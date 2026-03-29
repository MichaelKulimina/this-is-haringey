import type { Metadata } from 'next'
import { createServiceClient } from '@/lib/supabase/service'
import ManagePreferencesForm from './ManagePreferencesForm'

export const metadata: Metadata = {
  title: 'Manage preferences — This Is Haringey',
}

interface Props {
  searchParams: Promise<{ token?: string }>
}

export default async function ManagePreferencesPage({ searchParams }: Props) {
  const { token } = await searchParams

  if (!token) {
    return <InvalidLink />
  }

  const supabase = createServiceClient()

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('id, email, categories, verified, unsubscribed_at, verification_token')
    .eq('verification_token', token)
    .maybeSingle()

  if (!subscription || !subscription.verified) {
    return <InvalidLink />
  }

  if (subscription.unsubscribed_at) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center">
          <h1 className="text-2xl font-extrabold tracking-[-0.03em] text-foreground mb-3">
            You&apos;re not subscribed
          </h1>
          <p className="text-muted text-base leading-relaxed">
            This subscription has been cancelled. You can subscribe again from
            the home page if you&apos;d like to start receiving digests.
          </p>
        </div>
      </div>
    )
  }

  // Fetch all available categories
  const { data: allCategories } = await supabase
    .from('categories')
    .select('id, name')
    .order('name')

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full">
        <h1 className="text-2xl font-extrabold tracking-[-0.03em] text-foreground mb-2">
          Manage your preferences
        </h1>
        <p className="text-muted text-sm mb-6">
          Choose which categories you&apos;d like to receive in your weekly
          digest. Changes take effect from the next email.
        </p>

        <div className="bg-surface border border-border rounded-xl p-6">
          <ManagePreferencesForm
            token={token}
            email={subscription.email}
            currentCategories={subscription.categories}
            allCategories={allCategories ?? []}
            unsubscribeUrl={`/unsubscribe?token=${token}`}
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
