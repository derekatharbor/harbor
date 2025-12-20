// app/api/ai-redirect/worker/route.ts
// Serves a customized Cloudflare Worker script for a brand
// Usage: /api/ai-redirect/worker?brand=acme

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

const AI_BOTS = [
  'GPTBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-Web',
  'Anthropic-AI',
  'PerplexityBot',
  'Cohere-AI',
  'Google-Extended',
  'CCBot',
  'Amazonbot',
  'FacebookBot',
  'Bytespider',
  'Diffbot',
  'Omgilibot',
  'YouBot',
]

const SEARCH_BOTS = [
  'Googlebot',
  'Bingbot',
  'DuckDuckBot',
  'Slurp',
  'Baiduspider',
  'YandexBot',
  'facebot',
  'Twitterbot',
  'LinkedInBot',
  'Applebot',
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const brandSlug = searchParams.get('brand')
  const format = searchParams.get('format') || 'cloudflare' // cloudflare | nginx | nextjs
  
  if (!brandSlug) {
    return NextResponse.json({ error: 'Missing brand parameter' }, { status: 400 })
  }

  // Verify brand exists
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: brand } = await supabase
    .from('ai_profiles')
    .select('slug, brand_name, domain')
    .eq('slug', brandSlug)
    .single()

  if (!brand) {
    return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
  }

  const harborUrl = `https://useharbor.io/brands/${brandSlug}`

  if (format === 'cloudflare') {
    const script = generateCloudflareWorker(brandSlug, harborUrl)
    return new NextResponse(script, {
      headers: { 'Content-Type': 'application/javascript' }
    })
  }
  
  if (format === 'nginx') {
    const config = generateNginxConfig(brandSlug, harborUrl)
    return new NextResponse(config, {
      headers: { 'Content-Type': 'text/plain' }
    })
  }
  
  if (format === 'nextjs') {
    const middleware = generateNextJSMiddleware(brandSlug, harborUrl)
    return new NextResponse(middleware, {
      headers: { 'Content-Type': 'application/javascript' }
    })
  }

  if (format === 'vercel') {
    const config = generateVercelConfig(brandSlug, harborUrl)
    return new NextResponse(config, {
      headers: { 'Content-Type': 'application/json' }
    })
  }

  return NextResponse.json({ error: 'Invalid format' }, { status: 400 })
}

function generateCloudflareWorker(slug: string, harborUrl: string): string {
  return `// Harbor AI Redirect - Cloudflare Worker
// Redirects AI crawlers to your Harbor profile: ${harborUrl}
// Deploy at: https://workers.cloudflare.com

const HARBOR_URL = '${harborUrl}';

const AI_BOTS = ${JSON.stringify(AI_BOTS)};
const SEARCH_BOTS = ${JSON.stringify(SEARCH_BOTS)};

export default {
  async fetch(request, env, ctx) {
    const ua = request.headers.get('User-Agent') || '';
    
    // Never redirect search engines
    if (SEARCH_BOTS.some(bot => ua.includes(bot))) {
      return fetch(request);
    }
    
    // Redirect AI crawlers to Harbor
    if (AI_BOTS.some(bot => ua.includes(bot))) {
      ctx.waitUntil(
        fetch(\`https://useharbor.io/api/ai-redirect/track?brand=${slug}&ua=\${encodeURIComponent(ua.substring(0, 200))}\`)
          .catch(() => {})
      );
      return Response.redirect(HARBOR_URL, 302);
    }
    
    return fetch(request);
  }
};`
}

function generateNginxConfig(slug: string, harborUrl: string): string {
  const aiBotsPattern = AI_BOTS.join('|')
  const searchBotsPattern = SEARCH_BOTS.join('|')
  
  return `# Harbor AI Redirect - nginx config
# Add this to your server block
# Redirects AI crawlers to: ${harborUrl}

# Map to detect bot type
map $http_user_agent $is_search_bot {
    default 0;
    ~*(${searchBotsPattern}) 1;
}

map $http_user_agent $is_ai_bot {
    default 0;
    ~*(${aiBotsPattern}) 1;
}

# Redirect AI bots (but not search bots) to Harbor
if ($is_search_bot = 0) {
    set $redirect_to_harbor $is_ai_bot;
}

if ($redirect_to_harbor = 1) {
    return 302 ${harborUrl};
}`
}

function generateNextJSMiddleware(slug: string, harborUrl: string): string {
  return `// Harbor AI Redirect - Next.js Middleware
// Save as middleware.ts in your project root
// Redirects AI crawlers to: ${harborUrl}

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const AI_BOTS = ${JSON.stringify(AI_BOTS)}
const SEARCH_BOTS = ${JSON.stringify(SEARCH_BOTS)}
const HARBOR_URL = '${harborUrl}'

export function middleware(request: NextRequest) {
  const ua = request.headers.get('user-agent') || ''
  
  // Never redirect search engines
  if (SEARCH_BOTS.some(bot => ua.includes(bot))) {
    return NextResponse.next()
  }
  
  // Redirect AI crawlers to Harbor
  if (AI_BOTS.some(bot => ua.includes(bot))) {
    // Track the redirect
    fetch(\`https://useharbor.io/api/ai-redirect/track?brand=${slug}&ua=\${encodeURIComponent(ua.substring(0, 200))}\`)
      .catch(() => {})
    
    return NextResponse.redirect(HARBOR_URL)
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: '/:path*',
}`
}

function generateVercelConfig(slug: string, harborUrl: string): string {
  return JSON.stringify({
    "$schema": "https://openapi.vercel.sh/vercel.json",
    "headers": [
      {
        "source": "/(.*)",
        "headers": [
          {
            "key": "X-Harbor-Profile",
            "value": harborUrl
          }
        ]
      }
    ],
    "_comment": "For full AI redirect, use middleware.ts instead. This config just adds a header."
  }, null, 2)
}
