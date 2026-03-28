import Link from 'next/link'
import type { Submission } from '@/lib/submissions'

const STATUS_STYLES: Record<string, string> = {
  awaiting_payment: 'bg-gray-100 text-gray-500',
  pending: 'bg-amber-100 text-amber-800',
  re_review: 'bg-amber-100 text-amber-800',
  approved: 'bg-[#EEF3EF] text-[#3D5240]',
  returned: 'bg-[#FDF5F1] text-[#B84520]',
  rejected: 'bg-red-100 text-red-700',
  withdrawn: 'bg-gray-100 text-gray-400',
}

const STATUS_LABELS: Record<string, string> = {
  awaiting_payment: 'Awaiting payment',
  pending: 'Pending',
  re_review: 'Re-review',
  approved: 'Approved',
  returned: 'Returned',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function SubmissionRow({ submission }: { submission: Submission }) {
  const statusStyle = STATUS_STYLES[submission.status] ?? 'bg-gray-100 text-gray-500'
  const statusLabel = STATUS_LABELS[submission.status] ?? submission.status

  return (
    <tr className="hover:bg-background transition-colors">
      <td className="px-4 py-3">
        <p className="font-medium text-foreground line-clamp-1">{submission.event_name}</p>
        <p className="text-xs text-muted mt-0.5">
          {submission.event_date_start
            ? new Date(submission.event_date_start).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })
            : '—'}
        </p>
      </td>
      <td className="px-4 py-3 hidden md:table-cell">
        <p className="text-foreground">{submission.organiser_name}</p>
        <p className="text-xs text-muted mt-0.5">{submission.organiser_email}</p>
      </td>
      <td className="px-4 py-3 text-muted hidden sm:table-cell">
        {formatDate(submission.created_at)}
      </td>
      <td className="px-4 py-3">
        <span
          className={[
            'inline-block px-2 py-0.5 rounded-full text-xs font-semibold',
            statusStyle,
          ].join(' ')}
        >
          {statusLabel}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <Link
          href={`/admin/submissions/${submission.id}`}
          className="text-xs font-medium text-primary hover:underline whitespace-nowrap"
        >
          Review →
        </Link>
      </td>
    </tr>
  )
}
