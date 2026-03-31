import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(request: NextRequest) {
  let email: string

  try {
    const body = await request.json()
    email = (body.email ?? '').trim().toLowerCase()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
  }

  const supabase = createServiceClient()

  const { error } = await supabase
    .from('waitlist')
    .insert({ email })

  if (error) {
    // Unique constraint — already signed up
    if (error.code === '23505') {
      return NextResponse.json({ ok: true, already: true })
    }
    console.error('[waitlist] insert failed:', error)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
