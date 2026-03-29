import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://thisisharingey.co.uk'

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')

  if (!token) {
    return NextResponse.redirect(`${BASE_URL}/subscribe/error`)
  }

  const supabase = createServiceClient()

  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select('id, verified')
    .eq('verification_token', token)
    .maybeSingle()

  if (error || !subscription) {
    console.log('[subscribe/verify] token not found:', token)
    return NextResponse.redirect(`${BASE_URL}/subscribe/error`)
  }

  // Idempotent — safe to call even if already verified
  if (!subscription.verified) {
    const { error: updateErr } = await supabase
      .from('subscriptions')
      .update({ verified: true })
      .eq('id', subscription.id)

    if (updateErr) {
      console.error('[subscribe/verify] update failed:', updateErr)
      return NextResponse.redirect(`${BASE_URL}/subscribe/error`)
    }
  }

  console.log(`[subscribe/verify] verified subscription ${subscription.id}`)
  return NextResponse.redirect(`${BASE_URL}/subscribe/confirmed`)
}
