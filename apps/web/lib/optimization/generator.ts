// lib/optimization/generator.ts
// ENHANCED VERSION - Product-specific analysis + Brand analysis

import { OptimizationTask, getTasksForModule, TaskModule } from './tasks'

export interface ShoppingAnalysis {
  score: number
  total_mentions: number
  categories: Array<{
    category: string
    rank: number
    mentions: number
  }>
  competitors: Array<{
    brand: string
    mentions: number
  }>
  models: Array<{
    model: string
    mentions: number
  }>
  raw_results?: Array<{
    scan_id: string
    model: string
    category: string
    product: string
    brand: string
    rank: number
    confidence: number
    is_user_brand: boolean
  }>
}

export interface BrandAnalysis {
  visibility_index: number
  descriptors: Array<{
    word: string
    sentiment: string
    weight: number
  }>
  sentiment_breakdown: {
    positive: number
    neutral: number
    negative: number
  }
  total_mentions: number
}

export interface ProductInsight {
  product_name: string
  categories: string[]
  avg_rank: number
  mention_count: number
  models_present: string[]
  best_rank: number
  worst_rank: number
}

export interface TaskRecommendation {
  task: OptimizationTask
  priority: number // 1-100, higher = more urgent
  context: {
    // Shopping context
    affected_products?: ProductInsight[]
    affected_categories?: string[]
    competitor_examples?: string[]
    current_performance?: any
    product_count?: number
    
    // Brand context
    current_visibility?: number
    total_mentions?: number
    negative_descriptors?: string[]
    negative_count?: number
    descriptor_count?: number
    scattered?: boolean
    positive_descriptors?: string[]
    positive_count?: number
    
    // Conversations context
    questions?: string[]
    count?: number
    type?: 'brand_specific' | 'category_general'
    competitors?: string[]
    competitor_count?: number
    intents?: string[]
    brand_mentions?: number
    
    // Website context
    affected_urls?: any[]
    issue_code?: string
  }
}

// ============================================================================
// SHOPPING ANALYSIS
// ============================================================================

/**
 * Extract unique products for the user's brand
 */
function extractUserProducts(data: ShoppingAnalysis): ProductInsight[] {
  const userRows = data.raw_results?.filter(r => r.is_user_brand) || []
  
  // Group by product name
  const productMap = new Map<string, ProductInsight>()
  
  for (const row of userRows) {
    const existing = productMap.get(row.product) || {
      product_name: row.product,
      categories: [],
      avg_rank: 0,
      mention_count: 0,
      models_present: [],
      best_rank: 999,
      worst_rank: 0
    }
    
    // Add category if not present
    if (!existing.categories.includes(row.category)) {
      existing.categories.push(row.category)
    }
    
    // Add model if not present
    if (!existing.models_present.includes(row.model)) {
      existing.models_present.push(row.model)
    }
    
    // Update ranks
    existing.best_rank = Math.min(existing.best_rank, row.rank)
    existing.worst_rank = Math.max(existing.worst_rank, row.rank)
    existing.mention_count++
    
    productMap.set(row.product, existing)
  }
  
  // Calculate average ranks
  for (const [name, product] of productMap.entries()) {
    const productRows = userRows.filter(r => r.product === name)
    const totalRank = productRows.reduce((sum, r) => sum + r.rank, 0)
    product.avg_rank = totalRank / productRows.length
  }
  
  return Array.from(productMap.values())
    .sort((a, b) => b.mention_count - a.mention_count)
}

/**
 * Analyzes shopping scan data and returns prioritized task recommendations
 */
export function analyzeShoppingData(data: ShoppingAnalysis): TaskRecommendation[] {
  const tasks = getTasksForModule('shopping')
  const recommendations: TaskRecommendation[] = []
  
  // Extract product-specific insights
  const userProducts = extractUserProducts(data)
  
  console.log('🔍 [Analyzer] Found user products:', userProducts.map(p => p.product_name))
  
  for (const task of tasks) {
    if (task.shouldShow(data)) {
      const priority = calculateShoppingPriority(task, data, userProducts)
      const context = buildShoppingContext(task, data, userProducts)
      
      recommendations.push({
        task,
        priority,
        context
      })
    }
  }
  
  // Sort by priority (highest first)
  return recommendations.sort((a, b) => b.priority - a.priority)
}

/**
 * Calculate task priority based on data analysis
 */
