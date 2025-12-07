// app/api/sources/route.ts
// Sources aggregation API - citation data for the Sources page

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

// Domain authority scoring (simplified - could use Moz/Ahrefs API later)
const AUTHORITY_SCORES: Record<string, 'high' | 'medium' | 'low'> = {
  // High authority - major publications
  'forbes.com': 'high',
  'nytimes.com': 'high',
  'wsj.com': 'high',
  'bloomberg.com': 'high',
  'reuters.com': 'high',
  'techcrunch.com': 'high',
  'wired.com': 'high',
  'theverge.com': 'high',
  'cnbc.com': 'high',
  'businessinsider.com': 'high',
  'hbr.org': 'high',
  'harvard.edu': 'high',
  'mit.edu': 'high',
  'stanford.edu': 'high',
  'g2.com': 'high',
  'capterra.com': 'high',
  'gartner.com': 'high',
  'forrester.com': 'high',
  
  // Medium authority - industry sites
  'zapier.com': 'medium',
  'hubspot.com': 'medium',
  'shopify.com': 'medium',
  'salesforce.com': 'medium',
  'zendesk.com': 'medium',
  'pcmag.com': 'medium',
  'cnet.com': 'medium',
  'zdnet.com': 'medium',
  'venturebeat.com': 'medium',
  'producthunt.com': 'medium',
  'medium.com': 'medium',
  'dev.to': 'medium',
  
  // UGC - lower authority but still valuable
  'reddit.com': 'low',
  'quora.com': 'low',
  'youtube.com': 'low',
  'twitter.com': 'low',
  'linkedin.com': 'medium',
}

function getAuthorityScore(domain: string): 'high' | 'medium' | 'low' {
  const clean = domain.toLowerCase().replace('www.', '')
  return AUTHORITY_SCORES[clean] || 'low'
}

