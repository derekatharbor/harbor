import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Domain type classification
const DOMAIN_TYPES: Record<string, string[]> = {
  'Editorial': [
    'techcrunch.com', 'theverge.com', 'wired.com', 'forbes.com', 'bloomberg.com',
    'businessinsider.com', 'inc.com', 'entrepreneur.com', 'fastcompany.com',
    'mashable.com', 'venturebeat.com', 'zdnet.com', 'cnet.com', 'engadget.com',
    'arstechnica.com', 'medium.com', 'substack.com', 'nytimes.com', 'wsj.com',
    'theguardian.com', 'bbc.com', 'reuters.com', 'apnews.com'
  ],
  'UGC': [
    'reddit.com', 'quora.com', 'youtube.com', 'twitter.com', 'x.com',
    'facebook.com', 'linkedin.com', 'instagram.com', 'tiktok.com',
    'producthunt.com', 'hackernews.com', 'news.ycombinator.com',
    'stackoverflow.com', 'stackexchange.com', 'discord.com', 'slack.com'
  ],
  'Reference': [
    'wikipedia.org', 'wikimedia.org', 'britannica.com', 'merriam-webster.com',
    'dictionary.com', 'investopedia.com', 'webmd.com', 'mayoclinic.org',
    'docs.google.com', 'notion.so', 'gitbook.io', 'readthedocs.io'
  ],
  'Institutional': [
    // .edu and .gov domains handled separately
  ]
}

function classifyDomain(domain: string): string {
  const lowerDomain = domain.toLowerCase()
  
  // Check for institutional domains
  if (lowerDomain.endsWith('.edu') || lowerDomain.endsWith('.gov')) {
    return 'Institutional'
  }
  
  // Check known domain lists
  for (const [type, domains] of Object.entries(DOMAIN_TYPES)) {
    if (domains.some(d => lowerDomain.includes(d) || lowerDomain.endsWith(d))) {
      return type
    }
  }
  
  // Heuristics for Corporate vs Other
  if (lowerDomain.endsWith('.com') || lowerDomain.endsWith('.io') || lowerDomain.endsWith('.co')) {
    if (lowerDomain.includes('blog') || lowerDomain.includes('news')) {
      return 'Editorial'
    }
    return 'Corporate'
  }
  
  return 'Other'
}

// Colors matching Peec screenshot
const TYPE_COLORS: Record<string, string> = {
  'Corporate': '#FF8C42',    // Orange
  'Editorial': '#3B82F6',    // Blue
  'Other': '#9CA3AF',        // Gray
  'UGC': '#22D3EE',          // Cyan
  'Institutional': '#4ADE80', // Green
  'Reference': '#A855F7'     // Purple
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: dashboardId } = await params
    const supabase = getSupabase()

    // Get all user_prompts for this dashboard
    const { data: prompts, error: promptsError } = await supabase
      .from('user_prompts')
      .select('id')
      .eq('dashboard_id', dashboardId)
    
    if (promptsError) throw promptsError
    if (!prompts || prompts.length === 0) {
      return NextResponse.json({
        domains: [],
        urls: [],
        distribution: [],
        total: 0
      })
    }

    const promptIds = prompts.map(p => p.id)

    // Get all executions for these prompts
    const { data: executions, error: execError } = await supabase
      .from('prompt_executions')
      .select('id')
      .in('prompt_id', promptIds)
    
    if (execError) throw execError
    if (!executions || executions.length === 0) {
      return NextResponse.json({
        domains: [],
        urls: [],
        distribution: [],
        total: 0
      })
    }

    const executionIds = executions.map(e => e.id)

    // Get all citations from these executions
    const { data: citations, error: citationsError } = await supabase
      .from('prompt_citations')
      .select('id, url, domain, execution_id')
      .in('execution_id', executionIds)
    
    if (citationsError) throw citationsError
    if (!citations || citations.length === 0) {
      return NextResponse.json({
        domains: [],
        urls: [],
        distribution: [],
        total: 0
      })
    }

    // Aggregate by domain
    const domainMap = new Map<string, { count: number; type: string; urls: string[] }>()
    
    for (const citation of citations) {
      const domain = citation.domain || 'unknown'
      const existing = domainMap.get(domain)
      
      if (existing) {
        existing.count++
        if (!existing.urls.includes(citation.url)) {
          existing.urls.push(citation.url)
        }
      } else {
        domainMap.set(domain, {
          count: 1,
          type: classifyDomain(domain),
          urls: [citation.url]
        })
      }
    }

    // Sort domains by citation count
    const sortedDomains = Array.from(domainMap.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .map(([domain, data], index) => ({
        rank: index + 1,
        domain,
        type: data.type,
        citations: data.count,
        color: TYPE_COLORS[data.type] || TYPE_COLORS['Other']
      }))

    // Get all URLs sorted by domain frequency
    const allUrls = citations
      .map(c => ({
        url: c.url,
        domain: c.domain,
        type: classifyDomain(c.domain)
      }))
      .slice(0, 100)

    // Calculate distribution
    const typeCount = new Map<string, number>()
    for (const [, data] of domainMap) {
      const current = typeCount.get(data.type) || 0
      typeCount.set(data.type, current + data.count)
    }

    const distribution = Array.from(typeCount.entries())
      .map(([type, count]) => ({
        type,
        count,
        color: TYPE_COLORS[type] || TYPE_COLORS['Other'],
        percentage: Math.round((count / citations.length) * 100)
      }))
      .sort((a, b) => b.count - a.count)

    return NextResponse.json({
      domains: sortedDomains.slice(0, 20),
      urls: allUrls,
      distribution,
      total: citations.length
    })

  } catch (error: any) {
    console.error('Sources API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}