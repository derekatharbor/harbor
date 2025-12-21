// app/api/dashboard/[id]/opportunities/route.ts
// Returns personalized opportunity data based on REAL citation and prompt data

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Domain categorization for content types
const DOMAIN_CATEGORIES = {
  reviews: ['g2.com', 'capterra.com', 'trustradius.com', 'trustpilot.com', 'softwareadvice.com', 'getapp.com'],
  reddit: ['reddit.com'],
  linkedin: ['linkedin.com'],
  editorial: [
    'techcrunch.com', 'theverge.com', 'wired.com', 'forbes.com', 'bloomberg.com',
    'businessinsider.com', 'inc.com', 'entrepreneur.com', 'fastcompany.com',
    'venturebeat.com', 'zdnet.com', 'cnet.com', 'engadget.com', 'arstechnica.com',
    'nytimes.com', 'wsj.com', 'theguardian.com', 'bbc.com', 'reuters.com'
  ],
  listicle: ['zapier.com', 'pcmag.com', 'techradar.com', 'tomsguide.com', 'cnet.com'],
  howto: ['stackoverflow.com', 'medium.com', 'dev.to', 'github.com', 'youtube.com'],
  reference: ['wikipedia.org', 'investopedia.com', 'docs.']
}

function categorizeDomain(domain: string): string[] {
  const lowerDomain = domain.toLowerCase()
  const categories: string[] = []
  
  for (const [category, domains] of Object.entries(DOMAIN_CATEGORIES)) {
    if (domains.some(d => lowerDomain.includes(d))) {
      categories.push(category)
    }
  }
  
  // If no specific category, it's likely corporate/competitor
  if (categories.length === 0) {
    categories.push('corporate')
  }
  
  return categories
}

