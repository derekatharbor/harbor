// app/api/scan/diagnostics/route.ts
// Check if scan system is properly configured

import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: {
      hasOpenAI: !!process.env.OPENAI_API_KEY,
      hasAnthropic: !!process.env.ANTHROPIC_API_KEY,
      hasGoogle: !!process.env.GOOGLE_API_KEY,
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      nodeEnv: process.env.NODE_ENV,
    },
    keys: {
      openai: process.env.OPENAI_API_KEY?.substring(0, 10) + '...',
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    }
  }

  return NextResponse.json(diagnostics)
}
