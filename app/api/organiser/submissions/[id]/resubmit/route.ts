import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resubmitSubmission } from '@/lib/submissions'
import { sendAdminNotification } from '@/lib/email'

export async function POST(
  _request: NextRequest,
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

  try {
    const { organiser_email, event_name } = await resubmitSubmission(id, user.id)

    // Notify admin that a submission has been resubmitted
    await sendAdminNotification(event_name, id, organiser_email)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[organiser/resubmit]', err)
    const message = err instanceof Error ? err.message : 'Failed to resubmit'
    const status = message === 'Forbidden' ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
