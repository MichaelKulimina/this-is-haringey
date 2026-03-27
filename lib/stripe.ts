import Stripe from 'stripe'

// Lazy singleton — the Stripe instance is only created when first called at
// runtime, not at module import time. This prevents build failures when
// STRIPE_SECRET_KEY is not set in the build environment.
let _stripe: Stripe | undefined

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error('Missing STRIPE_SECRET_KEY env var')
    _stripe = new Stripe(key, {
      apiVersion: '2026-03-25.dahlia' as Stripe.LatestApiVersion,
    })
  }
  return _stripe
}
