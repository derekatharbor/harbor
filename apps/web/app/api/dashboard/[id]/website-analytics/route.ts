// app/api/dashboard/[id]/website-analytics/route.ts
// Website crawl and analysis for Website Analytics page

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { crawlWebsite, CrawlResult } from '@/lib/crawler/website-crawler'

export const dynamic = 'force-dynamic'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Cache crawl results for 24 hours
const CACHE_TTL_HOURS = 24

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: dashboardId } = await params
    const { searchParams } = new URL(request.url)
    const forceRefresh = searchParams.get('refresh') === 'true'
    
    const supabase = getSupabase()

    // Get dashboard info
    const { data: dashboard, error: dashError } = await supabase
      .from('dashboards')
      .select('domain, plan')
      .eq('id', dashboardId)
      .single()

    if (dashError || !dashboard) {
      return NextResponse.json({ error: 'Dashboard not found' }, { status: 404 })
    }

    // Check for cached results
    if (!forceRefresh) {
      const { data: cached } = await supabase
        .from('website_crawls')
        .select('*')
        .eq('dashboard_id', dashboardId)
        .order('crawled_at', { ascending: false })
        .limit(1)
        .single()

      if (cached) {
        const crawledAt = new Date(cached.crawled_at)
        const now = new Date()
        const hoursSinceCrawl = (now.getTime() - crawledAt.getTime()) / (1000 * 60 * 60)

        if (hoursSinceCrawl < CACHE_TTL_HOURS) {
          return NextResponse.json({
            ...cached.results,
            cached: true,
            crawled_at: cached.crawled_at,
            next_refresh_available: new Date(crawledAt.getTime() + CACHE_TTL_HOURS * 60 * 60 * 1000)
          })
        }
      }
    }

    // Run the crawler
    console.log(`[Website Analytics] Crawling ${dashboard.domain}...`)
    const plan = (dashboard.plan as 'solo' | 'agency' | 'enterprise') || 'solo'
    
    let crawlResult: CrawlResult
    try {
      crawlResult = await crawlWebsite(dashboard.domain, plan)
    } catch (crawlError) {
      console.error('[Website Analytics] Crawl failed:', crawlError)
      return NextResponse.json({
        error: 'Failed to crawl website',
        message: crawlError instanceof Error ? crawlError.message : 'Unknown error'
      }, { status: 500 })
    }

    // Store results
    const { error: insertError } = await supabase
      .from('website_crawls')
      .insert({
        dashboard_id: dashboardId,
        domain: dashboard.domain,
        results: crawlResult,
        crawled_at: new Date().toISOString()
      })

    if (insertError) {
      console.error('[Website Analytics] Failed to cache results:', insertError)
      // Continue anyway - just won't be cached
    }

    // Format response
    const response = formatCrawlResponse(crawlResult)

    return NextResponse.json({
      ...response,
      cached: false,
      crawled_at: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error in website analytics API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST to trigger a fresh crawl
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Same as GET but always forces refresh
  const url = new URL(request.url)
  url.searchParams.set('refresh', 'true')
  
  const newRequest = new NextRequest(url, {
    method: 'GET',
    headers: request.headers
  })
  
  return GET(newRequest, { params })
}

function formatCrawlResponse(crawl: CrawlResult) {
  // Group issues by severity
  const issuesBySeverity = {
    high: crawl.issues.filter(i => i.severity === 'high').length,
    medium: crawl.issues.filter(i => i.severity === 'med').length,
    low: crawl.issues.filter(i => i.severity === 'low').length
  }

  // Group schemas by type
  const schemasByType: Record<string, { found: number; complete: number }> = {}
  crawl.schemas_found.forEach(schema => {
    if (!schemasByType[schema.type]) {
      schemasByType[schema.type] = { found: 0, complete: 0 }
    }
    schemasByType[schema.type].found++
    if (schema.complete) {
      schemasByType[schema.type].complete++
    }
  })

  // Format pages for the table
  const pages = crawl.schemas_found.reduce((acc: any[], schema) => {
    const existing = acc.find(p => p.url === schema.url)
    if (existing) {
      existing.schemas.push({
        type: schema.type,
        complete: schema.complete,
        missing_fields: schema.missing_fields
      })
    } else {
      acc.push({
        url: schema.url,
        schemas: [{
          type: schema.type,
          complete: schema.complete,
          missing_fields: schema.missing_fields
        }],
        issues: crawl.issues.filter(i => i.url === schema.url)
      })
    }
    return acc
  }, [])

  // Add pages with issues but no schemas
  crawl.issues.forEach(issue => {
    if (!pages.find(p => p.url === issue.url)) {
      pages.push({
        url: issue.url,
        schemas: [],
        issues: crawl.issues.filter(i => i.url === issue.url)
      })
    }
  })

  // Calculate page-level readability (approximation)
  pages.forEach(page => {
    const hasSchemaIssue = page.issues.some((i: any) => 
      i.issue_code.includes('schema') || i.issue_code === 'no_schema'
    )
    const hasContentIssue = page.issues.some((i: any) => 
      i.issue_code.includes('readability') || i.issue_code.includes('jargon')
    )
    const hasStructureIssue = page.issues.some((i: any) => 
      i.issue_code.includes('h1') || i.issue_code.includes('meta')
    )

    // Base score minus penalties
    let score = 100
    if (hasSchemaIssue) score -= 25
    if (hasContentIssue) score -= 15
    if (hasStructureIssue) score -= 10
    page.issues.forEach((i: any) => {
      if (i.severity === 'high') score -= 10
      else if (i.severity === 'med') score -= 5
      else score -= 2
    })

    page.readability_score = Math.max(0, Math.min(100, score))
    page.status = score >= 80 ? 'good' : score >= 50 ? 'warning' : 'error'
  })

  // Generate recommendations from issues
  const recommendations = generateRecommendations(crawl.issues)

  return {
    readability_score: crawl.readability_score,
    schema_coverage: crawl.schema_coverage,
    pages_scanned: crawl.pages_analyzed,
    issues_count: issuesBySeverity,
    schema_types: schemasByType,
    pages: pages.slice(0, 50), // Limit for performance
    recommendations,
    has_data: crawl.pages_analyzed > 0
  }
}

function generateRecommendations(issues: CrawlResult['issues']) {
  const recommendations: any[] = []
  const issueCounts: Record<string, number> = {}

  // Count issue types
  issues.forEach(issue => {
    issueCounts[issue.issue_code] = (issueCounts[issue.issue_code] || 0) + 1
  })

  // Generate recommendations based on most common issues
  if (issueCounts['missing_org_schema']) {
    recommendations.push({
      id: 'add-org-schema',
      title: 'Add Organization Schema',
      description: 'Your homepage is missing Organization schema. This helps AI models understand your brand identity.',
      impact: 'high',
      pages_affected: issueCounts['missing_org_schema']
    })
  }

  if (issueCounts['missing_product_schema']) {
    recommendations.push({
      id: 'add-product-schema',
      title: 'Add Product Schema',
      description: 'Product pages are missing schema markup. AI cannot extract product details without this.',
      impact: 'high',
      pages_affected: issueCounts['missing_product_schema']
    })
  }

  if (issueCounts['missing_faq_schema'] || issueCounts['no_schema']) {
    const count = (issueCounts['missing_faq_schema'] || 0) + (issueCounts['no_schema'] || 0)
    recommendations.push({
      id: 'add-faq-schema',
      title: 'Add FAQ Schema',
      description: 'FAQ and help pages should have FAQPage schema so AI can index your answers.',
      impact: 'medium',
      pages_affected: count
    })
  }

  if (issueCounts['missing_meta_description']) {
    recommendations.push({
      id: 'fix-meta-descriptions',
      title: 'Fix Missing Meta Descriptions',
      description: 'Some pages lack meta descriptions. AI uses these for context about page content.',
      impact: 'low',
      pages_affected: issueCounts['missing_meta_description']
    })
  }

  if (issueCounts['low_readability'] || issueCounts['high_jargon']) {
    const count = (issueCounts['low_readability'] || 0) + (issueCounts['high_jargon'] || 0)
    recommendations.push({
      id: 'improve-readability',
      title: 'Improve Content Readability',
      description: 'Some pages have complex language. Simpler content is easier for AI to parse and cite.',
      impact: 'low',
      pages_affected: count
    })
  }

  return recommendations.slice(0, 5) // Top 5 recommendations
}
