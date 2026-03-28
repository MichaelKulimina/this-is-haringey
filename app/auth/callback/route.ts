import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const errorCode = searchParams.get('error_code')
  const next = searchParams.get('next') ?? '/organiser/dashboard'

  // Supabase redirected with an error (e.g. expired link)
  if (errorCode) {
    const param = errorCode === 'otp_expired' ? 'error=expired' : 'error=1'
    return NextResponse.redirect(`${origin}/organiser/login?${param}`)
  }

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const destination = next === '/organiser/dashboard'
        ? `${origin}/organiser/dashboard?verified=1`
        : `${origin}${next}`
      return NextResponse.redirect(destination)
    }

    console.error('[auth/callback] exchangeCodeForSession error:', JSON.stringify(error))
  }

  // Exchange failed — redirect to login with error flag
  return NextResponse.redirect(`${origin}/organiser/login?error=1`)
}
