// apps/web/app/api/scan/latest/route.ts
// UPDATED: Uses new meaningful visibility scoring system
// Version: 2024-11-25-v5

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { calculateWebsiteMetrics } from '@/lib/scan/website-metrics'
import {
  calculateVisibilityScore,
  calculateBrandVisibilityScore,
  calculateWebsiteReadinessScore,
  calculateHarborScore,
  type ShoppingData,
  type BrandData,
  type WebsiteData
} from '@/lib/scoring/visibility-score'

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

    console.log('📊 [API v5] Fetching latest scan for dashboard:', dashboardId)

    // Get latest scan for this dashboard - ONLY 'done' scans
    const { data: scan, error: scanError } = await supabase
      .from('scans')
      .select('*')
      .eq('dashboard_id', dashboardId)
      .eq('status', 'done')
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
        shopping: { 
          score: 0, 
          total_mentions: 0, 
          categories: [], 
          competitors: [], 
          models: [],
          breakdown: null
        },
        shopping_raw: [],
        brand: { 
          visibility_index: 0, 
          descriptors: [], 
          sentiment_breakdown: { positive: 0, neutral: 0, negative: 0 }, 
          total_mentions: 0,
          breakdown: null
        },
        conversations: { 
          volume_index: 0, 
          questions: [], 
          intent_breakdown: { how_to: 0, vs: 0, price: 0, trust: 0, features: 0 } 
        },
        website: { 
          readability_score: 0, 
          schema_coverage: 0, 
          issues: [],
          breakdown: null
        },
        harbor_score: null
      })
    }

    console.log('✅ [API v5] Found scan:', scan.id, 'Status:', scan.status)

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

    // ============================================
    // PROCESS SHOPPING DATA
    // ============================================
    const shoppingData = shoppingResults.data || []
    
    // Count user mentions vs competitor mentions
    const userMentions = shoppingData.filter(d => d.is_user_brand === true).length
    const totalMentions = shoppingData.length
    
    // Build category data
    const categoryMap = new Map<string, { rank: number; mentions: number }>()
    shoppingData.forEach(item => {
      if (item.category) {
        const existing = categoryMap.get(item.category)
        if (existing) {
          existing.mentions++
          // Keep best (lowest) rank
          if (item.rank && item.rank < existing.rank) {
            existing.rank = item.rank
          }
        } else {
          categoryMap.set(item.category, { rank: item.rank || 3, mentions: 1 })
        }
      }
    })
    
    const categories = Array.from(categoryMap.entries())
      .map(([category, data]) => ({ category, rank: data.rank, mentions: data.mentions }))
      .sort((a, b) => a.rank - b.rank)

    // Build competitor data
    const competitorMap = new Map<string, number>()
    shoppingData.forEach(item => {
      if (item.brand && !item.is_user_brand) {
        competitorMap.set(item.brand, (competitorMap.get(item.brand) || 0) + 1)
      }
    })
    
    const competitors = Array.from(competitorMap.entries())
      .map(([brand, mentions]) => ({ brand, mentions }))
      .sort((a, b) => b.mentions - a.mentions)

    // Build model data
    const modelMap = new Map<string, number>()
    shoppingData.forEach(item => {
      if (item.model) {
        modelMap.set(item.model, (modelMap.get(item.model) || 0) + 1)
      }
    })
    
    const models = Array.from(modelMap.entries())
      .map(([model, mentions]) => ({ model, mentions }))
      .sort((a, b) => b.mentions - a.mentions)

    // Calculate MEANINGFUL shopping visibility score
    const shoppingInput: ShoppingData = {
      total_mentions: userMentions,
      categories,
      models,
      competitors,
      raw_results: shoppingData.map(d => ({
        brand: d.brand,
        model: d.model,
        category: d.category,
        rank: d.rank || 3,
        is_user_brand: d.is_user_brand || false
      }))
    }
    
    const shoppingBreakdown = calculateVisibilityScore(shoppingInput)
    console.log('🛒 [API] Shopping visibility breakdown:', shoppingBreakdown)

    // ============================================
    // PROCESS BRAND DATA
    // ============================================
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

    // Calculate MEANINGFUL brand visibility score
    const brandInput: BrandData = {
      descriptors,
      sentiment_breakdown: sentimentCounts,
      total_mentions: brandData.length
    }
    
    const brandBreakdown = calculateBrandVisibilityScore(brandInput)
    console.log('⭐ [API] Brand visibility breakdown:', brandBreakdown)

    // ============================================
    // PROCESS CONVERSATIONS DATA
    // ============================================
    const conversationData = conversationResults.data || []
    const questions = conversationData.map(q => ({
      question: q.question,
      intent: q.intent,
      score: q.score || 1,
      emerging: q.emerging || false,
    }))

    const intentCounts = { how_to: 0, vs: 0, price: 0, trust: 0, features: 0 }
    conversationData.forEach(q => {
      const intent = q.intent as keyof typeof intentCounts
      if (intent in intentCounts) {
        intentCounts[intent]++
      }
    })

    const volumeIndex = conversationData.reduce((sum, q) => sum + (q.score || 1), 0)

    // ============================================
    // PROCESS WEBSITE DATA
    // ============================================
    console.log('🌐 [API] Calculating website metrics...')
    const websiteMetrics = await calculateWebsiteMetrics(supabase, scan.id)
    
    // Calculate MEANINGFUL website readiness score
    const websiteInput: WebsiteData = {
      pages_analyzed: new Set(websiteMetrics.issues.map(i => i.url)).size,
      schema_coverage: websiteMetrics.schema_coverage,
      issues: websiteMetrics.issues.map(i => ({ severity: i.severity, code: i.code })),
      readability_score: websiteMetrics.readability_score
    }
    
    const websiteBreakdown = calculateWebsiteReadinessScore(websiteInput)
    console.log('🌐 [API] Website readiness breakdown:', websiteBreakdown)

    // ============================================
    // CALCULATE OVERALL HARBOR SCORE
    // ============================================
    const harborScoreData = calculateHarborScore(shoppingInput, brandInput, websiteInput)
    console.log('🏆 [API] Harbor Score:', harborScoreData.harbor_score)

    // ============================================
    // BUILD RESPONSE
    // ============================================
    const response = {
      scan,
      shopping: {
        score: shoppingBreakdown.total,
        total_mentions: userMentions,
        categories,
        competitors,
        models,
        breakdown: shoppingBreakdown
      },
      shopping_raw: shoppingData,
      brand: {
        visibility_index: brandBreakdown.total,
        descriptors,
        sentiment_breakdown: sentimentBreakdown,
        total_mentions: brandData.length,
        breakdown: brandBreakdown
      },
      conversations: {
        volume_index: Math.round(volumeIndex),
        questions,
        intent_breakdown: intentCounts,
      },
      website: {
        readability_score: websiteBreakdown.total,
        schema_coverage: websiteMetrics.schema_coverage,
        issues: websiteMetrics.issues,
        breakdown: websiteBreakdown
      },
      harbor_score: harborScoreData
    }

    console.log('✅ [API v5] Returning response with new scoring')
    console.log('   Shopping:', shoppingBreakdown.total)
    console.log('   Brand:', brandBreakdown.total)
    console.log('   Website:', websiteBreakdown.total)
    console.log('   Harbor:', harborScoreData.harbor_score)
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('💥 [API] Critical error in GET /api/scan/latest:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}