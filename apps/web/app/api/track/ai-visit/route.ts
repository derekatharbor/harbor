// apps/web/app/api/track/ai-visit/route.ts
// Lightweight endpoint to log AI bot and referrer visits
// Can be called from middleware, edge functions, or client-side

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

// AI Bot patterns - keep in sync with ai-traffic-monitor.ts
const AI_BOTS: Record<string, { company: string; purpose: string }> = {
  'GPTBot': { company: 'OpenAI', purpose: 'training' },
  'OAI-SearchBot': { company: 'OpenAI', purpose: 'search_index' },
  'ChatGPT-User': { company: 'OpenAI', purpose: 'realtime_citation' },
  'ClaudeBot': { company: 'Anthropic', purpose: 'realtime_citation' },
  'Claude-Web': { company: 'Anthropic', purpose: 'realtime_citation' },
  'anthropic-ai': { company: 'Anthropic', purpose: 'training' },
  'Google-Extended': { company: 'Google', purpose: 'training' },
  'PerplexityBot': { company: 'Perplexity', purpose: 'search_index' },
  'Applebot-Extended': { company: 'Apple', purpose: 'training' },
  'meta-externalagent': { company: 'Meta', purpose: 'search_index' },
  'CCBot': { company: 'Common Crawl', purpose: 'training' },
  'Bytespider': { company: 'ByteDance', purpose: 'training' },
  'YouBot': { company: 'You.com', purpose: 'search_index' },
  'cohere-ai': { company: 'Cohere', purpose: 'training' },
}

const AI_REFERRERS: Record<string, { company: string; product: string }> = {
  'chat.openai.com': { company: 'OpenAI', product: 'ChatGPT' },
  'chatgpt.com': { company: 'OpenAI', product: 'ChatGPT' },
  'perplexity.ai': { company: 'Perplexity', product: 'Perplexity' },
  'www.perplexity.ai': { company: 'Perplexity', product: 'Perplexity' },
  'claude.ai': { company: 'Anthropic', product: 'Claude' },
  'www.claude.ai': { company: 'Anthropic', product: 'Claude' },
  'gemini.google.com': { company: 'Google', product: 'Gemini' },
  'bard.google.com': { company: 'Google', product: 'Bard' },
  'copilot.microsoft.com': { company: 'Microsoft', product: 'Copilot' },
  'you.com': { company: 'You.com', product: 'You.com' },
  'www.you.com': { company: 'You.com', product: 'You.com' },
  'poe.com': { company: 'Quora', product: 'Poe' },
  'www.poe.com': { company: 'Quora', product: 'Poe' },
}

function detectBot(userAgent: string): { botName: string; company: string; purpose: string } | null {
  for (const [botName, info] of Object.entries(AI_BOTS)) {
    if (userAgent.includes(botName)) {
      return { botName, ...info }
    }
  }
  return null
}

function detectReferrer(referrer: string): { domain: string; company: string; product: string } | null {
  if (!referrer) return null
  
  try {
    const url = new URL(referrer)
    const domain = url.hostname.toLowerCase()
    const match = AI_REFERRERS[domain]
    if (match) {
      return { domain, ...match }
    }
  } catch {
    // Invalid URL
  }
  return null
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_agent, referrer, url, ip } = body

    if (!url) {
      return NextResponse.json({ error: 'url required' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const results = { bot: false, referrer: false }

    // Check for AI bot
    if (user_agent) {
      const bot = detectBot(user_agent)
      if (bot) {
        await supabase.from('ai_bot_visits').insert({
          user_agent,
          bot_name: bot.botName,
          company: bot.company,
          purpose: bot.purpose,
          url_visited: url,
          ip_address: ip,
        })
        results.bot = true

        // If realtime citation, also log as citation
        if (bot.purpose === 'realtime_citation') {
          const slugMatch = url.match(/\/brands\/([^\/\?]+)/)
          await supabase.from('citations').insert({
            source: bot.company.toLowerCase() === 'openai' ? 'chatgpt' :
                    bot.company.toLowerCase() === 'anthropic' ? 'claude' : 'other',
            cited_url: url,
            cited_slug: slugMatch ? slugMatch[1] : null,
            cited_page_type: url.includes('/brands/') ? 'brand_profile' :
                            url.includes('/best-') ? 'listicle' : 'other',
            citation_type: 'direct_link',
            detected_by: 'bot_visit',
            metadata: { bot_name: bot.botName },
          })
        }
      }
    }

    // Check for AI referrer
    if (referrer) {
      const ref = detectReferrer(referrer)
      if (ref) {
        await supabase.from('ai_referrer_visits').insert({
          referrer,
          referrer_domain: ref.domain,
          company: ref.company,
          product: ref.product,
          landing_page: url,
        })
        results.referrer = true

        // Also log as citation
        const slugMatch = url.match(/\/brands\/([^\/\?]+)/)
        await supabase.from('citations').insert({
          source: ref.company.toLowerCase().includes('openai') ? 'chatgpt' :
                  ref.company.toLowerCase().includes('perplexity') ? 'perplexity' :
                  ref.company.toLowerCase().includes('anthropic') ? 'claude' :
                  ref.company.toLowerCase().includes('google') ? 'gemini' : 'other',
          cited_url: url,
          cited_slug: slugMatch ? slugMatch[1] : null,
          cited_page_type: url.includes('/brands/') ? 'brand_profile' :
                          url.includes('/best-') ? 'listicle' : 'other',
          citation_type: 'direct_link',
          detected_by: 'referrer_traffic',
          metadata: { referrer, product: ref.product },
        })
      }
    }

    return NextResponse.json({ success: true, ...results })

  } catch (error) {
    console.error('AI tracking error:', error)
    return NextResponse.json({ error: 'tracking failed' }, { status: 500 })
  }
}

// GET endpoint for checking current status
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get recent bot visits
    const { data: recentBots, count: botCount } = await supabase
      .from('ai_bot_visits')
      .select('*', { count: 'exact' })
      .order('timestamp', { ascending: false })
      .limit(10)

    // Get recent referrer visits
    const { data: recentReferrers, count: referrerCount } = await supabase
      .from('ai_referrer_visits')
      .select('*', { count: 'exact' })
      .order('timestamp', { ascending: false })
      .limit(10)

    // Get citation count
    const { count: citationCount } = await supabase
      .from('citations')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({
      stats: {
        total_bot_visits: botCount || 0,
        total_referrer_visits: referrerCount || 0,
        total_citations: citationCount || 0,
      },
      recent_bots: recentBots || [],
      recent_referrers: recentReferrers || [],
    })

  } catch (error) {
    console.error('AI tracking status error:', error)
    return NextResponse.json({ error: 'status failed' }, { status: 500 })
  }
}
