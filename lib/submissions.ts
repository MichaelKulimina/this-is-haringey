import { createServiceClient } from '@/lib/supabase/service'
import type { SubmissionFormData } from '@/lib/validations'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Submission {
  id: string
  event_name: string
  short_description: string
  full_description: string | null
  image_url: string | null
  image_thumb_url: string | null
  category_id: string
  category?: { id: string; name: string; slug: string }
  event_date_start: string
  event_date_end: string | null
  start_time: string
  end_time: string | null
  venue_name: string
  venue_address: string
  neighbourhood: string | null
  ticket_price: string
  ticket_url: string | null
  organiser_id: string | null
  organiser_name: string
  organiser_email: string
  accessibility_info: string | null
  borough_of_culture: boolean
  status: 'awaiting_payment' | 'pending' | 'approved' | 'returned' | 'rejected' | 'withdrawn' | 're_review' | 'withdrawal_requested'
  parent_event_id: string | null
  admin_feedback: string | null
  stripe_payment_intent_id: string | null
  stripe_charge_id: string | null
  submitter_ip: string | null
  privacy_consent: boolean
  created_at: string
  updated_at: string
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createSubmission(
  data: SubmissionFormData & { image_url?: string | null; image_thumb_url?: string | null },
  ip: string,
  userId?: string | null
): Promise<{ id: string }> {
  const db = createServiceClient()

  const { data: row, error } = await db
    .from('submissions')
    .insert({
      event_name: data.event_name,
      short_description: data.short_description,
      full_description: data.full_description ?? null,
      image_url: data.image_url ?? null,
      image_thumb_url: data.image_thumb_url ?? null,
      category_id: data.category_id,
      event_date_start: data.event_date_start,
      event_date_end: data.event_date_end || null,
      start_time: data.start_time,
      end_time: data.end_time || null,
      venue_name: data.venue_name,
      venue_address: data.venue_address,
      neighbourhood: data.neighbourhood ?? null,
      ticket_price: data.ticket_price,
      ticket_url: data.ticket_url ?? null,
      organiser_id: userId ?? null,
      organiser_name: data.organiser_name,
      organiser_email: data.organiser_email,
      accessibility_info: data.accessibility_info ?? null,
      borough_of_culture: data.borough_of_culture,
      status: 'awaiting_payment',
      submitter_ip: ip,
      privacy_consent: true,
    })
    .select('id')
    .single()

  if (error) throw new Error(`createSubmission failed: ${error.message}`)
  return { id: row.id }
}

// ─── Update after payment ─────────────────────────────────────────────────────

export async function updateSubmissionAfterPayment(
  id: string,
  paymentIntentId: string,
  chargeId: string
): Promise<void> {
  const db = createServiceClient()

  const { error } = await db
    .from('submissions')
    .update({
      status: 'pending',
      stripe_payment_intent_id: paymentIntentId,
      stripe_charge_id: chargeId,
    })
    .eq('id', id)

  if (error) throw new Error(`updateSubmissionAfterPayment failed: ${error.message}`)
}

// ─── Admin reads ──────────────────────────────────────────────────────────────

export async function getSubmissionsForAdmin(status?: string): Promise<Submission[]> {
  const db = createServiceClient()

  let query = db
    .from('submissions')
    .select('*, category:categories(id, name, slug)')
    .order('created_at', { ascending: false })

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) throw new Error(`getSubmissionsForAdmin failed: ${error.message}`)
  return (data ?? []) as Submission[]
}

export async function getSubmissionById(id: string): Promise<Submission | null> {
  const db = createServiceClient()

  const { data, error } = await db
    .from('submissions')
    .select('*, category:categories(id, name, slug)')
    .eq('id', id)
    .single()

  if (error) return null
  return data as Submission
}

// ─── Admin actions ────────────────────────────────────────────────────────────

