#!/usr/bin/env tsx

/**
 * Harbor Long-Tail Accuracy Test
 * 
 * Proves that AI models GUESS on specific, long-tail queries.
 * Uses our enriched feed_data (pricing, integrations, use_cases) as ground truth.
 * 
 * The goal: Show that AI recommends wrong brands or gets details wrong
 * when answering specific purchase-intent queries.
 * 
 * Usage:
 *   npx tsx scripts/longtail-test.ts --limit=20
 */

import { config } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import * as fs from 'fs'

// Setup
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
config({ path: resolve(__dirname, '../../../.env') })

// Clients
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
// TYPES
// ============================================================================

interface EnrichedBrand {
  id: string
  brand_name: string
  domain: string
  feed_data: {
    pricing?: {
      has_free_tier: boolean
      starting_price: string | null
      price_model: string
    }
    integrations?: string[]
    use_cases?: string[]
    short_description?: string
  }
}

interface TestQuery {
  type: 'price_filter' | 'integration_filter' | 'use_case_match' | 'combined'
  query: string
  expected_brands: string[]  // Brands that SHOULD match
  filter_criteria: string    // Human-readable criteria
}

interface TestResult {
  query: string
  query_type: string
  filter_criteria: string
  expected_brands: string[]
  chatgpt_response: string | null
  claude_response: string | null
  chatgpt_mentioned_expected: string[]
  claude_mentioned_expected: string[]
  chatgpt_mentioned_others: string[]
  claude_mentioned_others: string[]
  chatgpt_accuracy: 'correct' | 'partial' | 'wrong' | 'unknown'
  claude_accuracy: 'correct' | 'partial' | 'wrong' | 'unknown'
}

// ============================================================================
// API CALLERS
// ============================================================================

async function askChatGPT(question: string): Promise<string | null> {
  if (!openai) return null
  
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: question }],
      max_tokens: 600,
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
      max_tokens: 600,
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

function parsePrice(priceStr: string | null): number | null {
  if (!priceStr) return null
  // Extract numeric value from strings like "$23/mo", "$1,995/yr", "$4.16/mo"
  const match = priceStr.match(/\$?([\d,]+\.?\d*)/);
  if (!match) return null
  const num = parseFloat(match[1].replace(',', ''))
  // Normalize to monthly (rough estimate for yearly)
  if (priceStr.includes('/yr') || priceStr.includes('/year')) {
    return num / 12
  }
  return num
}