function calculateShoppingPriority(
  task: OptimizationTask, 
  data: ShoppingAnalysis,
  products: ProductInsight[]
): number {
  let priority = 50 // Base priority
  
  switch (task.id) {
    case 'add-product-schema':
      // Higher priority based on number of products + performance
      const avgRank = products.reduce((sum, p) => sum + p.avg_rank, 0) / (products.length || 1)
      
      if (products.length === 0) priority = 100 // No products found!
      else if (avgRank > 5) priority = 90
      else if (avgRank > 3) priority = 75
      else if (products.length > 1) priority = 65 // Multiple products, medium priority
      else priority = 55 // Maintenance task
      break
      
    case 'enrich-descriptions':
      // Priority based on how many products rank poorly
      const poorlyRanked = products.filter(p => p.avg_rank > 3)
      priority = Math.min(90, 50 + (poorlyRanked.length * 10))
      break
      
    case 'add-offers-schema':
      // Medium priority if products exist
      priority = products.length > 0 ? 60 : 45
      break
      
    case 'add-review-schema':
      // Higher if products exist but aren't winning
      const notWinning = products.filter(p => p.best_rank > 1)
      priority = Math.min(80, 50 + (notWinning.length * 8))
      break
      
    case 'create-category-pages':
      // High priority based on gap size
      const missingCategories = findMissingCategories(data)
      priority = Math.min(90, 50 + (missingCategories.length * 10))
      break
  }
  
  // Boost priority for high-impact tasks
  if (task.impact === 'high') priority += 10
  
  return Math.min(100, priority)
}

/**
 * Build contextual information for each task - PRODUCT-SPECIFIC
 */
function buildShoppingContext(
  task: OptimizationTask, 
  data: ShoppingAnalysis,
  products: ProductInsight[]
): any {
  const context: any = {
    product_count: products.length,
    affected_products: []
  }
  
  switch (task.id) {
    case 'add-product-schema':
      // List ALL products that need schema
      context.affected_products = products
      context.affected_categories = Array.from(
        new Set(products.flatMap(p => p.categories))
      )
      context.total_mentions = products.reduce((sum, p) => sum + p.mention_count, 0)
      break
      
    case 'enrich-descriptions':
      // List products with poor rankings
      const needsEnrichment = products.filter(p => p.avg_rank > 3)
      context.affected_products = needsEnrichment
      context.avg_rank = needsEnrichment.reduce((sum, p) => sum + p.avg_rank, 0) / (needsEnrichment.length || 1)
      break
      
    case 'add-offers-schema':
      // All products need this
      context.affected_products = products
      break
      
    case 'add-review-schema':
      // Products not ranking #1
      const notWinning = products.filter(p => p.best_rank > 1)
      context.affected_products = notWinning
      break
      
    case 'create-category-pages':
      context.missing_categories = findMissingCategories(data)
      context.competitor_examples = findCompetitorExamples(data)
      break
  }
  
  return context
}

/**
 * Find categories where competitors appear but user doesn't
 */
function findMissingCategories(data: ShoppingAnalysis): string[] {
  const allCategories = new Set(
    data.raw_results?.map(r => r.category) || []
  )
  
  const userCategories = new Set(
    data.raw_results?.filter(r => r.is_user_brand).map(r => r.category) || []
  )
  
  return Array.from(allCategories).filter(cat => !userCategories.has(cat))
}

/**
 * Find top competitors in missing categories
 */
function findCompetitorExamples(data: ShoppingAnalysis): Array<{category: string, brand: string, rank: number}> {
  const missing = findMissingCategories(data)
  const examples: Array<{category: string, brand: string, rank: number}> = []
  
  for (const category of missing.slice(0, 3)) {
    const topInCategory = data.raw_results
      ?.filter(r => r.category === category && !r.is_user_brand)
      .sort((a, b) => a.rank - b.rank)[0]
    
    if (topInCategory) {
      examples.push({
        category,
        brand: topInCategory.brand,
        rank: topInCategory.rank
      })
    }
  }
  
  return examples
}

// ============================================================================
// BRAND ANALYSIS
// ============================================================================

