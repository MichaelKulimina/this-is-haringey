import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rejectSubmission, getSubmissionById } from '@/lib/submissions'
import { sendRejectionEmail } from '@/lib/email'
import { AdminRejectSchema } from '@/lib/validations'
import { getStripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params

  // ── Admin auth check ────────────────────────────────────────────────────────
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.app_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // ── Validate body ───────────────────────────────────────────────────────────
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const parsed = AdminRejectSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors.reason?.[0] ?? 'Reason is required.' },
      { status: 422 }
    )
  }

  // ── Fetch submission ────────────────────────────────────────────────────────
  const submission = await getSubmissionById(id)
  if (!submission) {
    return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
  }

  // ── Issue Stripe refund if payment exists ───────────────────────────────────
  if (submission.stripe_charge_id) {
    try {
      await getStripe().refunds.create({
        charge: submission.stripe_charge_id,
        reason: 'requested_by_customer',
      })

      // Update payment record to 'refunded'
      const db = createServiceClient()
      await db
        .from('payments')
        .update({ status: 'refunded' })
        .eq('submission_id', id)
    } catch (err) {
      console.error('[admin/reject] Stripe refund failed:', err)
      return NextResponse.json(
        { error: 'Failed to issue refund. Please refund manually in Stripe dashboard.' },
        { status: 500 }
      )
    }
  }

  // ── Reject submission ───────────────────────────────────────────────────────
  try {
    await rejectSubmission(id, parsed.data.reason)
  } catch (err) {
    console.error('[admin/reject] rejectSubmission failed:', err)
    return NextResponse.json({ error: 'Failed to reject submission.' }, { status: 500 })
  }

  // ── Send email ──────────────────────────────────────────────────────────────
  await sendRejectionEmail(
    submission.organiser_email,
    submission.event_name,
    parsed.data.reason
  )

  return NextResponse.json({ success: true })
}
