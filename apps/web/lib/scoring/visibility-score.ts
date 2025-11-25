// lib/scoring/visibility-score.ts
// Meaningful visibility score calculation

export interface ShoppingData {
  total_mentions: number
  categories: Array<{ category: string; rank: number; mentions: number }>
  models: Array<{ model: string; mentions: number }>
  competitors: Array<{ brand: string; mentions: number }>
  raw_results?: Array<{
    brand: string
    model: string
    category: string
    rank: number
    is_user_brand: boolean
  }>
}

export interface VisibilityBreakdown {
  model_coverage: number      // 0-25: How many AI models mention you
  category_share: number      // 0-25: Your share of mentions vs competitors
  rank_position: number       // 0-25: Average rank when mentioned
  query_breadth: number       // 0-25: How many categories you appear in
  total: number               // 0-100: Sum of all components
}

/**
 * Calculate meaningful visibility score from shopping data
 * 
 * Components:
 * - Model Coverage (25 pts): Appear in 4/4 AI models
 * - Category Share (25 pts): Your mentions / total mentions
 * - Rank Position (25 pts): Average rank when mentioned (1st = best)
 * - Query Breadth (25 pts): Number of categories you appear in
 */
export function calculateVisibilityScore(data: ShoppingData): VisibilityBreakdown {
  const breakdown: VisibilityBreakdown = {
    model_coverage: 0,
    category_share: 0,
    rank_position: 0,
    query_breadth: 0,
    total: 0
  }

  // 1. MODEL COVERAGE (25 points)
  // How many of the 4 AI models mention you?
  const modelsWithMentions = data.models?.filter(m => m.mentions > 0).length || 0
  const totalModels = 4 // ChatGPT, Claude, Gemini, Perplexity
  
  if (modelsWithMentions === 4) breakdown.model_coverage = 25
  else if (modelsWithMentions === 3) breakdown.model_coverage = 19
  else if (modelsWithMentions === 2) breakdown.model_coverage = 12
  else if (modelsWithMentions === 1) breakdown.model_coverage = 6
  else breakdown.model_coverage = 0

  // 2. CATEGORY SHARE (25 points)
  // What percentage of all brand mentions are YOU?
  const userMentions = data.total_mentions || 0
  const competitorMentions = data.competitors?.reduce((sum, c) => sum + c.mentions, 0) || 0
  const totalBrandMentions = userMentions + competitorMentions
  
  if (totalBrandMentions > 0) {
    const sharePercent = (userMentions / totalBrandMentions) * 100
    // Scale: 50%+ share = 25 points, linear below
    breakdown.category_share = Math.min(25, Math.round((sharePercent / 50) * 25))
  }

  // 3. RANK POSITION (25 points)
  // Average rank when you appear (1 = best, 5+ = worst)
  if (data.raw_results && data.raw_results.length > 0) {
    const userResults = data.raw_results.filter(r => r.is_user_brand)
    if (userResults.length > 0) {
      const avgRank = userResults.reduce((sum, r) => sum + (r.rank || 3), 0) / userResults.length
      
      if (avgRank <= 1.5) breakdown.rank_position = 25
      else if (avgRank <= 2.0) breakdown.rank_position = 22
      else if (avgRank <= 2.5) breakdown.rank_position = 18
      else if (avgRank <= 3.0) breakdown.rank_position = 15
      else if (avgRank <= 4.0) breakdown.rank_position = 10
      else breakdown.rank_position = 5
    }
  } else if (data.categories && data.categories.length > 0) {
    // Fallback: use category rank data
    const avgRank = data.categories.reduce((sum, c) => sum + (c.rank || 3), 0) / data.categories.length
    
    if (avgRank <= 1.5) breakdown.rank_position = 25
    else if (avgRank <= 2.0) breakdown.rank_position = 22
    else if (avgRank <= 2.5) breakdown.rank_position = 18
    else if (avgRank <= 3.0) breakdown.rank_position = 15
    else if (avgRank <= 4.0) breakdown.rank_position = 10
    else breakdown.rank_position = 5
  }

  // 4. QUERY BREADTH (25 points)
  // How many different categories do you appear in?
  const categoryCount = data.categories?.length || 0
  
  if (categoryCount >= 10) breakdown.query_breadth = 25
  else if (categoryCount >= 7) breakdown.query_breadth = 20
  else if (categoryCount >= 5) breakdown.query_breadth = 15
  else if (categoryCount >= 3) breakdown.query_breadth = 10
  else if (categoryCount >= 1) breakdown.query_breadth = 5
  else breakdown.query_breadth = 0

  // Calculate total
  breakdown.total = 
    breakdown.model_coverage + 
    breakdown.category_share + 
    breakdown.rank_position + 
    breakdown.query_breadth

  return breakdown
}

