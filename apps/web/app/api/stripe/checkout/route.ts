// Path: apps/web/app/api/stripe/checkout/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getStripe, getPriceId, PLANS } from '@/lib/stripe'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: NextRequest) {
  try {
    const { plan, userId, orgId, billingPeriod = 'monthly' } = await request.json()

    if (!userId || !orgId) {
      return NextResponse.json(
        { error: 'User and org required' },
        { status: 400 }
      )
    }

    // Validate plan - now includes agency
    if (!plan || !['pro', 'growth', 'agency'].includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan. Must be "pro", "growth", or "agency"' },
        { status: 400 }
      )
    }

    // Get user email
    const { data: userData } = await getSupabase().auth.admin.getUserById(userId)
    if (!userData?.user?.email) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get or create Stripe customer
    const { data: org } = await getSupabase()
      .from('orgs')
      .select('stripe_customer_id, name')
      .eq('id', orgId)
      .single()

    let customerId = org?.stripe_customer_id

    if (!customerId) {
      // Create new Stripe customer
      const customer = await getStripe().customers.create({
        email: userData.user.email,
        name: org?.name || userData.user.email,
        metadata: {
          orgId,
          userId,
        },
      })
      customerId = customer.id

      // Save customer ID to org
      await getSupabase()
        .from('orgs')
        .update({ stripe_customer_id: customerId })
        .eq('id', orgId)
    }

    // Get the correct price ID
    const stripePriceId = getPriceId(plan as 'pro' | 'growth' | 'agency', billingPeriod as 'monthly' | 'yearly')

    if (!stripePriceId) {
      return NextResponse.json(
        { error: `Price not configured for ${plan} ${billingPeriod}` },
        { status: 500 }
      )
    }

    // Get app URL with fallback
    let appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://useharbor.io'
    if (!appUrl.startsWith('http')) {
      appUrl = `https://${appUrl}`
    }

    // Create checkout session with 7-day trial
    const session = await getStripe().checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/dashboard?upgraded=true&plan=${plan}`,
      cancel_url: `${appUrl}/pricing?canceled=true`,
      metadata: {
        orgId,
        userId,
        plan,
      },
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          orgId,
          userId,
          plan,
        },
      },
      allow_promotion_codes: true,
    })

    return NextResponse.json({ url: session.url })

  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout' },
      { status: 500 }
    )
  }
}