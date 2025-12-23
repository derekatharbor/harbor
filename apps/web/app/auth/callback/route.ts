// app/auth/callback/route.ts
// Updated to handle ?next= param for Shopify claim flow

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next')

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    await supabase.auth.exchangeCodeForSession(code)
  }

  // If there's a next param (e.g., from Shopify claim flow), redirect there
  if (next) {
    // Validate that next is a relative URL or same-origin to prevent open redirects
    if (next.startsWith('/')) {
      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  // Default redirect to dashboard
  return NextResponse.redirect(new URL('/dashboard', request.url))
}