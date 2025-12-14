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

// Price IDs - create these in Stripe Dashboard and add to env vars
export const PRICES = {
  // Subscription plans
  PRO_MONTHLY: process.env.STRIPE_PRICE_PRO_MONTHLY!,
  PRO_YEARLY: process.env.STRIPE_PRICE_PRO_YEARLY!,
  GROWTH_MONTHLY: process.env.STRIPE_PRICE_GROWTH_MONTHLY!,
  GROWTH_YEARLY: process.env.STRIPE_PRICE_GROWTH_YEARLY!,
  
  // One-time purchases
  DEEP_SCAN: process.env.STRIPE_PRICE_DEEP_SCAN!, // One-time $7.99
}

// Plan configuration
export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    prompts: 50,
    competitors: 2,
    platforms: 4,
    features: [
      '50 prompts tracked',
      '4 AI platforms',
      '2 competitors',
      'Daily monitoring',
      'Email support',
    ],
  },
  pro: {
    name: 'Pro',
    priceMonthly: 99,
    priceYearly: 990, // 2 months free
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
    priceYearly: 1790, // 2 months free
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
  enterprise: {
    name: 'Enterprise',
    prompts: -1, // unlimited
    competitors: 20,
    platforms: 4,
    features: [
      'Unlimited prompts',
      '4 AI platforms',
      '20+ competitors',
      'Daily monitoring',
      'SSO / SAML',
      'Dedicated success manager',
      'Custom integrations',
      'SLA guarantee',
    ],
  },
}

// Helper to get price ID for a plan
export function getPriceId(plan: 'pro' | 'growth', period: 'monthly' | 'yearly'): string {
  const key = `${plan.toUpperCase()}_${period.toUpperCase()}` as keyof typeof PRICES
  return PRICES[key]
}

// Helper to check plan limits
export function getPlanLimits(plan: keyof typeof PLANS) {
  const config = PLANS[plan]
  return {
    prompts: 'prompts' in config ? config.prompts : 50,
    competitors: 'competitors' in config ? config.competitors : 2,
    platforms: config.platforms,
  }
}