export function analyzeBrandData(data: BrandAnalysis): TaskRecommendation[] {
  const tasks = getTasksForModule('brand')
  const recommendations: TaskRecommendation[] = []
  
  console.log('🔍 [Brand Analyzer] Visibility:', data.visibility_index, 'Sentiment:', data.sentiment_breakdown)
  
  for (const task of tasks) {
    if (task.shouldShow(data)) {
      const priority = calculateBrandPriority(task, data)
      const context = buildBrandContext(task, data)
      
      recommendations.push({
        task,
        priority,
        context
      })
    }
  }
  
  return recommendations.sort((a, b) => b.priority - a.priority)
}

function calculateBrandPriority(task: OptimizationTask, data: BrandAnalysis): number {
  let priority = 50
  
  switch (task.id) {
    case 'add-organization-schema':
      if (data.visibility_index < 30) priority = 95
      else if (data.visibility_index < 60) priority = 80
      else priority = 65
      break
      
    case 'improve-negative-sentiment':
      const negPct = data.sentiment_breakdown?.negative || 0
      priority = Math.min(95, 50 + (negPct * 2))
      break
      
    case 'unify-brand-language':
      const scattered = data.descriptors?.filter(d => d.weight < 2).length || 0
      priority = Math.min(75, 50 + scattered)
      break
      
    case 'boost-positive-descriptors':
      const posPct = data.sentiment_breakdown?.positive || 0
      priority = posPct >= 60 ? 65 : 55
      break
      
    case 'add-brand-authority-links':
      priority = data.visibility_index < 40 ? 85 : 60
      break
  }
  
  if (task.impact === 'high') priority += 10
  return Math.min(100, priority)
}

function buildBrandContext(task: OptimizationTask, data: BrandAnalysis): any {
  const context: any = {}
  
  switch (task.id) {
    case 'add-organization-schema':
      context.current_visibility = data.visibility_index
      context.total_mentions = data.total_mentions
      break
      
    case 'improve-negative-sentiment':
      const negativeTerms = data.descriptors?.filter(d => 
        d.sentiment === 'neg' || d.sentiment === 'negative'
      ) || []
      context.negative_descriptors = negativeTerms.slice(0, 5).map(d => d.word)
      context.negative_count = negativeTerms.length
      break
      
    case 'unify-brand-language':
      const allTerms = data.descriptors?.map(d => d.word) || []
      context.descriptor_count = allTerms.length
      context.scattered = allTerms.length > 15
      break
      
    case 'boost-positive-descriptors':
      const positiveTerms = data.descriptors?.filter(d => 
        d.sentiment === 'pos' || d.sentiment === 'positive'
      ).sort((a, b) => b.weight - a.weight) || []
      context.positive_descriptors = positiveTerms.slice(0, 5).map(d => d.word)
      context.positive_count = positiveTerms.length
      break
      
    case 'add-brand-authority-links':
      context.current_visibility = data.visibility_index
      break
  }
  
  return context
}

// ============================================================================
// CONVERSATIONS ANALYSIS
// ============================================================================

export function analyzeConversationsData(data: any): TaskRecommendation[] {
  const tasks = getTasksForModule('conversations')
  const recommendations: TaskRecommendation[] = []
  
  console.log('📋 [Conversations Analyzer] Questions:', data.questions?.length || 0)
  
  for (const task of tasks) {
    if (task.shouldShow(data)) {
      const priority = calculateConversationsPriority(task, data)
      const context = buildConversationsContext(task, data)
      
      recommendations.push({
        task,
        priority,
        context
      })
    }
  }
  
  return recommendations.sort((a, b) => {
    // Brand-specific tasks first
    if (a.context.type === 'brand_specific' && b.context.type !== 'brand_specific') return -1
    if (b.context.type === 'brand_specific' && a.context.type !== 'brand_specific') return 1
    
    // Then by priority
    return b.priority - a.priority
  })
}

