'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import {
  SubmissionStep1Schema,
  SubmissionStep2Schema,
  SubmissionStep3Schema,
  SubmissionStep4Schema,
} from '@/lib/validations'
import { HARINGEY_AREAS } from '@/lib/types'
import type { Category } from '@/lib/types'
import ImageUploader from '@/components/ImageUploader'

const LISTING_FEE_PENCE = parseInt(process.env.NEXT_PUBLIC_LISTING_FEE_PENCE ?? '1000', 10)
const LISTING_FEE_DISPLAY = `£${(LISTING_FEE_PENCE / 100).toFixed(2)}`
const LISTING_FEE_SHORT = `£${Math.round(LISTING_FEE_PENCE / 100)}`

interface SubmitFormProps {
  categories: Category[]
  prefill?: {
    organiser_name?: string
    organiser_email?: string
    event_name?: string
    short_description?: string
    full_description?: string
    category_id?: string
    borough_of_culture?: boolean
    event_date_start?: string
    event_date_end?: string
    start_time?: string
    end_time?: string
    venue_name?: string
    venue_address?: string
    neighbourhood?: string
    ticket_price?: string
    ticket_url?: string
  } | null
}

type FormFields = {
  // Step 1
  event_name: string
  short_description: string
  full_description: string
  category_id: string
  borough_of_culture: boolean
  // Step 2
  event_date_start: string
  event_date_end: string
  start_time: string
  end_time: string
  venue_name: string
  venue_address: string
  neighbourhood: string
  // Step 3
  ticket_price: string
  ticket_url: string
  image_url: string | null
  image_thumb_url: string | null
  // Step 4
  organiser_name: string
  organiser_email: string
  accessibility_info: string
  privacy_consent: boolean
  website: string // honeypot — always empty for real users
}

const TOTAL_STEPS = 4

const STEP_LABELS = ['Event details', 'When & where', 'Image & tickets', 'Your details']

const today = new Date().toISOString().split('T')[0]

// ─── Field error display ──────────────────────────────────────────────────────
function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="mt-1 text-sm text-red-600">{msg}</p>
}

// ─── Label helper ─────────────────────────────────────────────────────────────
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
      {optional && (
        <span className="ml-1.5 text-xs font-normal text-muted">(optional)</span>
      )}
    </label>
  )
}

// ─── Input classes ─────────────────────────────────────────────────────────────
const inputCls =
  'w-full border border-border rounded-md px-3 py-2 text-sm bg-surface text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors'

