import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/service'
import { sendSubscriptionVerification } from '@/lib/email'
import { checkRateLimit } from '@/lib/rateLimit'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://thisisharingey.co.uk'

const SubscribeSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  categories: z
    .array(z.string().uuid())
    .min(1, 'Please select at least one category.'),
})

export async function POST(request: NextRequest) {
  // ── Rate limit: 10 per minute per IP ──────────────────────────────────────
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'

  if (!checkRateLimit(`subscribe:${ip}`, 10, 60_000)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    )
  }

  // ── Parse + validate ───────────────────────────────────────────────────────
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const parsed = SubscribeSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input.' },
      { status: 422 }
    )
  }

  const { email, categories } = parsed.data

  // ── Resolve category names for the verification email ─────────────────────
  const supabase = createServiceClient()

  const { data: catRows } = await supabase
    .from('categories')
    .select('id, name')
    .in('id', categories)

  const categoryNames = (catRows ?? []).map((c: { id: string; name: string }) => c.name)

  // ── Upsert logic ───────────────────────────────────────────────────────────
  const { data: existing } = await supabase
    .from('subscriptions')
    .select('id, verified, unsubscribed_at, verification_token')
    .eq('email', email)
    .maybeSingle()

  let token: string

  if (existing) {
    // Already verified and actively subscribed — silently succeed (privacy-safe)
    if (existing.verified && !existing.unsubscribed_at) {
      console.log(`[subscribe] ${email} already subscribed — returning ok silently`)
      return NextResponse.json({ ok: true })
    }

    // Needs re-verification (unverified or previously unsubscribed)
    // Regenerate token, update categories, clear unsubscribed_at
    const { data: updated, error: updateErr } = await supabase
      .from('subscriptions')
      .update({
        categories,
        verified: false,
        unsubscribed_at: null,
        verification_token: crypto.randomUUID(),
      })
      .eq('id', existing.id)
      .select('verification_token')
      .single()

    if (updateErr || !updated) {
      console.error('[subscribe] update failed:', updateErr)
      return NextResponse.json({ error: 'Subscription failed. Please try again.' }, { status: 500 })
    }

    token = updated.verification_token
  } else {
    // New subscriber — insert
    const { data: inserted, error: insertErr } = await supabase
      .from('subscriptions')
      .insert({ email, categories })
      .select('verification_token')
      .single()

    if (insertErr || !inserted) {
      console.error('[subscribe] insert failed:', insertErr)
      return NextResponse.json({ error: 'Subscription failed. Please try again.' }, { status: 500 })
    }

    token = inserted.verification_token
  }

  // ── Send verification email ────────────────────────────────────────────────
  const verificationUrl = `${BASE_URL}/api/subscribe/verify?token=${token}`
  await sendSubscriptionVerification(email, verificationUrl, categoryNames)

  console.log(`[subscribe] verification email sent to ${email}`)

  // Always return ok — widget shows "Check your inbox" regardless of branch taken
  return NextResponse.json({ ok: true })
}
