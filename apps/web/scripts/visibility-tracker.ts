#!/usr/bin/env tsx

/**
 * Harbor Visibility Tracker
 * 
 * Tests whether AI models recommend brands for queries they SHOULD rank for.
 * Based on the brand's own feed_data (use_cases, integrations, competitors).
 * 
 * This is the real value: not "is AI accurate" but "is AI recommending you"
 * 
 * Usage:
 *   npx tsx scripts/visibility-tracker.ts --limit=50
 *   npx tsx scripts/visibility-tracker.ts --brand="simplifyem"
 */

import { config } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import * as fs from 'fs'

// Setup paths
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
config({ path: resolve(__dirname, '../../../.env') })

// ============================================================================
// TYPES
// ============================================================================

interface Brand {
  id: string
  brand_name: string
  slug: string
  domain: string
  feed_data: any
  visibility_score: number
}

interface VisibilityQuery {
  type: 'use_case' | 'integration' | 'competitor' | 'category' | 'recommendation'
  query: string
  expected_mention: string // The brand name we expect to see
  context: string // What triggered this query (e.g., "use_case: rent collection")
}

interface VisibilityResult {
  brand_name: string
  domain: string
  query_type: string
  query: string
  context: string
  chatgpt_response: string | null
  claude_response: string | null
  chatgpt_mentions_brand: boolean
  claude_mentions_brand: boolean
  chatgpt_position: number | null // 1st, 2nd, 3rd mentioned, or null
  claude_position: number | null
  chatgpt_competitors_mentioned: string[]
  claude_competitors_mentioned: string[]
}

// ============================================================================
// AI CLIENTS
// ============================================================================

const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ============================================================================
// API CALLERS
// ============================================================================

async function askChatGPT(question: string): Promise<string | null> {
  if (!openai) return null
  
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: question }],
      max_tokens: 500,
      temperature: 0
    })
    return response.choices[0]?.message?.content?.trim() || null
  } catch (error: any) {
    console.log(`  ❌ ChatGPT error: ${error.message}`)
    return null
  }
}

async function askClaude(question: string): Promise<string | null> {
  if (!anthropic) return null
  
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [{ role: 'user', content: question }]
    })
    const textBlock = response.content.find((block: any) => block.type === 'text')
    return textBlock?.type === 'text' ? textBlock.text.trim() : null
  } catch (error: any) {
    console.log(`  ❌ Claude error: ${error.message}`)
    return null
  }
}

// ============================================================================
// QUERY GENERATORS
// ============================================================================

function generateVisibilityQueries(brand: Brand): VisibilityQuery[] {
  const queries: VisibilityQuery[] = []
  const fd = brand.feed_data || {}
  const brandName = brand.brand_name
  
  // 1. Use case queries - "What's the best tool for [use_case]?"
  if (fd.use_cases && Array.isArray(fd.use_cases)) {
    fd.use_cases.slice(0, 3).forEach((useCase: string) => {
      queries.push({
        type: 'use_case',
        query: `What are the best software tools for ${useCase}? List your top 3-5 recommendations.`,
        expected_mention: brandName,
        context: `use_case: ${useCase}`
      })
    })
  }
  
  // 2. Integration queries - "What tools integrate with [integration]?"
  if (fd.integrations && Array.isArray(fd.integrations)) {
    fd.integrations.slice(0, 2).forEach((integration: string) => {
      queries.push({
        type: 'integration',
        query: `What are the best tools that integrate with ${integration}? List a few options.`,
        expected_mention: brandName,
        context: `integration: ${integration}`
      })
    })
  }
  
  // 3. Competitor comparison queries - "[Brand] vs [Competitor]"
  if (fd.competitor_context?.competitors && Array.isArray(fd.competitor_context.competitors)) {
    fd.competitor_context.competitors.slice(0, 2).forEach((competitor: string) => {
      queries.push({
        type: 'competitor',
        query: `I'm deciding between ${brandName} and ${competitor}. Which one would you recommend and why?`,
        expected_mention: brandName,
        context: `competitor: ${competitor}`
      })
    })
  }
  
  // 4. Category query - based on industry/description
  if (fd.short_description || fd.one_line_summary) {
    const desc = fd.short_description || fd.one_line_summary
    // Extract likely category from description
    queries.push({
      type: 'category',
      query: `What are the top companies in the ${extractCategory(desc, brand.domain)} space? List the main players.`,
      expected_mention: brandName,
      context: `category from description`
    })
  }
  
  // 5. Direct recommendation query
  queries.push({
    type: 'recommendation',
    query: `Would you recommend ${brandName}? What do they do and who should use them?`,
    expected_mention: brandName,
    context: `direct recommendation`
  })
  
  return queries
}