// ─── Main component ───────────────────────────────────────────────────────────
export default function SubmitForm({ categories, prefill }: SubmitFormProps) {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const [fields, setFields] = useState<FormFields>({
    event_name: prefill?.event_name ?? '',
    short_description: prefill?.short_description ?? '',
    full_description: prefill?.full_description ?? '',
    category_id: prefill?.category_id ?? '',
    borough_of_culture: prefill?.borough_of_culture ?? false,
    event_date_start: prefill?.event_date_start ?? '',
    event_date_end: prefill?.event_date_end ?? '',
    start_time: prefill?.start_time ?? '',
    end_time: prefill?.end_time ?? '',
    venue_name: prefill?.venue_name ?? '',
    venue_address: prefill?.venue_address ?? '',
    neighbourhood: prefill?.neighbourhood ?? '',
    ticket_price: prefill?.ticket_price ?? '',
    ticket_url: prefill?.ticket_url ?? '',
    image_url: null,
    image_thumb_url: null,
    organiser_name: prefill?.organiser_name ?? '',
    organiser_email: prefill?.organiser_email ?? '',
    accessibility_info: '',
    privacy_consent: false,
    website: '', // honeypot
  })

  function set<K extends keyof FormFields>(key: K, value: FormFields[K]) {
    setFields((prev) => ({ ...prev, [key]: value }))
    // Clear field error on change
    if (fieldErrors[key]) {
      setFieldErrors((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    }
  }

  // ── Step validation ─────────────────────────────────────────────────────────
  function validateStep(n: number): boolean {
    let result
    const errors: Record<string, string> = {}

    if (n === 1) {
      result = SubmissionStep1Schema.safeParse(fields)
    } else if (n === 2) {
      result = SubmissionStep2Schema.safeParse(fields)
    } else if (n === 3) {
      result = SubmissionStep3Schema.safeParse(fields)
    } else {
      result = SubmissionStep4Schema.safeParse(fields)
    }

    if (!result.success) {
      const flat = result.error.flatten()
      // Field errors
      for (const [k, msgs] of Object.entries(flat.fieldErrors)) {
        if (Array.isArray(msgs) && msgs[0]) errors[k] = msgs[0]
      }
      // Form-level errors (from .refine())
      if (flat.formErrors?.length) {
        errors['_form'] = flat.formErrors[0]
      }
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

  // ── Final submission ────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validateStep(4)) return

    setIsSubmitting(true)
    setApiError(null)

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      })

      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.error ?? 'Something went wrong. Please try again.')
      }

      // Redirect to Stripe Checkout
      window.location.href = json.checkoutUrl
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setIsSubmitting(false)
    }
  }

  // ── Progress indicator ──────────────────────────────────────────────────────
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
                    done
                      ? 'bg-primary text-white'
                      : active
                      ? 'bg-primary text-white'
                      : 'bg-border text-muted',
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
                <div
                  className={[
                    'flex-1 h-px',
                    done ? 'bg-primary' : 'bg-border',
                  ].join(' ')}
                />
              )}
            </div>
          )
        })}
      </div>
    )
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Honeypot — invisible to real users */}
      <input
        type="text"
        name="website"
        value={fields.website}
        onChange={(e) => set('website', e.target.value)}
        tabIndex={-1}
        aria-hidden="true"
        autoComplete="off"
        style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px' }}
      />

      <ProgressBar />

      {/* ── API error banner ─────────────────────────────────────────────── */}
      {apiError && (
        <div className="mb-6 p-4 rounded-md bg-[#FDF5F1] border border-[#E05A2B]/30 text-sm text-[#B84520]">
          {apiError}
        </div>
      )}

      {/* ── Step 1: Event details ────────────────────────────────────────── */}
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
              placeholder="e.g. Open Studio Weekend — Tottenham Artists"
              className={inputCls}
            />
            <FieldError msg={fieldErrors.event_name} />
          </div>

          <div>
            <Label htmlFor="short_description">Short description</Label>
            <p className="text-xs text-muted mb-1">
              Shown on listing cards. Max 300 characters.
            </p>
            <textarea
              id="short_description"
              value={fields.short_description}
              onChange={(e) => set('short_description', e.target.value)}
              rows={3}
              maxLength={300}
              placeholder="A brief, punchy description of your event…"
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
            <p className="text-xs text-muted mb-1">
              Shown on the event detail page. You can include links and formatting.
            </p>
            <textarea
              id="full_description"
              value={fields.full_description}
              onChange={(e) => set('full_description', e.target.value)}
              rows={6}
              placeholder="Tell people everything they need to know about your event…"
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
                <span className="font-semibold text-[#5B21B6]">
                  Borough of Culture 2027
                </span>{' '}
                event
              </span>
            </label>
          </div>
        </div>
      )}

      {/* ── Step 2: When & where ─────────────────────────────────────────── */}
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

          {fieldErrors._form && (
            <p className="text-sm text-red-600">{fieldErrors._form}</p>
          )}

          <div>
            <Label htmlFor="venue_name">Venue name</Label>
            <input
              id="venue_name"
              type="text"
              value={fields.venue_name}
              onChange={(e) => set('venue_name', e.target.value)}
              placeholder="e.g. Hornsey Library"
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
              placeholder="e.g. Haringey Park, N8 9JA"
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

      {/* ── Step 3: Image & tickets ──────────────────────────────────────── */}
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

      {/* ── Step 4: Your details & payment ──────────────────────────────── */}
      {step === 4 && (
        <div className="space-y-5">
          <div>
            <Label htmlFor="organiser_name">Organiser name</Label>
            <input
              id="organiser_name"
              type="text"
              value={fields.organiser_name}
              onChange={(e) => set('organiser_name', e.target.value)}
              placeholder="Your name or organisation"
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
              placeholder="you@example.com"
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

          {/* Payment summary */}
          <div className="rounded-md border border-border bg-background p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Listing fee</span>
              <span className="text-sm font-bold text-foreground">{LISTING_FEE_DISPLAY}</span>
            </div>
            <p className="text-xs text-muted">
              One-time payment. If your listing is rejected, a full refund is issued automatically.
              Reviewed within 3 business days.
            </p>
          </div>

          {/* Privacy consent */}
          <div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={fields.privacy_consent}
                onChange={(e) => set('privacy_consent', e.target.checked as unknown as boolean)}
                className="mt-0.5 w-4 h-4 rounded border-border accent-primary"
              />
              <span className="text-sm text-foreground">
                I agree to the{' '}
                <Link href="/privacy" target="_blank" className="text-primary underline hover:no-underline">
                  Privacy Policy
                </Link>{' '}
                and consent to my details being stored and used for this submission.
              </span>
            </label>
            <FieldError msg={fieldErrors.privacy_consent} />
          </div>
        </div>
      )}

      {/* ── Navigation buttons ────────────────────────────────────────────── */}
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
                Preparing payment…
              </>
            ) : (
              `Pay ${LISTING_FEE_SHORT} & Submit →`
            )}
          </button>
        )}
      </div>
    </form>
  )
}