// Categorize prompts by intent
function categorizePrompt(prompt: string): string[] {
  const lower = prompt.toLowerCase()
  const categories: string[] = []
  
  // Comparison intent
  if (lower.includes(' vs ') || lower.includes('versus') || lower.includes('compare') || 
      lower.includes('alternative') || lower.includes('difference between') ||
      lower.includes('better than') || lower.includes('or ')) {
    categories.push('comparison')
  }
  
  // How-to intent
  if (lower.includes('how to') || lower.includes('how do') || lower.includes('tutorial') ||
      lower.includes('guide') || lower.includes('step by step') || lower.includes('set up') ||
      lower.includes('configure') || lower.includes('install')) {
    categories.push('howto')
  }
  
  // Listicle intent
  if (lower.includes('best ') || lower.includes('top ') || lower.includes('tools') ||
      lower.includes('software') || lower.includes('apps for') || lower.includes('list of')) {
    categories.push('listicle')
  }
  
  // Product intent
  if (lower.includes('pricing') || lower.includes('cost') || lower.includes('features') ||
      lower.includes('review') || lower.includes('worth it') || lower.includes('pros and cons')) {
    categories.push('product')
  }
  
  // If no category matched, default to general
  if (categories.length === 0) {
    categories.push('general')
  }
  
  return categories
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: dashboardId } = await params
    const supabase = getSupabase()

    // 1. Get dashboard info
    const { data: dashboard } = await supabase
      .from('dashboards')
      .select('id, brand_name, domain, metadata')
      .eq('id', dashboardId)
      .single()

    if (!dashboard) {
      return NextResponse.json({ error: 'Dashboard not found' }, { status: 404 })
    }

    const brandName = dashboard.brand_name
    const category = dashboard.metadata?.category || 'Unknown'
    const domain = dashboard.domain

    // 2. Get all prompts for this dashboard
    const { data: prompts } = await supabase
      .from('user_prompts')
      .select('id, prompt_text')
      .eq('dashboard_id', dashboardId)

    if (!prompts || prompts.length === 0) {
      return NextResponse.json({
        brand: { name: brandName, domain, category },
        competitors: [],
        topCompetitor: null,
        onPage: buildEmptyOnPage(),
        offPage: buildEmptyOffPage(),
        learn: buildLearnContent(brandName, category, null),
        hasData: false
      })
    }

    const promptIds = prompts.map(p => p.id)

    // 3. Get all executions
    const { data: executions } = await supabase
      .from('prompt_executions')
      .select('id, prompt_id')
      .in('prompt_id', promptIds)

    if (!executions || executions.length === 0) {
      return NextResponse.json({
        brand: { name: brandName, domain, category },
        competitors: [],
        topCompetitor: null,
        onPage: buildEmptyOnPage(),
        offPage: buildEmptyOffPage(),
        learn: buildLearnContent(brandName, category, null),
        hasData: false
      })
    }

    const executionIds = executions.map(e => e.id)
    
    // Map execution_id to prompt_id for later use
    const executionToPrompt = new Map<string, string>()
    executions.forEach(e => executionToPrompt.set(e.id, e.prompt_id))

    // 4. Get all citations
    const { data: citations } = await supabase
      .from('prompt_citations')
      .select('id, url, domain, execution_id')
      .in('execution_id', executionIds)

    // 5. Aggregate citations by domain and category
    const domainCounts = new Map<string, number>()
    const categoryDomains: Record<string, Map<string, number>> = {
      reviews: new Map(),
      reddit: new Map(),
      linkedin: new Map(),
      editorial: new Map(),
      listicle: new Map(),
      howto: new Map(),
      corporate: new Map()
    }

    if (citations) {
      for (const citation of citations) {
        const citationDomain = citation.domain || 'unknown'
        
        // Overall count
        domainCounts.set(citationDomain, (domainCounts.get(citationDomain) || 0) + 1)
        
        // Category-specific counts
        const categories = categorizeDomain(citationDomain)
        for (const cat of categories) {
          if (categoryDomains[cat]) {
            categoryDomains[cat].set(citationDomain, (categoryDomains[cat].get(citationDomain) || 0) + 1)
          }
        }
      }
    }

    // 6. Categorize prompts and count by category
    const promptsByCategory: Record<string, Array<{ text: string; count: number }>> = {
      comparison: [],
      howto: [],
      listicle: [],
      product: [],
      general: []
    }

    // Count how many times each prompt was executed
    const promptExecutionCounts = new Map<string, number>()
    executions.forEach(e => {
      promptExecutionCounts.set(e.prompt_id, (promptExecutionCounts.get(e.prompt_id) || 0) + 1)
    })

    for (const prompt of prompts) {
      const categories = categorizePrompt(prompt.prompt_text)
      const count = promptExecutionCounts.get(prompt.id) || 1
      
      for (const cat of categories) {
        if (promptsByCategory[cat]) {
          promptsByCategory[cat].push({ text: prompt.prompt_text, count })
        }
      }
    }

    // Sort prompts by execution count
    for (const cat of Object.keys(promptsByCategory)) {
      promptsByCategory[cat].sort((a, b) => b.count - a.count)
    }

    // 7. Find top competitor from citations (most cited non-brand corporate domain)
    const sortedCorporate = Array.from(categoryDomains.corporate.entries())
      .filter(([d]) => !d.includes(domain)) // Exclude own domain
      .sort((a, b) => b[1] - a[1])
    
    const topCompetitorDomain = sortedCorporate[0]?.[0] || null

    // 8. Build the response
    const response = {
      brand: {
        name: brandName,
        domain: domain,
        category: category
      },
      competitors: sortedCorporate.slice(0, 5).map(([d, count]) => ({
        name: extractBrandName(d),
        domain: d,
        score: count,
        logo_url: null
      })),
      topCompetitor: topCompetitorDomain ? {
        name: extractBrandName(topCompetitorDomain),
        domain: topCompetitorDomain,
        score: sortedCorporate[0][1],
        logo_url: null
      } : null,
      
      onPage: {
        comparison: {
          actionItems: buildComparisonActions(brandName, topCompetitorDomain, category),
          phrases: promptsByCategory.comparison.slice(0, 5).map(p => ({
            phrase: p.text.length > 60 ? p.text.substring(0, 60) + '...' : p.text,
            count: p.count
          })),
          topSources: mapToSources(categoryDomains.corporate, 3)
        },
        article: {
          actionItems: buildArticleActions(brandName, category),
          phrases: promptsByCategory.general.slice(0, 5).map(p => ({
            phrase: p.text.length > 60 ? p.text.substring(0, 60) + '...' : p.text,
            count: p.count
          })),
          topSources: mapToSources(categoryDomains.editorial, 3)
        },
        howto: {
          actionItems: buildHowtoActions(brandName),
          phrases: promptsByCategory.howto.slice(0, 5).map(p => ({
            phrase: p.text.length > 60 ? p.text.substring(0, 60) + '...' : p.text,
            count: p.count
          })),
          topSources: mapToSources(categoryDomains.howto, 3)
        },
        listicle: {
          actionItems: buildListicleActions(brandName, category),
          phrases: promptsByCategory.listicle.slice(0, 5).map(p => ({
            phrase: p.text.length > 60 ? p.text.substring(0, 60) + '...' : p.text,
            count: p.count
          })),
          topSources: mapToSources(categoryDomains.listicle, 3)
        },
        product: {
          actionItems: buildProductActions(brandName, domain),
          phrases: promptsByCategory.product.slice(0, 5).map(p => ({
            phrase: p.text.length > 60 ? p.text.substring(0, 60) + '...' : p.text,
            count: p.count
          })),
          topSources: mapToSources(categoryDomains.corporate, 3)
        }
      },
      
      offPage: {
        reddit: {
          actionItems: buildRedditActions(brandName, category),
          phrases: promptsByCategory.general.filter(p => 
            p.text.toLowerCase().includes('reddit') || 
            p.text.toLowerCase().includes('recommend')
          ).slice(0, 3).map(p => ({
            phrase: p.text.length > 60 ? p.text.substring(0, 60) + '...' : p.text,
            count: p.count
          })),
          topSources: mapToSources(categoryDomains.reddit, 3)
        },
        linkedin: {
          actionItems: buildLinkedinActions(brandName, category),
          phrases: [],
          topSources: mapToSources(categoryDomains.linkedin, 3)
        },
        reviews: {
          actionItems: buildReviewsActions(brandName),
          phrases: promptsByCategory.product.filter(p =>
            p.text.toLowerCase().includes('review') ||
            p.text.toLowerCase().includes('rating')
          ).slice(0, 3).map(p => ({
            phrase: p.text.length > 60 ? p.text.substring(0, 60) + '...' : p.text,
            count: p.count
          })),
          topSources: mapToSources(categoryDomains.reviews, 3)
        },
        pr: {
          actionItems: buildPRActions(brandName, category),
          phrases: [],
          topSources: mapToSources(categoryDomains.editorial, 3)
        }
      },
      
      learn: buildLearnContent(brandName, category, topCompetitorDomain),
      hasData: (citations?.length || 0) > 0
    }

    return NextResponse.json(response)

  } catch (error: any) {
    console.error('Opportunities API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Helper: Extract brand name from domain
function extractBrandName(domain: string): string {
  return domain
    .replace(/^www\./, '')
    .split('.')[0]
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Helper: Map domain counts to source format
function mapToSources(domainMap: Map<string, number>, limit: number) {
  return Array.from(domainMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([domain, count]) => ({
      domain,
      count,
      logo_url: null
    }))
}

// Empty state builders
function buildEmptyOnPage() {
  return {
    comparison: { actionItems: [], phrases: [], topSources: [] },
    article: { actionItems: [], phrases: [], topSources: [] },
    howto: { actionItems: [], phrases: [], topSources: [] },
    listicle: { actionItems: [], phrases: [], topSources: [] },
    product: { actionItems: [], phrases: [], topSources: [] }
  }
}

function buildEmptyOffPage() {
  return {
    reddit: { actionItems: [], phrases: [], topSources: [] },
    linkedin: { actionItems: [], phrases: [], topSources: [] },
    reviews: { actionItems: [], phrases: [], topSources: [] },
    pr: { actionItems: [], phrases: [], topSources: [] }
  }
}

// Action item builders (personalized with real data)
function buildComparisonActions(brand: string, competitor: string | null, category: string): string[] {
  const actions = []
  if (competitor) {
    actions.push(`Create a "${brand} vs ${extractBrandName(competitor)}" comparison page`)
    actions.push(`Analyze ${competitor}'s comparison content structure`)
  } else {
    actions.push(`Create comparison pages against top ${category} competitors`)
  }
  actions.push('Include feature tables, pricing, and use-case recommendations')
  actions.push('Add FAQ schema for better AI parsing')
  return actions
}

function buildArticleActions(brand: string, category: string): string[] {
  return [
    `Publish original research about ${category} trends`,
    'Create data-driven content with unique insights',
    'Take positions on industry debates to stand out',
    'Include expert quotes and primary sources'
  ]
}

function buildHowtoActions(brand: string): string[] {
  return [
    `Create step-by-step guides for ${brand} use cases`,
    'Include screenshots and practical examples',
    'Structure with clear H2/H3 headers for AI parsing',
    'Add video tutorials for complex workflows'
  ]
}

function buildListicleActions(brand: string, category: string): string[] {
  return [
    `Create "Best ${category} Tools" content (include ${brand} authentically)`,
    'Provide genuine pros/cons for each option',
    'Update regularly to stay current',
    'Include specific use cases and recommendations'
  ]
}

function buildProductActions(brand: string, domain: string): string[] {
  return [
    `Add Product schema markup to ${domain}`,
    'Write detailed product descriptions (150+ words each)',
    'Include pricing in structured data',
    'Add customer review schema if available'
  ]
}

function buildRedditActions(brand: string, category: string): string[] {
  const subreddit = category.toLowerCase().replace(/\s+/g, '')
  return [
    `Monitor r/${subreddit} and related subreddits`,
    'Answer questions helpfully without being promotional',
    'Build karma through genuine community participation',
    `Set up alerts for "${brand}" mentions`
  ]
}

function buildLinkedinActions(brand: string, category: string): string[] {
  return [
    `Post ${category} insights regularly`,
    'Engage with industry conversations',
    `Share ${brand} milestones and updates`,
    'Ensure executives are active on the platform'
  ]
}

function buildReviewsActions(brand: string): string[] {
  return [
    `Claim your G2 and Capterra profiles for ${brand}`,
    'Respond to all reviews (positive and negative)',
    'Encourage satisfied customers to leave reviews',
    'Keep product information current across platforms'
  ]
}

function buildPRActions(brand: string, category: string): string[] {
  return [
    `Pitch ${brand} stories to ${category} publications`,
    'Contribute guest articles to authoritative sites',
    `Get featured in "best ${category}" roundups`,
    'Build relationships with industry journalists'
  ]
}

// Learn content (personalized)
function buildLearnContent(brand: string, category: string, competitor: string | null): Record<string, string> {
  const competitorName = competitor ? extractBrandName(competitor) : 'competitors'
  
  return {
    comparison: `Comparison pages directly answer "which should I choose" questions that AI models frequently handle.\n\n${competitor ? `${competitorName} currently appears in comparison queries. ` : ''}Creating thorough, honest comparisons makes your content the primary source for these decisions.`,
    
    article: `Thought leadership gets cited for industry context. AI looks for authoritative voices when explaining ${category} concepts.\n\nOriginal data and unique perspectives are especially valuable—they become primary sources that can't be found elsewhere.`,
    
    howto: `How-to content gets cited when users ask AI for instructions. Clear, well-structured guides rank higher.\n\nThe key is specificity—detailed guides for ${brand} with real examples become go-to references.`,
    
    listicle: `Listicles get cited in "best of" queries. Being the author of authoritative ${category} lists builds category credibility.\n\nObjectivity matters—obviously biased lists lose credibility and AI citation potential.`,
    
    product: `Product pages with proper schema get cited in shopping queries. AI needs structured data to recommend ${brand} accurately.\n\nIncomplete pages get skipped for competitors with better markup.`,
    
    reddit: `Reddit discussions frequently appear in AI citations. The platform's authentic content is trusted by AI models.\n\nAuthentic participation matters—obvious marketing gets downvoted and ignored.`,
    
    linkedin: `LinkedIn content gets indexed for professional queries. Active presence signals credibility to AI models.\n\nConsistency matters more than virality—regular posts build authority over time.`,
    
    reviews: `Review sites are heavily cited for product recommendations. Ratings directly impact ${brand}'s visibility.\n\nNegative reviews handled well can boost credibility—they show responsiveness.`,
    
    pr: `Editorial mentions carry significant weight in AI citations. Quality backlinks boost visibility across all queries.\n\nFocus on genuine newsworthiness—AI distinguishes earned media from paid placements.`
  }
}