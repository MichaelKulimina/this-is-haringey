'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { getStoredConsent } from '@/components/CookieConsent'

export default function PageTracker() {
  const pathname = usePathname()
  const lastTracked = useRef<string | null>(null)

  useEffect(() => {
    // Only track if the user has explicitly accepted cookies (GDPR — Section 12.6)
    if (getStoredConsent() !== 'accepted') return

    // Only track public-facing routes
    if (
      pathname.startsWith('/admin') ||
      pathname.startsWith('/organiser') ||
      pathname.startsWith('/api')
    ) {
      return
    }

    // Avoid double-tracking the same path in a single session
    if (lastTracked.current === pathname) return
    lastTracked.current = pathname

    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: pathname,
        referrer: document.referrer || null,
      }),
    }).catch(() => {})
  }, [pathname])

  return null
}
