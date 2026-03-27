import { redirect, notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getSubmissionById } from '@/lib/submissions'
import { getCategories } from '@/lib/events'
import EditSubmissionForm from '@/components/organiser/EditSubmissionForm'

export const metadata: Metadata = { title: 'Edit submission — This Is Haringey' }

export default async function EditSubmissionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/organiser/login')
  }

  const [submission, categories] = await Promise.all([
    getSubmissionById(id),
    getCategories(),
  ])

  if (!submission) notFound()

  // Only the owning organiser can edit their own returned submission
  if (submission.organiser_id !== user.id) notFound()
  if (submission.status !== 'returned') {
    redirect('/organiser/dashboard')
  }

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
          Edit submission
        </h1>
        <p className="text-sm text-muted">
          Address the feedback below, then resubmit for review. No additional payment required.
        </p>
        {submission.admin_feedback && (
          <div className="mt-4 p-4 rounded-md border-l-4 border-primary bg-[#FDF5F1] text-sm text-foreground">
            <p className="font-semibold text-xs uppercase tracking-[0.08em] text-primary mb-1">
              Feedback from our team
            </p>
            <p className="text-sm text-foreground">{submission.admin_feedback}</p>
          </div>
        )}
      </div>

      <div className="bg-surface border border-border rounded-lg p-6 sm:p-8">
        <EditSubmissionForm
          submission={submission}
          categories={categories}
          mode="edit-returned"
        />
      </div>
    </div>
  )
}
