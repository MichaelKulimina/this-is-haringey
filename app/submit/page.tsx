import type { Metadata } from 'next'
import { getCategories } from '@/lib/events'
import { createClient } from '@/lib/supabase/server'
import SubmitForm from '@/components/SubmitForm'

export const metadata: Metadata = {
  title: 'Submit an Event',
  description:
    'Submit your Haringey event to This Is Haringey. Reach thousands of local people with a £10 listing.',
}

export default async function SubmitPage({
  searchParams,
}: {
  searchParams: Promise<{ cancelled?: string }>
}) {
  const params = await searchParams
  const cancelled = params.cancelled === '1'

  const [categories, supabase] = await Promise.all([
    getCategories(),
    createClient(),
  ])

  // Pre-fill organiser details if logged in
  let prefill: { organiser_name?: string; organiser_email?: string } | null = null
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const { data: organiser } = await supabase
        .from('organisers')
        .select('full_name, email')
        .eq('id', user.id)
        .single()

      if (organiser) {
        prefill = {
          organiser_name: organiser.full_name ?? '',
          organiser_email: organiser.email ?? '',
        }
      }
    }
  } catch {
    // Non-fatal — guest submission
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-[-0.03em] text-foreground mb-2">
          Submit an event
        </h1>
        <p className="text-muted text-base">
          Share your event with the Haringey community. Listings are reviewed within 3 business days.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted">
          <span className="inline-flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Reviewed by our team
          </span>
          <span className="inline-flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
            One-time fee of £10
          </span>
          <span className="inline-flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Live within 3 business days
          </span>
        </div>
      </div>

      {/* Cancelled banner */}
      {cancelled && (
        <div className="mb-6 p-4 rounded-md bg-background border border-border text-sm text-muted">
          Your payment was cancelled. Your form details are preserved below — complete the form and try again when you&#39;re ready.
        </div>
      )}

      {/* The form */}
      <div className="bg-surface border border-border rounded-lg p-6 sm:p-8">
        <SubmitForm categories={categories} prefill={prefill} />
      </div>

      {/* Footer note */}
      <p className="mt-6 text-xs text-muted text-center">
        Free listings are available for registered charities, CICs, and Haringey Council partners.{' '}
        <a href="mailto:hello@thisisharingey.co.uk" className="text-primary hover:underline">
          Contact us
        </a>{' '}
        to apply.
      </p>
    </div>
  )
}