function calculateConversationsPriority(task: OptimizationTask, data: any): number {
  let priority = 50
  
  switch (task.id) {
    case 'claim-brand-questions':
      const brandQuestions = data.questions?.filter((q: any) => q.mentions_brand === true) || []
      priority = Math.min(95, 60 + (brandQuestions.length * 2))
      break
      
    case 'create-competitor-comparisons':
      const competitorQuestions = data.questions?.filter((q: any) => q.mentions_competitor === true) || []
      const competitors = new Set(
        competitorQuestions.map((q: any) => q.competitor_name).filter((n: string) => n && n.trim())
      )
      priority = Math.min(90, 60 + (competitors.size * 5))
      break
      
    case 'add-faq-page-schema':
      const categoryQuestions = data.questions?.filter((q: any) => q.score >= 50 && q.mentions_brand === false) || []
      priority = Math.min(85, 55 + (categoryQuestions.length * 2))
      break
      
    case 'create-how-to-guides':
      const howToQuestions = data.questions?.filter((q: any) => q.intent === 'how_to') || []
      priority = Math.min(75, 50 + (howToQuestions.length * 2))
      break
      
    case 'add-pricing-transparency':
      const priceQuestions = data.questions?.filter((q: any) => q.intent === 'price') || []
      priority = Math.min(70, 50 + (priceQuestions.length * 3))
      break
      
    case 'address-trust-concerns':
      const trustQuestions = data.questions?.filter((q: any) => q.intent === 'trust') || []
      priority = Math.min(75, 50 + (trustQuestions.length * 3))
      break
      
    case 'optimize-emerging-topics':
      const emergingQuestions = data.questions?.filter((q: any) => q.emerging === true) || []
      const emergingBrandMentions = emergingQuestions.filter((q: any) => q.mentions_brand === true).length
      priority = Math.min(85, 60 + (emergingBrandMentions * 5) + (emergingQuestions.length * 2))
      break
  }
  
  if (task.impact === 'high') priority += 10
  return Math.min(100, priority)
}

function buildConversationsContext(task: OptimizationTask, data: any): any {
  const context: any = {}
  
  switch (task.id) {
    case 'claim-brand-questions':
      const brandQuestions = data.questions
        ?.filter((q: any) => q.mentions_brand === true)
        .sort((a: any, b: any) => b.score - a.score)
        .map((q: any) => q.question) || []
      context.questions = brandQuestions
      context.count = brandQuestions.length
      context.type = 'brand_specific'
      break
      
    case 'add-faq-page-schema':
      const categoryQuestions = data.questions
        ?.filter((q: any) => q.score >= 50 && q.mentions_brand === false)
        .sort((a: any, b: any) => b.score - a.score)
        .slice(0, 15)
        .map((q: any) => q.question) || []
      context.questions = categoryQuestions
      context.count = categoryQuestions.length
      context.type = 'category_general'
      break
      
    case 'create-competitor-comparisons':
      const competitorQuestions = data.questions
        ?.filter((q: any) => q.mentions_competitor === true)
        .sort((a: any, b: any) => b.score - a.score) || []
      
      const competitors = new Set(
        competitorQuestions
          .map((q: any) => q.competitor_name)
          .filter((name: string) => name && name.trim())
      )
      
      context.questions = competitorQuestions.map((q: any) => q.question)
      context.competitors = Array.from(competitors)
      context.count = competitorQuestions.length
      context.competitor_count = competitors.size
      break
      
    case 'create-how-to-guides':
      const howToQuestions = data.questions
        ?.filter((q: any) => q.intent === 'how_to')
        .sort((a: any, b: any) => b.score - a.score)
        .map((q: any) => q.question) || []
      context.questions = howToQuestions
      context.intents = ['how_to']
      context.count = howToQuestions.length
      break
      
    case 'add-pricing-transparency':
      const priceQuestions = data.questions
        ?.filter((q: any) => q.intent === 'price')
        .sort((a: any, b: any) => b.score - a.score)
        .map((q: any) => q.question) || []
      context.questions = priceQuestions
      context.intents = ['price']
      context.count = priceQuestions.length
      break
      
    case 'address-trust-concerns':
      const trustQuestions = data.questions
        ?.filter((q: any) => q.intent === 'trust')
        .sort((a: any, b: any) => b.score - a.score)
        .map((q: any) => q.question) || []
      context.questions = trustQuestions
      context.intents = ['trust']
      context.count = trustQuestions.length
      break
      
    case 'optimize-emerging-topics':
      const emergingQuestions = data.questions
        ?.filter((q: any) => q.emerging === true)
        .sort((a: any, b: any) => {
          if (a.mentions_brand && !b.mentions_brand) return -1
          if (!a.mentions_brand && b.mentions_brand) return 1
          return b.score - a.score
        })
        .map((q: any) => ({
          question: q.question,
          mentions_brand: q.mentions_brand,
          score: q.score
        })) || []
      
      context.questions = emergingQuestions.map((q: any) => q.question)
      context.brand_mentions = emergingQuestions.filter((q: any) => q.mentions_brand).length
      context.count = emergingQuestions.length
      break
  }
  
  return context
}

