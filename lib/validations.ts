import { z } from 'zod'

// ─── Step schemas (used for per-step client-side validation) ──────────────────

export const SubmissionStep1Schema = z.object({
  event_name: z
    .string()
    .min(1, 'Event name is required')
    .max(100, 'Event name must be 100 characters or fewer'),
  short_description: z
    .string()
    .min(1, 'Short description is required')
    .max(300, 'Short description must be 300 characters or fewer'),
  full_description: z.string().optional(),
  category_id: z.string().uuid('Please select a category'),
  borough_of_culture: z.boolean().default(false),
})

export const SubmissionStep2Schema = z
  .object({
    event_date_start: z.string().min(1, 'Start date is required'),
    event_date_end: z.string().optional().transform(v => v || undefined),
    start_time: z.string().min(1, 'Start time is required'),
    end_time: z.string().optional().transform(v => v || undefined),
    venue_name: z.string().min(1, 'Venue name is required'),
    venue_address: z
      .string()
      .min(1, 'Venue address is required')
      .refine(
        (v) => /[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}/i.test(v),
        'Please include a valid UK postcode in the address'
      ),
    neighbourhood: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.event_date_end) return true
      return data.event_date_end >= data.event_date_start
    },
    {
      message: 'End date must be on or after the start date',
      path: ['event_date_end'],
    }
  )
  .refine(
    (data) => {
      if (!data.end_time || data.event_date_end) return true
      return data.end_time > data.start_time
    },
    {
      message: 'End time must be after start time for single-day events',
      path: ['end_time'],
    }
  )

export const SubmissionStep3Schema = z.object({
  ticket_price: z.string().min(1, 'Ticket price is required (e.g. Free, £10)'),
  ticket_url: z
    .string()
    .optional()
    .refine(
      (v) => !v || v === '' || z.string().url().safeParse(v).success,
      'Please enter a valid URL (include https://)'
    ),
  image_url: z.string().url().optional().nullable(),
  image_thumb_url: z.string().url().optional().nullable(),
})

export const SubmissionStep4Schema = z.object({
  organiser_name: z.string().min(1, 'Organiser name is required'),
  organiser_email: z
    .string()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address'),
  accessibility_info: z.string().optional(),
  privacy_consent: z.literal(true, {
    message: 'You must accept the privacy policy to continue',
  }),
})

// ─── Full schema (used for server-side validation in /api/submit) ─────────────

export const SubmissionFormSchema = SubmissionStep1Schema.and(SubmissionStep2Schema)
  .and(SubmissionStep3Schema)
  .and(SubmissionStep4Schema)

export type SubmissionFormData = z.infer<typeof SubmissionFormSchema>

// ─── Admin action schema ───────────────────────────────────────────────────────

export const AdminActionSchema = z.object({
  feedback: z
    .string()
    .min(10, 'Please provide at least 10 characters of feedback'),
})

export const AdminRejectSchema = z.object({
  reason: z
    .string()
    .min(10, 'Please provide at least 10 characters for the rejection reason'),
})
