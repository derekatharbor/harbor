// app/api/stripe/deep-scan/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getStripe, PRICES } from '@/lib/stripe'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: NextRequest) {
  try {
    const { userId, orgId, dashboardId, quantity = 1 } = await request.json()

    if (!userId || !orgId || !dashboardId) {
      return NextResponse.json(
        { error: 'User, org, and dashboard required' },
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
    const { data: org } = await supabase
      .from('orgs')
      .select('stripe_customer_id, name')
      .eq('id', orgId)
      .single()

    let customerId = org?.stripe_customer_id

    if (!customerId) {
      const customer = await getStripe().customers.create({
        email: userData.user.email,
        name: org?.name || userData.user.email,
        metadata: { orgId, userId },
      })
      customerId = customer.id

      await supabase
        .from('orgs')
        .update({ stripe_customer_id: customerId })
        .eq('id', orgId)
    }

    // Create checkout session for one-time purchase
    const session = await getStripe().checkout.sessions.create({
      customer: customerId,
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: PRICES.DEEP_SCAN,
          quantity: quantity,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/${dashboardId}?deep_scan=purchased&qty=${quantity}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/${dashboardId}?deep_scan=canceled`,
      metadata: {
        orgId,
        userId,
        dashboardId,
        quantity: String(quantity),
        type: 'deep_scan',
      },
    })

    return NextResponse.json({ url: session.url })

  } catch (error: any) {
    console.error('Deep scan checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout' },
      { status: 500 }
    )
  }
}