// lib/stripe.ts
import Stripe from 'stripe'

// Lazy-load Stripe to avoid build-time initialization
let stripeInstance: Stripe | null = null

export function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set')
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      typescript: true,
    })
  }
  return stripeInstance
}

// Price IDs - set these in Stripe Dashboard and add to env vars
export const PRICES = {
  AGENCY_MONTHLY: process.env.STRIPE_PRICE_AGENCY_MONTHLY!,
  AGENCY_YEARLY: process.env.STRIPE_PRICE_AGENCY_YEARLY!,
  DEEP_SCAN: process.env.STRIPE_PRICE_DEEP_SCAN!, // One-time $7.99
}

export const PLANS = {
  free: {
    name: 'Free',
    dashboards: 1,
    scansPerWeek: 1,
    deepScans: 0,
    features: [
      'AI visibility dashboard',
      'Weekly scans across 4 AI models',
      'Competitor visibility insights',
      'Optimization recommendations',
      'Public AI profile page',
    ],
  },
  agency: {
    name: 'Agency',
    priceMonthly: 199,
    priceYearly: 1990, // ~2 months free
    dashboards: 5,
    scansPerMonth: 8,
    deepScansIncluded: 5,
    features: [
      'Everything in Free',
      'Up to 5 brands',
      'Deep analysis scans',
      'Priority support',
      'API access (coming soon)',
      'White-label reports (coming soon)',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    dashboards: 999,
    features: [
      'Everything in Agency',
      'Unlimited brands',
      'SSO + team controls',
      'Custom integrations',
      'Dedicated account manager',
      'SLA',
    ],
  },
}