function generateTestQueries(brands: EnrichedBrand[]): TestQuery[] {
  const queries: TestQuery[] = []
  
  // Group brands by integration
  const brandsByIntegration: Record<string, EnrichedBrand[]> = {}
  brands.forEach(b => {
    (b.feed_data.integrations || []).forEach(integration => {
      if (!brandsByIntegration[integration]) brandsByIntegration[integration] = []
      brandsByIntegration[integration].push(b)
    })
  })
  
  // Group brands by use case keywords
  const brandsByUseCase: Record<string, EnrichedBrand[]> = {}
  brands.forEach(b => {
    (b.feed_data.use_cases || []).forEach(useCase => {
      // Extract key category words
      const keywords = ['accounting', 'property management', 'time tracking', 'podcast', 
                       'salon', 'construction', 'ecommerce', 'marketing', 'design', 'HR']
      keywords.forEach(kw => {
        if (useCase.toLowerCase().includes(kw)) {
          if (!brandsByUseCase[kw]) brandsByUseCase[kw] = []
          if (!brandsByUseCase[kw].includes(b)) brandsByUseCase[kw].push(b)
        }
      })
    })
  })
  
  // 1. PRICE FILTER QUERIES
  // Find brands under $50/mo with free tier
  const cheapBrands = brands.filter(b => {
    const price = parsePrice(b.feed_data.pricing?.starting_price || null)
    return b.feed_data.pricing?.has_free_tier || (price !== null && price < 50)
  })
  
  if (cheapBrands.length > 0) {
    queries.push({
      type: 'price_filter',
      query: 'What are some affordable business software tools under $50 per month? List specific products with their pricing.',
      expected_brands: cheapBrands.slice(0, 5).map(b => b.brand_name),
      filter_criteria: 'Under $50/mo or has free tier'
    })
  }
  
  // 2. INTEGRATION FILTER QUERIES
  // QuickBooks integration (common)
  const quickbooksBrands = brandsByIntegration['QuickBooks'] || brandsByIntegration['QuickBooks Online'] || []
  if (quickbooksBrands.length > 0) {
    queries.push({
      type: 'integration_filter',
      query: 'What business tools integrate with QuickBooks? I need software that syncs with my QuickBooks accounting.',
      expected_brands: quickbooksBrands.map(b => b.brand_name),
      filter_criteria: 'Integrates with QuickBooks'
    })
  }
  
  // Salesforce integration
  const salesforceBrands = brandsByIntegration['Salesforce'] || []
  if (salesforceBrands.length > 0) {
    queries.push({
      type: 'integration_filter', 
      query: 'What tools integrate with Salesforce CRM? Looking for add-ons that work with our Salesforce setup.',
      expected_brands: salesforceBrands.map(b => b.brand_name),
      filter_criteria: 'Integrates with Salesforce'
    })
  }
  
  // Shopify integration
  const shopifyBrands = brandsByIntegration['Shopify'] || []
  if (shopifyBrands.length > 0) {
    queries.push({
      type: 'integration_filter',
      query: 'What marketing and notification tools work with Shopify? I have a Shopify store.',
      expected_brands: shopifyBrands.map(b => b.brand_name),
      filter_criteria: 'Integrates with Shopify'
    })
  }
  
  // Zapier integration  
  const zapierBrands = brandsByIntegration['Zapier'] || []
  if (zapierBrands.length > 0) {
    queries.push({
      type: 'integration_filter',
      query: 'What business tools connect with Zapier for automation? Need something I can integrate via Zapier.',
      expected_brands: zapierBrands.map(b => b.brand_name),
      filter_criteria: 'Integrates with Zapier'
    })
  }
  
  // 3. USE CASE QUERIES
  Object.entries(brandsByUseCase).forEach(([useCase, ucBrands]) => {
    if (ucBrands.length > 0) {
      queries.push({
        type: 'use_case_match',
        query: `What's the best software for ${useCase}? I'm looking for a solution specifically for ${useCase}.`,
        expected_brands: ucBrands.map(b => b.brand_name),
        filter_criteria: `Use case: ${useCase}`
      })
    }
  })
  
  // 4. COMBINED QUERIES (the real long-tail)
  // Time tracking + QuickBooks + under $50
  const timeTrackingCheapQB = brands.filter(b => {
    const hasTimeTracking = (b.feed_data.use_cases || []).some(uc => 
      uc.toLowerCase().includes('time tracking') || uc.toLowerCase().includes('time management')
    )
    const hasQuickBooks = (b.feed_data.integrations || []).some(i => 
      i.toLowerCase().includes('quickbooks')
    )
    const price = parsePrice(b.feed_data.pricing?.starting_price || null)
    const isAffordable = b.feed_data.pricing?.has_free_tier || (price !== null && price < 50)
    return hasTimeTracking && hasQuickBooks && isAffordable
  })
  
  if (timeTrackingCheapQB.length > 0) {
    queries.push({
      type: 'combined',
      query: 'I need time tracking software that integrates with QuickBooks and costs under $50/month. What are my options?',
      expected_brands: timeTrackingCheapQB.map(b => b.brand_name),
      filter_criteria: 'Time tracking + QuickBooks integration + under $50/mo'
    })
  }
  
  // Property management with free tier
  const propertyMgmtFree = brands.filter(b => {
    const hasPropertyMgmt = (b.feed_data.use_cases || []).some(uc => 
      uc.toLowerCase().includes('property') || uc.toLowerCase().includes('landlord') || uc.toLowerCase().includes('tenant')
    )
    return hasPropertyMgmt && b.feed_data.pricing?.has_free_tier
  })
  
  if (propertyMgmtFree.length > 0) {
    queries.push({
      type: 'combined',
      query: 'Is there free property management software? I\'m a small landlord and need something with no upfront cost.',
      expected_brands: propertyMgmtFree.map(b => b.brand_name),
      filter_criteria: 'Property management + has free tier'
    })
  }
  
  // Podcast hosting cheap
  const podcastCheap = brands.filter(b => {
    const hasPodcast = (b.feed_data.use_cases || []).some(uc => 
      uc.toLowerCase().includes('podcast')
    )
    const price = parsePrice(b.feed_data.pricing?.starting_price || null)
    return hasPodcast && price !== null && price < 20
  })
  
  if (podcastCheap.length > 0) {
    queries.push({
      type: 'combined',
      query: 'What\'s the cheapest podcast hosting? I\'m just starting out and need something under $20/month.',
      expected_brands: podcastCheap.map(b => b.brand_name),
      filter_criteria: 'Podcast hosting + under $20/mo'
    })
  }
  
  // eCommerce + Shopify
  const ecommShopify = brands.filter(b => {
    const hasEcomm = (b.feed_data.use_cases || []).some(uc => 
      uc.toLowerCase().includes('ecommerce') || uc.toLowerCase().includes('e-commerce') || uc.toLowerCase().includes('cart')
    )
    const hasShopify = (b.feed_data.integrations || []).some(i => 
      i.toLowerCase().includes('shopify')
    )
    return hasEcomm && hasShopify
  })
  
  if (ecommShopify.length > 0) {
    queries.push({
      type: 'combined',
      query: 'What eCommerce marketing tools work with Shopify? Need something for cart abandonment and promotions.',
      expected_brands: ecommShopify.map(b => b.brand_name),
      filter_criteria: 'eCommerce use case + Shopify integration'
    })
  }
  
  return queries
}

