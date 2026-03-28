import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createReReviewSubmission } from '@/lib/submissions'
import { sendReReviewNotification } from '@/lib/email'
import { ReReviewSchema } from '@/lib/validations'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.app_metadata?.role === 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = ReReviewSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.flatten() },
      { status: 422 }
    )
  }

  try {
    const { id: submissionId } = await createReReviewSubmission(id, user.id, {
      ...parsed.data,
      privacy_consent: true,
      image_url: (body as Record<string, unknown>).image_url as string | null ?? null,
      image_thumb_url: (body as Record<string, unknown>).image_thumb_url as string | null ?? null,
    })

    await sendReReviewNotification(parsed.data.event_name, submissionId)

    return NextResponse.json({ success: true, submissionId })
  } catch (err) {
    console.error('[organiser/events/edit]', err)
    const message = err instanceof Error ? err.message : 'Failed to submit changes'
    const status = message === 'Forbidden' ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
