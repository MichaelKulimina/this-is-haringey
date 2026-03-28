'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Submission } from '@/lib/submissions'
import StatusBadge from './StatusBadge'

interface Props {
  submissions: Submission[]
}

export default function MyListingsTable({ submissions }: Props) {
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null)
  const [confirmWithdrawId, setConfirmWithdrawId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleWithdraw(eventId: string) {
    setWithdrawingId(eventId)
    setError(null)
    try {
      const res = await fetch(`/api/organiser/events/${eventId}/withdraw`, { method: 'POST' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to request withdrawal')
      }
      setConfirmWithdrawId(null)
      window.location.reload()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setWithdrawingId(null)
    }
  }

  if (submissions.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-lg p-10 text-center">
        <p className="text-sm text-muted mb-4">You haven&apos;t submitted any events yet.</p>
        <Link
          href="/submit"
          className="px-4 py-2 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors"
        >
          Submit your first event
        </Link>
      </div>
    )
  }

  return (
    <>
      {error && (
        <div className="mb-4 p-3 rounded-md bg-[#FDF5F1] border border-primary/20 text-sm text-primary">
          {error}
        </div>
      )}

      {/* Withdrawal confirmation dialog */}
      {confirmWithdrawId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-surface rounded-lg border border-border shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-base font-bold text-foreground mb-2">Withdraw this listing?</h3>
            <p className="text-sm text-muted mb-5">
              Your event will be removed from the public directory. An admin must confirm the withdrawal.
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleWithdraw(confirmWithdrawId)}
                disabled={!!withdrawingId}
                className="flex-1 py-2 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors disabled:opacity-60"
              >
                {withdrawingId ? 'Requesting…' : 'Yes, withdraw'}
              </button>
              <button
                onClick={() => setConfirmWithdrawId(null)}
                className="flex-1 py-2 rounded-md border border-border text-sm font-medium text-muted hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-background">
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-[0.08em]">
                Event
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-[0.08em] hidden sm:table-cell">
                Date
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-[0.08em]">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-muted uppercase tracking-[0.08em]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {submissions.map((sub) => (
              <tr key={sub.id} className="hover:bg-background transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground text-sm leading-tight">
                    {sub.event_name}
                  </p>
                  {sub.category && (
                    <p className="text-xs text-muted mt-0.5">{sub.category.name}</p>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-muted hidden sm:table-cell whitespace-nowrap">
                  {new Date(sub.event_date_start).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={sub.status} />
                  {sub.status === 'returned' && sub.admin_feedback && (
                    <p className="text-xs text-muted mt-1 max-w-[200px] truncate">
                      {sub.admin_feedback}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2 flex-wrap">
                    {sub.status === 'returned' && (
                      <Link
                        href={`/organiser/submissions/${sub.id}/edit`}
                        className="px-3 py-1 rounded-md bg-primary text-white text-xs font-semibold hover:bg-primary-dark transition-colors"
                      >
                        Edit &amp; resubmit
                      </Link>
                    )}
                    {sub.status === 'approved' && (
                      <>
                        <Link
                          href={`/organiser/submissions/${sub.id}/re-review`}
                          className="px-3 py-1 rounded-md border border-border text-xs font-medium text-muted hover:text-foreground transition-colors"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => setConfirmWithdrawId(sub.id)}
                          className="px-3 py-1 rounded-md border border-border text-xs font-medium text-muted hover:text-red-600 hover:border-red-300 transition-colors"
                        >
                          Withdraw
                        </button>
                      </>
                    )}
                    {(sub.status === 'approved' ||
                      sub.status === 'returned' ||
                      sub.status === 'rejected' ||
                      sub.status === 'withdrawn' ||
                      sub.status === 'withdrawal_requested') && (
                      <Link
                        href={`/submit?duplicate_from=${sub.id}`}
                        className="px-3 py-1 rounded-md border border-border text-xs font-medium text-muted hover:text-foreground transition-colors"
                      >
                        Duplicate
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
