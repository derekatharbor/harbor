// DESTINATION: ~/Claude Harbor/apps/web/lib/category-scan.server.ts
// New file - category-level AI scans for Shopify stores

import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Model configurations
const MODELS = [
  { id: 'chatgpt', name: 'ChatGPT', provider: 'openai' },
  { id: 'claude', name: 'Claude', provider: 'anthropic' },
  { id: 'perplexity', name: 'Perplexity', provider: 'perplexity' },
  { id: 'gemini', name: 'Gemini', provider: 'google' },
]

// Prompt templates for category scanning
const PROMPT_TEMPLATES = [
  "What are the best {category} to buy in 2024?",
  "I'm looking for {category} recommendations. What should I consider?",
  "Top rated {category} for someone new to this",
]

interface CategoryGroup {
  category: string
  products: {
    id: string
    title: string
    price: string | null
    vendor: string | null
  }[]
  heroProduct: {
    id: string
    title: string
  }
}

interface ScanResult {
  model: string
  prompt: string
  response: string
  productsFound: string[]
  competitorsFound: string[]
  timestamp: string
}

/**
 * Get stores that are due for scanning based on their plan frequency
 */
export async function getStoresDueForScan(): Promise<any[]> {
  const supabase = getSupabase()
  
  const { data: stores, error } = await supabase
    .from('shopify_stores')
    .select('*')
    .not('dashboard_id', 'is', null)
    .or('next_scan_at.is.null,next_scan_at.lte.now()')

  if (error) {
    console.error('[CategoryScan] Error fetching stores:', error)
    return []
  }

  return stores || []
}

/**
 * Group products by category (product_type) and select hero product
 */
export async function groupProductsByCategory(storeId: string): Promise<CategoryGroup[]> {
  const supabase = getSupabase()
  
  const { data: products, error } = await supabase
    .from('shopify_products')
    .select('id, title, handle, vendor, product_type, price, currency')
    .eq('store_id', storeId)
    .order('price', { ascending: false, nullsFirst: false })

  if (error || !products?.length) {
    console.error('[CategoryScan] Error fetching products:', error)
    return []
  }

  // Group by product_type
  const groups = new Map<string, CategoryGroup>()

  for (const product of products) {
    const category = product.product_type || 'General'
    
    if (!groups.has(category)) {
      groups.set(category, {
        category,
        products: [],
        heroProduct: { id: product.id, title: product.title },
      })
    }

    groups.get(category)!.products.push({
      id: product.id,
      title: product.title,
      price: product.price,
      vendor: product.vendor,
    })
  }

  return Array.from(groups.values())
}

/**
 * Generate prompts for a category
 */
function generatePrompts(category: string): string[] {
  return PROMPT_TEMPLATES.map(template => 
    template.replace('{category}', category.toLowerCase())
  )
}

/**
 * Execute a single prompt against a model
 * TODO: Wire up to real APIs - returns mock data for now
 */
async function executePrompt(
  model: typeof MODELS[0],
  prompt: string,
  storeProducts: string[]
): Promise<ScanResult> {
  // TODO: Wire up to actual AI APIs
  console.log(`[CategoryScan] Would execute: ${model.name} - "${prompt}"`)
  
  return {
    model: model.id,
    prompt,
    response: `[Mock response for ${model.name}]`,
    productsFound: [],
    competitorsFound: [],
    timestamp: new Date().toISOString(),
  }
}

/**
 * Fuzzy match product names in AI response
 */
function matchProducts(
  response: string,
  storeProducts: { id: string; title: string }[]
): { productId: string; title: string; position: number }[] {
  const matches: { productId: string; title: string; position: number }[] = []
  const responseLower = response.toLowerCase()

  for (const product of storeProducts) {
    const titleLower = product.title.toLowerCase()
    
    let position = responseLower.indexOf(titleLower)
    
    if (position === -1) {
      const words = titleLower.split(' ').slice(0, 3).join(' ')
      if (words.length > 10) {
        position = responseLower.indexOf(words)
      }
    }

    if (position !== -1) {
      matches.push({
        productId: product.id,
        title: product.title,
        position: position,
      })
    }
  }

  return matches.sort((a, b) => a.position - b.position)
}

/**
 * Extract competitor product names from response
 */
function extractCompetitors(
  response: string,
  storeProducts: string[]
): string[] {
  const competitors: string[] = []
  
  const patterns = [
    /(?:the|a)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:from|by)/g,
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)'s\s+\w+/g,
  ]

  for (const pattern of patterns) {
    let match
    while ((match = pattern.exec(response)) !== null) {
      const potential = match[1]
      if (!storeProducts.some(p => p.toLowerCase().includes(potential.toLowerCase()))) {
        competitors.push(potential)
      }
    }
  }

  return [...new Set(competitors)]
}

/**
 * Run full category scan for a store
 */
