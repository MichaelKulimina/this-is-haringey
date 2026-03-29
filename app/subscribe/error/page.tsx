import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Verification failed — This Is Haringey',
}

export default function SubscribeErrorPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-[#FDF5F1] flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#E05A2B"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-8 h-8"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        <h1 className="text-2xl font-extrabold tracking-[-0.03em] text-foreground mb-3">
          That link has expired
        </h1>
        <p className="text-muted text-base leading-relaxed mb-8">
          Verification links are one-time use. If you&apos;d like to subscribe,
          please sign up again — it only takes a moment.
        </p>

        <Link
          href="/subscribe"
          className="inline-block px-6 py-2.5 bg-primary text-white rounded-md text-sm font-semibold tracking-[-0.01em] hover:bg-primary-dark transition-colors"
        >
          Subscribe →
        </Link>
      </div>
    </div>
  )
}
