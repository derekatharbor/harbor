// apps/web/app/api/claim/start/route.ts
// Sends verification code to email

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const { brandId, email } = await request.json()

    if (!brandId || !email) {
      return NextResponse.json(
        { error: 'Missing brandId or email' },
        { status: 400 }
      )
    }

    // Get brand profile
    const { data: brand } = await supabase
      .from('ai_profiles')
      .select('*')
      .eq('id', brandId)
      .single()

    if (!brand) {
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      )
    }

    // Check if already claimed
    if (brand.claimed) {
      return NextResponse.json(
        { error: `This profile is already claimed by the verified domain @${brand.domain}` },
        { status: 400 }
      )
    }

    // Validate email domain
    const emailDomain = email.split('@')[1]
    if (emailDomain !== brand.domain) {
      return NextResponse.json(
        { error: `You must use an email ending in @${brand.domain}` },
        { status: 400 }
      )
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString()

    // Store code in DB (expires in 10 minutes)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    await supabase
      .from('verification_codes')
      .insert({
        profile_id: brandId,
        email,
        code,
        expires_at: expiresAt,
        status: 'pending'
      })

    // TODO: Send email via Resend/SendGrid
    // For now, just log it (you'll add email service later)
    console.log(`Verification code for ${email}: ${code}`)

    // In development, return the code (remove this in production!)
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({ 
        success: true,
        devCode: code // Remove this in production!
      })
    }

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Claim start error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}