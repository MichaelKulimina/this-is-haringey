import type { Metadata } from 'next'
import Link from 'next/link'
import { getSubmissionsForAdmin } from '@/lib/submissions'
import SubmissionRow from '@/components/admin/SubmissionRow'

export const metadata: Metadata = { title: 'Submissions — Admin' }

const STATUS_TABS = [
  { label: 'Pending', value: 'pending' },
  { label: 'Awaiting payment', value: 'awaiting_payment' },
  { label: 'Approved', value: 'approved' },
  { label: 'Returned', value: 'returned' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'All', value: 'all' },
]

export default async function AdminSubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const params = await searchParams
  const currentStatus = params.status ?? 'pending'

  const submissions = await getSubmissionsForAdmin(
    currentStatus === 'all' ? undefined : currentStatus
  )

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-[-0.03em] text-foreground mb-1">
          Submissions
        </h1>
        <p className="text-sm text-muted">{submissions.length} result{submissions.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_TABS.map((tab) => {
          const active = tab.value === currentStatus
          return (
            <Link
              key={tab.value}
              href={`/admin/submissions?status=${tab.value}`}
              className={[
                'px-3 py-1.5 rounded-full text-xs font-semibold transition-colors',
                active
                  ? 'bg-primary text-white'
                  : 'bg-background text-muted border border-border hover:text-foreground',
              ].join(' ')}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>

      {/* Table */}
      {submissions.length === 0 ? (
        <div className="py-16 text-center text-muted text-sm">
          No {currentStatus === 'all' ? '' : currentStatus} submissions.
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-background">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-[0.08em]">
                  Event
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-[0.08em] hidden md:table-cell">
                  Organiser
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-[0.08em] hidden sm:table-cell">
                  Date submitted
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-[0.08em]">
                  Status
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {submissions.map((submission) => (
                <SubmissionRow key={submission.id} submission={submission} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
