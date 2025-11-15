// lib/crawler/website-crawler.ts

import * as cheerio from 'cheerio'

// ============================================================================
// TYPES
// ============================================================================

export interface CrawlResult {
  readability_score: number
  schema_coverage: number
  issues: Issue[]
  pages_analyzed: number
  schemas_found: SchemaFound[]
}

export interface Issue {
  url: string
  issue_code: string
  severity: 'high' | 'med' | 'low'
  message: string
  schema_found: boolean
}

export interface SchemaFound {
  url: string
  type: string
  complete: boolean
  missing_fields?: string[]
}

interface PageAnalysis {
  url: string
  title: string
  metaDescription: string
  schemas: any[]
  h1Count: number
  h2Count: number
  contentLength: number
  readabilityScore: number
  hasLists: boolean
  paragraphCount: number
  jargonDensity: number
}

// ============================================================================
// MAIN CRAWLER
// ============================================================================

export async function crawlWebsite(
  domain: string,
  plan: 'solo' | 'agency' | 'enterprise' = 'solo'
): Promise<CrawlResult> {
  console.log(`[Crawler] Starting crawl for ${domain} (${plan})`)

  // Get page limit based on plan
  const pageLimit = getPageLimit(plan)
  
  // Discover URLs to crawl
  const urls = await discoverUrls(domain, pageLimit)
  console.log(`[Crawler] Found ${urls.length} URLs to analyze`)

  // Analyze each page
  const analyses: PageAnalysis[] = []
  for (const url of urls) {
    try {
      const analysis = await analyzePage(url)
      analyses.push(analysis)
    } catch (error) {
      console.error(`[Crawler] Error analyzing ${url}:`, error)
    }
  }

  // Generate insights
  const result = generateInsights(analyses, domain)
  console.log(`[Crawler] Complete! Score: ${result.readability_score}%, Coverage: ${result.schema_coverage}%`)
  
  return result
}

// ============================================================================
// URL DISCOVERY
// ============================================================================

function getPageLimit(plan: string): number {
  const limits = {
    solo: 10,
    agency: 50,
    enterprise: 200,
  }
  return limits[plan as keyof typeof limits] || 10
}

async function discoverUrls(domain: string, limit: number): Promise<string[]> {
  const urls: Set<string> = new Set()
  const baseUrl = domain.startsWith('http') ? domain : `https://${domain}`

  // Always include homepage
  urls.add(baseUrl)

  // Try to fetch sitemap.xml
  try {
    const sitemapUrl = `${baseUrl}/sitemap.xml`
    const response = await fetch(sitemapUrl, {
      headers: { 'User-Agent': 'HarborBot/1.0 (GEO Analysis)' },
    })

    if (response.ok) {
      const xml = await response.text()
      const urlMatches = xml.match(/<loc>(.*?)<\/loc>/g) || []
      
      urlMatches.forEach((match) => {
        const url = match.replace(/<\/?loc>/g, '')
        if (urls.size < limit) {
          urls.add(url)
        }
      })

      console.log(`[Crawler] Found ${urlMatches.length} URLs in sitemap`)
    }
  } catch (error) {
    console.log('[Crawler] No sitemap found, will crawl from homepage')
  }

  // If we don't have enough URLs, crawl from homepage
  if (urls.size < 5) {
    try {
      const homepageUrls = await extractLinksFromPage(baseUrl, baseUrl)
      homepageUrls.forEach((url) => {
        if (urls.size < limit) {
          urls.add(url)
        }
      })
    } catch (error) {
      console.error('[Crawler] Error crawling homepage:', error)
    }
  }

  return Array.from(urls).slice(0, limit)
}

async function extractLinksFromPage(url: string, baseUrl: string): Promise<string[]> {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'HarborBot/1.0 (GEO Analysis)' },
  })
  const html = await response.text()
  const $ = cheerio.load(html)
  
  const links: Set<string> = new Set()
  
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href')
    if (!href) return
    
    // Convert relative URLs to absolute
    let absoluteUrl = href
    if (href.startsWith('/')) {
      absoluteUrl = `${baseUrl}${href}`
    } else if (!href.startsWith('http')) {
      return // Skip non-http links
    }
    
    // Only include URLs from the same domain
    if (absoluteUrl.startsWith(baseUrl)) {
      links.add(absoluteUrl)
    }
  })
  
  return Array.from(links)
}

