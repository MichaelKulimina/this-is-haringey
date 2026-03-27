import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/service'
import { updateSubmissionAfterPayment, getSubmissionById } from '@/lib/submissions'
import {
  sendSubmissionConfirmation,
  sendAdminNotification,
} from '@/lib/email'

// Explicitly opt out of body parsing — we need the raw bytes for Stripe signature verification
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest): Promise<NextResponse> {
  // ── 1. Read raw body ────────────────────────────────────────────────────────
  // Must use .text(), NOT .json() — signature verification requires exact raw bytes
  const rawBody = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('[webhook] STRIPE_WEBHOOK_SECRET is not set')
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  // ── 2. Verify signature ─────────────────────────────────────────────────────
  let event: ReturnType<typeof getStripe.prototype.webhooks.constructEvent> // Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error('[webhook] Signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 })
  }

  // ── 3. Handle event ─────────────────────────────────────────────────────────
  // Only process checkout.session.completed — acknowledge all others and move on
  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true })
  }

  const session = event.data.object

  // ── 4. Extract metadata ─────────────────────────────────────────────────────
  const submissionId = session.metadata?.submission_id
  if (!submissionId) {
    console.error('[webhook] checkout.session.completed missing submission_id metadata')
    return NextResponse.json({ error: 'Missing submission_id in metadata' }, { status: 400 })
  }

  // ── 5. Check payment status ─────────────────────────────────────────────────
  if (session.payment_status !== 'paid') {
    console.warn('[webhook] checkout.session.completed but payment_status is not paid:', session.payment_status)
    return NextResponse.json({ received: true })
  }

  // ── 6. Idempotency guard ────────────────────────────────────────────────────
  // Stripe may fire the same webhook event more than once
  const existing = await getSubmissionById(submissionId)
  if (!existing) {
    console.error('[webhook] Submission not found:', submissionId)
    return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
  }

  if (existing.status !== 'awaiting_payment') {
    // Already processed — return 200 to prevent Stripe retrying
    console.log('[webhook] Submission already processed, skipping:', submissionId)
    return NextResponse.json({ received: true })
  }

  // ── 7. Retrieve charge ID ───────────────────────────────────────────────────
  const paymentIntentId =
    typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id ?? ''

  let chargeId = ''
  try {
    const pi = await getStripe().paymentIntents.retrieve(paymentIntentId)
    chargeId =
      typeof pi.latest_charge === 'string'
        ? pi.latest_charge
        : pi.latest_charge?.id ?? ''
  } catch (err) {
    console.error('[webhook] Failed to retrieve payment intent:', err)
    // Non-fatal — proceed without charge ID for now
  }

  // ── 8. Update submission status to 'pending' ────────────────────────────────
  try {
    await updateSubmissionAfterPayment(submissionId, paymentIntentId, chargeId)
  } catch (err) {
    console.error('[webhook] updateSubmissionAfterPayment failed:', err)
    return NextResponse.json({ error: 'Failed to update submission' }, { status: 500 })
  }

  // ── 9. Insert payment audit record ─────────────────────────────────────────
  const db = createServiceClient()
  const { error: paymentError } = await db.from('payments').insert({
    submission_id: submissionId,
    organiser_id: existing.organiser_id ?? null,
    organiser_name: existing.organiser_name,
    organiser_email: existing.organiser_email,
    event_name: existing.event_name,
    amount_pence: 1000,
    currency: 'gbp',
    stripe_payment_intent_id: paymentIntentId,
    stripe_charge_id: chargeId || null,
    status: 'succeeded',
    submitter_ip: existing.submitter_ip,
  })

  if (paymentError) {
    // Log but don't fail — submission is already updated
    console.error('[webhook] Failed to insert payment record:', paymentError.message)
  }

  // ── 10. Send emails ─────────────────────────────────────────────────────────
  await Promise.all([
    sendSubmissionConfirmation(
      existing.organiser_email,
      existing.event_name,
      submissionId
    ),
    sendAdminNotification(
      existing.event_name,
      submissionId,
      existing.organiser_email
    ),
  ])

  return NextResponse.json({ received: true })
}
