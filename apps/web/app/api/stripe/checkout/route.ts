// app/api/stripe/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getStripe, PRICES } from '@/lib/stripe'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { priceId, userId, orgId, billingPeriod = 'monthly' } = await request.json()

    if (!userId || !orgId) {
      return NextResponse.json(
        { error: 'User and org required' },
        { status: 400 }
      )
    }

    // Get user email
    const { data: userData } = await supabase.auth.admin.getUserById(userId)
    if (!userData?.user?.email) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get or create Stripe customer
    const { data: org } = await supabase
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
      await supabase
        .from('orgs')
        .update({ stripe_customer_id: customerId })
        .eq('id', orgId)
    }

    // Determine price ID
    const stripePriceId = billingPeriod === 'yearly' 
      ? PRICES.AGENCY_YEARLY 
      : PRICES.AGENCY_MONTHLY

    // Create checkout session
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
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      metadata: {
        orgId,
        userId,
        plan: 'agency',
      },
      subscription_data: {
        metadata: {
          orgId,
          userId,
          plan: 'agency',
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