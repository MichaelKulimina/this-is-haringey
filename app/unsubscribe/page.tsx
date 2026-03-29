import type { Metadata } from 'next'
import { createServiceClient } from '@/lib/supabase/service'
import UnsubscribeForm from './UnsubscribeForm'

export const metadata: Metadata = {
  title: 'Unsubscribe — This Is Haringey',
}

interface Props {
  searchParams: Promise<{ token?: string }>
}

export default async function UnsubscribePage({ searchParams }: Props) {
  const { token } = await searchParams

  if (!token) {
    return <InvalidLink />
  }

  const supabase = createServiceClient()

  const { data: subscription, error: subError } = await supabase
    .from('subscriptions')
    .select('id, email, categories, verified, unsubscribed_at, verification_token')
    .eq('verification_token', token)
    .maybeSingle()

  if (subError) {
    console.error('[unsubscribe] query error:', subError)
  }
  console.log('[unsubscribe] token:', token, '| found:', !!subscription)

  if (!subscription) {
    return <InvalidLink />
  }

  if (subscription.unsubscribed_at) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center">
          <h1 className="text-2xl font-extrabold tracking-[-0.03em] text-foreground mb-3">
            You&apos;re already unsubscribed
          </h1>
          <p className="text-muted text-base leading-relaxed">
            You won&apos;t receive any more digest emails from us. If you change
            your mind, you can always subscribe again from the home page.
          </p>
        </div>
      </div>
    )
  }

  // Fetch category names for display
  const { data: catRows } = await supabase
    .from('categories')
    .select('id, name')
    .in('id', subscription.categories)

  const categoryNames = (catRows ?? []).map((c: { id: string; name: string }) => c.name)

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full">
        <h1 className="text-2xl font-extrabold tracking-[-0.03em] text-foreground mb-2">
          Unsubscribe from This Is Haringey
        </h1>
        <p className="text-muted text-sm mb-6">
          You&apos;re currently subscribed to weekly digests for{' '}
          <strong className="text-foreground">{categoryNames.join(', ')}</strong>.
        </p>

        <div className="bg-surface border border-border rounded-xl p-6">
          <UnsubscribeForm
            token={token}
            email={subscription.email}
            categoryNames={categoryNames}
          />
        </div>
      </div>
    </div>
  )
}

function InvalidLink() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center">
        <h1 className="text-2xl font-extrabold tracking-[-0.03em] text-foreground mb-3">
          That link isn&apos;t valid
        </h1>
        <p className="text-muted text-base leading-relaxed">
          If you need help managing your subscription, please contact{' '}
          <a
            href="mailto:hello@thisisharingey.co.uk"
            className="underline hover:text-foreground transition-colors"
          >
            hello@thisisharingey.co.uk
          </a>
          .
        </p>
      </div>
    </div>
  )
}
