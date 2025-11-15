// lib/optimization/tasks.ts
// Pre-defined optimization tasks with trigger logic

export type TaskImpact = 'high' | 'medium' | 'low'
export type TaskDifficulty = 'easy' | 'medium' | 'hard'
export type TaskModule = 'shopping' | 'brand' | 'conversations' | 'website'

export interface OptimizationTask {
  id: string
  module: TaskModule
  title: string
  description: string
  impact: TaskImpact
  difficulty: TaskDifficulty
  icon: string // lucide-react icon name
  
  // Modal content
  whyMatters: string
  whatToDo: string[]
  whereToDoIt: string[]
  
  // Actions
  hasGenerator: boolean
  hasValidator: boolean
  generatorEndpoint?: string
  validatorEndpoint?: string
  
  // Trigger logic
  shouldShow: (data: any) => boolean
}

// ============================================================================
// SHOPPING VISIBILITY TASKS
// ============================================================================

export const SHOPPING_TASKS: OptimizationTask[] = [
  {
    id: 'add-product-schema',
    module: 'shopping',
    title: 'Add Product Schema',
    description: 'Help AI models understand your products with structured data',
    impact: 'high',
    difficulty: 'easy',
    icon: 'ShoppingBag',
    
    whyMatters: 'AI models like ChatGPT, Claude, and Gemini need structured data to understand your products. Without Product schema, they can\'t reliably surface your products in shopping recommendations. This is the #1 factor in AI visibility.',
    
    whatToDo: [
      'We\'ll generate a Product JSON-LD snippet for each of your products',
      'This code tells AI exactly what you sell, pricing, ratings, and availability',
      'It\'s a simple copy/paste—no coding required'
    ],
    
    whereToDoIt: [
      'Open your product page template in your CMS (Shopify, WordPress, etc.)',
      'Find the <head> section of your HTML',
      'Paste the generated code before the closing </head> tag',
      'Save and publish the changes',
      'Repeat for each product type or use a template variable'
    ],
    
    hasGenerator: true,
    hasValidator: true,
    generatorEndpoint: '/api/gen/product-schema',
    validatorEndpoint: '/api/validate/schema',
    
    shouldShow: (data) => {
      // Show if user has low rankings or few mentions
      const userMentions = data.total_mentions || 0
      const avgRank = data.categories?.reduce((sum: number, cat: any) => sum + cat.rank, 0) / (data.categories?.length || 1)
      return userMentions < 10 || avgRank > 3
    }
  },
  
  {
    id: 'enrich-descriptions',
    module: 'shopping',
    title: 'Enrich Product Descriptions',
    description: 'Rewrite product descriptions to be AI-readable and compelling',
    impact: 'high',
    difficulty: 'medium',
    icon: 'FileText',
    
    whyMatters: 'AI models scan your product descriptions to understand what you sell and who it\'s for. Marketing fluff and jargon confuse them. Clear, factual descriptions with use cases help AI recommend your products accurately.',
    
    whatToDo: [
      'We\'ll generate 120-150 word descriptions for your key products',
      'These are written specifically for AI comprehension',
      'They focus on: what it is, who it\'s for, key features, and use cases'
    ],
    
    whereToDoIt: [
      'Copy the generated description',
      'Go to your product page in your CMS',
      'Add a new section called "Overview" or "About This Product"',
      'Paste the description above or below your existing content',
      'You can keep your marketing copy—this is supplemental'
    ],
    
    hasGenerator: true,
    hasValidator: false,
    generatorEndpoint: '/api/gen/product-description',
    
    shouldShow: (data) => {
      // Show if user brand appears but with low confidence or weak positioning
      const userProducts = data.raw_results?.filter((r: any) => r.is_user_brand) || []
      return userProducts.length > 0 && userProducts.length < 5
    }
  },
  
  {
    id: 'add-offers-schema',
    module: 'shopping',
    title: 'Add Pricing & Availability Schema',
    description: 'Make your prices and stock status visible to AI',
    impact: 'medium',
    difficulty: 'easy',
    icon: 'DollarSign',
    
    whyMatters: 'When users ask "What\'s the best affordable option?" or "What\'s in stock?", AI needs your pricing and availability data. The Offers schema tells AI your current price, currency, and whether the product is available.',
    
    whatToDo: [
      'We\'ll generate an Offers schema snippet',
      'This includes price, currency, availability status, and valid dates',
      'It goes inside your existing Product schema'
    ],
    
    whereToDoIt: [
      'Open the Product schema you added earlier (or we can combine them)',
      'Add the "offers" property inside your Product object',
      'Paste the generated Offers snippet',
      'Make sure your price updates automatically if you use dynamic pricing'
    ],
    
    hasGenerator: true,
    hasValidator: true,
    generatorEndpoint: '/api/gen/product-schema', // Use same endpoint
    validatorEndpoint: '/api/validate/schema',
    
    shouldShow: (data) => {
      // Always show after product schema is added
      return true
    }
  },
  
  {
    id: 'add-review-schema',
    module: 'shopping',
    title: 'Add Review & Rating Schema',
    description: 'Surface your product ratings and customer reviews to AI',
    impact: 'medium',
    difficulty: 'medium',
    icon: 'Star',
    
    whyMatters: 'AI models heavily weight customer reviews and ratings when making recommendations. If you have 4.8 stars and 500 reviews but no schema, AI doesn\'t know. Review schema surfaces your social proof.',
    
    whatToDo: [
      'We\'ll generate a Review and AggregateRating schema',
      'This shows your average rating, total reviews, and individual review highlights',
      'You\'ll need at least a few real customer reviews to use this'
    ],
    
    whereToDoIt: [
      'Add the "aggregateRating" and "review" properties to your Product schema',
      'Paste the generated snippets',
      'If you use a review platform (Yotpo, Trustpilot, etc.), connect their schema too',
      'Keep this updated as new reviews come in'
    ],
    
    hasGenerator: true,
    hasValidator: true,
    generatorEndpoint: '/api/gen/review-schema',
    validatorEndpoint: '/api/validate/schema',
    
    shouldShow: (data) => {
      // Show if user has products but isn't ranking well
      const avgRank = data.categories?.reduce((sum: number, cat: any) => sum + cat.rank, 0) / (data.categories?.length || 1)
      return avgRank > 2
    }
  },
  
  {
    id: 'create-category-pages',
    module: 'shopping',
    title: 'Create Missing Category Pages',
    description: 'Build landing pages for categories where you should appear but don\'t',
    impact: 'high',
    difficulty: 'hard',
    icon: 'Layout',
    
    whyMatters: 'AI finds you by scanning category-specific pages. If you sell "payment APIs" but only have a generic "products" page, AI won\'t surface you when users ask about payment solutions. Dedicated category pages give AI clear signals.',
    
    whatToDo: [
      'We\'ll identify categories where competitors appear but you don\'t',
      'For each, we\'ll suggest a page structure and headline copy',
      'You\'ll need to create actual pages in your CMS—this is more work but high impact'
    ],
    
    whereToDoIt: [
      'Create a new page in your CMS for each missing category',
      'Use our suggested URL structure: /products/[category-name]',
      'Add a clear H1 headline with the category name',
      'List relevant products with descriptions',
      'Add breadcrumb schema so AI understands the hierarchy'
    ],
    
    hasGenerator: true,
    hasValidator: false,
    generatorEndpoint: '/api/gen/category-page',
    
    shouldShow: (data) => {
      // Show if there are categories where competitors appear but user doesn't
      const allCategories = new Set(data.categories?.map((c: any) => c.category) || [])
      const userCategories = new Set(
        data.raw_results?.filter((r: any) => r.is_user_brand).map((r: any) => r.category) || []
      )
      return allCategories.size > userCategories.size
    }
  }
]

