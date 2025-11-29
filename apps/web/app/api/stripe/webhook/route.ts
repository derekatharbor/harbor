// app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getStripe } from '@/lib/stripe'
import Stripe from 'stripe'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

  let event: Stripe.Event

  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        // Check if this is a deep scan purchase or subscription
        if (session.metadata?.type === 'deep_scan') {
          await handleDeepScanPurchase(session)
        } else {
          await handleCheckoutComplete(session)
        }
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdate(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionCanceled(subscription)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentFailed(invoice)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error: any) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const orgId = session.metadata?.orgId
  if (!orgId) return

  // Update org with subscription info
  await supabase
    .from('orgs')
    .update({
      stripe_subscription_id: session.subscription as string,
      plan: 'agency',
      plan_status: 'active',
      updated_at: new Date().toISOString(),
    })
    .eq('id', orgId)

  // Update all dashboards for this org to agency plan
  await supabase
    .from('dashboards')
    .update({ plan: 'agency' })
    .eq('org_id', orgId)

  // Log the event
  await getSupabase().from('audit_log').insert({
    org_id: orgId,
    user_id: session.metadata?.userId,
    event: 'subscription_created',
    meta: {
      plan: 'agency',
      subscription_id: session.subscription,
      customer_id: session.customer,
    },
  })

  console.log(`✅ Org ${orgId} upgraded to Agency`)
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const orgId = subscription.metadata?.orgId
  if (!orgId) {
    // Try to find org by customer ID
    const { data: org } = await supabase
      .from('orgs')
      .select('id')
      .eq('stripe_customer_id', subscription.customer as string)
      .single()

    if (!org) return

    await updateOrgSubscription(org.id, subscription)
  } else {
    await updateOrgSubscription(orgId, subscription)
  }
}

async function updateOrgSubscription(orgId: string, subscription: Stripe.Subscription) {
  const status = subscription.status
  const plan = status === 'active' || status === 'trialing' ? 'agency' : 'solo'

  const periodEnd = (subscription as any).current_period_end 
    ? new Date((subscription as any).current_period_end * 1000).toISOString()
    : null

  await supabase
    .from('orgs')
    .update({
      stripe_subscription_id: subscription.id,
      plan: plan,
      plan_status: status,
      plan_period_end: periodEnd,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orgId)

  // Update dashboards plan
  await supabase
    .from('dashboards')
    .update({ plan })
    .eq('org_id', orgId)

  console.log(`📝 Org ${orgId} subscription updated: ${status}`)
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  const { data: org } = await supabase
    .from('orgs')
    .select('id')
    .eq('stripe_subscription_id', subscription.id)
    .single()

  if (!org) return

  // Downgrade to free
  await supabase
    .from('orgs')
    .update({
      plan: 'solo',
      plan_status: 'canceled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', org.id)

  await supabase
    .from('dashboards')
    .update({ plan: 'solo' })
    .eq('org_id', org.id)

  await getSupabase().from('audit_log').insert({
    org_id: org.id,
    event: 'subscription_canceled',
    meta: { subscription_id: subscription.id },
  })

  console.log(`⬇️ Org ${org.id} downgraded to Free`)
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const { data: org } = await supabase
    .from('orgs')
    .select('id')
    .eq('stripe_customer_id', invoice.customer as string)
    .single()

  if (!org) return

  await supabase
    .from('orgs')
    .update({
      plan_status: 'past_due',
      updated_at: new Date().toISOString(),
    })
    .eq('id', org.id)

  await getSupabase().from('audit_log').insert({
    org_id: org.id,
    event: 'payment_failed',
    meta: { invoice_id: invoice.id },
  })

  console.log(`⚠️ Payment failed for org ${org.id}`)
}

async function handleDeepScanPurchase(session: Stripe.Checkout.Session) {
  const orgId = session.metadata?.orgId
  const dashboardId = session.metadata?.dashboardId
  const quantity = parseInt(session.metadata?.quantity || '1', 10)

  if (!orgId) return

  // Add credits using the database function
  await getSupabase().rpc('add_deep_scan_credits', {
    p_org_id: orgId,
    p_dashboard_id: dashboardId || null,
    p_quantity: quantity,
    p_payment_id: session.payment_intent as string,
  })

  // Log the purchase
  await getSupabase().from('audit_log').insert({
    org_id: orgId,
    dashboard_id: dashboardId,
    event: 'deep_scan_purchased',
    meta: {
      quantity,
      payment_id: session.payment_intent,
      amount: session.amount_total,
    },
  })

  console.log(`🔍 Org ${orgId} purchased ${quantity} deep scan credits`)
}