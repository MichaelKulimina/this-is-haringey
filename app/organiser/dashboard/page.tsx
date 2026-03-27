import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import {
  getOrganiserSubmissions,
  getOrganiserPayments,
  getOrganiserProfile,
} from '@/lib/submissions'
import MyListingsTable from '@/components/organiser/MyListingsTable'
import BillingHistory from '@/components/organiser/BillingHistory'
import AccountSettings from '@/components/organiser/AccountSettings'

export const metadata: Metadata = { title: 'My listings — This Is Haringey' }

export default async function OrganiserDashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/organiser/login')
  }

  const [submissions, payments, profile] = await Promise.all([
    getOrganiserSubmissions(user.id),
    getOrganiserPayments(user.id),
    getOrganiserProfile(user.id),
  ])

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* My listings */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-extrabold tracking-[-0.03em] text-foreground">
            My listings
          </h2>
          <a
            href="/submit"
            className="px-4 py-2 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors"
          >
            + Submit new event
          </a>
        </div>
        <MyListingsTable submissions={submissions} />
      </section>

      {/* Account settings */}
      <section>
        <h2 className="text-xl font-extrabold tracking-[-0.03em] text-foreground mb-4">
          Account settings
        </h2>
        {profile && <AccountSettings organiser={profile} userId={user.id} />}
      </section>

      {/* Billing history */}
      {payments.length > 0 && (
        <section>
          <h2 className="text-xl font-extrabold tracking-[-0.03em] text-foreground mb-4">
            Billing history
          </h2>
          <BillingHistory payments={payments} />
        </section>
      )}
    </div>
  )
}