/**
 * Calculate competitor visibility score
 * Used for ranking competitors in the leaderboard
 */
export function calculateCompetitorVisibilityScore(
  competitorMentions: number,
  totalMentions: number,
  modelsCount: number,
  categoriesCount: number,
  avgRank: number
): number {
  let score = 0

  // Model coverage (25)
  if (modelsCount >= 4) score += 25
  else if (modelsCount >= 3) score += 19
  else if (modelsCount >= 2) score += 12
  else if (modelsCount >= 1) score += 6

  // Category share (25)
  if (totalMentions > 0) {
    const sharePercent = (competitorMentions / totalMentions) * 100
    score += Math.min(25, Math.round((sharePercent / 50) * 25))
  }

  // Rank position (25)
  if (avgRank <= 1.5) score += 25
  else if (avgRank <= 2.0) score += 22
  else if (avgRank <= 2.5) score += 18
  else if (avgRank <= 3.0) score += 15
  else if (avgRank <= 4.0) score += 10
  else score += 5

  // Query breadth (25)
  if (categoriesCount >= 10) score += 25
  else if (categoriesCount >= 7) score += 20
  else if (categoriesCount >= 5) score += 15
  else if (categoriesCount >= 3) score += 10
  else if (categoriesCount >= 1) score += 5

  return score
}

// ============================================
// BRAND VISIBILITY SCORE
// ============================================

export interface BrandData {
  descriptors: Array<{ word: string; sentiment: string; weight: number }>
  sentiment_breakdown: { positive: number; neutral: number; negative: number }
  total_mentions: number
}

export interface BrandVisibilityBreakdown {
  mention_volume: number      // 0-25: Raw mention count
  sentiment_score: number     // 0-25: Positive vs negative sentiment
  descriptor_diversity: number // 0-25: Variety of descriptors
  consistency: number         // 0-25: Consistent positive messaging
  total: number
}

export function calculateBrandVisibilityScore(data: BrandData): BrandVisibilityBreakdown {
  const breakdown: BrandVisibilityBreakdown = {
    mention_volume: 0,
    sentiment_score: 0,
    descriptor_diversity: 0,
    consistency: 0,
    total: 0
  }

  // 1. MENTION VOLUME (25 points)
  const mentions = data.total_mentions || 0
  if (mentions >= 50) breakdown.mention_volume = 25
  else if (mentions >= 30) breakdown.mention_volume = 20
  else if (mentions >= 20) breakdown.mention_volume = 15
  else if (mentions >= 10) breakdown.mention_volume = 10
  else if (mentions >= 5) breakdown.mention_volume = 5
  else breakdown.mention_volume = Math.min(5, mentions)

  // 2. SENTIMENT SCORE (25 points)
  const { positive, negative } = data.sentiment_breakdown || { positive: 0, negative: 0 }
  const total = positive + (data.sentiment_breakdown?.neutral || 0) + negative
  
  if (total > 0) {
    const positiveRatio = positive / total
    const negativeRatio = negative / total
    
    // Score based on positive ratio minus penalty for negative
    const sentimentRatio = positiveRatio - (negativeRatio * 2) // Negative hurts more
    breakdown.sentiment_score = Math.max(0, Math.min(25, Math.round(sentimentRatio * 25 + 12.5)))
  }

  // 3. DESCRIPTOR DIVERSITY (25 points)
  const uniqueDescriptors = new Set(data.descriptors?.map(d => d.word.toLowerCase())).size
  
  if (uniqueDescriptors >= 15) breakdown.descriptor_diversity = 25
  else if (uniqueDescriptors >= 10) breakdown.descriptor_diversity = 20
  else if (uniqueDescriptors >= 7) breakdown.descriptor_diversity = 15
  else if (uniqueDescriptors >= 4) breakdown.descriptor_diversity = 10
  else breakdown.descriptor_diversity = Math.min(10, uniqueDescriptors * 2)

  // 4. CONSISTENCY (25 points)
  // Are the positive descriptors consistent (high weight)?
  const positiveDescriptors = data.descriptors?.filter(d => d.sentiment === 'pos') || []
  if (positiveDescriptors.length > 0) {
    const avgWeight = positiveDescriptors.reduce((sum, d) => sum + (d.weight || 1), 0) / positiveDescriptors.length
    breakdown.consistency = Math.min(25, Math.round(avgWeight * 5))
  }

  breakdown.total = 
    breakdown.mention_volume +
    breakdown.sentiment_score +
    breakdown.descriptor_diversity +
    breakdown.consistency

  return breakdown
}

// ============================================
// WEBSITE READINESS SCORE
// ============================================

