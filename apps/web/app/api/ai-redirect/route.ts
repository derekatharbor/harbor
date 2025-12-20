// app/api/ai-redirect/route.ts
// Serves JavaScript snippet for AI bot redirect
// Usage: <script src="https://useharbor.io/api/ai-redirect?brand=acme"></script>

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

// AI crawler user agents to redirect
const AI_BOTS = [
  'GPTBot',
  'ChatGPT-User', 
  'ClaudeBot',
  'Claude-Web',
  'Anthropic-AI',
  'PerplexityBot',
  'Cohere-AI',
  'Google-Extended',  // Gemini training, NOT search
  'CCBot',            // Common Crawl (used for AI training)
  'Amazonbot',        // Alexa AI
  'FacebookBot',      // Meta AI
  'Bytespider',       // TikTok/ByteDance AI
  'Diffbot',
  'ImagesiftBot',
  'Omgilibot',
]

// Search engine bots - NEVER redirect these
const SEARCH_BOTS = [
  'Googlebot',
  'Bingbot', 
  'DuckDuckBot',
  'Slurp',           // Yahoo
  'Baiduspider',
  'YandexBot',
  'facebot',         // Facebook link preview (not AI)
  'Twitterbot',
  'LinkedInBot',
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const brandSlug = searchParams.get('brand')
  
  if (!brandSlug) {
    return new NextResponse('// Harbor AI Redirect: Missing brand parameter', {
      status: 400,
      headers: { 'Content-Type': 'application/javascript' }
    })
  }

  // Verify brand exists
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: brand } = await supabase
    .from('ai_profiles')
    .select('slug, brand_name')
    .eq('slug', brandSlug)
    .single()

  if (!brand) {
    return new NextResponse(`// Harbor AI Redirect: Brand "${brandSlug}" not found`, {
      status: 404,
      headers: { 'Content-Type': 'application/javascript' }
    })
  }

  const harborUrl = `https://useharbor.io/brands/${brandSlug}`
  const trackingUrl = `https://useharbor.io/api/ai-redirect/track?brand=${brandSlug}`

  // Generate the JavaScript snippet
  const script = `
// Harbor AI Redirect v1.0
// Redirects AI crawlers to your Harbor profile for better AI visibility
// https://useharbor.io

(function() {
  'use strict';
  
  var AI_BOTS = ${JSON.stringify(AI_BOTS)};
  var SEARCH_BOTS = ${JSON.stringify(SEARCH_BOTS)};
  var HARBOR_URL = '${harborUrl}';
  var TRACKING_URL = '${trackingUrl}';
  
  var ua = navigator.userAgent || '';
  
  // Check if this is a search bot (never redirect)
  var isSearchBot = SEARCH_BOTS.some(function(bot) {
    return ua.indexOf(bot) !== -1;
  });
  
  if (isSearchBot) {
    return; // Do nothing for search crawlers
  }
  
  // Check if this is an AI bot
  var isAIBot = AI_BOTS.some(function(bot) {
    return ua.indexOf(bot) !== -1;
  });
  
  if (isAIBot) {
    // Track the redirect (fire and forget)
    try {
      var img = new Image();
      img.src = TRACKING_URL + '&ua=' + encodeURIComponent(ua.substring(0, 200));
    } catch(e) {}
    
    // Redirect to Harbor profile
    window.location.replace(HARBOR_URL);
  }
  
  // Also inject canonical link for crawlers that parse HTML but don't execute JS
  if (typeof document !== 'undefined') {
    var existing = document.querySelector('link[rel="canonical"][data-harbor]');
    if (!existing) {
      var link = document.createElement('link');
      link.rel = 'canonical';
      link.href = HARBOR_URL;
      link.setAttribute('data-harbor', 'ai-profile');
      document.head.appendChild(link);
    }
  }
})();
`

  return new NextResponse(script.trim(), {
    status: 200,
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      'Access-Control-Allow-Origin': '*',
    }
  })
}
