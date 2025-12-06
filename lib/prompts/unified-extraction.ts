// lib/prompts/unified-extraction.ts
// Extracts brand AND university mentions from AI responses

import { SupabaseClient } from '@supabase/supabase-js'

interface EntityMatch {
  id: string
  name: string
  type: 'brand' | 'university'
  position: number
  context: string
}

interface ExtractionResult {
  brands: EntityMatch[]
  universities: EntityMatch[]
}

// Cache for entity lookups (refreshed periodically)
let brandCache: Map<string, { id: string; name: string }> = new Map()
let universityCache: Map<string, { id: string; name: string }> = new Map()
let cacheLastUpdated: Date | null = null
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

/**
 * Load entities from database into cache
 */
async function refreshCache(supabase: SupabaseClient) {
  const now = new Date()
  if (cacheLastUpdated && (now.getTime() - cacheLastUpdated.getTime()) < CACHE_TTL_MS) {
    return // Cache is still fresh
  }

  // Load brands
  const { data: brands } = await supabase
    .from('ai_profiles')
    .select('id, brand_name, slug')

  if (brands) {
    brandCache.clear()
    for (const brand of brands) {
      // Index by multiple variations
      brandCache.set(brand.brand_name.toLowerCase(), { id: brand.id, name: brand.brand_name })
      if (brand.slug) {
        brandCache.set(brand.slug.toLowerCase(), { id: brand.id, name: brand.brand_name })
      }
      // Handle common variations
      const simplified = brand.brand_name.toLowerCase().replace(/[^a-z0-9]/g, '')
      brandCache.set(simplified, { id: brand.id, name: brand.brand_name })
    }
  }

  // Load universities
  const { data: universities } = await supabase
    .from('university_profiles')
    .select('id, name, short_name, slug')
    .eq('is_active', true)

  if (universities) {
    universityCache.clear()
    for (const uni of universities) {
      // Index by full name
      universityCache.set(uni.name.toLowerCase(), { id: uni.id, name: uni.name })
      
      // Index by short name (MIT, UCLA, etc.)
      if (uni.short_name) {
        universityCache.set(uni.short_name.toLowerCase(), { id: uni.id, name: uni.name })
      }
      
      // Index by slug
      if (uni.slug) {
        universityCache.set(uni.slug.toLowerCase(), { id: uni.id, name: uni.name })
      }
      
      // Handle common variations
      const simplified = uni.name.toLowerCase().replace(/[^a-z0-9]/g, '')
      universityCache.set(simplified, { id: uni.id, name: uni.name })
    }
  }

  cacheLastUpdated = now
  console.log(`Cache refreshed: ${brandCache.size} brands, ${universityCache.size} universities`)
}

/**
 * Extract context around a match
 */
function extractContext(text: string, matchIndex: number, matchLength: number): string {
  const contextRadius = 100
  const start = Math.max(0, matchIndex - contextRadius)
  const end = Math.min(text.length, matchIndex + matchLength + contextRadius)
  
  let context = text.slice(start, end)
  if (start > 0) context = '...' + context
  if (end < text.length) context = context + '...'
  
  return context.replace(/\n/g, ' ').trim()
}

/**
 * Detect sentiment from context
 */
function detectSentiment(context: string): 'positive' | 'neutral' | 'negative' {
  const lower = context.toLowerCase()
  
  const positiveWords = [
    'best', 'top', 'leading', 'excellent', 'outstanding', 'renowned', 
    'prestigious', 'highly ranked', 'recommended', 'great', 'strong',
    'innovative', 'premier', 'elite', 'world-class', 'exceptional'
  ]
  
  const negativeWords = [
    'worst', 'poor', 'declining', 'struggling', 'controversial', 
    'overrated', 'expensive', 'difficult', 'challenging', 'problematic'
  ]
  
  const positiveCount = positiveWords.filter(w => lower.includes(w)).length
  const negativeCount = negativeWords.filter(w => lower.includes(w)).length
  
  if (positiveCount > negativeCount) return 'positive'
  if (negativeCount > positiveCount) return 'negative'
  return 'neutral'
}

/**
 * Main extraction function
 */
