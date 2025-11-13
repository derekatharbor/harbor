// lib/prompts.ts
// Enhanced prompt templates for Harbor v1 with competitor data collection

interface BrandMetadata {
  brandName: string
  domain: string
  category: string
  products?: string[]
  competitors?: string[]
}

// ============================================================================
// SHOPPING VISIBILITY PROMPTS
// ============================================================================

export function getShoppingPrompts(metadata: BrandMetadata): Array<{ prompt: string; category: string; model: string }> {
  const { brandName, category, products = [] } = metadata
  
  // Generate category-specific shopping prompts
  const categories = [
    category,
    ...products.slice(0, 3).map(p => `${p} category`),
  ].filter(Boolean)

  const prompts: Array<{ prompt: string; category: string; model: string }> = []
  
  // For each category, create multiple query variations
  categories.forEach(cat => {
    const variations = [
      `What are the best ${cat} for small businesses?`,
      `Top ${cat} recommendations for enterprises`,
      `Most popular ${cat} in 2024`,
      `${cat} comparison and reviews`,
    ]

    variations.forEach(query => {
      prompts.push({
        category: cat,
        model: 'all', // Will run on all models
        prompt: `A shopper asks: "${query}"

Please provide a ranked list of product recommendations. Include ALL major brands and products that would be recommended, not just one specific brand.

Return ONLY a JSON array with this exact structure (no markdown, no explanations):
[
  {
    "rank": 1,
    "brand": "Brand Name",
    "product": "Product Name",
    "reason": "Brief reason for recommendation"
  }
]

Include at least 5-8 different brands/products in your response, ranked by relevance to the query.`
      })
    })
  })

  // Return first 6 prompts to keep costs reasonable but get good coverage
  return prompts.slice(0, 6)
}

// ============================================================================
// BRAND VISIBILITY PROMPTS
// ============================================================================

export function getBrandPrompts(metadata: BrandMetadata): Array<{ prompt: string; model: string }> {
  const { brandName, category } = metadata

  return [
    {
      model: 'all',
      prompt: `Please analyze the brand "${brandName}" in the ${category} space.

Provide a comprehensive brand analysis with the following structure. Return ONLY valid JSON (no markdown, no code blocks):

{
  "summary": "2-3 sentence overview of what this brand is known for",
  "descriptors": [
    {"word": "innovative", "sentiment": "pos"},
    {"word": "expensive", "sentiment": "neg"},
    {"word": "reliable", "sentiment": "pos"}
  ],
  "competitors": [
    "Competitor 1",
    "Competitor 2",
    "Competitor 3",
    "Competitor 4",
    "Competitor 5"
  ],
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "marketPosition": "Brief description of market position"
}

Include 8-10 descriptors with varied sentiments (pos/neg/neu), and list 5 direct competitors.`
    },
    {
      model: 'all',
      prompt: `How is "${brandName}" typically mentioned or recommended in the context of ${category}? 

Return ONLY valid JSON with this structure:
{
  "mentionFrequency": "high" | "medium" | "low",
  "commonContexts": ["context 1", "context 2", "context 3"],
  "associatedTerms": ["term 1", "term 2", "term 3"],
  "competitorComparisons": [
    {
      "competitor": "Competitor Name",
      "comparisonContext": "How they're compared"
    }
  ]
}`
    }
  ]
}

// ============================================================================
// CONVERSATION VOLUME PROMPTS
// ============================================================================

export function getConversationPrompts(metadata: BrandMetadata): Array<{ prompt: string; model: string }> {
  const { brandName, category, competitors = [] } = metadata

  const prompts = [
    {
      model: 'all',
      prompt: `What are the most common questions users ask about ${category} and "${brandName}" specifically?

List 20-25 realistic questions that users might ask. Return ONLY valid JSON:

[
  {
    "question": "The actual question text",
    "intent": "how_to" | "vs" | "price" | "trust" | "features",
    "frequency": "high" | "medium" | "low",
    "mentionsBrand": true | false
  }
]

Include a mix of general category questions and brand-specific questions. Tag each with the appropriate intent.`
    }
  ]

  // Add competitor comparison prompts
  if (competitors.length > 0) {
    competitors.slice(0, 3).forEach(competitor => {
      prompts.push({
        model: 'all',
        prompt: `What questions do users ask when comparing "${brandName}" vs "${competitor}"?

Return ONLY valid JSON with this structure:
[
  {
    "question": "Question text",
    "intent": "vs" | "price" | "features" | "trust",
    "favors": "${brandName}" | "${competitor}" | "neutral"
  }
]

Include 5-8 realistic comparison questions.`
      })
    })
  }

  return prompts.slice(0, 4) // Keep it to 4 prompts max
}

// ============================================================================
// PROMPT EXECUTION HELPER
// ============================================================================

export interface PromptConfig {
  system?: string
  user: string
  maxTokens: number
  temperature?: number
}

export function buildPromptConfig(prompt: string, type: 'shopping' | 'brand' | 'conversations'): PromptConfig {
  const configs = {
    shopping: {
      system: 'You are a product recommendation analyst. You provide ranked lists of products based on consumer queries. Always return valid JSON arrays with no additional commentary.',
      maxTokens: 1000,
      temperature: 0.3,
    },
    brand: {
      system: 'You are a brand perception analyst. You analyze how brands are perceived and positioned in their markets. Always return valid JSON with no additional commentary.',
      maxTokens: 1500,
      temperature: 0.4,
    },
    conversations: {
      system: 'You are a consumer question analyst. You identify common questions and intents that users have about products and brands. Always return valid JSON arrays with no additional commentary.',
      maxTokens: 1200,
      temperature: 0.4,
    },
  }

  const config = configs[type]
  
  return {
    system: config.system,
    user: prompt,
    maxTokens: config.maxTokens,
    temperature: config.temperature,
  }
}

// ============================================================================
// SCORING HELPERS
// ============================================================================

export function calculateVisibilityScore(mentions: any[]): number {
  if (mentions.length === 0) return 0
  
  // Calculate based on rank positions and frequency
  const totalMentions = mentions.length
  const avgRank = mentions.reduce((sum, m) => sum + (m.rank || 10), 0) / totalMentions
  const topThreeMentions = mentions.filter(m => m.rank <= 3).length
  
  // Score formula: (mentions * 10) + (top-3 mentions * 20) - (avgRank * 5)
  const score = Math.min(100, Math.max(0, 
    (totalMentions * 10) + (topThreeMentions * 20) - (avgRank * 5)
  ))
  
  return Math.round(score * 10) / 10
}

export function calculateBrandVisibilityIndex(data: {
  totalMentions: number
  avgSentiment: number // -1 to 1
  competitorMentions: number
}): number {
  const { totalMentions, avgSentiment, competitorMentions } = data
  
  // Index formula: mentions × (1 + sentiment) × (1 / (1 + competitors/10))
  const sentimentBoost = 1 + (avgSentiment * 0.5)
  const competitorPenalty = 1 / (1 + (competitorMentions / 10))
  
  const index = totalMentions * sentimentBoost * competitorPenalty
  
  return Math.round(Math.min(100, index))
}

export function calculateConversationVolume(questions: any[]): number {
  // Simple volume index based on question count and brand-specific ratio
  const total = questions.length
  const brandSpecific = questions.filter(q => q.mentionsBrand).length
  const highFrequency = questions.filter(q => q.frequency === 'high').length
  
  const volume = (total * 5) + (brandSpecific * 10) + (highFrequency * 15)
  
  return Math.min(100, volume)
}
