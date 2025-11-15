// apps/web/app/api/scan/latest/route.ts
// FIXED: Added shopping_raw for action items
// Version: 2024-11-15-v4

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { calculateWebsiteMetrics } from '@/lib/scan/website-metrics'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'

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

    console.log('📊 [API v4] Fetching latest scan for dashboard:', dashboardId)

    // Get latest scan for this dashboard - ONLY 'done' scans
    const { data: scan, error: scanError } = await supabase
      .from('scans')
      .select('*')
      .eq('dashboard_id', dashboardId)
      .eq('status', 'done') // CRITICAL: Only get completed scans
      .order('started_at', { ascending: false })
      .limit(1)
      .single()

    if (scanError && scanError.code !== 'PGRST116') {
      console.error('❌ [API] Error fetching scan:', scanError)
      return NextResponse.json({ error: scanError.message }, { status: 500 })
    }

    if (!scan || scanError?.code === 'PGRST116') {
      console.log('⚠️ [API] No completed scans found for this dashboard')
      return NextResponse.json({
        scan: null,
        shopping: { score: 0, total_mentions: 0, categories: [], competitors: [], models: [] },
        shopping_raw: [], // Include empty array for no-scan state
        brand: { visibility_index: 0, descriptors: [], sentiment_breakdown: { positive: 0, neutral: 0, negative: 0 }, total_mentions: 0 },
        conversations: { volume_index: 0, questions: [], intent_breakdown: { how_to: 0, vs: 0, price: 0, trust: 0, features: 0 } },
        website: { readability_score: 0, schema_coverage: 0, issues: [] },
      })
    }

    console.log('✅ [API v4] Found scan:', scan.id, 'Status:', scan.status)

    // Fetch results for each module
    console.log('🔍 [API] Fetching module results...')
    
    const [shoppingResults, brandResults, conversationResults] = await Promise.all([
      supabase.from('results_shopping').select('*').eq('scan_id', scan.id),
      supabase.from('results_brand').select('*').eq('scan_id', scan.id),
      supabase.from('results_conversations').select('*').eq('scan_id', scan.id),
    ])

    console.log('📈 [API] Results counts:')
    console.log('  - Shopping:', shoppingResults.data?.length || 0)
    console.log('  - Brand:', brandResults.data?.length || 0)
    console.log('  - Conversations:', conversationResults.data?.length || 0)

    // Aggregate Shopping data
    const shoppingData = shoppingResults.data || []
    const totalMentions = shoppingData.length
    
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

    const competitorMap = new Map<string, number>()
    shoppingData.forEach((item) => {
      if (item.brand) {
        competitorMap.set(item.brand, (competitorMap.get(item.brand) || 0) + 1)
      }
    })
    
    const competitors = Array.from(competitorMap.entries())
      .map(([brand, mentions]) => ({ brand, mentions }))
      .sort((a, b) => b.mentions - a.mentions)

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
      ? Math.min(100, (totalMentions / Math.max(categories.length, 1)) * 25)
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
    
    console.log('🗣️ [API] Processing conversation data:', conversationData.length, 'rows')
    
    if (conversationData.length > 0) {
      console.log('🗣️ [API] Sample conversation row:', conversationData[0])
    }
    
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

    console.log('🗣️ [API] Conversations transformed:')
    console.log('  - Questions:', questions.length)
    console.log('  - Volume Index:', volumeIndex)
    console.log('  - Intent breakdown:', intentCounts)

    // Aggregate Website data - Use proper metrics calculator
    console.log('🌐 [API] Calculating website metrics...')
    const website = await calculateWebsiteMetrics(supabase, scan.id)
    
    console.log('🌐 [API] Website metrics:', {
      readability: website.readability_score,
      coverage: website.schema_coverage,
      issues: website.issues.length,
    })

    const response = {
      scan,
      shopping: {
        score: Math.round(shoppingScore),
        total_mentions: totalMentions,
        categories,
        competitors,
        models,
      },
      shopping_raw: shoppingData, // ⭐ ADDED: Raw data for action items analyzer
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
      website,
    }

    console.log('✅ [API v4] Returning response with shopping_raw:', shoppingData.length, 'rows')
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('💥 [API] Critical error in GET /api/scan/latest:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}