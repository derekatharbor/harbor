// apps/web/app/api/scan/latest/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Force dynamic rendering - don't pre-render at build time
export const dynamic = 'force-dynamic'

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  return createClient(supabaseUrl, supabaseKey)
}

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    
    const { searchParams } = new URL(req.url)
    const dashboardId = searchParams.get('dashboardId')

    if (!dashboardId) {
      return NextResponse.json(
        { error: 'Dashboard ID is required' },
        { status: 400 }
      )
    }

    // Get latest scan for this dashboard
    const { data: scan, error: scanError } = await supabase
      .from('scans')
      .select('*')
      .eq('dashboard_id', dashboardId)
      .order('started_at', { ascending: false })
      .limit(1)
      .single()

    if (scanError || !scan) {
      // No scans yet - return empty state
      return NextResponse.json({
        scan: null,
        shopping: { score: 0, total_mentions: 0, categories: [], competitors: [], models: [] },
        brand: { visibility_index: 0, descriptors: [], sentiment_breakdown: { positive: 0, neutral: 0, negative: 0 }, total_mentions: 0 },
        conversations: { volume_index: 0, questions: [], intent_breakdown: { how_to: 0, vs: 0, price: 0, trust: 0, features: 0 } },
        website: { readability_score: 0, schema_coverage: 0, issues: [] },
      })
    }

    // Fetch results for each module
    const [shoppingResults, brandResults, conversationResults, websiteResults] = await Promise.all([
      supabase.from('results_shopping').select('*').eq('scan_id', scan.id),
      supabase.from('results_brand').select('*').eq('scan_id', scan.id),
      supabase.from('results_conversations').select('*').eq('scan_id', scan.id),
      supabase.from('results_site').select('*').eq('scan_id', scan.id),
    ])

    // Aggregate Shopping data
    const shoppingData = shoppingResults.data || []
    const totalMentions = shoppingData.length
    
    // Group by category
    const categoryMap = new Map<string, { category: string; mentions: number; bestRank: number }>()
    shoppingData.forEach((item) => {
      const existing = categoryMap.get(item.category) || { category: item.category, mentions: 0, bestRank: 999 }
      categoryMap.set(item.category, {
        category: item.category,
        mentions: existing.mentions + 1,
        bestRank: Math.min(existing.bestRank, item.rank || 999),
      })
    })
    
    const categories = Array.from(categoryMap.values())
      .map(c => ({ category: c.category, rank: c.bestRank, mentions: c.mentions }))
      .sort((a, b) => b.mentions - a.mentions)

    // Group by competitor
    const competitorMap = new Map<string, number>()
    shoppingData.forEach((item) => {
      if (item.brand) {
        competitorMap.set(item.brand, (competitorMap.get(item.brand) || 0) + 1)
      }
    })
    
    const competitors = Array.from(competitorMap.entries())
      .map(([brand, mentions]) => ({ brand, mentions }))
      .sort((a, b) => b.mentions - a.mentions)

    // Group by model
    const modelMap = new Map<string, number>()
    shoppingData.forEach((item) => {
      if (item.model) {
        modelMap.set(item.model, (modelMap.get(item.model) || 0) + 1)
      }
    })
    
    const models = Array.from(modelMap.entries())
      .map(([model, mentions]) => ({ model, mentions }))
      .sort((a, b) => b.mentions - a.mentions)

    const shoppingScore = totalMentions > 0 
      ? Math.min(100, (totalMentions / categories.length) * 25)
      : 0

    // Aggregate Brand data
    const brandData = brandResults.data || []
    const descriptors = brandData.map((d) => ({
      word: d.descriptor,
      sentiment: d.sentiment,
      weight: d.weight || 1,
    }))
    
    const sentimentCounts = { positive: 0, neutral: 0, negative: 0 }
    brandData.forEach((d) => {
      if (d.sentiment === 'pos') sentimentCounts.positive++
      else if (d.sentiment === 'neu') sentimentCounts.neutral++
      else if (d.sentiment === 'neg') sentimentCounts.negative++
    })
    
    const totalSentiments = sentimentCounts.positive + sentimentCounts.neutral + sentimentCounts.negative
    const sentimentBreakdown = {
      positive: totalSentiments > 0 ? Math.round((sentimentCounts.positive / totalSentiments) * 100) : 0,
      neutral: totalSentiments > 0 ? Math.round((sentimentCounts.neutral / totalSentiments) * 100) : 0,
      negative: totalSentiments > 0 ? Math.round((sentimentCounts.negative / totalSentiments) * 100) : 0,
    }
    
    const totalWeightedMentions = brandData.reduce((sum, d) => sum + (d.weight || 1), 0)
    const visibilityIndex = totalWeightedMentions > 0 
      ? Math.min(100, totalWeightedMentions * 5)
      : 0

    // Aggregate Conversation data
    const conversationData = conversationResults.data || []
    const questions = conversationData.map((q) => ({
      question: q.question,
      intent: q.intent,
      score: q.score || 1,
      emerging: q.emerging || false,
    }))
    
    const intentCounts = { how_to: 0, vs: 0, price: 0, trust: 0, features: 0 }
    conversationData.forEach((q) => {
      const intent = q.intent as keyof typeof intentCounts
      if (intent in intentCounts) {
        intentCounts[intent]++
      }
    })
    
    const volumeIndex = conversationData.reduce((sum, q) => sum + (q.score || 1), 0)

    // Aggregate Website data
    const websiteData = websiteResults.data || []
    const issues = websiteData.map((issue) => ({
      url: issue.url,
      code: issue.issue_code,
      severity: issue.severity,
      message: issue.details?.message || 'No details available',
      schema_found: issue.schema_found || false,
    }))
    
    const totalIssues = issues.length
    const highSeverity = issues.filter(i => i.severity === 'high').length
    const readabilityScore = Math.max(0, 100 - (highSeverity * 20) - (totalIssues * 5))
    
    const pagesWithSchema = issues.filter(i => i.schema_found).length
    const totalPages = Math.max(issues.length, 1)
    const schemaCoverage = Math.round((pagesWithSchema / totalPages) * 100)

    return NextResponse.json({
      scan,
      shopping: {
        score: Math.round(shoppingScore),
        total_mentions: totalMentions,
        categories,
        competitors,
        models,
      },
      brand: {
        visibility_index: Math.round(visibilityIndex),
        descriptors,
        sentiment_breakdown: sentimentBreakdown,
        total_mentions: brandData.length,
      },
      conversations: {
        volume_index: Math.round(volumeIndex),
        questions,
        intent_breakdown: intentCounts,
      },
      website: {
        readability_score: Math.round(readabilityScore),
        schema_coverage: schemaCoverage,
        issues,
      },
    })
  } catch (error) {
    console.error('Error in GET /api/scan/latest:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}