// apps/web/app/api/auth/complete-signup/route.ts
// Creates a Supabase Auth account after claim verification

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const { email, password, brandSlug } = await request.json()

    // Validate input
    if (!email || !password || !brandSlug) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate password (min 8 chars)
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    // Create Supabase client with service role key
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // ========================================================================
    // STEP 1: Check if user exists in users table
    // ========================================================================
    
    const { data: existingUser, error: userCheckError } = await supabase
      .from('users')
      .select('id, email, supabase_uid')
      .eq('email', email)
      .single()

    if (userCheckError || !existingUser) {
      return NextResponse.json(
        { error: 'User not found. Please complete the claim process first.' },
        { status: 404 }
      )
    }

    // ========================================================================
    // STEP 2: Check if user already has a Supabase Auth account
    // ========================================================================
    
    if (existingUser.supabase_uid) {
      return NextResponse.json(
        { error: 'This email already has an account. Please log in instead.' },
        { status: 400 }
      )
    }

    // ========================================================================
    // STEP 3: Create Supabase Auth account
    // ========================================================================
    
    const { data: authData, error: signUpError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm since we already verified email via claim
      user_metadata: {
        email_verified: true,
        claimed_brand_slug: brandSlug
      }
    })

    if (signUpError || !authData.user) {
      console.error('❌ Failed to create Supabase Auth account:', signUpError)
      return NextResponse.json(
        { error: signUpError?.message || 'Failed to create account' },
        { status: 500 }
      )
    }

    console.log('✅ Supabase Auth account created:', authData.user.id)

    // ========================================================================
    // STEP 4: Link Supabase Auth UID to users table
    // ========================================================================
    
    const { error: updateError } = await supabase
      .from('users')
      .update({
        supabase_uid: authData.user.id,
        last_login_at: new Date().toISOString()
      })
      .eq('id', existingUser.id)

    if (updateError) {
      console.error('❌ Failed to link Supabase UID to user:', updateError)
      // Still return success since the auth account was created
      // User can still log in, and we can fix the link later
    }

    // ========================================================================
    // STEP 5: Create a session for the user
    // ========================================================================
    
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/brands/${brandSlug}/manage`
      }
    })

    if (sessionError) {
      console.error('❌ Failed to generate session:', sessionError)
    }

    console.log(`✅ Account created successfully:`)
    console.log(`   Email: ${email}`)
    console.log(`   Auth UID: ${authData.user.id}`)
    console.log(`   User ID: ${existingUser.id}`)
    console.log(`   Brand Slug: ${brandSlug}`)

    // ========================================================================
    // STEP 6: Return success
    // ========================================================================
    
    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email
      },
      brandSlug
    })

  } catch (error: any) {
    console.error('❌ Complete signup error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