// ============================================================================
// PAGE ANALYSIS
// ============================================================================

async function analyzePage(url: string): Promise<PageAnalysis> {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'HarborBot/1.0 (GEO Analysis)' },
  })
  const html = await response.text()
  const $ = cheerio.load(html)

  // Extract schemas
  const schemas: any[] = []
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const json = JSON.parse($(el).html() || '{}')
      schemas.push(json)
    } catch (error) {
      console.error(`[Crawler] Invalid JSON-LD on ${url}`)
    }
  })

  // Extract text content
  const title = $('title').text() || ''
  const metaDescription = $('meta[name="description"]').attr('content') || ''
  const h1Count = $('h1').length
  const h2Count = $('h2').length
  const paragraphCount = $('p').length
  const hasLists = $('ul, ol').length > 0

  // Get main content (remove scripts, styles, nav, footer)
  $('script, style, nav, footer, header').remove()
  const contentText = $('body').text().trim()
  const contentLength = contentText.length

  // Calculate readability score
  const readabilityScore = calculateReadability(contentText)
  
  // Calculate jargon density
  const jargonDensity = calculateJargonDensity(contentText)

  return {
    url,
    title,
    metaDescription,
    schemas,
    h1Count,
    h2Count,
    contentLength,
    readabilityScore,
    hasLists,
    paragraphCount,
    jargonDensity,
  }
}

// ============================================================================
// READABILITY ANALYSIS (GEO-SPECIFIC)
// ============================================================================

function calculateReadability(text: string): number {
  // Simplified Flesch Reading Ease approximation
  const words = text.split(/\s+/).filter(w => w.length > 0)
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const syllables = words.reduce((sum, word) => sum + countSyllables(word), 0)

  if (words.length === 0 || sentences.length === 0) return 0

  const avgWordsPerSentence = words.length / sentences.length
  const avgSyllablesPerWord = syllables / words.length

  // Flesch formula: 206.835 - 1.015(words/sentences) - 84.6(syllables/words)
  let score = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord

  // Normalize to 0-100 where higher is better for AI
  score = Math.max(0, Math.min(100, score))
  
  return Math.round(score)
}

function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, '')
  if (word.length <= 3) return 1
  
  const vowels = word.match(/[aeiouy]+/g)
  let count = vowels ? vowels.length : 1
  
  // Adjust for silent e
  if (word.endsWith('e')) count--
  
  return Math.max(1, count)
}

function calculateJargonDensity(text: string): number {
  const words = text.split(/\s+/).filter(w => w.length > 0)
  if (words.length === 0) return 0

  // Count "complex" words (>3 syllables)
  const complexWords = words.filter(w => countSyllables(w) > 3).length
  
  return Math.round((complexWords / words.length) * 100)
}

// ============================================================================
// SCHEMA VALIDATION (GEO-CRITICAL)
// ============================================================================

function validateSchema(schema: any, type: string): { complete: boolean; missing: string[] } {
  const requiredFields: Record<string, string[]> = {
    Organization: ['name', 'url'],
    Product: ['name', 'description', 'offers'],
    FAQPage: ['mainEntity'],
    Article: ['headline', 'author', 'datePublished'],
    BreadcrumbList: ['itemListElement'],
  }

  const required = requiredFields[type] || []
  const missing: string[] = []

  required.forEach((field) => {
    if (!schema[field]) {
      missing.push(field)
    }
  })

  return {
    complete: missing.length === 0,
    missing,
  }
}

// ============================================================================
// INSIGHTS GENERATION
// ============================================================================

