'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const CONSENT_KEY = 'tih-cookie-consent'

export type ConsentValue = 'accepted' | 'declined'

/** Returns the stored consent value, or null if none has been set yet. */
export function getStoredConsent(): ConsentValue | null {
  if (typeof window === 'undefined') return null
  const v = localStorage.getItem(CONSENT_KEY)
  if (v === 'accepted' || v === 'declined') return v
  return null
}

export default function CookieConsent() {
  // Start hidden — we reveal only after the client has checked localStorage.
  // This avoids an SSR/hydration mismatch where the banner flickers on every
  // page load before the preference is read.
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (getStoredConsent() === null) {
      setVisible(true)
    }
  }, [])

  function handleAccept() {
    localStorage.setItem(CONSENT_KEY, 'accepted')
    setVisible(false)
  }

  function handleDecline() {
    localStorage.setItem(CONSENT_KEY, 'declined')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      aria-live="polite"
      className="fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-border shadow-lg"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Description */}
        <p className="text-sm text-muted flex-1 leading-relaxed">
          We use cookies to keep you signed in and to measure anonymous page
          views.{' '}
          <Link
            href="/cookies"
            className="text-foreground underline hover:no-underline"
          >
            Cookie Policy
          </Link>
        </p>

        {/* Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleDecline}
            className="px-4 py-2 rounded-md border border-border bg-transparent text-sm font-medium text-foreground hover:bg-background transition-colors cursor-pointer"
          >
            Necessary only
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-2 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors cursor-pointer"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  )
}
