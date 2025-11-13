// app/api/scan/latest/route.ts
// Returns aggregated scan data formatted for dashboard pages

export const runtime = 'nodejs'

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get current user
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's dashboard
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('org_id')
      .eq('user_id', session.user.id)
      .single()

    if (!userRole?.org_id) {
      return NextResponse.json({ hasScans: false })
    }

    const { data: dashboard } = await supabase
      .from('dashboards')
      .select('id, brand_name, metadata')
      .eq('org_id', userRole.org_id)
      .single()

    if (!dashboard) {
      return NextResponse.json({ hasScans: false })
    }

    // Get latest completed scan
    const { data: scan } = await supabase
      .from('scans')
      .select('id, status, started_at, finished_at, type')
      .eq('dashboard_id', dashboard.id)
      .in('status', ['done', 'partial'])
      .order('finished_at', { ascending: false })
      .limit(1)
      .single()

    if (!scan) {
      return NextResponse.json({ hasScans: false })
    }

    // Get all results for this scan
    const [shoppingResults, brandResults, conversationResults, siteResults] = await Promise.all([
      supabase
        .from('results_shopping')
        .select('*')
        .eq('scan_id', scan.id),
      
      supabase
        .from('results_brand')
        .select('*')
        .eq('scan_id', scan.id),
      
      supabase
        .from('results_conversations')
        .select('*')
        .eq('scan_id', scan.id),
      
      supabase
        .from('results_site')
        .select('*')
        .eq('scan_id', scan.id),
    ])

    // ========================================================================
    // AGGREGATE SHOPPING DATA
    // ========================================================================
    const shopping = aggregateShoppingData(
      shoppingResults.data || [],
      dashboard.brand_name,
      dashboard.metadata
    )

    // ========================================================================
    // AGGREGATE BRAND DATA
    // ========================================================================
    const brand = aggregateBrandData(brandResults.data || [])

    // ========================================================================
    // AGGREGATE CONVERSATION DATA
    // ========================================================================
    const conversations = aggregateConversationData(conversationResults.data || [])

    // ========================================================================
    // AGGREGATE WEBSITE DATA
    // ========================================================================
    const website = aggregateWebsiteData(siteResults.data || [])

    return NextResponse.json({
      hasScans: true,
      last_scan: scan.finished_at,
      scan_id: scan.id,
      dashboard: {
        id: dashboard.id,
        brand_name: dashboard.brand_name,
      },
      shopping,
      brand,
      conversations,
      website,
    })

  } catch (error: any) {
    console.error('Latest scan fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch scan data' },
      { status: 500 }
    )
  }
}

// ============================================================================
// AGGREGATION FUNCTIONS
// ============================================================================

function aggregateShoppingData(results: any[], userBrand: string, metadata: any) {
  if (results.length === 0) {
    return {
      shopping_visibility: 0,
      total_mentions: 0,
      categories: [],
      competitors: [],
      models: [],
    }
  }

  // Count total mentions of user's brand
  const userMentions = results.filter(r => 
    r.brand?.toLowerCase() === userBrand.toLowerCase()
  )

  // Group by category
  const categoryMap = new Map<string, any>()
  
  userMentions.forEach(result => {
    const category = result.category
    
    if (!categoryMap.has(category)) {
      categoryMap.set(category, {
        name: category,
        mentions: 0,
        models: new Set<string>(),
        ranks: [],
      })
    }
    
    const cat = categoryMap.get(category)
    cat.mentions++
    cat.models.add(result.model)
    cat.ranks.push(result.rank)
  })

  // Format categories
  const categories = Array.from(categoryMap.values())
    .map(cat => ({
      name: cat.name,
      rank: Math.round(cat.ranks.reduce((a: number, b: number) => a + b, 0) / cat.ranks.length),
      mentions: cat.mentions,
      models: Array.from(cat.models),
      trend: 'stable' as const, // TODO: Compare with previous scan
    }))
    .sort((a, b) => b.mentions - a.mentions)

  // Aggregate competitors
  const competitorMap = new Map<string, any>()
  
  results.forEach(result => {
    const brand = result.brand
    
    if (!competitorMap.has(brand)) {
      competitorMap.set(brand, {
        brand,
        mentions: 0,
        ranks: [],
      })
    }
    
    const comp = competitorMap.get(brand)
    comp.mentions++
    comp.ranks.push(result.rank)
  })

  const competitors = Array.from(competitorMap.values())
    .map(comp => ({
      brand: comp.brand,
      mentions: comp.mentions,
      avg_rank: Number((comp.ranks.reduce((a: number, b: number) => a + b, 0) / comp.ranks.length).toFixed(1)),
      isUser: comp.brand.toLowerCase() === userBrand.toLowerCase(),
    }))
    .sort((a, b) => {
      // User brand first, then by mentions
      if (a.isUser) return -1
      if (b.isUser) return 1
      return b.mentions - a.mentions
    })
    .slice(0, 7) // Top 7

  // Aggregate by model
  const modelMap = new Map<string, any>()
  
  userMentions.forEach(result => {
    const model = result.model
    
    if (!modelMap.has(model)) {
      modelMap.set(model, {
        name: formatModelName(model),
        mentions: 0,
      })
    }
    
    modelMap.get(model).mentions++
  })

  const totalPossibleMentions = categoryMap.size * 3 // Assuming 3 models queried per category
  
  const models = Array.from(modelMap.values()).map(m => ({
    name: m.name,
    mentions: m.mentions,
    coverage: Math.round((m.mentions / Math.max(totalPossibleMentions, 1)) * 100),
  }))

  // Calculate visibility score
  const avgRank = userMentions.length > 0
    ? userMentions.reduce((sum, r) => sum + r.rank, 0) / userMentions.length
    : 0
  
  // Score formula: (mentions / total results) * (1 / avg_rank) * 100
  const visibility_score = userMentions.length > 0
    ? Math.min(100, Math.round(
        (userMentions.length / results.length) * (1 / Math.max(avgRank, 1)) * 100
      ))
    : 0

  return {
    shopping_visibility: visibility_score,
    total_mentions: userMentions.length,
    categories,
    competitors,
    models,
  }
}

