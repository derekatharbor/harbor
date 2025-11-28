// apps/web/app/api/waitlist/shopify/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Generate short referral code
function generateReferralCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase()
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const { email, referredBy } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email required' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Check if already on waitlist
    const { data: existing } = await supabase
      .from('shopify_waitlist')
      .select('*')
      .eq('email', normalizedEmail)
      .single()

    if (existing) {
      // Return their existing position and referral info
      const { count: totalSignups } = await supabase
        .from('shopify_waitlist')
        .select('*', { count: 'exact', head: true })

      return NextResponse.json({
        position: existing.position,
        referralCode: existing.referral_code,
        referralCount: existing.referral_count || 0,
        totalSignups: totalSignups || 0,
        message: 'Already on waitlist'
      })
    }

    // Generate unique referral code
    const referralCode = generateReferralCode()

    // Get current max position
    const { data: maxPos } = await supabase
      .from('shopify_waitlist')
      .select('position')
      .order('position', { ascending: false })
      .limit(1)
      .single()

    const position = (maxPos?.position || 0) + 1

    // Insert new signup
    const { data: newSignup, error: insertError } = await supabase
      .from('shopify_waitlist')
      .insert({
        email: normalizedEmail,
        referral_code: referralCode,
        referred_by: referredBy || null,
        position: position,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (insertError) {
      console.error('Waitlist insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to join waitlist' },
        { status: 500 }
      )
    }

    // If referred, bump the referrer up in the queue and increment their count
    if (referredBy) {
      const { data: referrer } = await supabase
        .from('shopify_waitlist')
        .select('position, referral_count')
        .eq('referral_code', referredBy)
        .single()

      if (referrer) {
        await supabase
          .from('shopify_waitlist')
          .update({ 
            position: Math.max(1, referrer.position - 1),
            referral_count: (referrer.referral_count || 0) + 1,
            updated_at: new Date().toISOString()
          })
          .eq('referral_code', referredBy)
      }
    }

    // Get total signups for social proof
    const { count: totalSignups } = await supabase
      .from('shopify_waitlist')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({
      position: newSignup.position,
      referralCode: newSignup.referral_code,
      referralCount: 0,
      totalSignups: totalSignups || position
    })

  } catch (error) {
    console.error('Waitlist error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}

// GET endpoint to check position by referral code
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (!code) {
      return NextResponse.json(
        { error: 'Referral code required' },
        { status: 400 }
      )
    }

    const { data: signup } = await supabase
      .from('shopify_waitlist')
      .select('*')
      .eq('referral_code', code)
      .single()

    if (!signup) {
      return NextResponse.json(
        { error: 'Not found' },
        { status: 404 }
      )
    }

    const { count: totalSignups } = await supabase
      .from('shopify_waitlist')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({
      position: signup.position,
      referralCode: signup.referral_code,
      referralCount: signup.referral_count || 0,
      totalSignups: totalSignups || 0
    })

  } catch (error) {
    console.error('Waitlist lookup error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}