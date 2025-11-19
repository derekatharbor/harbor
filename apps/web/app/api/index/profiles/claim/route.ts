// API Route: POST /api/profiles/claim
// Sends verification email for claiming a profile

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { profile_id, email } = await request.json()

    if (!profile_id || !email) {
      return NextResponse.json(
        { error: 'Missing profile_id or email' },
        { status: 400 }
      )
    }

    // Get the profile
    const { data: profile, error: profileError } = await supabase
      .from('ai_profiles')
      .select('domain, brand_name, claimed')
      .eq('id', profile_id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    if (profile.claimed) {
      return NextResponse.json(
        { error: 'Profile already claimed' },
        { status: 400 }
      )
    }

    // Validate email domain matches profile domain
    const emailDomain = email.split('@')[1]
    if (emailDomain !== profile.domain) {
      return NextResponse.json(
        { error: `Email must be from @${profile.domain}` },
        { status: 400 }
      )
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24) // 24 hour expiry

    // Create claim request
    const { error: claimError } = await supabase
      .from('claim_requests')
      .insert({
        profile_id,
        email,
        email_domain: emailDomain,
        verification_token: verificationToken,
        expires_at: expiresAt.toISOString(),
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        user_agent: request.headers.get('user-agent'),
      })

    if (claimError) {
      throw claimError
    }

    // Send verification email
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/profiles/verify?token=${verificationToken}`

    await sendVerificationEmail({
      to: email,
      brandName: profile.brand_name,
      verificationUrl,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error creating claim request:', error)
    return NextResponse.json(
      { error: 'Failed to send verification email' },
      { status: 500 }
    )
  }
}

// Email sending function (integrate with your email service)
async function sendVerificationEmail({
  to,
  brandName,
  verificationUrl,
}: {
  to: string
  brandName: string
  verificationUrl: string
}) {
  // TODO: Integrate with email service (SendGrid, Resend, etc.)
  console.log('Send verification email:', {
    to,
    brandName,
    verificationUrl,
  })

  // Example with fetch to email API:
  /*
  await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: 'verify@harbor.io', name: 'Harbor' },
      subject: `Verify your claim for ${brandName}`,
      content: [{
        type: 'text/html',
        value: `
          <h2>Verify Your Profile Claim</h2>
          <p>You requested to claim the AI Profile for <strong>${brandName}</strong>.</p>
          <p>Click the link below to verify your email and complete the claim:</p>
          <a href="${verificationUrl}">${verificationUrl}</a>
          <p>This link expires in 24 hours.</p>
        `
      }]
    })
  })
  */
}