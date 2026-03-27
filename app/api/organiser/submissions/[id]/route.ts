import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateReturnedSubmission } from '@/lib/submissions'
import { SubmissionEditSchema } from '@/lib/validations'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params

  // Auth check
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

  const parsed = SubmissionEditSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.flatten() },
      { status: 422 }
    )
  }

  try {
    await updateReturnedSubmission(id, user.id, {
      ...parsed.data,
      privacy_consent: true, // already consented on original submission
      image_url: (body as Record<string, unknown>).image_url as string | null ?? null,
      image_thumb_url: (body as Record<string, unknown>).image_thumb_url as string | null ?? null,
    })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[organiser/submissions PUT]', err)
    const message = err instanceof Error ? err.message : 'Failed to update submission'
    const status = message === 'Forbidden' ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
