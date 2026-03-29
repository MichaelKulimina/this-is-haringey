import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/service'

const UnsubscribeSchema = z.object({
  token: z.string().uuid('Invalid token.'),
})

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const parsed = UnsubscribeSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid token.' },
      { status: 422 }
    )
  }

  const { token } = parsed.data
  const supabase = createServiceClient()

  const { data: subscription, error: fetchErr } = await supabase
    .from('subscriptions')
    .select('id, unsubscribed_at')
    .eq('verification_token', token)
    .maybeSingle()

  if (fetchErr || !subscription) {
    return NextResponse.json({ error: 'Subscription not found.' }, { status: 404 })
  }

  // Idempotent — if already unsubscribed, return ok
  if (subscription.unsubscribed_at) {
    return NextResponse.json({ ok: true })
  }

  const { error: updateErr } = await supabase
    .from('subscriptions')
    .update({ unsubscribed_at: new Date().toISOString() })
    .eq('id', subscription.id)

  if (updateErr) {
    console.error('[unsubscribe] update failed:', updateErr)
    return NextResponse.json({ error: 'Failed to unsubscribe. Please try again.' }, { status: 500 })
  }

  console.log(`[unsubscribe] unsubscribed subscription ${subscription.id}`)
  return NextResponse.json({ ok: true })
}