// ============================================================================
// RESPONSE ANALYSIS
// ============================================================================

function analyzeResponse(
  response: string | null,
  expectedBrands: string[],
  allBrandNames: string[]
): { mentionedExpected: string[]; mentionedOthers: string[] } {
  if (!response) return { mentionedExpected: [], mentionedOthers: [] }
  
  const responseLower = response.toLowerCase()
  
  const mentionedExpected = expectedBrands.filter(brand => 
    responseLower.includes(brand.toLowerCase())
  )
  
  // Check for other brands from our dataset that were mentioned but shouldn't be
  const mentionedOthers = allBrandNames.filter(brand => 
    !expectedBrands.map(b => b.toLowerCase()).includes(brand.toLowerCase()) &&
    responseLower.includes(brand.toLowerCase())
  )
  
  return { mentionedExpected, mentionedOthers }
}

function determineAccuracy(
  mentionedExpected: string[],
  expectedBrands: string[],
  response: string | null
): 'correct' | 'partial' | 'wrong' | 'unknown' {
  if (!response) return 'unknown'
  if (expectedBrands.length === 0) return 'unknown'
  
  const hitRate = mentionedExpected.length / expectedBrands.length
  
  if (hitRate >= 0.5) return 'correct'  // Got at least half
  if (hitRate > 0) return 'partial'      // Got at least one
  return 'wrong'                          // Got none
}

// ============================================================================
// MAIN TEST
// ============================================================================

