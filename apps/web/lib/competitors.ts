// apps/web/lib/competitors.ts
// Competitor matching with fuzzy industry matching

import { createClient } from '@supabase/supabase-js'

interface Competitor {
  id: string
  slug: string
  brand_name: string
  industry: string
  visibility_score: number
  rank_global?: number
}

interface CompetitorResult {
  competitors: Competitor[]
  userRank: number
  totalInCategory: number
  category: string
}

/**
 * Get competitors for a brand based on industry similarity
 * Uses fuzzy matching to catch variations in industry naming
 */
export async function getCompetitors(
  brandId: string, 
  limit: number = 5
): Promise<CompetitorResult | null> {
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  // Get the brand
  const { data: brand, error: brandError } = await supabase
    .from('ai_profiles')
    .select('id, industry, visibility_score')
    .eq('id', brandId)
    .single()
  
  if (brandError || !brand || !brand.industry) {
    console.error('Brand not found or missing industry:', brandError)
    return null
  }
  
  // Get all brands in similar industries (fuzzy match)
  const { data: allCompetitors, error: compError } = await supabase
    .from('ai_profiles')
    .select('id, slug, brand_name, industry, visibility_score, rank_global')
    .neq('id', brandId)
    .not('visibility_score', 'is', null)
    .or(`industry.ilike.${brand.industry},industry.ilike.%${brand.industry}%,industry.ilike.${brand.industry}%`)
    .order('visibility_score', { ascending: false })
  
  if (compError || !allCompetitors) {
    console.error('Error fetching competitors:', compError)
    return null
  }
  
  // Calculate user's rank in this category
  const userRank = allCompetitors.findIndex(c => c.id === brand.id) + 1
  
  // Return top N competitors
  const competitors = allCompetitors
    .filter(c => c.id !== brand.id)
    .slice(0, limit)
  
  return {
    competitors,
    userRank: userRank || allCompetitors.length + 1,
    totalInCategory: allCompetitors.length + 1, // +1 for user's brand
    category: brand.industry
  }
}

/**
 * Get competitor details (for Pro users)
 * Includes full profile data, not just basic info
 */
export async function getCompetitorDetails(
  competitorIds: string[]
): Promise<any[]> {
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  const { data, error } = await supabase
    .from('ai_profiles')
    .select('*')
    .in('id', competitorIds)
  
  if (error) {
    console.error('Error fetching competitor details:', error)
    return []
  }
  
  return data || []
}

/**
 * Calculate rank among competitors
 */
export function calculateCompetitorGap(
  userRank: number,
  topCompetitors: Competitor[]
): {
  positionsBehind: number
  avgTopThreeRank: number
  gapMessage: string
} {
  const topThreeRanks = topCompetitors
    .slice(0, 3)
    .map(c => c.rank_global || 999)
    .filter(r => r !== 999)
  
  const avgTopThreeRank = topThreeRanks.length > 0
    ? Math.round(topThreeRanks.reduce((a, b) => a + b, 0) / topThreeRanks.length)
    : 0
  
  const positionsBehind = avgTopThreeRank > 0 
    ? userRank - avgTopThreeRank
    : 0
  
  let gapMessage = ''
  if (positionsBehind > 0) {
    gapMessage = `${positionsBehind} positions behind top 3 average`
  } else if (positionsBehind === 0) {
    gapMessage = `Tied with top performers`
  } else {
    gapMessage = `Ahead of category average`
  }
  
  return {
    positionsBehind: Math.abs(positionsBehind),
    avgTopThreeRank,
    gapMessage
  }
}
