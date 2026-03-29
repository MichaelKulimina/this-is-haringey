'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Submission } from '@/lib/submissions'

const STATUS_STYLES: Record<string, string> = {
  awaiting_payment: 'bg-gray-100 text-gray-500',
  pending: 'bg-amber-100 text-amber-800',
  re_review: 'bg-amber-100 text-amber-800',
  approved: 'bg-[#EEF3EF] text-[#3D5240]',
  returned: 'bg-[#FDF5F1] text-[#B84520]',
  rejected: 'bg-red-100 text-red-700',
}

function formatDate(d?: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatTime(t?: string | null) {
  if (!t) return null
  return t.slice(0, 5)
}

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div>
      <p className="text-xs font-semibold text-muted uppercase tracking-[0.08em] mb-1">{label}</p>
      <p className="text-sm text-foreground">{value}</p>
    </div>
  )
}

export default function SubmissionDetail({ submission }: { submission: Submission }) {
  const [status, setStatus] = useState(submission.status)
  const [feedback, setFeedback] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState<'approve' | 'return' | 'reject' | 'refund' | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [refundIssued, setRefundIssued] = useState(false)

  async function issueRefund() {
    setLoading('refund')
    setActionError(null)
    setSuccessMsg(null)
    try {
      const res = await fetch(`/api/admin/submissions/${submission.id}/refund`, {
        method: 'POST',
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Refund failed.')
      setRefundIssued(true)
      setSuccessMsg('Refund issued successfully.')
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(null)
    }
  }

  async function callAction(
    type: 'approve' | 'return' | 'reject',
    body?: object
  ) {
    setLoading(type)
    setActionError(null)
    setSuccessMsg(null)

    try {
      const res = await fetch(`/api/admin/submissions/${submission.id}/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      })
      const json = await res.json()

      if (!res.ok) throw new Error(json.error ?? 'Action failed.')

      if (type === 'approve') {
        setStatus('approved')
        setSuccessMsg(
          submission.parent_event_id
            ? 'Re-review approved. The live listing has been updated.'
            : 'Submission approved and listing published.'
        )
      } else if (type === 'return') {
        setStatus('returned')
        setSuccessMsg('Submission returned to organiser with feedback.')
      } else {
        setStatus('rejected')
        setSuccessMsg('Submission rejected and refund issued.')
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(null)
    }
  }

  const statusStyle = STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-500'
  const isResolved = ['approved', 'rejected', 'withdrawn'].includes(status)

  return (
    <div>
      {/* Back link */}
      <Link
        href="/admin/submissions"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors mb-6"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
        All submissions
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-[-0.03em] text-foreground mb-1">
            {submission.event_name}
          </h1>
          <p className="text-sm text-muted">
            Submitted {new Date(submission.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusStyle}`}>
          {status.replace('_', ' ')}
        </span>
      </div>

      {/* Success / error banners */}
      {successMsg && (
        <div className="mb-6 p-4 rounded-md bg-[#EEF3EF] border border-[#3D5240]/20 text-sm text-[#3D5240]">
          {successMsg}
        </div>
      )}
      {actionError && (
        <div className="mb-6 p-4 rounded-md bg-[#FDF5F1] border border-[#E05A2B]/30 text-sm text-[#B84520]">
          {actionError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left: Event details ──────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Image */}
          {submission.image_thumb_url && (
            <div className="rounded-md overflow-hidden border border-border">
              <Image
                src={submission.image_thumb_url}
                alt={submission.event_name}
                width={800}
                height={450}
                className="w-full object-cover"
                style={{ aspectRatio: '16/9' }}
              />
            </div>
          )}

          {/* Core details */}
          <div className="bg-surface border border-border rounded-lg p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Category" value={(submission.category as {name?: string} | null)?.name ?? submission.category_id} />
            <Field label="Date" value={`${formatDate(submission.event_date_start)}${submission.event_date_end ? ` – ${formatDate(submission.event_date_end)}` : ''}`} />
            <Field label="Time" value={`${formatTime(submission.start_time) ?? ''}${submission.end_time ? ` – ${formatTime(submission.end_time)}` : ''}`} />
            <Field label="Ticket price" value={submission.ticket_price} />
            <Field label="Ticket URL" value={submission.ticket_url} />
            <Field label="Borough of Culture" value={submission.borough_of_culture ? 'Yes' : null} />
          </div>

          {/* Description */}
          <div className="bg-surface border border-border rounded-lg p-5 space-y-4">
            <div>
              <p className="text-xs font-semibold text-muted uppercase tracking-[0.08em] mb-2">Short description</p>
              <p className="text-sm text-foreground">{submission.short_description}</p>
            </div>
            {submission.full_description && (
              <div>
                <p className="text-xs font-semibold text-muted uppercase tracking-[0.08em] mb-2">Full description</p>
                <div
                  className="text-sm text-foreground prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: submission.full_description }}
                />
              </div>
            )}
          </div>

          {/* Venue & accessibility */}
          <div className="bg-surface border border-border rounded-lg p-5 space-y-3">
            <Field label="Venue" value={submission.venue_name} />
            <Field label="Address" value={submission.venue_address} />
            <Field label="Neighbourhood" value={submission.neighbourhood} />
            <Field label="Accessibility" value={submission.accessibility_info} />
          </div>

          {/* Admin feedback history */}
          {submission.admin_feedback && (
            <div className="bg-surface border border-border rounded-lg p-5">
              <p className="text-xs font-semibold text-muted uppercase tracking-[0.08em] mb-2">
                Admin feedback
              </p>
              <p className="text-sm text-foreground">{submission.admin_feedback}</p>
            </div>
          )}
        </div>

        {/* ── Right: Organiser + actions ──────────────────────────────── */}
        <div className="space-y-4">

          {/* Organiser info */}
          <div className="bg-surface border border-border rounded-lg p-4 space-y-3">
            <p className="text-xs font-semibold text-muted uppercase tracking-[0.08em]">Organiser</p>
            <Field label="Name" value={submission.organiser_name} />
            <Field label="Email" value={submission.organiser_email} />
            <Field label="IP address" value={submission.submitter_ip} />
          </div>

          {/* Payment info */}
          {submission.stripe_payment_intent_id && (
            <div className="bg-surface border border-border rounded-lg p-4 space-y-2">
              <p className="text-xs font-semibold text-muted uppercase tracking-[0.08em] mb-2">Payment</p>
              <p className="text-xs text-muted font-mono break-all">{submission.stripe_payment_intent_id}</p>
            </div>
          )}

          {/* Standalone refund — for rejected submissions where auto-refund may have failed */}
          {status === 'rejected' && submission.stripe_charge_id && !refundIssued && (
            <div className="bg-surface border border-border rounded-lg p-4">
              <p className="text-sm font-semibold text-foreground mb-1">Issue refund</p>
              <p className="text-xs text-muted mb-3">
                If the automatic refund failed at rejection, use this to issue it manually.
              </p>
              <button
                onClick={issueRefund}
                disabled={loading !== null}
                className="w-full py-2 rounded-md bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading === 'refund' ? 'Processing…' : 'Issue £10 Refund'}
              </button>
            </div>
          )}

          {/* Admin actions — only show if still pending or returned */}
          {!isResolved && status !== 'awaiting_payment' && (
            <div className="space-y-3">
              {/* Approve */}
              {status === 'pending' || status === 'returned' || status === 're_review' ? (
                <div className="bg-surface border border-border rounded-lg p-4">
                  <p className="text-sm font-semibold text-foreground mb-3">Approve</p>
                  <button
                    onClick={() => callAction('approve')}
                    disabled={loading !== null}
                    className="w-full py-2 rounded-md bg-[#3D5240] text-white text-sm font-semibold hover:bg-[#2c3d2f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading === 'approve' ? 'Publishing…' : 'Approve & Publish'}
                  </button>
                </div>
              ) : null}

              {/* Return with feedback */}
              <div className="bg-surface border border-border rounded-lg p-4">
                <p className="text-sm font-semibold text-foreground mb-3">Return with feedback</p>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={4}
                  placeholder="Explain what needs to change before this can be approved…"
                  className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none mb-3"
                />
                <button
                  onClick={() => {
                    if (feedback.trim().length < 10) {
                      setActionError('Please provide at least 10 characters of feedback.')
                      return
                    }
                    callAction('return', { feedback })
                  }}
                  disabled={loading !== null}
                  className="w-full py-2 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading === 'return' ? 'Sending…' : 'Return with feedback'}
                </button>
              </div>

              {/* Reject */}
              <div className="bg-surface border border-[#fca5a5] rounded-lg p-4">
                <p className="text-sm font-semibold text-foreground mb-1">Reject</p>
                <p className="text-xs text-muted mb-3">
                  This will trigger an automatic Stripe refund of £10.00.
                </p>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  placeholder="Reason for rejection (sent to organiser)…"
                  className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none mb-3"
                />
                <button
                  onClick={() => {
                    if (reason.trim().length < 10) {
                      setActionError('Please provide at least 10 characters for the rejection reason.')
                      return
                    }
                    callAction('reject', { reason })
                  }}
                  disabled={loading !== null}
                  className="w-full py-2 rounded-md bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading === 'reject' ? 'Processing refund…' : 'Reject & Issue Refund'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
