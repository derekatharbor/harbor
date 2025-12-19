// Path: lib/stripe.ts

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

// Price IDs from Stripe Dashboard
export const PRICES = {
  // Pro plan
  PRO_MONTHLY: process.env.STRIPE_PRICE_PRO_MONTHLY || 'price_1SeMlEPyuUdZfszdinzPf7yQ',
  PRO_YEARLY: process.env.STRIPE_PRICE_PRO_YEARLY || 'price_1SeMlmPyuUdZfszdj8MDRHA9',
  
  // Growth plan
  GROWTH_MONTHLY: process.env.STRIPE_PRICE_GROWTH_MONTHLY || 'price_1SeMmaPyuUdZfszdkLKWn9B2',
  GROWTH_YEARLY: process.env.STRIPE_PRICE_GROWTH_YEARLY || 'price_1SeMn2PyuUdZfszdLlhWkNak',
  
  // Agency plan
  AGENCY_MONTHLY: process.env.STRIPE_PRICE_AGENCY_MONTHLY || 'price_1SYYedPyuUdZfszdkZWcXl4r',
  AGENCY_YEARLY: process.env.STRIPE_PRICE_AGENCY_YEARLY || 'price_1SYYewPyuUdZfszdbn0kQDra',
  
  // One-time purchases
  DEEP_SCAN: process.env.STRIPE_PRICE_DEEP_SCAN!, // One-time $7.99
}

// Plan configuration
export const PLANS = {
  pro: {
    name: 'Pro',
    priceMonthly: 99,
    priceYearly: 990,
    prompts: 100,
    competitors: 5,
    platforms: 4,
    features: [
      '100 prompts tracked',
      '4 AI platforms',
      '5 competitors',
      'Daily monitoring',
      'Visibility trends',
      'Source citations',
      'Priority support',
    ],
  },
  growth: {
    name: 'Growth',
    priceMonthly: 179,
    priceYearly: 1790,
    prompts: 200,
    competitors: 10,
    platforms: 4,
    features: [
      '200 prompts tracked',
      '4 AI platforms',
      '10 competitors',
      'Daily monitoring',
      'Advanced analytics',
      'Team seats',
      'API access',
      'Slack alerts',
    ],
  },
  agency: {
    name: 'Agency',
    priceMonthly: 199,
    priceYearly: 1990,
    prompts: 500,
    competitors: 25,
    platforms: 4,
    features: [
      '500 prompts tracked',
      '4 AI platforms',
      '25 competitors',
      'Daily monitoring',
      'White-label reports',
      'Multi-brand dashboards',
      'Client seat management',
      'Priority support',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    priceMonthly: null,
    priceYearly: null,
    prompts: -1, // unlimited
    competitors: 50,
    platforms: 4,
    features: [
      'Unlimited prompts',
      '4 AI platforms',
      '50+ competitors',
      'Daily monitoring',
      'SSO / SAML',
      'Dedicated success manager',
      'Custom integrations',
      'SLA guarantee',
    ],
  },
}

// Helper to get price ID for a plan
export function getPriceId(plan: 'pro' | 'growth' | 'agency', period: 'monthly' | 'yearly'): string {
  const key = `${plan.toUpperCase()}_${period.toUpperCase()}` as keyof typeof PRICES
  return PRICES[key]
}

// Helper to check plan limits
export function getPlanLimits(plan: keyof typeof PLANS) {
  const config = PLANS[plan]
  return {
    prompts: config.prompts,
    competitors: config.competitors,
    platforms: config.platforms,
  }
}

// Helper to get plan by price ID (for webhook processing)
export function getPlanByPriceId(priceId: string): keyof typeof PLANS | null {
  if (priceId === PRICES.PRO_MONTHLY || priceId === PRICES.PRO_YEARLY) return 'pro'
  if (priceId === PRICES.GROWTH_MONTHLY || priceId === PRICES.GROWTH_YEARLY) return 'growth'
  if (priceId === PRICES.AGENCY_MONTHLY || priceId === PRICES.AGENCY_YEARLY) return 'agency'
  return null
}