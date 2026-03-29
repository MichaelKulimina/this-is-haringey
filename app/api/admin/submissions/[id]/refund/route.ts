import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSubmissionById } from '@/lib/submissions'
import { getStripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(
  _request: NextRequest,
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

  // ── Fetch submission ────────────────────────────────────────────────────────
  const submission = await getSubmissionById(id)
  if (!submission) {
    return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
  }

  if (submission.status !== 'rejected') {
    return NextResponse.json(
      { error: 'Refunds can only be issued for rejected submissions.' },
      { status: 422 }
    )
  }

  if (!submission.stripe_charge_id) {
    return NextResponse.json(
      { error: 'No Stripe charge found for this submission.' },
      { status: 422 }
    )
  }

  // ── Check if already refunded ───────────────────────────────────────────────
  const db = createServiceClient()
  const { data: payment } = await db
    .from('payments')
    .select('status')
    .eq('submission_id', id)
    .single()

  if (payment?.status === 'refunded') {
    return NextResponse.json({ error: 'This submission has already been refunded.' }, { status: 422 })
  }

  // ── Issue Stripe refund ─────────────────────────────────────────────────────
  try {
    await getStripe().refunds.create({
      charge: submission.stripe_charge_id,
      reason: 'requested_by_customer',
    })

    await db
      .from('payments')
      .update({ status: 'refunded' })
      .eq('submission_id', id)
  } catch (err) {
    console.error('[admin/refund] Stripe refund failed:', err)
    return NextResponse.json(
      { error: 'Failed to issue refund. Please refund manually in Stripe dashboard.' },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
