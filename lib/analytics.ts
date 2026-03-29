import { unstable_cache } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/service'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CategoryCount {
  name: string
  slug: string
  count: number
  colour: string
}

export interface SubscriptionCategoryCount {
  name: string
  count: number
}

export interface PlatformMetrics {
  submissionsInQueue: number
  totalPublishedEvents: number
  upcomingEvents: number
  totalSubmissions: number
  approvalRate: number
  boroughOfCultureEvents: number
  eventsByCategory: CategoryCount[]
  registeredOrganisers: number
  newOrganisers30d: number
  totalRevenuePence: number
  revenue30dPence: number
  avgListingsPerOrganiser: number
  totalActiveSubscriptions: number
  newSubscriptions30d: number
  subscriptionsByCategory: SubscriptionCategoryCount[]
}

export interface WebTrafficMetrics {
  totalViews30d: number
  dailyViews: Array<{ date: string; views: number }>
  topPages: Array<{ path: string; count: number }>
  topReferrers: Array<{ referrer: string; count: number }>
}

export interface AnalyticsData {
  platform: PlatformMetrics
  traffic: WebTrafficMetrics
}

// ─── Category accent colours for chart bars ───────────────────────────────────

const CATEGORY_CHART_COLOURS: Record<string, string> = {
  'arts-culture': '#9B8BB4',
  music: '#E05A2B',
  community: '#6B7C6E',
  'food-drink': '#B84520',
  'learning-talks': '#4A7C8E',
}

// ─── Supabase metrics ─────────────────────────────────────────────────────────

async function fetchPlatformMetrics(): Promise<PlatformMetrics> {
  const db = createServiceClient()
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
  const today = now.toISOString().split('T')[0]

  const [
    queueResult,
    publishedResult,
    upcomingResult,
    bocResult,
    totalSubsResult,
    approvedCountResult,
    resolvedCountResult,
    eventsByCategoryResult,
    organisersResult,
    newOrganisersResult,
    totalRevenueResult,
    revenue30dResult,
    activeSubsResult,
    newSubsResult,
    categoriesResult,
    subsByCategoryResult,
  ] = await Promise.all([
    // Submissions in pending queue
    db.from('submissions').select('id', { count: 'exact', head: true }).eq('status', 'pending'),

    // Total published events
    db.from('events').select('id', { count: 'exact', head: true }).eq('status', 'published'),

    // Upcoming events (next 30 days)
    db
      .from('events')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'published')
      .gte('event_date_start', today)
      .lte('event_date_start', thirtyDaysFromNow),

    // Borough of Culture events
    db
      .from('events')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'published')
      .eq('borough_of_culture', true),

    // Total submissions all time (excluding awaiting_payment)
    db
      .from('submissions')
      .select('id', { count: 'exact', head: true })
      .neq('status', 'awaiting_payment'),

    // Approved count (for approval rate)
    db.from('submissions').select('id', { count: 'exact', head: true }).eq('status', 'approved'),

    // Total resolved (approved + rejected + returned) for approval rate
    db
      .from('submissions')
      .select('id', { count: 'exact', head: true })
      .in('status', ['approved', 'rejected', 'returned']),

    // Events by subcategory — fetch events with category join
    db
      .from('events')
      .select('category:categories(name, slug)')
      .eq('status', 'published'),

    // Registered organisers
    db.from('organisers').select('id', { count: 'exact', head: true }),

    // New organisers (last 30 days)
    db
      .from('organisers')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo),

    // Total revenue
    db
      .from('payments')
      .select('amount_pence')
      .eq('status', 'succeeded'),

    // Revenue last 30 days
    db
      .from('payments')
      .select('amount_pence')
      .eq('status', 'succeeded')
      .gte('created_at', thirtyDaysAgo),

    // Total active subscriptions
    db
      .from('subscriptions')
      .select('id', { count: 'exact', head: true })
      .eq('verified', true)
      .is('unsubscribed_at', null),

    // New subscriptions (last 30 days)
    db
      .from('subscriptions')
      .select('id', { count: 'exact', head: true })
      .eq('verified', true)
      .is('unsubscribed_at', null)
      .gte('created_at', thirtyDaysAgo),

    // All categories (for subscription breakdown join)
    db.from('categories').select('id, name, slug').order('name'),

    // Subscriptions by category — fetch all active subscriptions with categories array
    db
      .from('subscriptions')
      .select('categories')
      .eq('verified', true)
      .is('unsubscribed_at', null),
  ])

  // Events by subcategory — aggregate in JS since Supabase doesn't support GROUP BY via client
  const eventsRows = (eventsByCategoryResult.data ?? []) as unknown as Array<{
    category: { name: string; slug: string } | null
  }>
  const categoryMap = new Map<string, { name: string; slug: string; count: number }>()
  for (const row of eventsRows) {
    if (!row.category) continue
    const key = row.category.slug
    const existing = categoryMap.get(key)
    if (existing) {
      existing.count++
    } else {
      categoryMap.set(key, { name: row.category.name, slug: row.category.slug, count: 1 })
    }
  }
  const eventsByCategory: CategoryCount[] = Array.from(categoryMap.values())
    .sort((a, b) => b.count - a.count)
    .map((c) => ({
      ...c,
      colour: CATEGORY_CHART_COLOURS[c.slug] ?? '#888888',
    }))

  // Subscriptions by category — unnest arrays in JS
  const categories = (categoriesResult.data ?? []) as Array<{ id: string; name: string; slug: string }>
  const categoryIdToName = new Map(categories.map((c) => [c.id, c.name]))
  const subsCountMap = new Map<string, number>()
  for (const row of (subsByCategoryResult.data ?? []) as Array<{ categories: string[] }>) {
    for (const catId of row.categories ?? []) {
      subsCountMap.set(catId, (subsCountMap.get(catId) ?? 0) + 1)
    }
  }
  const subscriptionsByCategory: SubscriptionCategoryCount[] = Array.from(subsCountMap.entries())
    .map(([id, count]) => ({ name: categoryIdToName.get(id) ?? id, count }))
    .sort((a, b) => b.count - a.count)

  // Revenue totals
  const totalRevenuePence = (totalRevenueResult.data ?? []).reduce(
    (sum: number, p: { amount_pence: number }) => sum + p.amount_pence,
    0
  )
  const revenue30dPence = (revenue30dResult.data ?? []).reduce(
    (sum: number, p: { amount_pence: number }) => sum + p.amount_pence,
    0
  )

  // Approval rate
  const resolvedCount = resolvedCountResult.count ?? 0
  const approvedCount = approvedCountResult.count ?? 0
  const approvalRate = resolvedCount > 0 ? Math.round((approvedCount / resolvedCount) * 100) : 0

  // Average listings per organiser
  const orgCount = organisersResult.count ?? 0
  const totalPaidSubs = totalSubsResult.count ?? 0
  const avgListingsPerOrganiser =
    orgCount > 0 ? Math.round((totalPaidSubs / orgCount) * 10) / 10 : 0

  return {
    submissionsInQueue: queueResult.count ?? 0,
    totalPublishedEvents: publishedResult.count ?? 0,
    upcomingEvents: upcomingResult.count ?? 0,
    totalSubmissions: totalPaidSubs,
    approvalRate,
    boroughOfCultureEvents: bocResult.count ?? 0,
    eventsByCategory,
    registeredOrganisers: orgCount,
    newOrganisers30d: newOrganisersResult.count ?? 0,
    totalRevenuePence,
    revenue30dPence,
    avgListingsPerOrganiser,
    totalActiveSubscriptions: activeSubsResult.count ?? 0,
    newSubscriptions30d: newSubsResult.count ?? 0,
    subscriptionsByCategory,
  }
}

