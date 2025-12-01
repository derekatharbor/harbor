// middleware.ts
// Auth protection + AI traffic tracking

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Quick bot detection patterns for common AI crawlers
const AI_BOT_PATTERNS = [
  'GPTBot', 'OAI-SearchBot', 'ChatGPT-User',
  'ClaudeBot', 'Claude-Web', 'anthropic-ai',
  'PerplexityBot', 'Google-Extended', 'Applebot-Extended',
  'meta-externalagent', 'CCBot', 'Bytespider', 'YouBot', 'cohere-ai'
]

const AI_REFERRER_DOMAINS = [
  'chat.openai.com', 'chatgpt.com', 'perplexity.ai', 'www.perplexity.ai',
  'claude.ai', 'www.claude.ai', 'gemini.google.com', 'bard.google.com',
  'copilot.microsoft.com', 'you.com', 'www.you.com', 'poe.com', 'www.poe.com'
]

function isAIBot(userAgent: string): boolean {
  return AI_BOT_PATTERNS.some(pattern => userAgent.includes(pattern))
}

function isAIReferrer(referrer: string): boolean {
  if (!referrer) return false
  try {
    const domain = new URL(referrer).hostname.toLowerCase()
    return AI_REFERRER_DOMAINS.includes(domain)
  } catch {
    return false
  }
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  // AI Traffic Tracking (fire-and-forget, non-blocking)
  const userAgent = req.headers.get('user-agent') || ''
  const referrer = req.headers.get('referer') || ''
  const url = req.nextUrl.href
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || ''
  
  // Only track if it's an AI bot or AI referrer (don't track every request)
  if (isAIBot(userAgent) || isAIReferrer(referrer)) {
    // Fire and forget - don't await
    fetch(`${req.nextUrl.origin}/api/track/ai-visit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_agent: userAgent, referrer, url, ip }),
    }).catch(() => {}) // Silently ignore errors
  }
  
  // Skip middleware during build (no env vars available)
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return res
  }

  // At runtime, check auth
  try {
    const { createMiddlewareClient } = await import('@supabase/auth-helpers-nextjs')
    const supabase = createMiddlewareClient({ req, res })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    const path = req.nextUrl.pathname

    // Public routes - allow without session
    if (path.startsWith('/auth/')) {
      if (session) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
      return res
    }

    // Protected routes - require session
    if (path.startsWith('/dashboard') || path.startsWith('/onboarding')) {
      if (!session) {
        return NextResponse.redirect(new URL('/auth/login', req.url))
      }

      // Check if user has completed onboarding
      const { data: dashboards } = await supabase
        .from('dashboards')
        .select('id')
        .limit(1)

      const hasCompletedOnboarding = dashboards && dashboards.length > 0

      if (path.startsWith('/onboarding') && hasCompletedOnboarding) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }

      if (path.startsWith('/dashboard') && !hasCompletedOnboarding) {
        return NextResponse.redirect(new URL('/onboarding', req.url))
      }

      return res
    }

    return res
  } catch (error) {
    // If anything fails, just pass through (don't block users)
    console.warn('Middleware error:', error)
    return res
  }
}

export const config = {
  matcher: [
    // Auth routes
    '/dashboard/:path*', 
    '/auth/:path*', 
    '/onboarding/:path*',
    // AI tracking - catch brand pages and API feeds
    '/brands/:path*',
    '/api/harbor-feed/:path*',
    '/best-:path*',
    '/top-:path*',
  ],
}