function generateInsights(analyses: PageAnalysis[], domain: string): CrawlResult {
  const issues: Issue[] = []
  const schemasFound: SchemaFound[] = []
  
  let totalReadability = 0
  let pagesWithSchema = 0
  let totalSchemas = 0

  // Analyze each page
  analyses.forEach((page) => {
    totalReadability += page.readabilityScore

    // Check for schemas
    if (page.schemas.length === 0) {
      // Check what type of page it is and suggest appropriate schema
      const pageType = detectPageType(page.url)
      
      if (pageType === 'homepage') {
        issues.push({
          url: page.url,
          issue_code: 'missing_org_schema',
          severity: 'high',
          message: 'Missing Organization schema on homepage - AI models need this to understand your brand',
          schema_found: false,
        })
      } else if (pageType === 'product') {
        issues.push({
          url: page.url,
          issue_code: 'missing_product_schema',
          severity: 'high',
          message: 'Missing Product schema - AI cannot extract product details',
          schema_found: false,
        })
      } else if (pageType === 'faq') {
        issues.push({
          url: page.url,
          issue_code: 'missing_faq_schema',
          severity: 'med',
          message: 'Missing FAQ schema - questions not indexed for AI responses',
          schema_found: false,
        })
      } else {
        issues.push({
          url: page.url,
          issue_code: 'no_schema',
          severity: 'med',
          message: 'No structured data found - add relevant schema markup',
          schema_found: false,
        })
      }
    } else {
      pagesWithSchema++
      
      // Validate each schema
      page.schemas.forEach((schema) => {
        totalSchemas++
        const type = schema['@type'] || 'Unknown'
        const validation = validateSchema(schema, type)
        
        schemasFound.push({
          url: page.url,
          type,
          complete: validation.complete,
          missing_fields: validation.missing,
        })

        if (!validation.complete) {
          issues.push({
            url: page.url,
            issue_code: 'incomplete_schema',
            severity: 'med',
            message: `${type} schema missing fields: ${validation.missing.join(', ')}`,
            schema_found: true,
          })
        }
      })
    }

    // Content quality checks
    if (page.readabilityScore < 50) {
      issues.push({
        url: page.url,
        issue_code: 'low_readability',
        severity: 'low',
        message: `Content is complex (score: ${page.readabilityScore}/100) - simplify for AI parsing`,
        schema_found: page.schemas.length > 0,
      })
    }

    if (page.h1Count === 0) {
      issues.push({
        url: page.url,
        issue_code: 'missing_h1',
        severity: 'med',
        message: 'No H1 heading - AI needs clear page topic',
        schema_found: page.schemas.length > 0,
      })
    }

    if (page.h1Count > 1) {
      issues.push({
        url: page.url,
        issue_code: 'multiple_h1',
        severity: 'low',
        message: `Multiple H1 tags (${page.h1Count}) - confuses AI about primary topic`,
        schema_found: page.schemas.length > 0,
      })
    }

    if (!page.metaDescription) {
      issues.push({
        url: page.url,
        issue_code: 'missing_meta_description',
        severity: 'low',
        message: 'Missing meta description - AI uses this for context',
        schema_found: page.schemas.length > 0,
      })
    }

    if (page.jargonDensity > 30) {
      issues.push({
        url: page.url,
        issue_code: 'high_jargon',
        severity: 'low',
        message: `High jargon density (${page.jargonDensity}%) - may confuse AI models`,
        schema_found: page.schemas.length > 0,
      })
    }
  })

  // Calculate overall scores
  const readability_score = analyses.length > 0 
    ? Math.round(totalReadability / analyses.length)
    : 0

  const schema_coverage = analyses.length > 0
    ? Math.round((pagesWithSchema / analyses.length) * 100)
    : 0

  return {
    readability_score,
    schema_coverage,
    issues,
    pages_analyzed: analyses.length,
    schemas_found: schemasFound,
  }
}

// ============================================================================
// HELPERS
// ============================================================================

function detectPageType(url: string): 'homepage' | 'product' | 'faq' | 'blog' | 'other' {
  const path = url.toLowerCase()
  
  if (path.endsWith('/') || path.split('/').length <= 3) {
    return 'homepage'
  }
  if (path.includes('/product') || path.includes('/shop') || path.includes('/item')) {
    return 'product'
  }
  if (path.includes('/faq') || path.includes('/help') || path.includes('/support')) {
    return 'faq'
  }
  if (path.includes('/blog') || path.includes('/article') || path.includes('/post')) {
    return 'blog'
  }
  
  return 'other'
}
