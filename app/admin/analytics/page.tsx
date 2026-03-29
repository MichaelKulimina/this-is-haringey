import type { Metadata } from 'next'
import { getAnalyticsData } from '@/lib/analytics'
import EventsByCategoryChart from '@/components/admin/analytics/EventsByCategoryChart'
import VisitorTrendChart from '@/components/admin/analytics/VisitorTrendChart'

export const metadata: Metadata = { title: 'Analytics — Admin' }

function formatPounds(pence: number) {
  return `£${(pence / 100).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function StatCard({
  label,
  value,
  sub,
  highlight,
}: {
  label: string
  value: string | number
  sub?: string
  highlight?: boolean
}) {
  return (
    <div
      className={[
        'bg-surface border rounded-lg p-4',
        highlight ? 'border-amber-300 bg-amber-50' : 'border-border',
      ].join(' ')}
    >
      <p className="text-xs font-semibold text-muted uppercase tracking-[0.08em] mb-1">{label}</p>
      <p
        className={[
          'text-2xl font-extrabold tracking-[-0.03em]',
          highlight ? 'text-amber-700' : 'text-foreground',
        ].join(' ')}
      >
        {value}
      </p>
      {sub && <p className="text-xs text-muted mt-1">{sub}</p>}
    </div>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-base font-extrabold tracking-[-0.03em] text-foreground mb-4">
      {children}
    </h2>
  )
}

export default async function AdminAnalyticsPage() {
  const { platform: p, traffic: t } = await getAnalyticsData()

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-[-0.03em] text-foreground mb-1">
          Analytics
        </h1>
        <p className="text-sm text-muted">Platform overview — data refreshes every 15 minutes</p>
      </div>

      {/* ── Web Traffic ──────────────────────────────────────────────────────── */}
      <section>
        <SectionHeading>Web Traffic</SectionHeading>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <StatCard
            label="Page views (30 days)"
            value={t.totalViews30d.toLocaleString()}
          />
        </div>

        {t.dailyViews.length > 0 ? (
          <div className="bg-surface border border-border rounded-lg p-4 mb-6">
            <p className="text-xs font-semibold text-muted uppercase tracking-[0.08em] mb-4">
              Daily page views — last 30 days
            </p>
            <VisitorTrendChart data={t.dailyViews} />
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-lg p-5 mb-6">
            <p className="text-sm text-muted">No page view data yet — tracking begins once the site receives visitors.</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Top pages */}
          <div className="bg-surface border border-border rounded-lg p-4">
            <p className="text-xs font-semibold text-muted uppercase tracking-[0.08em] mb-3">
              Top pages (30 days)
            </p>
            {t.topPages.length > 0 ? (
              <table className="w-full text-sm">
                <tbody className="divide-y divide-border">
                  {t.topPages.map((row) => (
                    <tr key={row.path}>
                      <td className="py-2 text-foreground font-mono text-xs truncate max-w-[180px]">
                        {row.path}
                      </td>
                      <td className="py-2 text-right text-muted text-xs">
                        {row.count.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-muted">No data yet</p>
            )}
          </div>

          {/* Top referrers */}
          <div className="bg-surface border border-border rounded-lg p-4">
            <p className="text-xs font-semibold text-muted uppercase tracking-[0.08em] mb-3">
              Top referrers (30 days)
            </p>
            {t.topReferrers.length > 0 ? (
              <table className="w-full text-sm">
                <tbody className="divide-y divide-border">
                  {t.topReferrers.map((row) => (
                    <tr key={row.referrer}>
                      <td className="py-2 text-foreground text-xs truncate max-w-[180px]">
                        {row.referrer}
                      </td>
                      <td className="py-2 text-right text-muted text-xs">
                        {row.count.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-muted">No referrer data yet</p>
            )}
          </div>
        </div>
      </section>

      {/* ── Platform Content ─────────────────────────────────────────────────── */}
      <section>
        <SectionHeading>Platform Content</SectionHeading>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 mb-6">
          <StatCard
            label="Submissions in queue"
            value={p.submissionsInQueue}
            sub="Pending review"
            highlight={p.submissionsInQueue > 10}
          />
          <StatCard label="Published events" value={p.totalPublishedEvents.toLocaleString()} />
          <StatCard
            label="Upcoming (30 days)"
            value={p.upcomingEvents.toLocaleString()}
            sub="Events with a start date in the next 30 days"
          />
          <StatCard
            label="Total submissions"
            value={p.totalSubmissions.toLocaleString()}
            sub="All time"
          />
          <StatCard
            label="Approval rate"
            value={`${p.approvalRate}%`}
            sub="Of resolved submissions"
          />
          <StatCard
            label="Borough of Culture"
            value={p.boroughOfCultureEvents.toLocaleString()}
            sub="Events tagged BoC 2027"
          />
        </div>

        <div className="bg-surface border border-border rounded-lg p-4">
          <p className="text-xs font-semibold text-muted uppercase tracking-[0.08em] mb-4">
            Events by subcategory
          </p>
          <EventsByCategoryChart data={p.eventsByCategory} />
        </div>
      </section>

      {/* ── Organisers & Revenue ─────────────────────────────────────────────── */}
      <section>
        <SectionHeading>Organisers &amp; Revenue</SectionHeading>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard
            label="Registered organisers"
            value={p.registeredOrganisers.toLocaleString()}
          />
          <StatCard
            label="New organisers"
            value={p.newOrganisers30d.toLocaleString()}
            sub="Last 30 days"
          />
          <StatCard
            label="Total revenue"
            value={formatPounds(p.totalRevenuePence)}
            sub="All time"
          />
          <StatCard
            label="Revenue (30 days)"
            value={formatPounds(p.revenue30dPence)}
          />
          <StatCard
            label="Avg listings"
            value={p.avgListingsPerOrganiser}
            sub="Per organiser"
          />
        </div>
      </section>

      {/* ── Subscriptions ────────────────────────────────────────────────────── */}
      <section>
        <SectionHeading>Subscriptions</SectionHeading>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          <StatCard
            label="Active subscriptions"
            value={p.totalActiveSubscriptions.toLocaleString()}
          />
          <StatCard
            label="New subscriptions"
            value={p.newSubscriptions30d.toLocaleString()}
            sub="Last 30 days"
          />
        </div>

        {p.subscriptionsByCategory.length > 0 && (
          <div className="bg-surface border border-border rounded-lg p-4 max-w-sm">
            <p className="text-xs font-semibold text-muted uppercase tracking-[0.08em] mb-3">
              Subscriptions by category
            </p>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-border">
                {p.subscriptionsByCategory.map((s) => (
                  <tr key={s.name}>
                    <td className="py-2 text-sm text-foreground">{s.name}</td>
                    <td className="py-2 text-right text-muted text-sm">
                      {s.count.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