function extractCategory(description: string, domain: string): string {
  // Simple extraction - look for common patterns
  const desc = description.toLowerCase()
  
  if (desc.includes('property management')) return 'property management software'
  if (desc.includes('telematics')) return 'telematics and fleet management'
  if (desc.includes('crm') || desc.includes('salesforce')) return 'CRM and sales software'
  if (desc.includes('cannabis')) return 'cannabis software'
  if (desc.includes('restaurant') || desc.includes('food')) return 'restaurant technology'
  if (desc.includes('marketing')) return 'marketing software'
  if (desc.includes('hr') || desc.includes('human resources')) return 'HR software'
  if (desc.includes('accounting') || desc.includes('finance')) return 'accounting software'
  
  // Fallback: use domain-based guess
  return 'B2B software'
}

// ============================================================================
// RESPONSE ANALYSIS
// ============================================================================

function analyzeResponse(
  response: string | null, 
  brandName: string,
  knownCompetitors: string[]
): { mentions: boolean; position: number | null; competitorsMentioned: string[] } {
  if (!response) {
    return { mentions: false, position: null, competitorsMentioned: [] }
  }
  
  const responseLower = response.toLowerCase()
  const brandLower = brandName.toLowerCase()
  
  // Check if brand is mentioned
  const mentions = responseLower.includes(brandLower) || 
                   responseLower.includes(brandLower.replace(/\s+/g, '')) ||
                   responseLower.includes(brandLower.replace(/\s+/g, '-'))
  
  // Find position (1st, 2nd, 3rd, etc.)
  let position: number | null = null
  if (mentions) {
    // Split by common list patterns and find where brand appears
    const lines = response.split(/[\n\r]+|(?:\d+\.\s)|(?:•\s)|(?:-\s)/)
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().includes(brandLower)) {
        position = i + 1
        break
      }
    }
    // If we couldn't find position in list, but it's mentioned, assume position 1
    if (position === null || position > 10) position = 1
  }
  
  // Check which competitors are mentioned
  const competitorsMentioned = knownCompetitors.filter(comp => 
    responseLower.includes(comp.toLowerCase())
  )
  
  return { mentions, position, competitorsMentioned }
}

// ============================================================================
// MAIN TRACKER
// ============================================================================

