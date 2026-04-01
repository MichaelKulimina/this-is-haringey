import { NextRequest, NextResponse } from 'next/server'
import DOMPurify from 'isomorphic-dompurify'
import { checkRateLimit } from '@/lib/rateLimit'
import { SubmissionFormSchema } from '@/lib/validations'
import { createSubmission } from '@/lib/submissions'
import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://thisisharingey.co.uk'

export async function POST(request: NextRequest): Promise<NextResponse> {
  // ── Rate limit ──────────────────────────────────────────────────────────────
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Too many submissions. Please wait before trying again.' },
      { status: 429 }
    )
  }

  // ── Parse body ──────────────────────────────────────────────────────────────
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  // ── Honeypot check ──────────────────────────────────────────────────────────
  // If the hidden 'website' field is populated, it's almost certainly a bot.
  // Return 200 silently — don't reveal the check to the submitter.
  const raw = body as Record<string, unknown>
  if (raw.website) {
    return NextResponse.json({ ok: true })
  }

  // ── Server-side validation (Zod) ────────────────────────────────────────────
  const parsed = SubmissionFormSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.flatten() },
      { status: 422 }
    )
  }

  const data = parsed.data

  // ── Sanitise rich-text and free-text fields ─────────────────────────────────
  if (data.full_description) {
    data.full_description = DOMPurify.sanitize(data.full_description)
  }
  if (data.accessibility_info) {
    data.accessibility_info = DOMPurify.sanitize(data.accessibility_info)
  }

  // ── Optional session — link to organiser if logged in ──────────────────────
  let userId: string | null = null
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    userId = user?.id ?? null
  } catch {
    // Session read failure is non-fatal — guest submission proceeds
  }

  // ── Create submission record (status: awaiting_payment) ─────────────────────
  let submissionId: string
  try {
    const { id } = await createSubmission(data, ip, userId)
    submissionId = id
  } catch (err) {
    console.error('[submit] createSubmission failed:', err)
    return NextResponse.json(
      { error: 'Failed to save submission. Please try again.' },
      { status: 500 }
    )
  }

  // ── Create Stripe Checkout session ─────────────────────────────────────────
  let checkoutUrl: string
  try {
    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            unit_amount: parseInt(process.env.NEXT_PUBLIC_LISTING_FEE_PENCE ?? '1000', 10),
            product_data: {
              name: `Event listing — ${data.event_name}`,
              description: 'One-off listing fee for This Is Haringey',
            },
          },
          quantity: 1,
        },
      ],
      customer_email: data.organiser_email,
      success_url: `${BASE_URL}/submit/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE_URL}/submit?cancelled=1`,
      metadata: {
        submission_id: submissionId,
      },
      expires_at: Math.floor(Date.now() / 1000) + 1800, // 30 minutes
    })

    if (!session.url) throw new Error('Stripe returned no checkout URL')
    checkoutUrl = session.url
  } catch (err) {
    console.error('[submit] Stripe session creation failed:', err)
    return NextResponse.json(
      { error: 'Payment setup failed. Please try again.' },
      { status: 500 }
    )
  }

  return NextResponse.json({ checkoutUrl })
}
