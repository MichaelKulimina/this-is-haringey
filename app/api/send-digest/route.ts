import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { buildDigestEmailHtml, DigestEvent, getResend } from '@/lib/email'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://thisisharingey.co.uk'

// ── Helpers ───────────────────────────────────────────────────────────────────

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function toISODate(date: Date): string {
  return date.toISOString().split('T')[0]
}

function formatWeekLabel(start: Date, end: Date): string {
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' }
  const startStr = start.toLocaleDateString('en-GB', opts)
  const endStr = end.toLocaleDateString('en-GB', opts)
  return `${startStr}–${endStr}`
}

/** Split an array into chunks of at most `size`. */
function chunks<T>(arr: T[], size: number): T[][] {
  const result: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size))
  }
  return result
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // ── Auth: verify CRON_SECRET ───────────────────────────────────────────────
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.warn('[send-digest] unauthorized request — missing or incorrect CRON_SECRET')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  console.log('[send-digest] digest job started')

  const supabase = createServiceClient()
  const today = new Date()
  const rangeStart = toISODate(today)
  const rangeEnd = toISODate(addDays(today, 14))
  const weekLabel = formatWeekLabel(today, addDays(today, 14))

  // ── Query upcoming published events ───────────────────────────────────────
  const { data: eventRows, error: eventsErr } = await supabase
    .from('events')
    .select(`
      id,
      event_name,
      short_description,
      image_thumb_url,
      event_date_start,
      start_time,
      end_time,
      venue_name,
      borough_of_culture,
      category_id,
      category:categories(id, name, slug)
    `)
    .eq('status', 'published')
    .gte('event_date_start', rangeStart)
    .lte('event_date_start', rangeEnd)
    .order('event_date_start', { ascending: true })

  if (eventsErr) {
    console.error('[send-digest] events query failed:', eventsErr)
    return NextResponse.json({ error: 'Failed to fetch events.' }, { status: 500 })
  }

  const events = (eventRows ?? []) as unknown as (DigestEvent & { category_id: string; category?: { id: string; name: string; slug: string } })[]

  // ── Query active verified subscribers ─────────────────────────────────────
  const { data: subscriberRows, error: subErr } = await supabase
    .from('subscriptions')
    .select('id, email, categories, verification_token')
    .eq('verified', true)
    .is('unsubscribed_at', null)

  if (subErr) {
    console.error('[send-digest] subscribers query failed:', subErr)
    return NextResponse.json({ error: 'Failed to fetch subscribers.' }, { status: 500 })
  }

  const subscribers = subscriberRows ?? []

  if (subscribers.length === 0) {
    console.log('[send-digest] no active subscribers — exiting')
    return NextResponse.json({ sent: 0, skipped: 0 })
  }

  // ── Build category name lookup ─────────────────────────────────────────────
  const { data: catRows } = await supabase
    .from('categories')
    .select('id, name')

  const categoryNameById = new Map<string, string>(
    (catRows ?? []).map((c: { id: string; name: string }) => [c.id, c.name] as [string, string])
  )

  // ── Build event map grouped by category_id ────────────────────────────────
  const eventsByCategory = new Map<string, DigestEvent[]>()
  for (const event of events) {
    const list = eventsByCategory.get(event.category_id) ?? []
    list.push(event)
    eventsByCategory.set(event.category_id, list)
  }

  // ── Build email batch ─────────────────────────────────────────────────────
  type ResendEmail = {
    from: string
    to: string
    subject: string
    html: string
  }

  const emailBatch: ResendEmail[] = []
  let skipped = 0

  const FROM = `This Is Haringey <${process.env.EMAIL_FROM_ADDRESS ?? 'hello@thisisharingey.co.uk'}>`

  for (const subscriber of subscribers) {
    const subscribedCategoryIds: string[] = subscriber.categories ?? []

    // Collect events for this subscriber's categories
    const subscriberEvents: DigestEvent[] = []
    for (const catId of subscribedCategoryIds) {
      const catEvents = eventsByCategory.get(catId) ?? []
      subscriberEvents.push(...catEvents)
    }

    // Sort by date and deduplicate (an event appears in only one category)
    const uniqueEvents = Array.from(
      new Map(subscriberEvents.map((e) => [e.id, e])).values()
    ).sort((a, b) =>
      a.event_date_start.localeCompare(b.event_date_start)
    )

    // Skip this subscriber if no matching events this week
    if (uniqueEvents.length === 0) {
      skipped++
      continue
    }

    // Cap at 8 events per digest
    const digestEvents = uniqueEvents.slice(0, 8)

    // Build subscriber-specific URLs (token-authenticated, no login required)
    const unsubscribeUrl = `${BASE_URL}/unsubscribe?token=${subscriber.verification_token}`
    const manageUrl = `${BASE_URL}/manage-preferences?token=${subscriber.verification_token}`

    // Build category names for the subject line and intro
    const subscriberCategoryNames = subscribedCategoryIds
      .map((id) => categoryNameById.get(id))
      .filter(Boolean) as string[]

    const subject = `What's On in Haringey this week — ${subscriberCategoryNames.join(', ')}`

    const html = buildDigestEmailHtml(
      digestEvents,
      subscriberCategoryNames,
      weekLabel,
      unsubscribeUrl,
      manageUrl
    )

    emailBatch.push({
      from: FROM,
      to: subscriber.email,
      subject,
      html,
    })
  }

  if (emailBatch.length === 0) {
    console.log(`[send-digest] no emails to send (${skipped} subscribers skipped — no matching events)`)
    return NextResponse.json({ sent: 0, skipped })
  }

  // ── Send in chunks of 100 (Resend batch limit) ────────────────────────────
  const resend = getResend()
  let sentCount = 0

  try {
    for (const chunk of chunks(emailBatch, 100)) {
      await resend.batch.send(chunk)
      sentCount += chunk.length
      console.log(`[send-digest] sent chunk of ${chunk.length} emails (total so far: ${sentCount})`)
    }
  } catch (err) {
    console.error('[send-digest] batch send failed:', err)
    return NextResponse.json(
      { error: 'Digest send failed.', sent: sentCount, skipped },
      { status: 500 }
    )
  }

  console.log(`[send-digest] complete — sent: ${sentCount}, skipped: ${skipped}`)
  return NextResponse.json({ sent: sentCount, skipped })
}
