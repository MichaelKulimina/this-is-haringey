import type { Metadata } from 'next'
import Link from 'next/link'
import { getSubmissionsForAdmin, getWithdrawalRequestsForAdmin } from '@/lib/submissions'
import SubmissionRow from '@/components/admin/SubmissionRow'
import ConfirmWithdrawButton from '@/components/admin/ConfirmWithdrawButton'

export const metadata: Metadata = { title: 'Submissions — Admin' }

const STATUS_TABS = [
  { label: 'Pending', value: 'pending' },
  { label: 'Re-review', value: 're_review' },
  { label: 'Awaiting payment', value: 'awaiting_payment' },
  { label: 'Approved', value: 'approved' },
  { label: 'Returned', value: 'returned' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Withdrawals', value: 'withdrawals' },
  { label: 'All', value: 'all' },
]

export default async function AdminSubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const params = await searchParams
  const currentStatus = params.status ?? 'pending'

  const isWithdrawals = currentStatus === 'withdrawals'

  const [submissions, withdrawals] = await Promise.all([
    isWithdrawals
      ? Promise.resolve([])
      : getSubmissionsForAdmin(currentStatus === 'all' ? undefined : currentStatus),
    isWithdrawals ? getWithdrawalRequestsForAdmin() : Promise.resolve([]),
  ])

  const count = isWithdrawals ? withdrawals.length : submissions.length

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-[-0.03em] text-foreground mb-1">
          Submissions
        </h1>
        <p className="text-sm text-muted">
          {count} result{count !== 1 ? 's' : ''}
        </p>
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

      {/* Withdrawals tab */}
      {isWithdrawals && (
        <>
          {withdrawals.length === 0 ? (
            <div className="py-16 text-center text-muted text-sm">
              No pending withdrawal requests.
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
                      Published
                    </th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {withdrawals.map((event) => (
                    <tr key={event.id} className="hover:bg-background transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground text-sm">
                        {event.event_name}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted hidden md:table-cell">
                        {event.organiser_name}
                        <br />
                        <span className="text-xs">{event.organiser_email}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted hidden sm:table-cell">
                        {new Date(event.published_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <ConfirmWithdrawButton eventId={event.id} />
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Submissions table */}
      {!isWithdrawals && (
        <>
          {submissions.length === 0 ? (
            <div className="py-16 text-center text-muted text-sm">
              No {currentStatus === 'all' ? '' : currentStatus.replace('_', ' ')} submissions.
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
        </>
      )}
    </div>
  )
}

