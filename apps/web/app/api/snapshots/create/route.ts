// apps/web/app/api/snapshots/create/route.ts
// Create a snapshot after a scan completes

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  calculateVisibilityScore,
  calculateBrandVisibilityScore,
  calculateWebsiteReadinessScore,
  calculateHarborScore,
  type ShoppingData,
  type BrandData,
  type WebsiteData
} from '@/lib/scoring/visibility-score'
import { calculateWebsiteMetrics } from '@/lib/scan/website-metrics'

export const dynamic = 'force-dynamic'

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  return createClient(supabaseUrl, supabaseKey)
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    const body = await req.json()
    
    const { dashboardId, scanId } = body
    
    if (!dashboardId) {
      return NextResponse.json({ error: 'Dashboard ID required' }, { status: 400 })
    }
    
    console.log('📸 [Snapshot] Creating snapshot for dashboard:', dashboardId)
    
    // If scanId provided, use it. Otherwise get latest completed scan
    let targetScanId = scanId
    
    if (!targetScanId) {
      const { data: latestScan } = await supabase
        .from('scans')
        .select('id')
        .eq('dashboard_id', dashboardId)
        .eq('status', 'done')
        .order('finished_at', { ascending: false })
        .limit(1)
        .single()
      
      if (!latestScan) {
        return NextResponse.json({ error: 'No completed scan found' }, { status: 404 })
      }
      targetScanId = latestScan.id
    }
    
    console.log('📸 [Snapshot] Using scan:', targetScanId)
    
    // Fetch all results for this scan (same logic as /api/scan/latest)
    const [shoppingResults, brandResults, conversationResults] = await Promise.all([
      supabase.from('results_shopping').select('*').eq('scan_id', targetScanId),
      supabase.from('results_brand').select('*').eq('scan_id', targetScanId),
      supabase.from('results_conversations').select('*').eq('scan_id', targetScanId),
    ])
    
    // Calculate Shopping Score
    const shoppingData = shoppingResults.data || []
    const userMentions = shoppingData.filter(d => d.is_user_brand === true).length
    
    const categoryMap = new Map<string, { rank: number; mentions: number }>()
    shoppingData.forEach(item => {
      if (item.category) {
        const existing = categoryMap.get(item.category)
        if (existing) {
          existing.mentions++
          if (item.rank && item.rank < existing.rank) existing.rank = item.rank
        } else {
          categoryMap.set(item.category, { rank: item.rank || 3, mentions: 1 })
        }
      }
    })
    
    const categories = Array.from(categoryMap.entries())
      .map(([category, data]) => ({ category, rank: data.rank, mentions: data.mentions }))
    
    const competitorMap = new Map<string, number>()
    shoppingData.forEach(item => {
      if (item.brand && !item.is_user_brand) {
        competitorMap.set(item.brand, (competitorMap.get(item.brand) || 0) + 1)
      }
    })
    const competitors = Array.from(competitorMap.entries())
      .map(([brand, mentions]) => ({ brand, mentions }))
    
    const modelMap = new Map<string, number>()
    shoppingData.forEach(item => {
      if (item.model) modelMap.set(item.model, (modelMap.get(item.model) || 0) + 1)
    })
    const models = Array.from(modelMap.entries())
      .map(([model, mentions]) => ({ model, mentions }))
    
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
    const shoppingScore = calculateVisibilityScore(shoppingInput).total
    
    // Calculate Brand Score
    const brandData = brandResults.data || []
    const descriptors = brandData.map(d => ({
      word: d.descriptor,
      sentiment: d.sentiment,
      weight: d.weight || 1,
    }))
    
    const sentimentCounts = { positive: 0, neutral: 0, negative: 0 }
    brandData.forEach(d => {
      if (d.sentiment === 'pos') sentimentCounts.positive++
      else if (d.sentiment === 'neu') sentimentCounts.neutral++
      else if (d.sentiment === 'neg') sentimentCounts.negative++
    })
    
    const brandInput: BrandData = {
      descriptors,
      sentiment_breakdown: sentimentCounts,
      total_mentions: brandData.length
    }
    const brandScore = calculateBrandVisibilityScore(brandInput).total
    
    // Calculate Website Score
    const websiteMetrics = await calculateWebsiteMetrics(supabase, targetScanId)
    const websiteInput: WebsiteData = {
      pages_analyzed: new Set(websiteMetrics.issues.map(i => i.url)).size,
      schema_coverage: websiteMetrics.schema_coverage,
      issues: websiteMetrics.issues.map(i => ({ severity: i.severity, code: i.code })),
      readability_score: websiteMetrics.readability_score
    }
    const websiteScore = calculateWebsiteReadinessScore(websiteInput).total
    
    // Calculate Harbor Score
    const harborScoreData = calculateHarborScore(shoppingInput, brandInput, websiteInput)
    
    // Conversation count
    const conversationCount = conversationResults.data?.length || 0
    
    console.log('📸 [Snapshot] Scores:', { 
      shopping: shoppingScore, 
      brand: brandScore, 
      website: websiteScore, 
      harbor: harborScoreData.harbor_score 
    })
    
    const today = new Date().toISOString().split('T')[0]
    
    // Upsert snapshot
    const { data: snapshot, error: snapshotError } = await supabase
      .from('scan_snapshots')
      .upsert({
        dashboard_id: dashboardId,
        scan_id: targetScanId,
        snapshot_date: today,
        shopping_score: shoppingScore,
        brand_score: brandScore,
        website_score: websiteScore,
        harbor_score: harborScoreData.harbor_score,
        conversation_count: conversationCount
      }, {
        onConflict: 'dashboard_id,snapshot_date'
      })
      .select()
      .single()
    
    if (snapshotError) {
      console.error('❌ [Snapshot] Error creating snapshot:', snapshotError)
      return NextResponse.json({ error: snapshotError.message }, { status: 500 })
    }
    
    console.log('✅ [Snapshot] Created for dashboard:', dashboardId, 'date:', today)
    
    return NextResponse.json({
      success: true,
      snapshot,
      scores: {
        shopping: shoppingScore,
        brand: brandScore,
        website: websiteScore,
        harbor: harborScoreData.harbor_score
      }
    })
    
  } catch (error) {
    console.error('💥 [Snapshot] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
