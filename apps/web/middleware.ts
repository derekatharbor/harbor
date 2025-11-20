// middleware.ts
// TEMPORARILY DISABLED - Just let everything through

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  // Do absolutely nothing - just pass through
  return NextResponse.next()
}

export const config = {
  matcher: [],  // Match nothing - effectively disable middleware
}