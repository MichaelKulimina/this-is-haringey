import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { approveSubmission, approveReReview, getSubmissionById } from '@/lib/submissions'
import { sendApprovalEmail } from '@/lib/email'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params

  // ── Admin auth check (defence in depth — middleware is first line) ──────────
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.app_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // ── Fetch submission ────────────────────────────────────────────────────────
  const submission = await getSubmissionById(id)
  if (!submission) {
    return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
  }

  if (
    submission.status !== 'pending' &&
    submission.status !== 'returned' &&
    submission.status !== 're_review'
  ) {
    return NextResponse.json(
      { error: `Cannot approve a submission with status '${submission.status}'` },
      { status: 400 }
    )
  }

  // ── Approve ─────────────────────────────────────────────────────────────────
  let eventId: string

  try {
    if (submission.parent_event_id) {
      // Re-review: update the existing published event in-place
      const result = await approveReReview(id)
      eventId = result.eventId
    } else {
      // Normal approval: create a new event record
      const result = await approveSubmission(id)
      eventId = result.eventId
    }
  } catch (err) {
    console.error('[admin/approve] failed:', err)
    return NextResponse.json({ error: 'Failed to approve submission.' }, { status: 500 })
  }

  // ── Send approval email ─────────────────────────────────────────────────────
  await sendApprovalEmail(submission.organiser_email, submission.event_name, eventId)

  return NextResponse.json({ success: true, eventId })
}
