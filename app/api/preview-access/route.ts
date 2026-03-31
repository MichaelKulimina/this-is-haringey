import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const PREVIEW_PASSWORD = process.env.PREVIEW_PASSWORD

  if (!PREVIEW_PASSWORD) {
    return NextResponse.json({ error: 'Preview access is not configured.' }, { status: 503 })
  }

  let password: string
  try {
    const body = await request.json()
    password = body.password ?? ''
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  if (password !== PREVIEW_PASSWORD) {
    return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })

  // Set a 30-day preview access cookie
  response.cookies.set('tih-preview-access', 'granted', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  })

  return response
}