async function trackVisibility(options: { limit?: number; brandSlug?: string } = {}) {
  const { limit = 50, brandSlug } = options
  
  console.log('\n🔍 Harbor Visibility Tracker')
  console.log('================================')
  console.log('Testing: Do AI models recommend your brand for relevant queries?\n')
  
  // Check API keys
  console.log('API Status:')
  console.log(`  OpenAI:    ${openai ? '✓ Ready' : '✗ Missing'}`)
  console.log(`  Anthropic: ${anthropic ? '✓ Ready' : '✗ Missing'}`)
  console.log('')
  
  if (!openai && !anthropic) {
    console.error('❌ No API keys configured.')
    process.exit(1)
  }
  
  // Fetch brands with useful feed_data
  let query = supabase
    .from('ai_profiles')
    .select('id, brand_name, slug, domain, feed_data, visibility_score')
    .not('feed_data', 'is', null)
    .order('visibility_score', { ascending: false })
  
  if (brandSlug) {
    query = query.eq('slug', brandSlug)
  } else {
    query = query.limit(limit * 2) // Fetch extra since some won't have queryable data
  }
  
  const { data: allBrands, error } = await query
  
  if (error || !allBrands) {
    console.error('Failed to fetch brands:', error)
    process.exit(1)
  }
  
  // Filter to brands that have queryable data
  const brands = allBrands.filter(b => {
    const fd = b.feed_data || {}
    return (fd.use_cases?.length > 0) || 
           (fd.integrations?.length > 0) || 
           (fd.competitor_context?.competitors?.length > 0) ||
           fd.short_description ||
           fd.one_line_summary
  }).slice(0, limit)
  
  console.log(`📊 Testing ${brands.length} brands with queryable data\n`)
  
  const results: VisibilityResult[] = []
  const stats = {
    total_queries: 0,
    chatgpt_mentions: 0,
    claude_mentions: 0,
    visibility_gaps: 0
  }
  
  for (const brand of brands) {
    console.log(`\n🏢 ${brand.brand_name} (${brand.domain})`)
    console.log('─'.repeat(50))
    
    const feedData = typeof brand.feed_data === 'string' 
      ? JSON.parse(brand.feed_data) 
      : brand.feed_data
    
    const queries = generateVisibilityQueries({ ...brand, feed_data: feedData })
    const knownCompetitors = feedData.competitor_context?.competitors || []
    
    if (queries.length === 0) {
      console.log('  ⏭️  No queryable data, skipping')
      continue
    }
    
    for (const q of queries) {
      console.log(`  🔎 ${q.type}: "${q.query.substring(0, 50)}..."`)
      
      // Query both models
      const [chatgptResponse, claudeResponse] = await Promise.all([
        askChatGPT(q.query),
        askClaude(q.query)
      ])
      
      // Analyze responses
      const chatgptAnalysis = analyzeResponse(chatgptResponse, brand.brand_name, knownCompetitors)
      const claudeAnalysis = analyzeResponse(claudeResponse, brand.brand_name, knownCompetitors)
      
      // Log results
      const gptIcon = chatgptAnalysis.mentions ? '✓' : '✗'
      const claudeIcon = claudeAnalysis.mentions ? '✓' : '✗'
      
      console.log(`     ChatGPT ${gptIcon}: ${chatgptAnalysis.mentions ? `Mentioned (#${chatgptAnalysis.position})` : 'NOT mentioned'}`)
      console.log(`     Claude ${claudeIcon}:  ${claudeAnalysis.mentions ? `Mentioned (#${claudeAnalysis.position})` : 'NOT mentioned'}`)
      
      if (chatgptAnalysis.competitorsMentioned.length > 0) {
        console.log(`     ChatGPT mentioned competitors: ${chatgptAnalysis.competitorsMentioned.join(', ')}`)
      }
      
      // Track stats
      stats.total_queries++
      if (chatgptAnalysis.mentions) stats.chatgpt_mentions++
      if (claudeAnalysis.mentions) stats.claude_mentions++
      if (!chatgptAnalysis.mentions && !claudeAnalysis.mentions) stats.visibility_gaps++
      
      // Store result
      results.push({
        brand_name: brand.brand_name,
        domain: brand.domain,
        query_type: q.type,
        query: q.query,
        context: q.context,
        chatgpt_response: chatgptResponse,
        claude_response: claudeResponse,
        chatgpt_mentions_brand: chatgptAnalysis.mentions,
        claude_mentions_brand: claudeAnalysis.mentions,
        chatgpt_position: chatgptAnalysis.position,
        claude_position: claudeAnalysis.position,
        chatgpt_competitors_mentioned: chatgptAnalysis.competitorsMentioned,
        claude_competitors_mentioned: claudeAnalysis.competitorsMentioned
      })
      
      // Rate limiting
      await new Promise(r => setTimeout(r, 300))
    }
  }
  
  // Print summary
  console.log('\n\n📈 VISIBILITY SUMMARY')
  console.log('═'.repeat(50))
  console.log(`Total queries tested: ${stats.total_queries}`)
  console.log(``)
  console.log(`ChatGPT mentioned brand: ${stats.chatgpt_mentions}/${stats.total_queries} (${((stats.chatgpt_mentions/stats.total_queries)*100).toFixed(1)}%)`)
  console.log(`Claude mentioned brand:  ${stats.claude_mentions}/${stats.total_queries} (${((stats.claude_mentions/stats.total_queries)*100).toFixed(1)}%)`)
  console.log(``)
  console.log(`🚨 VISIBILITY GAPS (neither model mentioned brand): ${stats.visibility_gaps}`)
  
  // Save full report
  const timestamp = new Date().toISOString().split('T')[0]
  const outputPath = resolve(__dirname, `../../../visibility-report-${timestamp}.json`)
  
  const report = {
    generated_at: new Date().toISOString(),
    stats,
    results
  }
  
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2))
  console.log(`\n💾 Full report saved to: ${outputPath}`)
  
  // Show worst visibility gaps
  const gaps = results.filter(r => !r.chatgpt_mentions_brand && !r.claude_mentions_brand)
  
  if (gaps.length > 0) {
    console.log('\n\n🚨 TOP VISIBILITY GAPS (Brand not mentioned by ANY model):')
    console.log('─'.repeat(60))
    
    gaps.slice(0, 15).forEach((gap, i) => {
      console.log(`\n${i + 1}. ${gap.brand_name}`)
      console.log(`   Query: "${gap.query}"`)
      console.log(`   Context: ${gap.context}`)
      console.log(`   ChatGPT recommended: ${gap.chatgpt_competitors_mentioned.length > 0 ? gap.chatgpt_competitors_mentioned.join(', ') : '(others)'}`)
    })
  }
  
  // Show brands with lowest visibility
  const brandVisibility: Record<string, { total: number; mentioned: number }> = {}
  results.forEach(r => {
    if (!brandVisibility[r.brand_name]) {
      brandVisibility[r.brand_name] = { total: 0, mentioned: 0 }
    }
    brandVisibility[r.brand_name].total++
    if (r.chatgpt_mentions_brand || r.claude_mentions_brand) {
      brandVisibility[r.brand_name].mentioned++
    }
  })
  
  const sortedBrands = Object.entries(brandVisibility)
    .map(([name, data]) => ({ name, ...data, rate: data.mentioned / data.total }))
    .sort((a, b) => a.rate - b.rate)
  
  console.log('\n\n📉 BRANDS WITH LOWEST AI VISIBILITY:')
  console.log('─'.repeat(50))
  sortedBrands.slice(0, 10).forEach((b, i) => {
    console.log(`${i + 1}. ${b.name}: ${(b.rate * 100).toFixed(0)}% visibility (${b.mentioned}/${b.total} queries)`)
  })
  
  console.log('\n✅ Done!\n')
}

// ============================================================================
// CLI
// ============================================================================

const args = process.argv.slice(2)
const limitArg = args.find(a => a.startsWith('--limit'))
const brandArg = args.find(a => a.startsWith('--brand'))

const limit = limitArg ? parseInt(limitArg.split('=')[1] || '50') : 50
const brandSlug = brandArg ? brandArg.split('=')[1] : undefined

trackVisibility({ limit, brandSlug })
