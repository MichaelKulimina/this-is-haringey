'use client'

import { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import {
  SubmissionStep1Schema,
  SubmissionStep2Schema,
  SubmissionStep3Schema,
} from '@/lib/validations'
import { z } from 'zod'
import { HARINGEY_AREAS } from '@/lib/types'
import type { Category } from '@/lib/types'
import type { Submission } from '@/lib/submissions'
import ImageUploader from '@/components/ImageUploader'

interface Props {
  submission: Submission
  categories: Category[]
  mode: 'edit-returned'
}

type FormFields = {
  event_name: string
  short_description: string
  full_description: string
  category_id: string
  borough_of_culture: boolean
  event_date_start: string
  event_date_end: string
  start_time: string
  end_time: string
  venue_name: string
  venue_address: string
  neighbourhood: string
  ticket_price: string
  ticket_url: string
  image_url: string | null
  image_thumb_url: string | null
  organiser_name: string
  organiser_email: string
  accessibility_info: string
}

const EditStep4Schema = z.object({
  organiser_name: z.string().min(1, 'Organiser name is required'),
  organiser_email: z
    .string()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address'),
  accessibility_info: z.string().optional(),
})

const TOTAL_STEPS = 4
const STEP_LABELS = ['Event details', 'When & where', 'Image & tickets', 'Your details']
const today = new Date().toISOString().split('T')[0]

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="mt-1 text-sm text-red-600">{msg}</p>
}

function Label({
  htmlFor,
  children,
  optional,
}: {
  htmlFor: string
  children: React.ReactNode
  optional?: boolean
}) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-foreground mb-1">
      {children}
      {optional && <span className="ml-1.5 text-xs font-normal text-muted">(optional)</span>}
    </label>
  )
}

const inputCls =
  'w-full border border-border rounded-md px-3 py-2 text-sm bg-surface text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors'

