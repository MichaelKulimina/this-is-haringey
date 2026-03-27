import { redirect, notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { getCategories } from '@/lib/events'
import ReReviewForm from '@/components/organiser/ReReviewForm'

export const metadata: Metadata = { title: 'Edit listing — This Is Haringey' }

export default async function ReReviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // NOTE: The [id] here is the submission id — we use it to find the linked event
  const { id } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/organiser/login')
  }

  // Find the event linked to this submission
  const db = createServiceClient()
  const { data: submission } = await db
    .from('submissions')
    .select('*, category:categories(id, name, slug)')
    .eq('id', id)
    .single()

  if (!submission) notFound()
  if (submission.organiser_id !== user.id) notFound()
  if (submission.status !== 'approved') redirect('/organiser/dashboard')

  // Find the published event linked to this submission
  const { data: event } = await db
    .from('events')
    .select('*')
    .eq('submission_id', id)
    .eq('status', 'published')
    .single()

  if (!event) redirect('/organiser/dashboard')

  const categories = await getCategories()

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <a
          href="/organiser/dashboard"
          className="text-sm text-muted hover:text-foreground transition-colors mb-4 inline-block"
        >
          ← Back to my listings
        </a>
        <h1 className="text-3xl font-extrabold tracking-[-0.03em] text-foreground mb-2">
          Edit listing
        </h1>
        <div className="mt-3 p-3 rounded-md bg-amber-50 border border-amber-200 text-sm text-amber-800">
          <strong>Your listing remains live</strong> while your changes are under review.
          Once approved, the updated version will replace the current one.
        </div>
      </div>

      <div className="bg-surface border border-border rounded-lg p-6 sm:p-8">
        <ReReviewForm
          event={event}
          categories={categories}
        />
      </div>
    </div>
  )
}
