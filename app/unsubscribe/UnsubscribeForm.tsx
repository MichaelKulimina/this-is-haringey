'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Props {
  token: string
  email: string
  categoryNames: string[]
}

export default function UnsubscribeForm({ token, email, categoryNames }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  async function handleUnsubscribe() {
    setStatus('loading')
    try {
      const res = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      if (!res.ok) throw new Error('Failed')
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'done') {
    return (
      <div className="text-center py-2">
        {/* Mail-off icon */}
        <div className="mx-auto mb-5 w-14 h-14 rounded-full bg-background border border-border flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#888"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-7 h-7"
            aria-hidden="true"
          >
            <path d="M2 7l10 7 10-7" />
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <line x1="17" y1="17" x2="22" y2="22" />
            <line x1="22" y1="17" x2="17" y2="22" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-2">
          You&apos;ve been unsubscribed
        </h2>
        <p className="text-muted text-sm mb-6">
          You won&apos;t receive any more digest emails. Changed your mind?
        </p>
        <Link
          href="/subscribe"
          className="text-sm font-medium text-primary hover:text-primary-dark underline transition-colors"
        >
          Subscribe again →
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-muted mb-1">Subscribed email</p>
        <p className="text-sm font-medium text-foreground">{email}</p>
      </div>

      <div>
        <p className="text-sm text-muted mb-1">Current categories</p>
        <div className="flex flex-wrap gap-1.5">
          {categoryNames.map((name) => (
            <span
              key={name}
              className="px-2.5 py-1 rounded-full text-xs font-medium bg-background border border-border text-muted"
            >
              {name}
            </span>
          ))}
        </div>
      </div>

      {status === 'error' && (
        <p className="text-sm text-red-600">
          Something went wrong. Please try again or contact hello@thisisharingey.co.uk.
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-3 pt-1">
        <button
          onClick={handleUnsubscribe}
          disabled={status === 'loading'}
          className="px-5 py-2.5 bg-foreground text-white rounded-md text-sm font-semibold hover:bg-foreground/80 transition-colors disabled:opacity-60"
        >
          {status === 'loading' ? 'Unsubscribing…' : 'Unsubscribe'}
        </button>
        <Link
          href="/"
          className="px-5 py-2.5 border border-border rounded-md text-sm font-medium text-muted hover:text-foreground hover:border-foreground/30 transition-colors text-center"
        >
          Keep my subscription
        </Link>
      </div>
    </div>
  )
}
