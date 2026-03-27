import type { Submission } from '@/lib/submissions'

type Status = Submission['status']

const STATUS_CONFIG: Record<
  Status,
  { label: string; className: string }
> = {
  awaiting_payment: {
    label: 'Awaiting payment',
    className: 'bg-gray-100 text-gray-500',
  },
  pending: {
    label: 'Awaiting review',
    className: 'bg-amber-100 text-amber-800',
  },
  re_review: {
    label: 'Under re-review',
    className: 'bg-amber-100 text-amber-800',
  },
  approved: {
    label: 'Live',
    className: 'bg-[#EEF3EF] text-[#3D5240]',
  },
  returned: {
    label: 'Returned — action required',
    className: 'bg-[#FDF5F1] text-primary',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-red-100 text-red-700',
  },
  withdrawn: {
    label: 'Withdrawn',
    className: 'bg-gray-100 text-gray-500',
  },
}

export default function StatusBadge({ status }: { status: Status }) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    className: 'bg-gray-100 text-gray-500',
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${config.className}`}
    >
      {config.label}
    </span>
  )
}