// Enhanced source type classification
function classifySourceType(domain: string): string {
  const d = domain.toLowerCase().replace('www.', '')
  
  // Editorial / News
  if (['forbes.com', 'nytimes.com', 'wsj.com', 'bloomberg.com', 'reuters.com', 
       'techcrunch.com', 'wired.com', 'theverge.com', 'cnbc.com', 'businessinsider.com',
       'venturebeat.com', 'mashable.com', 'engadget.com', 'arstechnica.com',
       'pcmag.com', 'cnet.com', 'zdnet.com', 'thenextweb.com', 'inc.com',
       'entrepreneur.com', 'fastcompany.com', 'fortune.com', 'time.com',
       'bbc.com', 'bbc.co.uk', 'cnn.com', 'theguardian.com', 'washingtonpost.com',
       'usatoday.com', 'huffpost.com', 'businesswire.com', 'prnewswire.com',
       'techradar.com', 'tomshardware.com', 'digitaltrends.com', 'gizmodo.com',
       'lifehacker.com', 'makeuseof.com', 'howtogeek.com', 'androidauthority.com',
       '9to5mac.com', '9to5google.com', 'macrumors.com', 'appleinsider.com'].some(e => d.includes(e))) {
    return 'editorial'
  }
  
  // Review sites
  if (['g2.com', 'capterra.com', 'trustradius.com', 'softwareadvice.com', 
       'getapp.com', 'trustpilot.com', 'yelp.com', 'reviews.com', 
       'consumerreports.org', 'wirecutter.com', 'tomsguide.com',
       'toptenreviews.com', 'softwarepundit.com', 'selectsoftwarereviews.com',
       'slant.co', 'alternativeto.net', 'producthunt.com', 'saasworthy.com',
       'financesonline.com', 'softwareworld.co', 'crozdesk.com'].some(e => d.includes(e))) {
    return 'review'
  }
  
  // Institutional / Research / Education
  if (['.edu', '.gov', 'gartner.com', 'forrester.com', 'mckinsey.com', 
       'hbr.org', 'statista.com', 'pewresearch.org', 'ibm.com/think',
       'deloitte.com', 'accenture.com', 'bcg.com', 'bain.com', 'kpmg.com',
       'pwc.com', 'ey.com', 'nielsen.com', 'idc.com', 'emarketer.com',
       'brookings.edu', 'rand.org', 'nist.gov', 'ieee.org', 'acm.org'].some(e => d.includes(e))) {
    return 'institutional'
  }
  
  // UGC - User Generated Content
  if (['reddit.com', 'quora.com', 'youtube.com', 'twitter.com', 'facebook.com',
       'medium.com', 'dev.to', 'stackoverflow.com', 'stackexchange.com',
       'news.ycombinator.com', 'hashnode.dev', 'substack.com', 'ghost.io',
       'wordpress.com', 'blogger.com', 'tumblr.com', 'discord.com',
       'slack.com', 'github.com', 'gitlab.com', 'bitbucket.org',
       'indiehackers.com', 'lobste.rs', 'hackernoon.com'].some(e => d.includes(e))) {
    return 'ugc'
  }
  
  // Reference / Documentation
  if (['wikipedia.org', 'wikimedia.org', 'britannica.com', 'dictionary.com',
       'merriam-webster.com', 'investopedia.com', 'webmd.com', 'healthline.com',
       'mayoclinic.org', 'nih.gov', 'cdc.gov', 'who.int'].some(e => d.includes(e))) {
    return 'reference'
  }
  
  // Corporate (SaaS companies, tech companies)
  if (['asana.com', 'monday.com', 'clickup.com', 'notion.so', 'trello.com',
       'hubspot.com', 'salesforce.com', 'zendesk.com', 'shopify.com', 'stripe.com',
       'zapier.com', 'slack.com', 'zoom.us', 'figma.com', 'canva.com',
       'atlassian.com', 'jira.com', 'confluence.com', 'airtable.com',
       'mailchimp.com', 'intercom.com', 'drift.com', 'freshworks.com',
       'servicenow.com', 'workday.com', 'oracle.com', 'sap.com', 'microsoft.com',
       'google.com', 'amazon.com', 'apple.com', 'adobe.com', 'dropbox.com',
       'box.com', 'docusign.com', 'pandadoc.com', 'calendly.com',
       'typeform.com', 'surveymonkey.com', 'webflow.com', 'squarespace.com',
       'wix.com', 'godaddy.com', 'namecheap.com', 'cloudflare.com',
       'twilio.com', 'sendgrid.com', 'segment.com', 'mixpanel.com',
       'amplitude.com', 'heap.io', 'hotjar.com', 'crazy egg.com',
       'buffer.com', 'hootsuite.com', 'sproutsocial.com', 'later.com',
       'semrush.com', 'ahrefs.com', 'moz.com', 'screaming frog.co.uk',
       'nerdwallet.com', 'creditkarma.com', 'mint.com', 'experian.com',
       'equifax.com', 'transunion.com', 'bankrate.com', 'lendingtree.com'].some(e => d.includes(e))) {
    return 'corporate'
  }
  
  // Check for blog patterns (often editorial-style)
  if (d.includes('blog.') || d.includes('/blog') || d.endsWith('.blog')) {
    return 'editorial'
  }
  
  // Check for docs patterns (reference)
  if (d.includes('docs.') || d.includes('/docs') || d.includes('help.') || d.includes('support.')) {
    return 'reference'
  }
  
  return 'other'
}