// ─── Web traffic metrics ──────────────────────────────────────────────────────

async function fetchWebTraffic(): Promise<WebTrafficMetrics> {
  const db = createServiceClient()

  const [dailyResult, topPagesResult, topReferrersResult, totalResult] =
    await Promise.all([
      db.rpc('get_daily_page_views', { days_back: 30 }),
      db.rpc('get_top_pages', { days_back: 30, row_limit: 10 }),
      db.rpc('get_top_referrers', { days_back: 30, row_limit: 8 }),
      db
        .from('page_views')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
    ])

  const dailyViews = (dailyResult.data ?? []).map(
    (row: { view_date: string; view_count: number }) => ({
      date: row.view_date,
      views: Number(row.view_count),
    })
  )

  const topPages = (topPagesResult.data ?? []).map(
    (row: { path: string; view_count: number }) => ({
      path: row.path,
      count: Number(row.view_count),
    })
  )

  const topReferrers = (topReferrersResult.data ?? []).map(
    (row: { referrer: string; view_count: number }) => ({
      referrer: row.referrer,
      count: Number(row.view_count),
    })
  )

  return {
    totalViews30d: totalResult.count ?? 0,
    dailyViews,
    topPages,
    topReferrers,
  }
}

// ─── Cached fetch ─────────────────────────────────────────────────────────────

export const getAnalyticsData = unstable_cache(
  async (): Promise<AnalyticsData> => {
    const [platform, traffic] = await Promise.all([
      fetchPlatformMetrics(),
      fetchWebTraffic(),
    ])
    return { platform, traffic }
  },
  ['admin-analytics'],
  { revalidate: 900 } // 15 minutes
)
