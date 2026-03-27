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
  status: 'awaiting_payment' | 'pending' | 'approved' | 'returned' | 'rejected' | 'withdrawn'
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
