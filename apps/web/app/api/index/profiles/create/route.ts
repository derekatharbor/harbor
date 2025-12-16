// apps/web/app/api/index/profiles/create/route.ts
// Creates a new pending profile (not indexed until verified)

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

// Initialize Resend
const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null

// Helper: Title case a string
function toTitleCase(str: string): string {
  return str
    .split(/[\s-_]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

// Helper: Generate brand name from domain
function brandNameFromDomain(domain: string): string {
  // Remove TLD and common prefixes
  const name = domain
    .replace(/^www\./, '')
    .split('.')[0]
  return toTitleCase(name)
}

// Helper: Generate slug from domain
function slugFromDomain(domain: string): string {
  return domain
    .replace(/^www\./, '')
    .replace(/\./g, '-')
    .toLowerCase()
}

export async function POST(request: Request) {
  try {
    const { companyName, domain, email } = await request.json()

    // Validate inputs
    if (!domain || !email) {
      return NextResponse.json(
        { error: 'Domain and email are required' },
        { status: 400 }
      )
    }

    // Normalize domain (lowercase, remove protocol/www)
    const normalizedDomain = domain
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/.*$/, '')
      .trim()

    // Validate domain format
    const domainRegex = /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}$/
    if (!domainRegex.test(normalizedDomain)) {
      return NextResponse.json(
        { error: 'Please enter a valid domain (e.g., acme.com)' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    // Validate email domain matches
    const emailDomain = email.split('@')[1].toLowerCase()
    if (emailDomain !== normalizedDomain) {
      return NextResponse.json(
        { error: `Your email must end with @${normalizedDomain}` },
        { status: 400 }
      )
    }

    // Initialize Supabase
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

    // Check if domain already exists
    const { data: existing } = await supabase
      .from('ai_profiles')
      .select('id, brand_name, claimed, status')
      .eq('domain', normalizedDomain)
      .single()

    if (existing) {
      // Profile exists - check if claimed and give specific message
      if (existing.claimed) {
        return NextResponse.json(
          { 
            error: `This brand is already claimed. If you work at ${normalizedDomain}, search for it and sign in to manage.`,
            existingProfile: {
              id: existing.id,
              brandName: existing.brand_name,
              claimed: existing.claimed
            }
          },
          { status: 409 }
        )
      }
      // Profile exists but unclaimed - redirect them to claim it
      return NextResponse.json(
        { 
          error: `A profile for ${existing.brand_name} already exists. Search for it to claim.`,
          existingProfile: {
            id: existing.id,
            brandName: existing.brand_name,
            claimed: existing.claimed
          }
        },
        { status: 409 }
      )
    }

    // Generate brand name and slug
    // Use provided company name, or fall back to domain-based name
    const brandName = companyName?.trim() || brandNameFromDomain(normalizedDomain)
    const baseSlug = slugFromDomain(normalizedDomain)
    
    // Ensure unique slug
    let slug = baseSlug
    let slugCounter = 0
    while (true) {
      const { data: slugExists } = await supabase
        .from('ai_profiles')
        .select('id')
        .eq('slug', slug)
        .single()
      
      if (!slugExists) break
      slugCounter++
      slug = `${baseSlug}-${slugCounter}`
    }

    // Create the pending profile
    const { data: newProfile, error: createError } = await supabase
      .from('ai_profiles')
      .insert({
        brand_name: brandName,
        domain: normalizedDomain,
        slug,
        claimed: false,
        logo_url: `https://cdn.brandfetch.io/${normalizedDomain}?c=1id1Fyz-h7an5-5KR_y`,
        feed_data: {}, // Required field - empty for now, can be enriched later
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('id, brand_name, slug, domain')
      .single()

    if (createError) {
      console.error('Failed to create profile:', createError)
      return NextResponse.json(
        { error: 'Failed to create profile' },
        { status: 500 }
      )
    }

    // Generate 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes

    // Store verification code
    const { error: codeError } = await supabase
      .from('verification_codes')
      .insert({
        profile_id: newProfile.id,
        email: email.toLowerCase(),
        code,
        expires_at: expiresAt,
        status: 'pending'
      })

    if (codeError) {
      console.error('Failed to create verification code:', codeError)
      // Clean up the profile we just created
      await supabase.from('ai_profiles').delete().eq('id', newProfile.id)
      return NextResponse.json(
        { error: 'Failed to initiate verification' },
        { status: 500 }
      )
    }

    // Send verification email
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
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0B0B0C;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0B0B0C; padding: 40px 20px;">
                <tr>
                  <td align="center">
                    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px; background-color: #111213; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08);">
                      
                      <!-- Header -->
                      <tr>
                        <td style="padding: 32px 32px 24px 32px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.06);">
                          <img src="https://useharbor.io/images/harbor-logo-white.svg" alt="Harbor" width="100" style="display: block; margin: 0 auto;" />
                        </td>
                      </tr>

                      <!-- Content -->
                      <tr>
                        <td style="padding: 32px;">
                          <h1 style="margin: 0 0 16px 0; color: #ffffff; font-size: 24px; font-weight: 600; text-align: center;">
                            Verify your profile
                          </h1>
                          <p style="margin: 0 0 24px 0; color: rgba(255,255,255,0.5); font-size: 15px; line-height: 1.6; text-align: center;">
                            Enter this code to complete your profile for <strong style="color: rgba(255,255,255,0.8);">${brandName}</strong>
                          </p>
                          
                          <!-- Code Box -->
                          <div style="background-color: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
                            <span style="font-family: 'SF Mono', Monaco, 'Courier New', monospace; font-size: 36px; font-weight: 700; color: #ffffff; letter-spacing: 8px;">
                              ${code}
                            </span>
                          </div>
                          
                          <p style="margin: 0; color: rgba(255,255,255,0.3); font-size: 13px; text-align: center;">
                            This code expires in 10 minutes.<br/>
                            If you didn't request this, you can ignore this email.
                          </p>
                        </td>
                      </tr>

                      <!-- Footer -->
                      <tr>
                        <td style="padding: 24px 32px; text-align: center; border-top: 1px solid rgba(255,255,255,0.06);">
                          <p style="margin: 0; color: rgba(255,255,255,0.2); font-size: 12px;">
                            Harbor - AI Visibility Platform
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
        console.log(`✓ Verification code sent to ${email} for new profile ${brandName}`)
      } catch (emailError) {
        console.error('Failed to send email:', emailError)
        // Don't fail - log the code in dev
      }
    } else {
      // Development mode
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
      console.log(`📧 NEW PROFILE VERIFICATION CODE`)
      console.log(`   Email: ${email}`)
      console.log(`   Code: ${code}`)
      console.log(`   Brand: ${brandName}`)
      console.log(`   Domain: ${normalizedDomain}`)
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    }

    // Return success with profile info
    const response: any = {
      success: true,
      profile: {
        id: newProfile.id,
        brandName: newProfile.brand_name,
        slug: newProfile.slug,
        domain: newProfile.domain,
      },
      message: 'Verification code sent to your email'
    }

    // In dev, include the code for testing
    if (process.env.NODE_ENV === 'development') {
      response.devCode = code
    }

    return NextResponse.json(response)

  } catch (error: any) {
    console.error('Create profile error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}