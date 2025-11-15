// lib/optimization/generator.ts
// Analyzes scan data and determines which tasks to show

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

export interface TaskRecommendation {
  task: OptimizationTask
  priority: number // 1-100, higher = more urgent
  context: {
    affected_categories?: string[]
    competitor_examples?: string[]
    current_performance?: any
  }
}

/**
 * Analyzes shopping scan data and returns prioritized task recommendations
 */
export function analyzeShoppingData(data: ShoppingAnalysis): TaskRecommendation[] {
  const tasks = getTasksForModule('shopping')
  const recommendations: TaskRecommendation[] = []
  
  for (const task of tasks) {
    if (task.shouldShow(data)) {
      const priority = calculatePriority(task, data)
      const context = buildContext(task, data)
      
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
function calculatePriority(task: OptimizationTask, data: ShoppingAnalysis): number {
  let priority = 50 // Base priority
  
  switch (task.id) {
    case 'add-product-schema':
      // Higher priority if mentions are very low
      if (data.total_mentions < 5) priority = 95
      else if (data.total_mentions < 10) priority = 85
      else priority = 70
      break
      
    case 'enrich-descriptions':
      // Priority based on how many products appear but rank poorly
      const userProducts = data.raw_results?.filter(r => r.is_user_brand) || []
      const avgRank = userProducts.reduce((sum, p) => sum + p.rank, 0) / (userProducts.length || 1)
      if (avgRank > 5) priority = 80
      else if (avgRank > 3) priority = 65
      else priority = 50
      break
      
    case 'add-offers-schema':
      // Medium priority, but higher if product schema likely exists
      priority = data.total_mentions > 10 ? 60 : 45
      break
      
    case 'add-review-schema':
      // Higher if user has some presence but isn't winning
      const userMentions = data.total_mentions
      if (userMentions > 5 && userMentions < 20) priority = 70
      else priority = 55
      break
      
    case 'create-category-pages':
      // High priority if there are obvious gaps
      const missingCategories = findMissingCategories(data)
      priority = Math.min(90, 50 + (missingCategories.length * 10))
      break
  }
  
  // Boost priority for high-impact tasks
  if (task.impact === 'high') priority += 10
  
  return Math.min(100, priority)
}

/**
 * Build contextual information for each task
 */
function buildContext(task: OptimizationTask, data: ShoppingAnalysis): any {
  const context: any = {}
  
  switch (task.id) {
    case 'add-product-schema':
      context.current_mentions = data.total_mentions
      context.affected_categories = data.categories.map(c => c.category)
      break
      
    case 'enrich-descriptions':
      const userProducts = data.raw_results?.filter(r => r.is_user_brand) || []
      context.current_products = userProducts.map(p => ({
        category: p.category,
        rank: p.rank,
        model: p.model
      }))
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

/**
 * Generic task analyzer for other modules (we'll customize these later)
 */
export function analyzeBrandData(data: any): TaskRecommendation[] {
  // Placeholder - we'll build this for Brand module
  return []
}

export function analyzeConversationData(data: any): TaskRecommendation[] {
  // Placeholder - we'll build this for Conversations module
  return []
}

export function analyzeWebsiteData(data: any): TaskRecommendation[] {
  // Placeholder - we'll build this for Website module
  return []
}