export async function runCategoryScan(storeId: string): Promise<{
  success: boolean
  categoriesScanned: number
  error?: string
}> {
  const supabase = getSupabase()
  console.log(`[CategoryScan] Starting scan for store: ${storeId}`)

  try {
    const categories = await groupProductsByCategory(storeId)
    
    if (categories.length === 0) {
      return { success: true, categoriesScanned: 0 }
    }

    console.log(`[CategoryScan] Found ${categories.length} categories`)

    for (const category of categories) {
      const prompts = generatePrompts(category.category)
      const allResults: ScanResult[] = []
      const allProductMatches: Map<string, { mentions: number; bestPosition: number; models: string[] }> = new Map()

      for (const prompt of prompts.slice(0, 1)) {
        for (const model of MODELS) {
          const result = await executePrompt(
            model,
            prompt,
            category.products.map(p => p.title)
          )
          allResults.push(result)

          const matches = matchProducts(
            result.response,
            category.products.map(p => ({ id: p.id, title: p.title }))
          )

          for (let i = 0; i < matches.length; i++) {
            const match = matches[i]
            const existing = allProductMatches.get(match.productId) || {
              mentions: 0,
              bestPosition: 999,
              models: [],
            }
            existing.mentions++
            existing.bestPosition = Math.min(existing.bestPosition, i + 1)
            existing.models.push(model.id)
            allProductMatches.set(match.productId, existing)
          }

          result.competitorsFound = extractCompetitors(
            result.response,
            category.products.map(p => p.title)
          )
        }
      }

      const modelsWithMentions = new Set(
        allResults.filter(r => r.productsFound.length > 0).map(r => r.model)
      )
      const visibilityScore = Math.round((modelsWithMentions.size / MODELS.length) * 100)
      const allCompetitors = [...new Set(allResults.flatMap(r => r.competitorsFound))]

      const { data: scanRecord, error: scanError } = await supabase
        .from('shopify_category_scans')
        .insert({
          store_id: storeId,
          category: category.category,
          hero_product_id: category.heroProduct.id,
          hero_product_title: category.heroProduct.title,
          product_count: category.products.length,
          models_scanned: MODELS.map(m => m.id),
          visibility_score: visibilityScore,
          scan_results: allResults,
          competitors_found: allCompetitors,
        })
        .select('id')
        .single()

      if (scanError) {
        console.error('[CategoryScan] Error saving scan:', scanError)
        continue
      }

      const productVisibilityRecords = category.products.map(product => {
        const matchData = allProductMatches.get(product.id)
        return {
          product_id: product.id,
          scan_id: scanRecord.id,
          mentioned: !!matchData,
          mention_count: matchData?.mentions || 0,
          best_position: matchData?.bestPosition || null,
          mentioned_by: matchData?.models || [],
          issues: [],
          issue_count: 0,
        }
      })

      await supabase
        .from('shopify_product_visibility')
        .insert(productVisibilityRecords)

      console.log(`[CategoryScan] Completed category: ${category.category}`)
    }

    const nextScan = await calculateNextScan(storeId)
    await supabase
      .from('shopify_stores')
      .update({
        last_scan_at: new Date().toISOString(),
        next_scan_at: nextScan,
      })
      .eq('id', storeId)

    return { success: true, categoriesScanned: categories.length }

  } catch (error) {
    console.error('[CategoryScan] Error:', error)
    return { success: false, categoriesScanned: 0, error: String(error) }
  }
}

/**
 * Calculate next scan date based on store's plan
 */
async function calculateNextScan(storeId: string): Promise<string> {
  const supabase = getSupabase()
  
  const { data: store } = await supabase
    .from('shopify_stores')
    .select('scan_frequency')
    .eq('id', storeId)
    .single()

  const frequency = store?.scan_frequency || 'monthly'
  const now = new Date()

  switch (frequency) {
    case 'daily':
      now.setDate(now.getDate() + 1)
      break
    case 'weekly':
      now.setDate(now.getDate() + 7)
      break
    case 'monthly':
    default:
      now.setDate(now.getDate() + 30)
      break
  }

  return now.toISOString()
}

/**
 * Get visibility summary for a store's dashboard
 */
export async function getStoreVisibilitySummary(storeId: string): Promise<{
  overallScore: number | null
  totalMentions: number
  categoriesTracked: number
  topIssues: any[]
  lastScanAt: string | null
}> {
  const supabase = getSupabase()
  
  const { data: latestScans } = await supabase
    .from('shopify_category_scans')
    .select('*')
    .eq('store_id', storeId)
    .order('scanned_at', { ascending: false })
    .limit(50)

  if (!latestScans?.length) {
    return {
      overallScore: null,
      totalMentions: 0,
      categoriesTracked: 0,
      topIssues: [],
      lastScanAt: null,
    }
  }

  const latestPerCategory = new Map<string, typeof latestScans[0]>()
  for (const scan of latestScans) {
    if (!latestPerCategory.has(scan.category)) {
      latestPerCategory.set(scan.category, scan)
    }
  }

  const scans = Array.from(latestPerCategory.values())

  const validScores = scans.filter(s => s.visibility_score !== null)
  const overallScore = validScores.length > 0
    ? Math.round(validScores.reduce((sum, s) => sum + s.visibility_score, 0) / validScores.length)
    : null

  const scanIds = scans.map(s => s.id)
  const { count: mentionCount } = await supabase
    .from('shopify_product_visibility')
    .select('*', { count: 'exact', head: true })
    .in('scan_id', scanIds)
    .eq('mentioned', true)

  const topIssues: any[] = []

  return {
    overallScore,
    totalMentions: mentionCount || 0,
    categoriesTracked: scans.length,
    topIssues,
    lastScanAt: scans[0]?.scanned_at || null,
  }
}
