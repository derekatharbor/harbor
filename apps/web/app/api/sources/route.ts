// app/api/sources/route.ts
// Sources API - uses RPC to avoid URL length issues

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function classifySourceType(domain: string): string {
  const d = domain.toLowerCase().replace('www.', '')
  
  if (['forbes.com', 'nytimes.com', 'techcrunch.com', 'wired.com', 'theverge.com', 
       'businessinsider.com', 'venturebeat.com', 'zdnet.com', 'cnet.com', 'pcmag.com',
       'cnbc.com', 'bloomberg.com', 'reuters.com', 'wsj.com', 'inc.com', 'fastcompany.com',
       'entrepreneur.com', 'hbr.org'].some(e => d.includes(e))) {
    return 'Editorial'
  }
  if (['g2.com', 'capterra.com', 'trustradius.com', 'softwareadvice.com', 'getapp.com',
       'trustpilot.com', 'producthunt.com'].some(e => d.includes(e))) {
    return 'Review'
  }
  if (['.edu', '.gov', 'gartner.com', 'forrester.com', 'mckinsey.com', 'wikipedia.org'].some(e => d.includes(e))) {
    return 'Institutional'
  }
  if (['reddit.com', 'quora.com', 'youtube.com', 'twitter.com', 'medium.com', 
       'stackoverflow.com', 'github.com', 'dev.to'].some(e => d.includes(e))) {
    return 'UGC'
  }
  if (['asana.com', 'monday.com', 'hubspot.com', 'salesforce.com', 'zapier.com',
       'notion.so', 'slack.com', 'atlassian.com', 'zendesk.com', 'intercom.com',
       'stripe.com', 'shopify.com', 'mailchimp.com'].some(e => d.includes(e))) {
    return 'Corporate'
  }
  return 'Other'
}

export async function GET(request: NextRequest) {
  const supabase = getSupabase()
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '50')

  try {
    // Use RPC to get top sources (avoids URL length issues)
    const { data: sourcesRaw, error: rpcError } = await supabase.rpc('get_top_saas_sources')

    if (rpcError) {
      console.error('Sources RPC error:', rpcError)
      return NextResponse.json({
        sources: [],
        typeBreakdown: [],
        totals: { totalCitations: 0, uniqueDomains: 0, highAuthority: 0, gapOpportunities: null }
      })
    }

    const sources = (sourcesRaw || []).slice(0, limit).map((s: any, idx: number) => ({
      domain: s.domain,
      sourceType: classifySourceType(s.domain),
      totalCitations: parseInt(s.citations),
      uniqueUrls: parseInt(s.unique_urls) || parseInt(s.citations),
      favicon: `https://www.google.com/s2/favicons?domain=${s.domain}&sz=32`
    }))

    // Type breakdown
    const typeBreakdown: Record<string, number> = {}
    sources.forEach((s: any) => {
      typeBreakdown[s.sourceType] = (typeBreakdown[s.sourceType] || 0) + s.totalCitations
    })

    const totalCitations = sources.reduce((sum: number, s: any) => sum + s.totalCitations, 0)

    return NextResponse.json({
      sources,
      typeBreakdown: Object.entries(typeBreakdown).map(([type, count]) => ({
        type,
        count,
        percentage: totalCitations > 0 ? Math.round((count / totalCitations) * 100) : 0
      })),
      totals: {
        totalCitations,
        uniqueDomains: sources.length,
        highAuthority: sources.filter((s: any) => ['Editorial', 'Institutional', 'Review'].includes(s.sourceType)).length,
        gapOpportunities: null
      }
    })

  } catch (error) {
    console.error('Sources API error:', error)
    return NextResponse.json({ error: 'Failed to fetch sources' }, { status: 500 })
  }
}