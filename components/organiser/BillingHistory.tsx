import type { Payment } from '@/lib/submissions'

interface Props {
  payments: Payment[]
}

export default function BillingHistory({ payments }: Props) {
  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-background">
            <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-[0.08em]">
              Date
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-[0.08em]">
              Event
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-[0.08em] hidden sm:table-cell">
              Amount
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-[0.08em]">
              Status
            </th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {payments.map((payment) => (
            <tr key={payment.id} className="hover:bg-background transition-colors">
              <td className="px-4 py-3 text-sm text-muted whitespace-nowrap">
                {new Date(payment.created_at).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </td>
              <td className="px-4 py-3 text-sm text-foreground">{payment.event_name}</td>
              <td className="px-4 py-3 text-sm text-muted hidden sm:table-cell">
                £{(payment.amount_pence / 100).toFixed(2)}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    payment.status === 'refunded'
                      ? 'bg-gray-100 text-gray-500'
                      : 'bg-[#EEF3EF] text-[#3D5240]'
                  }`}
                >
                  {payment.status === 'refunded' ? 'Refunded' : 'Paid'}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                {payment.stripe_charge_id && (
                  <a
                    href={`https://dashboard.stripe.com/payments/${payment.stripe_charge_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline"
                  >
                    Receipt →
                  </a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
