import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/service'

const ManagePreferencesSchema = z.object({
  token: z.string().uuid('Invalid token.'),
  categories: z
    .array(z.string().uuid())
    .min(1, 'Please select at least one category.'),
})

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const parsed = ManagePreferencesSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input.' },
      { status: 422 }
    )
  }

  const { token, categories } = parsed.data
  const supabase = createServiceClient()

  const { data: subscription, error: fetchErr } = await supabase
    .from('subscriptions')
    .select('id, verified, unsubscribed_at')
    .eq('verification_token', token)
    .maybeSingle()

  if (fetchErr || !subscription) {
    return NextResponse.json({ error: 'Subscription not found.' }, { status: 404 })
  }

  if (!subscription.verified || subscription.unsubscribed_at) {
    return NextResponse.json({ error: 'Subscription not found.' }, { status: 404 })
  }

  const { error: updateErr } = await supabase
    .from('subscriptions')
    .update({ categories })
    .eq('id', subscription.id)

  if (updateErr) {
    console.error('[manage-preferences] update failed:', updateErr)
    return NextResponse.json(
      { error: 'Failed to update preferences. Please try again.' },
      { status: 500 }
    )
  }

  console.log(`[manage-preferences] updated categories for subscription ${subscription.id}`)
  return NextResponse.json({ ok: true })
}