export default function EditSubmissionForm({ submission, categories, mode }: Props) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const [fields, setFields] = useState<FormFields>({
    event_name: submission.event_name,
    short_description: submission.short_description,
    full_description: submission.full_description ?? '',
    category_id: submission.category_id,
    borough_of_culture: submission.borough_of_culture,
    event_date_start: submission.event_date_start,
    event_date_end: submission.event_date_end ?? '',
    start_time: submission.start_time,
    end_time: submission.end_time ?? '',
    venue_name: submission.venue_name,
    venue_address: submission.venue_address,
    neighbourhood: submission.neighbourhood ?? '',
    ticket_price: submission.ticket_price,
    ticket_url: submission.ticket_url ?? '',
    image_url: submission.image_url,
    image_thumb_url: submission.image_thumb_url,
    organiser_name: submission.organiser_name,
    organiser_email: submission.organiser_email,
    accessibility_info: submission.accessibility_info ?? '',
  })

  function set<K extends keyof FormFields>(key: K, value: FormFields[K]) {
    setFields((prev) => ({ ...prev, [key]: value }))
    if (fieldErrors[key]) {
      setFieldErrors((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    }
  }

  function validateStep(n: number): boolean {
    let result
    const errors: Record<string, string> = {}

    if (n === 1) result = SubmissionStep1Schema.safeParse(fields)
    else if (n === 2) result = SubmissionStep2Schema.safeParse(fields)
    else if (n === 3) result = SubmissionStep3Schema.safeParse(fields)
    else result = EditStep4Schema.safeParse(fields)

    if (!result.success) {
      const flat = result.error.flatten()
      for (const [k, msgs] of Object.entries(flat.fieldErrors)) {
        if (Array.isArray(msgs) && msgs[0]) errors[k] = msgs[0]
      }
      if (flat.formErrors?.length) errors['_form'] = flat.formErrors[0]
      setFieldErrors(errors)
      return false
    }

    setFieldErrors({})
    return true
  }

  function handleContinue() {
    if (validateStep(step)) setStep((s) => s + 1)
  }

  function handleBack() {
    setApiError(null)
    setStep((s) => s - 1)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validateStep(4)) return

    setIsSubmitting(true)
    setApiError(null)

    try {
      // 1. Update the submission fields
      const updateRes = await fetch(`/api/organiser/submissions/${submission.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      })
      if (!updateRes.ok) {
        const data = await updateRes.json()
        throw new Error(data.error ?? 'Failed to update submission')
      }

      // 2. Resubmit (change status to pending)
      const resubmitRes = await fetch(
        `/api/organiser/submissions/${submission.id}/resubmit`,
        { method: 'POST' }
      )
      if (!resubmitRes.ok) {
        const data = await resubmitRes.json()
        throw new Error(data.error ?? 'Failed to resubmit')
      }

      router.push('/organiser/dashboard')
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setIsSubmitting(false)
    }
  }

  function ProgressBar() {
    return (
      <div className="flex items-center gap-2 mb-8">
        {STEP_LABELS.map((label, i) => {
          const n = i + 1
          const done = n < step
          const active = n === step
          return (
            <div key={n} className="flex items-center gap-2 flex-1 min-w-0">
              <div className="flex items-center gap-1.5 shrink-0">
                <div
                  className={[
                    'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                    done || active ? 'bg-primary text-white' : 'bg-border text-muted',
                  ].join(' ')}
                >
                  {done ? (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    n
                  )}
                </div>
                <span
                  className={[
                    'text-xs font-medium hidden sm:block truncate',
                    active ? 'text-foreground' : 'text-muted',
                  ].join(' ')}
                >
                  {label}
                </span>
              </div>
              {n < TOTAL_STEPS && (
                <div className={['flex-1 h-px', done ? 'bg-primary' : 'bg-border'].join(' ')} />
              )}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <ProgressBar />

      {apiError && (
        <div className="mb-6 p-4 rounded-md bg-[#FDF5F1] border border-[#E05A2B]/30 text-sm text-[#B84520]">
          {apiError}
        </div>
      )}

      {/* Step 1 */}
      {step === 1 && (
        <div className="space-y-5">
          <div>
            <Label htmlFor="event_name">Event name</Label>
            <input
              id="event_name"
              type="text"
              value={fields.event_name}
              onChange={(e) => set('event_name', e.target.value)}
              maxLength={100}
              className={inputCls}
            />
            <FieldError msg={fieldErrors.event_name} />
          </div>

          <div>
            <Label htmlFor="short_description">Short description</Label>
            <p className="text-xs text-muted mb-1">Shown on listing cards. Max 300 characters.</p>
            <textarea
              id="short_description"
              value={fields.short_description}
              onChange={(e) => set('short_description', e.target.value)}
              rows={3}
              maxLength={300}
              className={inputCls + ' resize-none'}
            />
            <div className="flex justify-between mt-1">
              <FieldError msg={fieldErrors.short_description} />
              <p
                className={[
                  'text-xs ml-auto',
                  fields.short_description.length > 280 ? 'text-primary' : 'text-muted',
                ].join(' ')}
              >
                {fields.short_description.length}/300
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="full_description" optional>
              Full description
            </Label>
            <textarea
              id="full_description"
              value={fields.full_description}
              onChange={(e) => set('full_description', e.target.value)}
              rows={6}
              className={inputCls + ' resize-y'}
            />
          </div>

          <div>
            <Label htmlFor="category_id">Category</Label>
            <select
              id="category_id"
              value={fields.category_id}
              onChange={(e) => set('category_id', e.target.value)}
              className={inputCls}
            >
              <option value="">Select a category…</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <FieldError msg={fieldErrors.category_id} />
          </div>

          <div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={fields.borough_of_culture}
                onChange={(e) => set('borough_of_culture', e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-border accent-[#5B21B6]"
              />
              <span className="text-sm text-foreground">
                This is an official{' '}
                <span className="font-semibold text-[#5B21B6]">Borough of Culture 2027</span> event
              </span>
            </label>
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="event_date_start">Start date</Label>
              <input
                id="event_date_start"
                type="date"
                value={fields.event_date_start}
                onChange={(e) => set('event_date_start', e.target.value)}
                min={today}
                className={inputCls}
              />
              <FieldError msg={fieldErrors.event_date_start} />
            </div>
            <div>
              <Label htmlFor="event_date_end" optional>
                End date
              </Label>
              <input
                id="event_date_end"
                type="date"
                value={fields.event_date_end}
                onChange={(e) => set('event_date_end', e.target.value)}
                min={fields.event_date_start || today}
                className={inputCls}
              />
              <FieldError msg={fieldErrors.event_date_end} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_time">Start time</Label>
              <input
                id="start_time"
                type="time"
                value={fields.start_time}
                onChange={(e) => set('start_time', e.target.value)}
                className={inputCls}
              />
              <FieldError msg={fieldErrors.start_time} />
            </div>
            <div>
              <Label htmlFor="end_time" optional>
                End time
              </Label>
              <input
                id="end_time"
                type="time"
                value={fields.end_time}
                onChange={(e) => set('end_time', e.target.value)}
                className={inputCls}
              />
              <FieldError msg={fieldErrors.end_time} />
            </div>
          </div>

          {fieldErrors._form && <p className="text-sm text-red-600">{fieldErrors._form}</p>}

          <div>
            <Label htmlFor="venue_name">Venue name</Label>
            <input
              id="venue_name"
              type="text"
              value={fields.venue_name}
              onChange={(e) => set('venue_name', e.target.value)}
              className={inputCls}
            />
            <FieldError msg={fieldErrors.venue_name} />
          </div>

          <div>
            <Label htmlFor="venue_address">Venue address</Label>
            <input
              id="venue_address"
              type="text"
              value={fields.venue_address}
              onChange={(e) => set('venue_address', e.target.value)}
              className={inputCls}
            />
            <p className="mt-1 text-xs text-muted">Include the full postcode.</p>
            <FieldError msg={fieldErrors.venue_address} />
          </div>

          <div>
            <Label htmlFor="neighbourhood" optional>
              Neighbourhood
            </Label>
            <select
              id="neighbourhood"
              value={fields.neighbourhood}
              onChange={(e) => set('neighbourhood', e.target.value)}
              className={inputCls}
            >
              <option value="">Select area…</option>
              {HARINGEY_AREAS.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div className="space-y-5">
          <div>
            <Label htmlFor="image" optional>
              Event image
            </Label>
            <Suspense fallback={<div className="h-32 bg-background rounded-md animate-pulse" />}>
              <ImageUploader
                onUploadComplete={({ imageUrl, imageThumbUrl }) => {
                  set('image_url', imageUrl)
                  set('image_thumb_url', imageThumbUrl)
                }}
                onClear={() => {
                  set('image_url', null)
                  set('image_thumb_url', null)
                }}
              />
            </Suspense>
            {fields.image_url && (
              <p className="mt-1 text-xs text-muted">
                Current image will be replaced when you upload a new one.
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="ticket_price">Ticket price</Label>
            <input
              id="ticket_price"
              type="text"
              value={fields.ticket_price}
              onChange={(e) => set('ticket_price', e.target.value)}
              placeholder="e.g. Free, £10, From £5"
              className={inputCls}
            />
            <FieldError msg={fieldErrors.ticket_price} />
          </div>

          <div>
            <Label htmlFor="ticket_url" optional>
              Booking / ticket URL
            </Label>
            <input
              id="ticket_url"
              type="url"
              value={fields.ticket_url}
              onChange={(e) => set('ticket_url', e.target.value)}
              placeholder="https://…"
              className={inputCls}
            />
            <FieldError msg={fieldErrors.ticket_url} />
          </div>
        </div>
      )}

      {/* Step 4 */}
      {step === 4 && (
        <div className="space-y-5">
          <div>
            <Label htmlFor="organiser_name">Organiser name</Label>
            <input
              id="organiser_name"
              type="text"
              value={fields.organiser_name}
              onChange={(e) => set('organiser_name', e.target.value)}
              className={inputCls}
            />
            <FieldError msg={fieldErrors.organiser_name} />
          </div>

          <div>
            <Label htmlFor="organiser_email">Email address</Label>
            <input
              id="organiser_email"
              type="email"
              value={fields.organiser_email}
              onChange={(e) => set('organiser_email', e.target.value)}
              className={inputCls}
            />
            <p className="mt-1 text-xs text-muted">
              Not displayed publicly. Used for submission updates only.
            </p>
            <FieldError msg={fieldErrors.organiser_email} />
          </div>

          <div>
            <Label htmlFor="accessibility_info" optional>
              Accessibility information
            </Label>
            <textarea
              id="accessibility_info"
              value={fields.accessibility_info}
              onChange={(e) => set('accessibility_info', e.target.value)}
              rows={3}
              placeholder="e.g. Step-free access, BSL interpreter available, hearing loop fitted"
              className={inputCls + ' resize-none'}
            />
          </div>

          <div className="rounded-md border border-border bg-background p-4 text-sm text-muted">
            <p>
              <strong className="text-foreground">No additional payment required.</strong> Your
              original listing fee covers this resubmission.
            </p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
        {step > 1 ? (
          <button
            type="button"
            onClick={handleBack}
            className="px-4 py-2 text-sm font-medium text-muted hover:text-foreground transition-colors"
          >
            ← Back
          </button>
        ) : (
          <div />
        )}

        {step < TOTAL_STEPS ? (
          <button
            type="button"
            onClick={handleContinue}
            className="px-6 py-2.5 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors"
          >
            Continue →
          </button>
        ) : (
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Submitting…
              </>
            ) : (
              'Resubmit for review →'
            )}
          </button>
        )}
      </div>
    </form>
  )
}
