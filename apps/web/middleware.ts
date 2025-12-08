// middleware.ts
// Auth protection that works at build AND runtime

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
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
        return NextResponse.redirect(new URL('/login', req.url))
      }

      // Allow /onboarding/analyzing to pass through (post-signup analysis)
      if (path === '/onboarding/analyzing') {
        return res
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
  matcher: ['/dashboard/:path*', '/auth/:path*', '/onboarding/:path*'],
}