export interface WebsiteData {
  pages_analyzed: number
  schema_coverage: number // % of pages with schema
  issues: Array<{ severity: string; code: string }>
  readability_score?: number
}

export interface WebsiteReadinessBreakdown {
  schema_coverage: number     // 0-30: % of pages with proper schema
  technical_health: number    // 0-30: Low issues = higher score
  page_coverage: number       // 0-20: More pages analyzed = better
  ai_optimization: number     // 0-20: AI-specific optimizations
  total: number
}

export function calculateWebsiteReadinessScore(data: WebsiteData): WebsiteReadinessBreakdown {
  const breakdown: WebsiteReadinessBreakdown = {
    schema_coverage: 0,
    technical_health: 0,
    page_coverage: 0,
    ai_optimization: 0,
    total: 0
  }

  // 1. SCHEMA COVERAGE (30 points)
  const schemaCoverage = data.schema_coverage || 0
  breakdown.schema_coverage = Math.round((schemaCoverage / 100) * 30)

  // 2. TECHNICAL HEALTH (30 points)
  // Fewer issues = higher score
  const highIssues = data.issues?.filter(i => i.severity === 'high').length || 0
  const medIssues = data.issues?.filter(i => i.severity === 'med').length || 0
  const lowIssues = data.issues?.filter(i => i.severity === 'low').length || 0
  
  // Penalty: high = -5, med = -2, low = -1
  const penalty = (highIssues * 5) + (medIssues * 2) + (lowIssues * 1)
  breakdown.technical_health = Math.max(0, 30 - Math.min(30, penalty))

  // 3. PAGE COVERAGE (20 points)
  const pagesAnalyzed = data.pages_analyzed || 0
  if (pagesAnalyzed >= 100) breakdown.page_coverage = 20
  else if (pagesAnalyzed >= 50) breakdown.page_coverage = 15
  else if (pagesAnalyzed >= 20) breakdown.page_coverage = 10
  else if (pagesAnalyzed >= 10) breakdown.page_coverage = 5
  else breakdown.page_coverage = Math.min(5, pagesAnalyzed)

  // 4. AI OPTIMIZATION (20 points)
  // Check for AI-friendly indicators
  let aiScore = 0
  
  // Has Organization schema
  const hasOrgSchema = data.issues?.some(i => 
    i.code === 'missing_organization_schema'
  ) === false
  if (hasOrgSchema) aiScore += 5

  // Has Product schema (if applicable)
  const hasProductSchema = data.issues?.some(i => 
    i.code === 'missing_product_schema'
  ) === false
  if (hasProductSchema) aiScore += 5

  // Has FAQ schema
  const hasFaqSchema = data.issues?.some(i => 
    i.code === 'missing_faq_schema'
  ) === false
  if (hasFaqSchema) aiScore += 5

  // Good readability
  if ((data.readability_score || 0) >= 80) aiScore += 5

  breakdown.ai_optimization = aiScore

  breakdown.total = 
    breakdown.schema_coverage +
    breakdown.technical_health +
    breakdown.page_coverage +
    breakdown.ai_optimization

  return breakdown
}

// ============================================
// HARBOR SCORE (OVERALL)
// ============================================

export interface HarborScoreBreakdown {
  shopping_visibility: number   // 0-100
  brand_visibility: number      // 0-100
  website_readiness: number     // 0-100
  harbor_score: number          // 0-100 weighted average
  
  // Component breakdowns for display
  shopping_breakdown?: VisibilityBreakdown
  brand_breakdown?: BrandVisibilityBreakdown
  website_breakdown?: WebsiteReadinessBreakdown
}

/**
 * Calculate overall Harbor Score
 * 
 * Weighting:
 * - Shopping Visibility: 35%
 * - Brand Visibility: 30%
 * - Website Readiness: 35%
 */
export function calculateHarborScore(
  shoppingData: ShoppingData,
  brandData: BrandData,
  websiteData: WebsiteData
): HarborScoreBreakdown {
  const shoppingBreakdown = calculateVisibilityScore(shoppingData)
  const brandBreakdown = calculateBrandVisibilityScore(brandData)
  const websiteBreakdown = calculateWebsiteReadinessScore(websiteData)

  const harborScore = Math.round(
    (shoppingBreakdown.total * 0.35) +
    (brandBreakdown.total * 0.30) +
    (websiteBreakdown.total * 0.35)
  )

  return {
    shopping_visibility: shoppingBreakdown.total,
    brand_visibility: brandBreakdown.total,
    website_readiness: websiteBreakdown.total,
    harbor_score: harborScore,
    shopping_breakdown: shoppingBreakdown,
    brand_breakdown: brandBreakdown,
    website_breakdown: websiteBreakdown
  }
}
