// middleware.ts

import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  // Skip middleware entirely if env vars are missing (during build)
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('⚠️  Supabase env vars missing - skipping middleware (build time)')
    return res
  }

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
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*', '/onboarding/:path*'],
}