async function runLongTailTest(options: { limit: number }) {
  const { limit } = options
  
  console.log('\n🎯 Harbor Long-Tail Accuracy Test')
  console.log('==================================')
  console.log('Testing: Does AI get specific, filtered queries right?\n')
  
  // Check API keys
  console.log('API Status:')
  console.log(`  OpenAI:    ${openai ? '✓ Ready' : '✗ Missing'}`)
  console.log(`  Anthropic: ${anthropic ? '✓ Ready' : '✗ Missing'}`)
  console.log('')
  
  // Fetch enriched profiles
  const { data: profiles, error } = await supabase
    .from('ai_profiles')
    .select('id, brand_name, domain, feed_data')
    .not('feed_data', 'is', null)
    .order('visibility_score', { ascending: false })
    .limit(200)  // Get a good sample to generate queries from
  
  if (error || !profiles) {
    console.error('Failed to fetch profiles:', error)
    process.exit(1)
  }
  
  // Filter to enriched profiles
  const enrichedProfiles = profiles.filter(p => {
    const fd = p.feed_data || {}
    return fd.pricing || (fd.integrations && fd.integrations.length > 0) || (fd.use_cases && fd.use_cases.length > 0)
  }) as EnrichedBrand[]
  
  console.log(`📊 Found ${enrichedProfiles.length} enriched profiles`)
  
  // Generate test queries
  const allQueries = generateTestQueries(enrichedProfiles)
  const queries = allQueries.slice(0, limit)
  
  console.log(`🔍 Generated ${allQueries.length} test queries, running ${queries.length}\n`)
  
  const allBrandNames = enrichedProfiles.map(p => p.brand_name)
  const results: TestResult[] = []
  
  const stats = {
    total: 0,
    chatgpt_correct: 0,
    chatgpt_partial: 0,
    chatgpt_wrong: 0,
    claude_correct: 0,
    claude_partial: 0,
    claude_wrong: 0
  }
  
  for (const q of queries) {
    console.log(`\n🔎 ${q.type}: "${q.query.substring(0, 60)}..."`)
    console.log(`   Filter: ${q.filter_criteria}`)
    console.log(`   Expected: ${q.expected_brands.slice(0, 3).join(', ')}${q.expected_brands.length > 3 ? '...' : ''}`)
    
    // Query both models
    const [chatgptResponse, claudeResponse] = await Promise.all([
      askChatGPT(q.query),
      askClaude(q.query)
    ])
    
    // Analyze responses
    const chatgptAnalysis = analyzeResponse(chatgptResponse, q.expected_brands, allBrandNames)
    const claudeAnalysis = analyzeResponse(claudeResponse, q.expected_brands, allBrandNames)
    
    const chatgptAccuracy = determineAccuracy(chatgptAnalysis.mentionedExpected, q.expected_brands, chatgptResponse)
    const claudeAccuracy = determineAccuracy(claudeAnalysis.mentionedExpected, q.expected_brands, claudeResponse)
    
    // Log results
    console.log(`   ChatGPT: ${chatgptAccuracy.toUpperCase()} - mentioned ${chatgptAnalysis.mentionedExpected.length}/${q.expected_brands.length} expected`)
    console.log(`   Claude:  ${claudeAccuracy.toUpperCase()} - mentioned ${claudeAnalysis.mentionedExpected.length}/${q.expected_brands.length} expected`)
    
    if (chatgptAnalysis.mentionedExpected.length > 0) {
      console.log(`   ChatGPT found: ${chatgptAnalysis.mentionedExpected.join(', ')}`)
    }
    if (claudeAnalysis.mentionedExpected.length > 0) {
      console.log(`   Claude found: ${claudeAnalysis.mentionedExpected.join(', ')}`)
    }
    
    // Update stats
    stats.total++
    if (chatgptAccuracy === 'correct') stats.chatgpt_correct++
    if (chatgptAccuracy === 'partial') stats.chatgpt_partial++
    if (chatgptAccuracy === 'wrong') stats.chatgpt_wrong++
    if (claudeAccuracy === 'correct') stats.claude_correct++
    if (claudeAccuracy === 'partial') stats.claude_partial++
    if (claudeAccuracy === 'wrong') stats.claude_wrong++
    
    // Store result
    results.push({
      query: q.query,
      query_type: q.type,
      filter_criteria: q.filter_criteria,
      expected_brands: q.expected_brands,
      chatgpt_response: chatgptResponse,
      claude_response: claudeResponse,
      chatgpt_mentioned_expected: chatgptAnalysis.mentionedExpected,
      claude_mentioned_expected: claudeAnalysis.mentionedExpected,
      chatgpt_mentioned_others: chatgptAnalysis.mentionedOthers,
      claude_mentioned_others: claudeAnalysis.mentionedOthers,
      chatgpt_accuracy: chatgptAccuracy,
      claude_accuracy: claudeAccuracy
    })
    
    // Rate limiting
    await new Promise(r => setTimeout(r, 500))
  }
  
  // Summary
  console.log('\n\n📈 LONG-TAIL ACCURACY SUMMARY')
  console.log('═'.repeat(50))
  console.log(`Total queries tested: ${stats.total}`)
  console.log('')
  console.log('ChatGPT:')
  console.log(`  ✓ Correct (50%+ expected): ${stats.chatgpt_correct} (${(stats.chatgpt_correct/stats.total*100).toFixed(0)}%)`)
  console.log(`  ~ Partial (some expected): ${stats.chatgpt_partial} (${(stats.chatgpt_partial/stats.total*100).toFixed(0)}%)`)
  console.log(`  ✗ Wrong (none expected):   ${stats.chatgpt_wrong} (${(stats.chatgpt_wrong/stats.total*100).toFixed(0)}%)`)
  console.log('')
  console.log('Claude:')
  console.log(`  ✓ Correct (50%+ expected): ${stats.claude_correct} (${(stats.claude_correct/stats.total*100).toFixed(0)}%)`)
  console.log(`  ~ Partial (some expected): ${stats.claude_partial} (${(stats.claude_partial/stats.total*100).toFixed(0)}%)`)
  console.log(`  ✗ Wrong (none expected):   ${stats.claude_wrong} (${(stats.claude_wrong/stats.total*100).toFixed(0)}%)`)
  
  // Save report
  const timestamp = new Date().toISOString().split('T')[0]
  const outputPath = resolve(__dirname, `../../../longtail-report-${timestamp}.json`)
  
  fs.writeFileSync(outputPath, JSON.stringify({
    generated_at: new Date().toISOString(),
    stats,
    results
  }, null, 2))
  
  console.log(`\n💾 Full report saved to: ${outputPath}`)
  
  // Show worst failures (queries where both models got it wrong)
  const failures = results.filter(r => r.chatgpt_accuracy === 'wrong' && r.claude_accuracy === 'wrong')
  
  if (failures.length > 0) {
    console.log('\n\n🚨 COMPLETE FAILURES (Neither model found expected brands):')
    console.log('─'.repeat(60))
    
    failures.slice(0, 10).forEach((f, i) => {
      console.log(`\n${i + 1}. "${f.query}"`)
      console.log(`   Should have mentioned: ${f.expected_brands.join(', ')}`)
      console.log(`   ChatGPT mentioned: ${f.chatgpt_mentioned_others.length > 0 ? f.chatgpt_mentioned_others.join(', ') : '(other brands)'}`)
      console.log(`   Claude mentioned: ${f.claude_mentioned_others.length > 0 ? f.claude_mentioned_others.join(', ') : '(other brands)'}`)
    })
  }
  
  console.log('\n✅ Done!\n')
}

// ============================================================================
// CLI
// ============================================================================

const args = process.argv.slice(2)
const limitArg = args.find(a => a.startsWith('--limit'))
const limit = limitArg ? parseInt(limitArg.split('=')[1] || '20') : 20

runLongTailTest({ limit })
