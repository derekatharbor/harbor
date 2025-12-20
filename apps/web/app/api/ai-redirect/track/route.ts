// app/api/ai-redirect/track/route.ts
// Tracks AI redirect events for analytics
// Called as a pixel: /api/ai-redirect/track?brand=acme&ua=GPTBot

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

// 1x1 transparent GIF
const PIXEL = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
)

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const brandSlug = searchParams.get('brand')
  const userAgent = searchParams.get('ua') || ''
  
  if (brandSlug) {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )

      // Determine which AI platform this is
      let platform = 'unknown'
      if (userAgent.includes('GPTBot') || userAgent.includes('ChatGPT')) platform = 'chatgpt'
      else if (userAgent.includes('Claude') || userAgent.includes('Anthropic')) platform = 'claude'
      else if (userAgent.includes('Perplexity')) platform = 'perplexity'
      else if (userAgent.includes('Google-Extended')) platform = 'gemini'
      else if (userAgent.includes('Cohere')) platform = 'cohere'
      else if (userAgent.includes('CCBot')) platform = 'commoncrawl'
      else if (userAgent.includes('Bytespider')) platform = 'bytedance'

      // Log to ai_redirect_events table (create if needed)
      // For now, just increment a counter on the profile
      try {
        await supabase.rpc('increment_redirect_count', { 
          brand_slug: brandSlug,
          ai_platform: platform 
        })
      } catch {
        // RPC doesn't exist yet - just log it
        console.log(`[AI Redirect] ${brandSlug} <- ${platform} (${userAgent.substring(0, 100)})`)
      }

    } catch (error) {
      // Silent fail - don't break the redirect
      console.error('[AI Redirect Track]', error)
    }
  }

  // Return 1x1 transparent GIF
  return new NextResponse(PIXEL, {
    status: 200,
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
    }
  })
}