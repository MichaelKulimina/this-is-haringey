import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(req: NextRequest) {
  try {
    const { path, referrer } = await req.json()

    if (!path || typeof path !== 'string') {
      return NextResponse.json({ ok: true })
    }

    // Skip non-public routes — these are filtered client-side too but defence in depth
    if (
      path.startsWith('/admin') ||
      path.startsWith('/api') ||
      path.startsWith('/organiser')
    ) {
      return NextResponse.json({ ok: true })
    }

    const db = createServiceClient()
    await db.from('page_views').insert({
      path: path.slice(0, 500),
      referrer: referrer ? String(referrer).slice(0, 500) : null,
    })
  } catch {
    // Never block the client
  }

  return NextResponse.json({ ok: true })
}
