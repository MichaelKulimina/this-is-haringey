import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { confirmWithdrawal } from '@/lib/submissions'
import { sendWithdrawalConfirmedEmail } from '@/lib/email'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.app_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { organiser_email, event_name } = await confirmWithdrawal(id)
    await sendWithdrawalConfirmedEmail(organiser_email, event_name)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[admin/confirm-withdrawal]', err)
    return NextResponse.json({ error: 'Failed to confirm withdrawal' }, { status: 500 })
  }
}
