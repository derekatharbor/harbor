// middleware.ts
// Fixed to skip entirely during build

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // CRITICAL: Skip all middleware logic during build
  // This prevents "supabaseKey is required" errors
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    // During build time, just let everything through
    return NextResponse.next()
  }

  // At runtime, only import Supabase if env vars exist
  try {
    const { createMiddlewareClient } = await import('@supabase/auth-helpers-nextjs')
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req, res })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    const path = req.nextUrl.pathname

    // Public routes - allow without session
    if (path.startsWith('/auth/')) {
      // If logged in and trying to access auth pages, redirect to dashboard
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

      // If on onboarding page but already has dashboard, redirect to dashboard
      if (path.startsWith('/onboarding') && hasCompletedOnboarding) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }

      // If on dashboard but hasn't completed onboarding, redirect to onboarding
      if (path.startsWith('/dashboard') && !hasCompletedOnboarding) {
        return NextResponse.redirect(new URL('/onboarding', req.url))
      }

      return res
    }

    return res
  } catch (error) {
    // If anything fails (including during build), just pass through
    console.warn('Middleware skipped:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.next()
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*', '/onboarding/:path*'],
}