export async function approveSubmission(id: string): Promise<{ eventId: string }> {
  const db = createServiceClient()

  // Fetch submission
  const submission = await getSubmissionById(id)
  if (!submission) throw new Error('Submission not found')

  // Publish to events table
  const { data: event, error: eventError } = await db
    .from('events')
    .insert({
      submission_id: id,
      event_name: submission.event_name,
      short_description: submission.short_description,
      full_description: submission.full_description,
      image_url: submission.image_url,
      image_thumb_url: submission.image_thumb_url,
      category_id: submission.category_id,
      event_date_start: submission.event_date_start,
      event_date_end: submission.event_date_end,
      start_time: submission.start_time,
      end_time: submission.end_time,
      venue_name: submission.venue_name,
      venue_address: submission.venue_address,
      neighbourhood: submission.neighbourhood,
      ticket_price: submission.ticket_price,
      ticket_url: submission.ticket_url,
      organiser_id: submission.organiser_id,
      organiser_name: submission.organiser_name,
      accessibility_info: submission.accessibility_info,
      borough_of_culture: submission.borough_of_culture,
      status: 'published',
      published_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (eventError) throw new Error(`publishEvent failed: ${eventError.message}`)

  // Update submission status
  const { error: submissionError } = await db
    .from('submissions')
    .update({ status: 'approved' })
    .eq('id', id)

  if (submissionError) throw new Error(`approveSubmission update failed: ${submissionError.message}`)

  return { eventId: event.id }
}

export async function returnSubmission(id: string, feedback: string): Promise<void> {
  const db = createServiceClient()

  const { error } = await db
    .from('submissions')
    .update({ status: 'returned', admin_feedback: feedback })
    .eq('id', id)

  if (error) throw new Error(`returnSubmission failed: ${error.message}`)
}

export async function rejectSubmission(id: string, reason: string): Promise<void> {
  const db = createServiceClient()

  const { error } = await db
    .from('submissions')
    .update({ status: 'rejected', admin_feedback: reason })
    .eq('id', id)

  if (error) throw new Error(`rejectSubmission failed: ${error.message}`)
}

// ─── Organiser reads ───────────────────────────────────────────────────────────

export interface Payment {
  id: string
  submission_id: string
  event_name: string
  organiser_name: string
  organiser_email: string
  amount_pence: number
  currency: string
  stripe_payment_intent_id: string
  stripe_charge_id: string | null
  status: 'succeeded' | 'refunded'
  created_at: string
}

export async function getOrganiserSubmissions(userId: string): Promise<Submission[]> {
  const db = createServiceClient()

  // Exclude re-review submissions — they are change requests, not listings
  const { data, error } = await db
    .from('submissions')
    .select('*, category:categories(id, name, slug)')
    .eq('organiser_id', userId)
    .is('parent_event_id', null)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`getOrganiserSubmissions failed: ${error.message}`)
  const submissions = (data ?? []) as Submission[]

  // For approved submissions, overlay the linked event's status so the
  // organiser sees withdrawal_requested / withdrawn instead of "Live"
  const approvedIds = submissions.filter(s => s.status === 'approved').map(s => s.id)
  if (approvedIds.length === 0) return submissions

  const { data: events } = await db
    .from('events')
    .select('submission_id, status')
    .in('submission_id', approvedIds)

  const eventStatusMap = new Map((events ?? []).map(e => [e.submission_id, e.status]))

  return submissions.map(s => {
    const evStatus = eventStatusMap.get(s.id)
    if (evStatus && evStatus !== 'published') {
      return { ...s, status: evStatus as Submission['status'] }
    }
    return s
  })
}

export async function getOrganiserPayments(userId: string): Promise<Payment[]> {
  const db = createServiceClient()

  const { data, error } = await db
    .from('payments')
    .select('*')
    .eq('organiser_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`getOrganiserPayments failed: ${error.message}`)
  return (data ?? []) as Payment[]
}

export async function getOrganiserProfile(userId: string): Promise<{
  id: string
  full_name: string
  organisation_name: string | null
  email: string
} | null> {
  const db = createServiceClient()

  const { data, error } = await db
    .from('organisers')
    .select('id, full_name, organisation_name, email')
    .eq('id', userId)
    .single()

  if (error) return null
  return data
}

// ─── Organiser actions ────────────────────────────────────────────────────────

export async function updateReturnedSubmission(
  id: string,
  userId: string,
  data: SubmissionFormData & { image_url?: string | null; image_thumb_url?: string | null }
): Promise<void> {
  const db = createServiceClient()

  // Verify ownership and status
  const existing = await getSubmissionById(id)
  if (!existing) throw new Error('Submission not found')
  if (existing.organiser_id !== userId) throw new Error('Forbidden')
  if (existing.status !== 'returned') throw new Error('Submission is not in returned state')

  const { error } = await db
    .from('submissions')
    .update({
      event_name: data.event_name,
      short_description: data.short_description,
      full_description: data.full_description ?? null,
      image_url: data.image_url ?? null,
      image_thumb_url: data.image_thumb_url ?? null,
      category_id: data.category_id,
      event_date_start: data.event_date_start,
      event_date_end: data.event_date_end || null,
      start_time: data.start_time,
      end_time: data.end_time || null,
      venue_name: data.venue_name,
      venue_address: data.venue_address,
      neighbourhood: data.neighbourhood ?? null,
      ticket_price: data.ticket_price,
      ticket_url: data.ticket_url ?? null,
      organiser_name: data.organiser_name,
      organiser_email: data.organiser_email,
      accessibility_info: data.accessibility_info ?? null,
      borough_of_culture: data.borough_of_culture,
    })
    .eq('id', id)

  if (error) throw new Error(`updateReturnedSubmission failed: ${error.message}`)
}

export async function resubmitSubmission(
  id: string,
  userId: string
): Promise<{ organiser_email: string; event_name: string }> {
  const db = createServiceClient()

  const existing = await getSubmissionById(id)
  if (!existing) throw new Error('Submission not found')
  if (existing.organiser_id !== userId) throw new Error('Forbidden')
  if (existing.status !== 'returned') throw new Error('Submission is not in returned state')

  const { error } = await db
    .from('submissions')
    .update({ status: 'pending' })
    .eq('id', id)

  if (error) throw new Error(`resubmitSubmission failed: ${error.message}`)

  return {
    organiser_email: existing.organiser_email,
    event_name: existing.event_name,
  }
}

export async function requestWithdrawal(
  submissionId: string,
  userId: string
): Promise<void> {
  const db = createServiceClient()

  // Resolve submission to find its parent_event_id (re-review) or look up
  // the event directly via events.submission_id (original submission)
  const { data: submission } = await db
    .from('submissions')
    .select('id, parent_event_id')
    .eq('id', submissionId)
    .single()

  const { data: event, error: fetchError } = submission?.parent_event_id
    ? await db.from('events').select('id, organiser_id, status').eq('id', submission.parent_event_id).single()
    : await db.from('events').select('id, organiser_id, status').eq('submission_id', submissionId).single()

  if (fetchError || !event) throw new Error('Event not found')
  if (event.organiser_id !== userId) throw new Error('Forbidden')
  if (event.status !== 'published') throw new Error('Event is not published')

  const { error } = await db
    .from('events')
    .update({ status: 'withdrawal_requested' })
    .eq('id', event.id)

  if (error) throw new Error(`requestWithdrawal failed: ${error.message}`)
}

export async function createReReviewSubmission(
  eventId: string,
  userId: string,
  data: Omit<SubmissionFormData, 'organiser_email'> & { image_url?: string | null; image_thumb_url?: string | null }
): Promise<{ id: string }> {
  const db = createServiceClient()

  // Verify the event belongs to this organiser
  const { data: event, error: fetchError } = await db
    .from('events')
    .select('id, organiser_id')
    .eq('id', eventId)
    .single()

  if (fetchError || !event) throw new Error('Event not found')
  if (event.organiser_id !== userId) throw new Error('Forbidden')

  // Fetch organiser email from the organisers table
  const { data: organiser } = await db
    .from('organisers')
    .select('email')
    .eq('id', userId)
    .single()

  const organiserEmail = organiser?.email ?? ''

  const { data: row, error } = await db
    .from('submissions')
    .insert({
      event_name: data.event_name,
      short_description: data.short_description,
      full_description: data.full_description ?? null,
      image_url: data.image_url ?? null,
      image_thumb_url: data.image_thumb_url ?? null,
      category_id: data.category_id,
      event_date_start: data.event_date_start,
      event_date_end: data.event_date_end || null,
      start_time: data.start_time,
      end_time: data.end_time || null,
      venue_name: data.venue_name,
      venue_address: data.venue_address,
      neighbourhood: data.neighbourhood ?? null,
      ticket_price: data.ticket_price,
      ticket_url: data.ticket_url ?? null,
      organiser_id: userId,
      organiser_name: data.organiser_name,
      organiser_email: organiserEmail,
      accessibility_info: data.accessibility_info ?? null,
      borough_of_culture: data.borough_of_culture,
      status: 're_review',
      parent_event_id: eventId,
      privacy_consent: true,
      stripe_payment_intent_id: null,
      stripe_charge_id: null,
      submitter_ip: null,
    })
    .select('id')
    .single()

  if (error) throw new Error(`createReReviewSubmission failed: ${error.message}`)
  return { id: row.id }
}

export async function approveReReview(
  submissionId: string
): Promise<{ eventId: string; organiser_email: string }> {
  const db = createServiceClient()

  const submission = await getSubmissionById(submissionId)
  if (!submission) throw new Error('Submission not found')
  if (!submission.parent_event_id) throw new Error('No parent event linked')

  // Update the existing event with the new submission data
  const { error: updateError } = await db
    .from('events')
    .update({
      event_name: submission.event_name,
      short_description: submission.short_description,
      full_description: submission.full_description,
      image_url: submission.image_url,
      image_thumb_url: submission.image_thumb_url,
      category_id: submission.category_id,
      event_date_start: submission.event_date_start,
      event_date_end: submission.event_date_end,
      start_time: submission.start_time,
      end_time: submission.end_time,
      venue_name: submission.venue_name,
      venue_address: submission.venue_address,
      neighbourhood: submission.neighbourhood,
      ticket_price: submission.ticket_price,
      ticket_url: submission.ticket_url,
      organiser_name: submission.organiser_name,
      accessibility_info: submission.accessibility_info,
      borough_of_culture: submission.borough_of_culture,
    })
    .eq('id', submission.parent_event_id)

  if (updateError) throw new Error(`approveReReview update event failed: ${updateError.message}`)

  // Mark submission as approved
  const { error: subError } = await db
    .from('submissions')
    .update({ status: 'approved' })
    .eq('id', submissionId)

  if (subError) throw new Error(`approveReReview update submission failed: ${subError.message}`)

  return {
    eventId: submission.parent_event_id,
    organiser_email: submission.organiser_email,
  }
}

export async function confirmWithdrawal(
  eventId: string
): Promise<{ organiser_email: string; event_name: string }> {
  const db = createServiceClient()

  const { data: event, error: fetchError } = await db
    .from('events')
    .select('id, organiser_id, event_name, status')
    .eq('id', eventId)
    .single()

  if (fetchError || !event) throw new Error('Event not found')
  if (event.status !== 'withdrawal_requested') throw new Error('Event is not awaiting withdrawal')

  const { data: organiser } = await db
    .from('organisers')
    .select('email')
    .eq('id', event.organiser_id)
    .single()

  const { error } = await db
    .from('events')
    .update({ status: 'withdrawn' })
    .eq('id', eventId)

  if (error) throw new Error(`confirmWithdrawal failed: ${error.message}`)

  return {
    organiser_email: organiser?.email ?? '',
    event_name: event.event_name,
  }
}

export async function updateOrganiserProfile(
  userId: string,
  data: { full_name?: string; organisation_name?: string | null; email?: string }
): Promise<void> {
  const db = createServiceClient()

  const { error } = await db
    .from('organisers')
    .update({
      ...(data.full_name !== undefined && { full_name: data.full_name }),
      ...(data.organisation_name !== undefined && { organisation_name: data.organisation_name }),
      ...(data.email !== undefined && { email: data.email }),
    })
    .eq('id', userId)

  if (error) throw new Error(`updateOrganiserProfile failed: ${error.message}`)
}

export async function getWithdrawalRequestsForAdmin(): Promise<
  Array<{ id: string; event_name: string; organiser_name: string; organiser_email: string; organiser_id: string | null; published_at: string; updated_at: string }>
> {
  const db = createServiceClient()

  const { data, error } = await db
    .from('events')
    .select('id, event_name, organiser_name, organiser_id, published_at, updated_at, organiser:organisers(email)')
    .eq('status', 'withdrawal_requested')
    .order('updated_at', { ascending: false })

  if (error) throw new Error(`getWithdrawalRequestsForAdmin failed: ${error.message}`)

  return (data ?? []).map((e) => ({
    id: e.id,
    event_name: e.event_name,
    organiser_name: e.organiser_name,
    organiser_email: (e.organiser as { email?: string } | null)?.email ?? '',
    organiser_id: e.organiser_id,
    published_at: e.published_at,
    updated_at: e.updated_at,
  }))
}
