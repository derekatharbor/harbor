// apps/web/app/api/claim/verify/route.ts
// Verifies code and claims the brand profile

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const { brandId, email, code } = await request.json()

    if (!brandId || !email || !code) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Find verification code
    const { data: verification } = await supabase
      .from('verification_codes')
      .select('*')
      .eq('profile_id', brandId)
      .eq('email', email)
      .eq('code', code)
      .eq('status', 'pending')
      .single()

    if (!verification) {
      return NextResponse.json(
        { error: 'Invalid or expired code' },
        { status: 400 }
      )
    }

    // Check expiry
    if (new Date(verification.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Code expired' },
        { status: 400 }
      )
    }

    // Mark code as used
    await supabase
      .from('verification_codes')
      .update({ status: 'used' })
      .eq('id', verification.id)

    // Get current user from Supabase Auth (you'll implement this properly later)
    // For now, we'll use a placeholder - you need to integrate with auth.users
    const userId = 'placeholder-user-id' // TODO: Get from Supabase Auth session

    // Claim the profile
    await supabase
      .from('ai_profiles')
      .update({
        claimed: true,
        claimed_by_user_id: userId,
        claimed_at: new Date().toISOString()
      })
      .eq('id', brandId)

    // Create empty canonical profile for edits
    await supabase
      .from('canonical_profiles')
      .insert({
        profile_id: brandId,
        claimed_by_user_id: userId,
        overview: '',
        definition: '',
        products: [],
        faqs: [],
        glossary: {},
        structured_data: {}
      })

    return NextResponse.json({ 
      success: true,
      userId,
      brandId
    })

  } catch (error: any) {
    console.error('Claim verify error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}