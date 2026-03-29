import type { Metadata } from 'next'
import Link from 'next/link'
import { getCategories } from '@/lib/events'
import SubscriptionWidget from '@/components/SubscriptionWidget'

export const metadata: Metadata = {
  title: 'Subscribe',
  description:
    'Get a free weekly email with upcoming events in Haringey, filtered by the categories you care about.',
  twitter: {
    card: 'summary_large_image',
  },
}

export default async function SubscribePage() {
  const categories = await getCategories()

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      {/* Breadcrumb */}
      <nav className="mb-8 text-sm text-muted" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-foreground transition-colors">
          What&apos;s On
        </Link>
        <span className="mx-2 text-border" aria-hidden="true">/</span>
        <span className="text-foreground">Subscribe</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-[-0.04em] text-foreground mb-3">
          Never miss what&apos;s on
        </h1>
        <p className="text-muted text-base leading-relaxed max-w-lg">
          Get a free weekly digest every Friday with upcoming events in Haringey
          — filtered by the categories you actually care about. No noise, no
          spam. Unsubscribe at any time.
        </p>
      </div>

      {/* How it works */}
      <div className="mb-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            step: '01',
            heading: 'Choose your categories',
            body: 'Pick from Arts, Music, Community, Food & Drink, or Learning & Talks.',
          },
          {
            step: '02',
            heading: 'Confirm your email',
            body: "We'll send a one-click verification link. No account needed.",
          },
          {
            step: '03',
            heading: 'Get Friday digests',
            body: 'Receive a curated list of upcoming events every Friday morning.',
          },
        ].map(({ step, heading, body }) => (
          <div
            key={step}
            className="bg-surface border border-border rounded-xl p-5"
          >
            <p className="text-xs font-semibold tracking-[0.10em] uppercase text-primary mb-2">
              {step}
            </p>
            <p className="text-sm font-semibold text-foreground mb-1">{heading}</p>
            <p className="text-sm text-muted leading-relaxed">{body}</p>
          </div>
        ))}
      </div>

      {/* Widget */}
      <SubscriptionWidget categories={categories} />
    </div>
  )
}