function aggregateBrandData(results: any[]) {
  if (results.length === 0) {
    return {
      visibility_index: 0,
      descriptors: [],
      sentiment_breakdown: { positive: 0, neutral: 0, negative: 0 },
    }
  }

  // Group descriptors
  const descriptorMap = new Map<string, any>()
  
  results.forEach(result => {
    const desc = result.descriptor.toLowerCase()
    
    if (!descriptorMap.has(desc)) {
      descriptorMap.set(desc, {
        word: result.descriptor,
        sentiment: result.sentiment,
        count: 0,
        weight: 0,
      })
    }
    
    const d = descriptorMap.get(desc)
    d.count++
    d.weight += result.weight || 1
  })

  const descriptors = Array.from(descriptorMap.values())
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 20) // Top 20

  // Sentiment breakdown
  const sentiment_breakdown = {
    positive: results.filter(r => r.sentiment === 'pos').length,
    neutral: results.filter(r => r.sentiment === 'neu').length,
    negative: results.filter(r => r.sentiment === 'neg').length,
  }

  // Visibility index (mentions × prominence × sentiment ratio)
  const total = sentiment_breakdown.positive + sentiment_breakdown.neutral + sentiment_breakdown.negative
  const sentimentScore = total > 0
    ? (sentiment_breakdown.positive * 1 + sentiment_breakdown.neutral * 0.5 - sentiment_breakdown.negative * 0.5) / total
    : 0
  
  const visibility_index = Math.max(0, Math.min(100, Math.round(
    (results.length / 50) * sentimentScore * 100
  )))

  return {
    visibility_index,
    descriptors,
    sentiment_breakdown,
  }
}

function aggregateConversationData(results: any[]) {
  if (results.length === 0) {
    return {
      conversation_volume: 0,
      questions: [],
      intent_breakdown: {},
    }
  }

  // Sort by score
  const questions = results
    .sort((a, b) => b.score - a.score)
    .slice(0, 25) // Top 25
    .map(q => ({
      question: q.question,
      intent: q.intent,
      score: q.score,
      emerging: q.emerging,
    }))

  // Intent breakdown
  const intent_breakdown: Record<string, number> = {}
  results.forEach(q => {
    intent_breakdown[q.intent] = (intent_breakdown[q.intent] || 0) + 1
  })

  // Volume calculation (relative index)
  const conversation_volume = Math.min(100, Math.round((results.length / 25) * 100))

  return {
    conversation_volume,
    questions,
    intent_breakdown,
  }
}

function aggregateWebsiteData(results: any[]) {
  if (results.length === 0) {
    return {
      readability_score: 100,
      issues: [],
      schema_coverage: 100,
    }
  }

  // Group by severity
  const issues = results.map(r => ({
    url: r.url,
    code: r.issue_code,
    severity: r.severity,
    message: r.details?.message || 'Issue detected',
    schema_found: r.schema_found,
  }))

  const high = issues.filter(i => i.severity === 'high').length
  const med = issues.filter(i => i.severity === 'med').length
  const low = issues.filter(i => i.severity === 'low').length

  // Calculate scores
  const readability_score = Math.max(0, 100 - (high * 15 + med * 8 + low * 3))
  const schema_coverage = Math.max(0, 100 - (high * 20))

  return {
    readability_score,
    schema_coverage,
    issues,
  }
}

function formatModelName(model: string): string {
  const mapping: Record<string, string> = {
    gpt: 'ChatGPT',
    claude: 'Claude',
    gemini: 'Gemini',
    perplexity: 'Perplexity',
  }
  return mapping[model] || model
}