// ============================================================================
// WEBSITE ANALYSIS (Placeholder)
// ============================================================================

// ============================================================================
// WEBSITE ANALYSIS
// ============================================================================

export function analyzeWebsiteData(data: any): TaskRecommendation[] {
  const tasks = getTasksForModule('website')
  const recommendations: TaskRecommendation[] = []
  
  console.log('📋 [Website Analyzer] Issues:', data.issues?.length || 0)
  
  for (const task of tasks) {
    if (task.shouldShow(data)) {
      const priority = calculateWebsitePriority(task, data)
      const context = buildWebsiteContext(task, data)
      
      recommendations.push({
        task,
        priority,
        context
      })
    }
  }
  
  return recommendations.sort((a, b) => b.priority - a.priority)
}

function calculateWebsitePriority(task: OptimizationTask, data: any): number {
  let priority = 50
  
  switch (task.id) {
    case 'add-missing-schema':
      const noSchemaIssues = data.issues?.filter((i: any) => i.issue_code === 'no_schema') || []
      priority = Math.min(95, 60 + (noSchemaIssues.length * 0.5))
      break
      
    case 'add-faq-schema-pages':
      const faqIssues = data.issues?.filter((i: any) => i.issue_code === 'missing_faq_schema') || []
      priority = Math.min(90, 70 + (faqIssues.length * 5))
      break
      
    case 'fix-multiple-h1':
      const h1Issues = data.issues?.filter((i: any) => i.issue_code === 'multiple_h1') || []
      priority = Math.min(75, 50 + (h1Issues.length * 0.3))
      break
      
    case 'add-meta-descriptions':
      const metaIssues = data.issues?.filter((i: any) => i.issue_code === 'missing_meta_description') || []
      priority = Math.min(70, 50 + (metaIssues.length * 0.8))
      break
      
    case 'improve-readability':
      const readabilityIssues = data.issues?.filter((i: any) => i.issue_code === 'low_readability') || []
      priority = Math.min(60, 40 + (readabilityIssues.length * 0.1))
      break
  }
  
  if (task.impact === 'high') priority += 10
  return Math.min(100, priority)
}

function buildWebsiteContext(task: OptimizationTask, data: any): any {
  const context: any = {}
  
  switch (task.id) {
    case 'add-missing-schema':
      const noSchemaIssues = data.issues?.filter((i: any) => i.issue_code === 'no_schema') || []
      context.affected_urls = noSchemaIssues.map((i: any) => i.url).slice(0, 20)
      context.count = noSchemaIssues.length
      context.issue_code = 'no_schema'
      break
      
    case 'add-faq-schema-pages':
      const faqIssues = data.issues?.filter((i: any) => i.issue_code === 'missing_faq_schema') || []
      context.affected_urls = faqIssues.map((i: any) => i.url)
      context.count = faqIssues.length
      context.issue_code = 'missing_faq_schema'
      break
      
    case 'fix-multiple-h1':
      const h1Issues = data.issues?.filter((i: any) => i.issue_code === 'multiple_h1') || []
      context.affected_urls = h1Issues.map((i: any) => ({
        url: i.url,
        h1_count: parseInt(i.message?.match(/\d+/)?.[0] || '0')
      })).slice(0, 20)
      context.count = h1Issues.length
      context.issue_code = 'multiple_h1'
      break
      
    case 'add-meta-descriptions':
      const metaIssues = data.issues?.filter((i: any) => i.issue_code === 'missing_meta_description') || []
      context.affected_urls = metaIssues.map((i: any) => i.url).slice(0, 20)
      context.count = metaIssues.length
      context.issue_code = 'missing_meta_description'
      break
      
    case 'improve-readability':
      const readabilityIssues = data.issues?.filter((i: any) => i.issue_code === 'low_readability') || []
      const worstPages = readabilityIssues
        .map((i: any) => ({
          url: i.url,
          score: parseInt(i.message?.match(/score: (\d+)/)?.[1] || '100')
        }))
        .sort((a: { url: string; score: number }, b: { url: string; score: number }) => a.score - b.score)
        .slice(0, 20)
      context.affected_urls = worstPages
      context.count = readabilityIssues.length
      context.issue_code = 'low_readability'
      break
  }
  
  return context
}