// ============================================================================
// BRAND VISIBILITY TASKS (Placeholder - we'll build these next)
// ============================================================================

export const BRAND_TASKS: OptimizationTask[] = [
  // We'll add these when we build the Brand module
]

// ============================================================================
// CONVERSATION VOLUME TASKS (Placeholder)
// ============================================================================

export const CONVERSATION_TASKS: OptimizationTask[] = [
  // We'll add these when we build the Conversations module
]

// ============================================================================
// WEBSITE ANALYTICS TASKS (Placeholder)
// ============================================================================

export const WEBSITE_TASKS: OptimizationTask[] = [
  // We'll add these when we build the Website module
]

// ============================================================================
// TASK REGISTRY
// ============================================================================

export const ALL_TASKS: OptimizationTask[] = [
  ...SHOPPING_TASKS,
  ...BRAND_TASKS,
  ...CONVERSATION_TASKS,
  ...WEBSITE_TASKS
]

export function getTaskById(taskId: string): OptimizationTask | undefined {
  return ALL_TASKS.find(task => task.id === taskId)
}

export function getTasksForModule(module: TaskModule): OptimizationTask[] {
  switch (module) {
    case 'shopping':
      return SHOPPING_TASKS
    case 'brand':
      return BRAND_TASKS
    case 'conversations':
      return CONVERSATION_TASKS
    case 'website':
      return WEBSITE_TASKS
    default:
      return []
  }
}