export async function extractEntities(
  supabase: SupabaseClient,
  responseText: string
): Promise<ExtractionResult> {
  await refreshCache(supabase)
  
  const result: ExtractionResult = {
    brands: [],
    universities: []
  }
  
  const foundBrands = new Set<string>()
  const foundUniversities = new Set<string>()
  
  // Track positions for ranking
  let positionCounter = 1
  
  // Process text to find entities
  // We check longer names first to avoid partial matches
  const sortedUniversities = Array.from(universityCache.entries())
    .sort((a, b) => b[0].length - a[0].length)
  
  const sortedBrands = Array.from(brandCache.entries())
    .sort((a, b) => b[0].length - a[0].length)
  
  // Find universities first (they have more specific names)
  for (const [searchTerm, entity] of sortedUniversities) {
    if (foundUniversities.has(entity.id)) continue
    if (searchTerm.length < 3) continue // Skip very short terms
    
    // Create regex that matches whole words
    const regex = new RegExp(`\\b${escapeRegex(searchTerm)}\\b`, 'gi')
    const match = regex.exec(responseText.toLowerCase())
    
    if (match) {
      foundUniversities.add(entity.id)
      const context = extractContext(responseText, match.index, match[0].length)
      
      result.universities.push({
        id: entity.id,
        name: entity.name,
        type: 'university',
        position: positionCounter++,
        context
      })
    }
  }
  
  // Find brands
  for (const [searchTerm, entity] of sortedBrands) {
    if (foundBrands.has(entity.id)) continue
    if (searchTerm.length < 2) continue
    
    // Skip generic words that might be brand names
    const skipWords = ['the', 'and', 'for', 'you', 'can', 'new', 'get', 'use', 'make', 'close']
    if (skipWords.includes(searchTerm)) continue
    
    const regex = new RegExp(`\\b${escapeRegex(searchTerm)}\\b`, 'gi')
    const match = regex.exec(responseText.toLowerCase())
    
    if (match) {
      foundBrands.add(entity.id)
      const context = extractContext(responseText, match.index, match[0].length)
      
      result.brands.push({
        id: entity.id,
        name: entity.name,
        type: 'brand',
        position: positionCounter++,
        context
      })
    }
  }
  
  return result
}

/**
 * Store extraction results in database
 */
export async function storeExtractionResults(
  supabase: SupabaseClient,
  executionId: string,
  results: ExtractionResult
) {
  // Store brand mentions with profile_id
  if (results.brands.length > 0) {
    const brandMentions = results.brands.map(b => ({
      execution_id: executionId,
      profile_id: b.id,  // NEW: Link to ai_profiles
      brand_name: b.name, // Keep for backward compatibility
      position: b.position,
      sentiment: detectSentiment(b.context),
      context: b.context
    }))
    
    await supabase
      .from('prompt_brand_mentions')
      .upsert(brandMentions, { onConflict: 'execution_id,profile_id' })
  }
  
  // Store university mentions
  if (results.universities.length > 0) {
    const uniMentions = results.universities.map(u => ({
      execution_id: executionId,
      university_id: u.id,
      position: u.position,
      sentiment: detectSentiment(u.context),
      context: u.context
    }))
    
    await supabase
      .from('university_mentions')
      .upsert(uniMentions, { onConflict: 'execution_id,university_id' })
  }
  
  return {
    brands_found: results.brands.length,
    universities_found: results.universities.length
  }
}

/**
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Re-process existing executions to extract universities
 * Run this once after adding university_profiles
 */
export async function reprocessExecutionsForUniversities(
  supabase: SupabaseClient,
  topic?: string
) {
  // Build query
  let query = supabase
    .from('prompt_executions')
    .select('id, response_text, prompt_id, seed_prompts!inner(topic)')
  
  if (topic) {
    query = query.eq('seed_prompts.topic', topic)
  }
  
  const { data: executions, error } = await query
  
  if (error || !executions) {
    console.error('Failed to fetch executions:', error)
    return { processed: 0, error }
  }
  
  let processed = 0
  let universitiesFound = 0
  
  for (const execution of executions) {
    if (!execution.response_text) continue
    
    const results = await extractEntities(supabase, execution.response_text)
    await storeExtractionResults(supabase, execution.id, results)
    
    processed++
    universitiesFound += results.universities.length
    
    // Log progress every 50
    if (processed % 50 === 0) {
      console.log(`Processed ${processed}/${executions.length} executions...`)
    }
  }
  
  // Update aggregate scores
  await supabase.rpc('update_university_visibility')
  
  console.log(`Reprocessing complete: ${processed} executions, ${universitiesFound} university mentions found`)
  
  return { processed, universitiesFound }
}
