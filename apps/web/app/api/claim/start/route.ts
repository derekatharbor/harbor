import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { email, brandId } = await request.json()

    // Validate input
    if (!email || !brandId) {
      return NextResponse.json(
        { error: 'Email and brand ID are required' },
        { status: 400 }
      )
    }

    // Fetch the brand
    const { data: brand, error: brandError } = await supabase
      .from('ai_profiles')
      .select('*')
      .eq('id', brandId)
      .single()

    if (brandError || !brand) {
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      )
    }

    // Check if brand is already claimed
    if (brand.claimed) {
      return NextResponse.json(
        { error: 'This brand has already been claimed' },
        { status: 400 }
      )
    }

    // Verify email domain matches brand domain
    const emailDomain = email.split('@')[1].toLowerCase()
    const brandDomain = brand.domain.toLowerCase()

    if (emailDomain !== brandDomain) {
      return NextResponse.json(
        { error: `Email must be from @${brandDomain}` },
        { status: 400 }
      )
    }

    // Generate 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString()

    // Store verification code in database
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 10) // 10 minute expiry

    const { error: insertError } = await supabase
      .from('verification_codes')
      .insert({
        email,
        code,
        brand_id: brandId,
        expires_at: expiresAt.toISOString(),
      })

    if (insertError) {
      console.error('Error inserting verification code:', insertError)
      return NextResponse.json(
        { error: 'Failed to generate verification code' },
        { status: 500 }
      )
    }

    // Send email via Resend
    try {
      await resend.emails.send({
        from: 'Harbor <verify@useharbor.io>',
        to: email,
        subject: `Verify your ${brand.brand_name} profile claim`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #101A31;">
              <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                
                <!-- Header -->
                <div style="text-align: center; margin-bottom: 40px;">
                  <h1 style="color: #FFFFFF; font-size: 24px; font-weight: 700; margin: 0 0 8px 0;">
                    Verify Your Profile Claim
                  </h1>
                  <p style="color: #A4B1C3; font-size: 16px; margin: 0;">
                    Someone requested to claim ${brand.brand_name} on Harbor
                  </p>
                </div>

                <!-- Code Card -->
                <div style="background-color: #0C1422; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 40px 32px; text-align: center; margin-bottom: 32px;">
                  <p style="color: #CBD3E2; font-size: 14px; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 1px;">
                    Your Verification Code
                  </p>
                  <div style="font-size: 48px; font-weight: 700; color: #FFFFFF; letter-spacing: 8px; font-family: 'Courier New', monospace; margin: 0 0 16px 0;">
                    ${code}
                  </div>
                  <p style="color: #A4B1C3; font-size: 14px; margin: 0;">
                    This code expires in 10 minutes
                  </p>
                </div>

                <!-- Instructions -->
                <div style="background-color: rgba(255,255,255,0.03); border-radius: 12px; padding: 24px; margin-bottom: 32px;">
                  <p style="color: #CBD3E2; font-size: 14px; line-height: 1.6; margin: 0 0 12px 0;">
                    Enter this code on the Harbor claim page to verify your ownership of <strong style="color: #FFFFFF;">${brand.brand_name}</strong>.
                  </p>
                  <p style="color: #A4B1C3; font-size: 13px; line-height: 1.5; margin: 0;">
                    If you didn't request this verification, you can safely ignore this email.
                  </p>
                </div>

                <!-- Footer -->
                <div style="text-align: center; padding-top: 32px; border-top: 1px solid rgba(255,255,255,0.05);">
                  <p style="color: #A4B1C3; font-size: 13px; margin: 0 0 8px 0;">
                    Sent by Harbor
                  </p>
                  <p style="color: #6B7280; font-size: 12px; margin: 0;">
                    The first platform for AI search visibility
                  </p>
                </div>
              </div>
            </body>
          </html>
        `,
      })

      console.log(`✅ Verification code sent to ${email}: ${code}`)
    } catch (emailError) {
      console.error('Error sending email:', emailError)
      return NextResponse.json(
        { error: 'Failed to send verification email' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: 'Verification code sent to your email'
    })

  } catch (error) {
    console.error('Error in claim start:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}