export async function GET(request: NextRequest) {
  const supabase = getSupabase()
  const { searchParams } = new URL(request.url)
  
  const dashboardId = searchParams.get('dashboard_id')
  const userBrand = searchParams.get('brand')
  const gapAnalysis = searchParams.get('gap') === 'true'
  const limit = parseInt(searchParams.get('limit') || '50')
  const excludeUniversities = searchParams.get('exclude_universities') !== 'false'

  try {
    // Get execution IDs for non-university prompts
    let executionIds: string[] | null = null
    
    if (excludeUniversities) {
      const { data: executions } = await supabase
        .from('prompt_executions')
        .select('id, seed_prompts!inner(topic)')
        .neq('seed_prompts.topic', 'universities')
      
      executionIds = executions?.map((e: any) => e.id) || []
      
      if (executionIds.length === 0) {
        return NextResponse.json({
          sources: [],
          typeBreakdown: [],
          totals: { totalCitations: 0, uniqueDomains: 0, highAuthority: 0, gapOpportunities: null }
        })
      }
    }

    // Get citations
    let query = supabase
      .from('prompt_citations')
      .select(`
        id,
        url,
        domain,
        source_type,
        execution_id,
        prompt_executions (
          id,
          prompt_id,
          model,
          executed_at,
          prompt_brand_mentions (
            brand_name,
            position,
            sentiment
          )
        )
      `)
      .order('id', { ascending: false })
      .limit(1000)
    
    if (executionIds && executionIds.length > 0) {
      query = query.in('execution_id', executionIds)
    }

    const { data: citations, error } = await query

    if (error) throw error

    // Aggregate by domain
    const domainStats: Record<string, {
      domain: string
      sourceType: string
      authority: 'high' | 'medium' | 'low'
      totalCitations: number
      uniqueUrls: Set<string>
      brandMentions: Record<string, number>
      urlTypes: Record<string, number>
      recentCitations: number // last 7 days
      trend: 'up' | 'down' | 'stable'
    }> = {}

    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    for (const citation of citations || []) {
      const domain = citation.domain?.toLowerCase().replace('www.', '') || 'unknown'
      
      if (!domainStats[domain]) {
        domainStats[domain] = {
          domain,
          sourceType: classifySourceType(domain),
          authority: getAuthorityScore(domain),
          totalCitations: 0,
          uniqueUrls: new Set(),
          brandMentions: {},
          urlTypes: {},
          recentCitations: 0,
          trend: 'stable'
        }
      }

      const stats = domainStats[domain]
      stats.totalCitations++
      stats.uniqueUrls.add(citation.url)
      
      // Track brand mentions for this source
      const exec = citation.prompt_executions as any
      if (exec?.prompt_brand_mentions) {
        for (const mention of exec.prompt_brand_mentions) {
          stats.brandMentions[mention.brand_name] = (stats.brandMentions[mention.brand_name] || 0) + 1
        }
      }

      // Track recency
      if (exec?.executed_at && new Date(exec.executed_at) > weekAgo) {
        stats.recentCitations++
      }
    }

    // Convert to array and sort by total citations
    let sources = Object.values(domainStats).map(s => ({
      domain: s.domain,
      sourceType: s.sourceType,
      authority: s.authority,
      totalCitations: s.totalCitations,
      uniqueUrls: s.uniqueUrls.size,
      brandMentions: s.brandMentions,
      topBrands: Object.entries(s.brandMentions)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count })),
      recentCitations: s.recentCitations,
      trend: s.recentCitations > s.totalCitations * 0.3 ? 'up' : 
             s.recentCitations < s.totalCitations * 0.1 ? 'down' : 'stable',
      favicon: `https://www.google.com/s2/favicons?domain=${s.domain}&sz=32`
    }))

    // Gap analysis: filter to sources where user's brand is NOT mentioned
    if (gapAnalysis && userBrand) {
      sources = sources.filter(s => !s.brandMentions[userBrand])
    }

    // Sort by priority (high authority + high citations first)
    sources.sort((a, b) => {
      const authorityWeight = { high: 3, medium: 2, low: 1 }
      const scoreA = authorityWeight[a.authority] * 10 + a.totalCitations
      const scoreB = authorityWeight[b.authority] * 10 + b.totalCitations
      return scoreB - scoreA
    })

    // Source type breakdown for donut chart
    const typeBreakdown: Record<string, { count: number; domains: string[] }> = {}
    for (const source of sources) {
      if (!typeBreakdown[source.sourceType]) {
        typeBreakdown[source.sourceType] = { count: 0, domains: [] }
      }
      typeBreakdown[source.sourceType].count += source.totalCitations
      if (typeBreakdown[source.sourceType].domains.length < 5) {
        typeBreakdown[source.sourceType].domains.push(source.domain)
      }
    }

    // Calculate totals
    const totalCitations = sources.reduce((sum, s) => sum + s.totalCitations, 0)

    return NextResponse.json({
      sources: sources.slice(0, limit),
      typeBreakdown: Object.entries(typeBreakdown).map(([type, data]) => ({
        type,
        count: data.count,
        percentage: Math.round((data.count / totalCitations) * 100),
        topDomains: data.domains
      })),
      totals: {
        totalCitations,
        uniqueDomains: sources.length,
        highAuthority: sources.filter(s => s.authority === 'high').length,
        gapOpportunities: gapAnalysis ? sources.length : null
      }
    })

  } catch (error) {
    console.error('Sources API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sources' },
      { status: 500 }
    )
  }
}