import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { returnSubmission, getSubmissionById } from '@/lib/submissions'
import { sendReturnEmail } from '@/lib/email'
import { AdminActionSchema } from '@/lib/validations'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params

  // ── Admin auth check ────────────────────────────────────────────────────────
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.app_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // ── Validate body ───────────────────────────────────────────────────────────
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const parsed = AdminActionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors.feedback?.[0] ?? 'Feedback is required.' },
      { status: 422 }
    )
  }

  // ── Fetch submission ────────────────────────────────────────────────────────
  const submission = await getSubmissionById(id)
  if (!submission) {
    return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
  }

  // ── Return ──────────────────────────────────────────────────────────────────
  try {
    await returnSubmission(id, parsed.data.feedback)
  } catch (err) {
    console.error('[admin/return] returnSubmission failed:', err)
    return NextResponse.json({ error: 'Failed to return submission.' }, { status: 500 })
  }

  // ── Send email ──────────────────────────────────────────────────────────────
  await sendReturnEmail(
    submission.organiser_email,
    submission.event_name,
    parsed.data.feedback
  )

  return NextResponse.json({ success: true })
}
