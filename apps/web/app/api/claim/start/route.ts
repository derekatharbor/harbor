// apps/web/app/api/claim/start/route.ts
// Sends verification code to email via Resend

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

// Initialize Resend (only if API key is set)
const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null

export async function POST(request: Request) {
  try {
    const { brandId, email } = await request.json()

    if (!brandId || !email) {
      return NextResponse.json(
        { error: 'Missing brandId or email' },
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

    // Send email
    if (resend) {
      try {
        await resend.emails.send({
          from: 'Harbor <verify@useharbor.io>',
          to: email,
          subject: `Your Harbor verification code: ${code}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f4;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 0;">
                <tr>
                  <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                      
                      <!-- Header -->
                      <tr>
                        <td style="background-color: #101A31; padding: 32px; text-align: center;">
                          <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                            Harbor
                          </h1>
                        </td>
                      </tr>

                      <!-- Content -->
                      <tr>
                        <td style="padding: 40px 32px;">
                          <h2 style="margin: 0 0 16px 0; color: #101A31; font-size: 20px; font-weight: 600;">
                            Verify your email
                          </h2>
                          <p style="margin: 0 0 24px 0; color: #6B7280; font-size: 16px; line-height: 1.5;">
                            You're claiming <strong style="color: #101A31;">${brand.brand_name}</strong>'s profile on Harbor. Enter this code to verify your email:
                          </p>

                          <!-- Code Box -->
                          <div style="background-color: #F3F4F6; border: 2px solid #E5E7EB; border-radius: 8px; padding: 24px; text-align: center; margin: 0 0 24px 0;">
                            <div style="font-size: 36px; font-weight: 700; color: #101A31; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                              ${code}
                            </div>
                          </div>

                          <p style="margin: 0 0 8px 0; color: #6B7280; font-size: 14px; line-height: 1.5;">
                            This code will expire in <strong>10 minutes</strong>.
                          </p>
                          <p style="margin: 0; color: #6B7280; font-size: 14px; line-height: 1.5;">
                            If you didn't request this code, you can safely ignore this email.
                          </p>
                        </td>
                      </tr>

                      <!-- Footer -->
                      <tr>
                        <td style="background-color: #F9FAFB; padding: 24px 32px; text-align: center; border-top: 1px solid #E5E7EB;">
                          <p style="margin: 0 0 8px 0; color: #9CA3AF; font-size: 12px;">
                            Harbor - AI Visibility Platform
                          </p>
                          <p style="margin: 0; color: #9CA3AF; font-size: 12px;">
                            <a href="https://useharbor.io" style="color: #FF6B4A; text-decoration: none;">useharbor.io</a>
                          </p>
                        </td>
                      </tr>

                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
          `
        })
        console.log(`✓ Verification code sent to ${email}`)
      } catch (emailError) {
        console.error('Failed to send email:', emailError)
        // Don't fail the request if email fails - log and continue
      }
    } else {
      // Development mode - log to console
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
      console.log(`📧 VERIFICATION CODE FOR ${email}`)
      console.log(`   Code: ${code}`)
      console.log(`   Brand: ${brand.brand_name}`)
      console.log(`   Expires: ${new Date(expiresAt).toLocaleString()}`)
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    }

    // In development, return the code for easy testing
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({ 
        success: true,
        message: 'Verification code sent',
        devCode: code // Remove in production or protect with flag
      })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Verification code sent to your email'
    })

  } catch (error: any) {
    console.error('Claim start error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}