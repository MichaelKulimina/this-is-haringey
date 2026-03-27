import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getSubmissionById } from '@/lib/submissions'
import SubmissionDetail from '@/components/admin/SubmissionDetail'

export const metadata: Metadata = { title: 'Review submission — Admin' }

export default async function AdminSubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const submission = await getSubmissionById(id)

  if (!submission) notFound()

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <SubmissionDetail submission={submission} />
    </div>
  )
}
