// apps/web/app/api/claim/verify/route.ts
// Verifies the code and completes the claim process

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const { brandId, email, code } = await request.json()

    // Validate input
    if (!brandId || !email || !code) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate code format (6 digits)
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: 'Code must be 6 digits' },
        { status: 400 }
      )
    }

    // Create Supabase client
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // ========================================================================
    // STEP 1: Verify the code
    // ========================================================================
    
    const { data: verification, error: verifyError } = await supabase
      .from('verification_codes')
      .select('*')
      .eq('profile_id', brandId)
      .eq('email', email)
      .eq('code', code)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (verifyError || !verification) {
      console.error('Verification failed:', verifyError)
      return NextResponse.json(
        { error: 'Invalid or expired code. Please request a new one.' },
        { status: 400 }
      )
    }

    // ========================================================================
    // STEP 2: Check if profile is already claimed
    // ========================================================================
    
    const { data: brand } = await supabase
      .from('ai_profiles')
      .select('claimed, brand_name, slug')
      .eq('id', brandId)
      .single()

    if (!brand) {
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      )
    }

    if (brand.claimed) {
      return NextResponse.json(
        { error: 'This profile has already been claimed' },
        { status: 400 }
      )
    }

    // ========================================================================
    // STEP 3: Mark verification code as used
    // ========================================================================
    
    await supabase
      .from('verification_codes')
      .update({ status: 'verified' })
      .eq('id', verification.id)

    // ========================================================================
    // STEP 4: Create or get user
    // ========================================================================
    
    let { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (!user) {
      // Create new user
      const { data: newUser, error: createUserError } = await supabase
        .from('users')
        .insert({ 
          email,
          last_login_at: new Date().toISOString()
        })
        .select()
        .single()

      if (createUserError) {
        console.error('Failed to create user:', createUserError)
        return NextResponse.json(
          { error: 'Failed to create user account' },
          { status: 500 }
        )
      }

      user = newUser
    } else {
      // Update existing user's last login
      await supabase
        .from('users')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', user.id)
    }

    // ========================================================================
    // STEP 5: Create verified profile link
    // ========================================================================
    
    const { error: linkError } = await supabase
      .from('verified_profiles')
      .insert({
        profile_id: brandId,
        user_id: user.id,
        verified_email: email,
        claimed_at: new Date().toISOString()
      })

    if (linkError) {
      // Check if already exists (race condition)
      if (linkError.code === '23505') { // Unique violation
        return NextResponse.json(
          { error: 'This profile is already claimed by this email' },
          { status: 400 }
        )
      }

      console.error('Failed to create verified profile:', linkError)
      return NextResponse.json(
        { error: 'Failed to link profile to user' },
        { status: 500 }
      )
    }

    // ========================================================================
    // STEP 6: Mark ai_profile as claimed
    // ========================================================================
    
    const { error: updateError } = await supabase
      .from('ai_profiles')
      .update({
        claimed: true,
        claimed_at: new Date().toISOString(),
        claimed_by_email: email
      })
      .eq('id', brandId)

    if (updateError) {
      console.error('Failed to update profile:', updateError)
      // Don't fail the request - the profile is already linked
    }

    // ========================================================================
    // STEP 7: Log the claim event
    // ========================================================================
    
    console.log(`✅ Profile claimed successfully:`)
    console.log(`   Brand: ${brand.brand_name}`)
    console.log(`   Email: ${email}`)
    console.log(`   User ID: ${user.id}`)

    // ========================================================================
    // STEP 8: Return success
    // ========================================================================
    
    return NextResponse.json({
      success: true,
      userId: user.id,
      email: user.email,
      brandSlug: brand.slug,
      message: 'Profile claimed successfully!'
    })

  } catch (error: any) {
    console.error('Claim verify error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}

// ============================================================================
// HELPER: Get verification status (optional endpoint)
// ============================================================================

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const profileId = searchParams.get('profileId')
    const email = searchParams.get('email')

    if (!profileId || !email) {
      return NextResponse.json(
        { error: 'Missing profileId or email' },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check if this email has a pending verification
    const { data: pendingCodes } = await supabase
      .from('verification_codes')
      .select('created_at, expires_at')
      .eq('profile_id', profileId)
      .eq('email', email)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)

    const hasPending = pendingCodes && pendingCodes.length > 0

    return NextResponse.json({
      hasPendingCode: hasPending,
      expiresAt: hasPending ? pendingCodes[0].expires_at : null
    })

  } catch (error) {
    console.error('Verification status check error:', error)
    return NextResponse.json(
      { error: 'Failed to check status' },
      { status: 500 }
    )
  }
}