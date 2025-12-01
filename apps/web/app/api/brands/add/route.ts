// apps/web/app/api/brands/add/route.ts
// Creates a new brand profile from domain
// - Rate limited by IP
// - Basic scrape (no LLM calls)
// - Queues for enrichment later

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'

// Simple in-memory rate limiting (resets on deploy)
// In production, use Redis or similar
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 5 // requests
const RATE_WINDOW = 60 * 60 * 1000 // 1 hour in ms

// Disposable email domains to block
const DISPOSABLE_DOMAINS = [
  'tempmail.com', 'throwaway.com', '10minutemail.com', 'guerrillamail.com',
  'mailinator.com', 'temp-mail.org', 'fakeinbox.com', 'trashmail.com'
]

function getClientIP(request: NextRequest): string {
  const headersList = headers()
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }
  return request.headers.get('x-real-ip') || 'unknown'
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const record = rateLimitMap.get(ip)

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW })
    return { allowed: true, remaining: RATE_LIMIT - 1 }
  }

  if (record.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0 }
  }

  record.count++
  return { allowed: true, remaining: RATE_LIMIT - record.count }
}

function cleanDomain(input: string): string {
  return input
    .toLowerCase()
    .replace(/^(https?:\/\/)?(www\.)?/, '')
    .split('/')[0]
    .trim()
}

function getRootDomain(domain: string): string {
  // Extract root domain (e.g., "shop.nike.com" -> "nike.com")
  const parts = domain.split('.')
  if (parts.length >= 2) {
    return parts.slice(-2).join('.')
  }
  return domain
}

function validateEmailMatchesDomain(email: string, domain: string): { valid: boolean; expectedDomain: string } {
  const emailDomain = email.split('@')[1]?.toLowerCase()
  const rootDomain = getRootDomain(domain)
  const emailRootDomain = emailDomain ? getRootDomain(emailDomain) : ''
  
  // Check if email domain matches website domain (or root domains match)
  const valid = emailDomain === domain || emailRootDomain === rootDomain
  
  return { valid, expectedDomain: rootDomain }
}

function generateSlug(brandName: string): string {
  return brandName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

async function scrapeBasicInfo(domain: string): Promise<{
  title: string | null
  description: string | null
  ogImage: string | null
}> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000) // 8s timeout

    const res = await fetch(`https://${domain}`, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'HarborBot/1.0 (https://useharbor.io)',
      },
    })

    clearTimeout(timeout)

    if (!res.ok) {
      return { title: null, description: null, ogImage: null }
    }

    const html = await res.text()

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const title = titleMatch ? titleMatch[1].trim() : null

    // Extract meta description
    const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i)
    const description = descMatch ? descMatch[1].trim() : null

    // Extract OG image
    const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)
    let ogImage = ogMatch ? ogMatch[1].trim() : null

    // Make OG image absolute if relative
    if (ogImage && !ogImage.startsWith('http')) {
      ogImage = `https://${domain}${ogImage.startsWith('/') ? '' : '/'}${ogImage}`
    }

    return { title, description, ogImage }
  } catch (err) {
    console.error(`Scrape failed for ${domain}:`, err)
    return { title: null, description: null, ogImage: null }
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limit check
    const ip = getClientIP(request)
    const { allowed, remaining } = checkRateLimit(ip)

    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'X-RateLimit-Remaining': '0' } }
      )
    }

    // Parse body
    const body = await request.json()
    const { domain: rawDomain, email, brandName: rawBrandName } = body

    if (!rawDomain) {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 })
    }

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    // Check for disposable email
    const emailDomain = email.split('@')[1]?.toLowerCase()
    if (DISPOSABLE_DOMAINS.includes(emailDomain)) {
      return NextResponse.json({ error: 'Please use a business email' }, { status: 400 })
    }

    const domain = cleanDomain(rawDomain)

    if (!domain || domain.length < 3) {
      return NextResponse.json({ error: 'Invalid domain' }, { status: 400 })
    }

    // Validate email matches domain
    const { valid, expectedDomain } = validateEmailMatchesDomain(email, domain)
    if (!valid) {
      return NextResponse.json(
        { error: `Please use a @${expectedDomain} email address to add this brand` },
        { status: 400 }
      )
    }

    // Initialize Supabase
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Check if domain already exists
    const { data: existing } = await supabase
      .from('ai_profiles')
      .select('slug')
      .eq('domain', domain)
      .single()

    if (existing) {
      // Profile already exists - just return it
      return NextResponse.json({ 
        slug: existing.slug,
        existing: true 
      })
    }

    // Scrape basic info
    const { title, description, ogImage } = await scrapeBasicInfo(domain)

    // Determine brand name
    let brandName = rawBrandName?.trim()
    if (!brandName && title) {
      // Try to extract brand name from title (often "Brand Name | Tagline" or "Brand Name - Tagline")
      brandName = title.split(/[|\-–—]/)[0].trim()
    }
    if (!brandName) {
      // Fall back to domain name
      brandName = domain.split('.')[0]
      brandName = brandName.charAt(0).toUpperCase() + brandName.slice(1)
    }

    // Generate slug
    let slug = generateSlug(brandName)

    // Ensure slug is unique
    const { data: slugCheck } = await supabase
      .from('ai_profiles')
      .select('slug')
      .eq('slug', slug)
      .single()

    if (slugCheck) {
      // Add random suffix
      slug = `${slug}-${Math.random().toString(36).substring(2, 6)}`
    }

    // Get next rank (put at end)
    const { data: maxRank } = await supabase
      .from('ai_profiles')
      .select('rank_global')
      .order('rank_global', { ascending: false })
      .limit(1)
      .single()

    const nextRank = (maxRank?.rank_global || 0) + 1

    // Use Brandfetch for logo (consistent with other profiles)
    const logoUrl = `https://cdn.brandfetch.io/${domain}?c=1id1Fyz-h7an5-5KR_y`

    // Create profile - auto-claimed since they verified via email domain
    const { data: profile, error: insertError } = await supabase
      .from('ai_profiles')
      .insert({
        slug,
        domain,
        brand_name: brandName,
        description: description || `${brandName} - AI visibility profile`,
        logo_url: logoUrl,
        visibility_score: null, // Will be calculated during enrichment
        rank_global: nextRank,
        category: 'Uncategorized', // Will be set during enrichment
        claimed: true, // Auto-claim since email domain matches
        claimed_at: new Date().toISOString(),
        claimed_by_email: email,
        created_at: new Date().toISOString(),
        // Store metadata for follow-up
        metadata: {
          submitted_by: email,
          submitted_at: new Date().toISOString(),
          source: 'add_brand_modal',
          needs_enrichment: true,
        },
      })
      .select('slug')
      .single()

    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
    }

    return NextResponse.json({
      slug: profile.slug,
      existing: false,
    }, {
      headers: { 'X-RateLimit-Remaining': remaining.toString() }
    })

  } catch (err: any) {
    console.error('Add brand error:', err)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}