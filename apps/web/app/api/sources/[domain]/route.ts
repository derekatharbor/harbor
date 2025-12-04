// app/api/sources/[domain]/route.ts
// Source detail API - URLs and Chats for a specific domain

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Classify URL type based on URL patterns and content
function classifyUrlType(url: string): string {
  const lower = url.toLowerCase()
  
  if (lower.includes('best-') || lower.includes('/best/') || lower.includes('-vs-') || 
      lower.includes('top-10') || lower.includes('top-5') || lower.includes('-tools')) {
    return 'listicle'
  }
  if (lower.includes('how-to') || lower.includes('guide') || lower.includes('tutorial') ||
      lower.includes('step-by-step')) {
    return 'how-to'
  }
  if (lower.includes('review') || lower.includes('rating') || lower.includes('comparison')) {
    return 'review'
  }
  if (lower.includes('-vs-') || lower.includes('compare') || lower.includes('alternative')) {
    return 'comparison'
  }
  if (lower.includes('news') || lower.includes('/2024/') || lower.includes('/2025/')) {
    return 'news'
  }
  
  return 'other'
}

// Domain authority scoring
const AUTHORITY_SCORES: Record<string, 'high' | 'medium' | 'low'> = {
  'forbes.com': 'high',
  'nytimes.com': 'high',
  'techcrunch.com': 'high',
  'g2.com': 'high',
  'capterra.com': 'high',
  'cnbc.com': 'high',
  'wired.com': 'high',
  'zapier.com': 'medium',
  'hubspot.com': 'medium',
  'medium.com': 'medium',
  'reddit.com': 'low',
  'quora.com': 'low',
}

function classifySourceType(domain: string): string {
  const d = domain.toLowerCase()
  
  if (['forbes.com', 'nytimes.com', 'techcrunch.com', 'wired.com', 'cnbc.com'].some(e => d.includes(e))) {
    return 'editorial'
  }
  if (['g2.com', 'capterra.com', 'trustradius.com'].some(e => d.includes(e))) {
    return 'review'
  }
  if (['reddit.com', 'quora.com', 'medium.com'].some(e => d.includes(e))) {
    return 'ugc'
  }
  if (['.edu', '.gov'].some(e => d.includes(e))) {
    return 'institutional'
  }
  
  return 'corporate'
}

export async function GET(
  request: NextRequest,
  { params }: { params: { domain: string } }
) {
  const supabase = getSupabase()
  const domain = decodeURIComponent(params.domain).toLowerCase().replace('www.', '')

  try {
    // Get all citations for this domain with execution data
    const { data: citations, error } = await supabase
      .from('prompt_citations')
      .select(`
        id,
        url,
        domain,
        execution_id,
        prompt_executions (
          id,
          prompt_id,
          model,
          response_text,
          executed_at,
          seed_prompts (
            prompt_text,
            topic
          ),
          prompt_brand_mentions (
            brand_name,
            position,
            sentiment
          )
        )
      `)
      .ilike('domain', `%${domain}%`)
      .order('id', { ascending: false })
      .limit(500)

    if (error) throw error

    // Aggregate URLs
    const urlMap: Record<string, {
      url: string
      title?: string
      urlType: string
      executions: Set<string>
      brandMentioned: boolean
      totalCitations: number
    }> = {}

    // Track which prompts cited this domain
    const chatMap: Record<string, {
      id: string
      prompt: string
      model: string
      response_snippet: string
      citations: number
      mentions: number
      sources: Set<string>
      executed_at: string
    }> = {}

    let totalCitations = 0
    let brandMentionedInAny = false

    for (const citation of citations || []) {
      totalCitations++
      const url = citation.url
      const exec = citation.prompt_executions as any

      // Track URL stats
      if (!urlMap[url]) {
        urlMap[url] = {
          url,
          urlType: classifyUrlType(url),
          executions: new Set(),
          brandMentioned: false,
          totalCitations: 0
        }
      }
      urlMap[url].executions.add(citation.execution_id)
      urlMap[url].totalCitations++

      // Check if user's brand is mentioned in this execution
      if (exec?.prompt_brand_mentions?.length > 0) {
        urlMap[url].brandMentioned = true
        brandMentionedInAny = true
      }

      // Track chat/prompt stats
      if (exec && exec.id) {
        if (!chatMap[exec.id]) {
          const promptText = exec.seed_prompts?.prompt_text || 'Unknown prompt'
          const responseText = exec.response_text || ''
          
          chatMap[exec.id] = {
            id: exec.id,
            prompt: promptText.length > 100 ? promptText.slice(0, 100) + '...' : promptText,
            model: exec.model || 'unknown',
            response_snippet: responseText.length > 200 ? responseText.slice(0, 200) + '...' : responseText,
            citations: 0,
            mentions: exec.prompt_brand_mentions?.length || 0,
            sources: new Set(),
            executed_at: exec.executed_at
          }
        }
        chatMap[exec.id].citations++
        chatMap[exec.id].sources.add(domain)
      }
    }

    // Get other sources from the same executions to show related sources
    const executionIds = [...new Set(citations?.map(c => c.execution_id) || [])]
    
    if (executionIds.length > 0) {
      const { data: relatedCitations } = await supabase
        .from('prompt_citations')
        .select('domain, execution_id')
        .in('execution_id', executionIds.slice(0, 100))

      for (const rc of relatedCitations || []) {
        const execId = rc.execution_id
        if (chatMap[execId] && rc.domain !== domain) {
          chatMap[execId].sources.add(rc.domain.replace('www.', ''))
        }
      }
    }

    // Convert to arrays
    const urls = Object.values(urlMap).map(u => ({
      url: u.url,
      title: null, // Could fetch titles later
      urlType: u.urlType,
      brandMentioned: u.brandMentioned,
      mentions: u.brandMentioned ? 1 : 0,
      usedTotal: u.executions.size,
      avgCitations: u.totalCitations / Math.max(u.executions.size, 1)
    })).sort((a, b) => b.usedTotal - a.usedTotal)

    const chats = Object.values(chatMap).map(c => ({
      ...c,
      sources: [...c.sources]
    })).sort((a, b) => new Date(b.executed_at).getTime() - new Date(a.executed_at).getTime())

    return NextResponse.json({
      domain,
      stats: {
        totalCitations,
        uniqueUrls: Object.keys(urlMap).length,
        brandMentioned: brandMentionedInAny,
        sourceType: classifySourceType(domain),
        authority: AUTHORITY_SCORES[domain] || 'low'
      },
      urls,
      chats
    })

  } catch (error) {
    console.error('Source detail API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch source details' },
      { status: 500 }
    )
  }
}