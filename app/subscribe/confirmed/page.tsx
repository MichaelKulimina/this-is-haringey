import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Subscribed — This Is Haringey',
}

export default function SubscribeConfirmedPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-[#EEF3EF] flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#6B7C6E"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-8 h-8"
            aria-hidden="true"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h1 className="text-2xl font-extrabold tracking-[-0.03em] text-foreground mb-3">
          You&apos;re subscribed!
        </h1>
        <p className="text-muted text-base leading-relaxed mb-2">
          You&apos;ll receive your first digest this Friday. We&apos;ll only
          email you about events in the categories you selected.
        </p>
        <p className="text-muted text-sm mb-8">
          You can manage or cancel your subscription at any time using the link
          in each digest email.
        </p>

        <Link
          href="/"
          className="inline-block px-6 py-2.5 bg-primary text-white rounded-md text-sm font-semibold tracking-[-0.01em] hover:bg-primary-dark transition-colors"
        >
          Browse events →
        </Link>
      </div>
    </div>
  )
}
