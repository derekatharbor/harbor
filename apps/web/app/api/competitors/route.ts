// apps/web/app/api/competitors/route.ts
// FIXED: Uses correct table relationships (dashboards → ai_profiles via dashboard_id)

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  return createClient(supabaseUrl, supabaseKey)
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const brandId = searchParams.get('brandId')
    
    if (!brandId) {
      return NextResponse.json(
        { error: 'brandId is required' },
        { status: 400 }
      )
    }
    
    console.log('[Competitors API] Fetching for brandId:', brandId)
    
    const supabase = getSupabaseClient()
    
    // 1. Get the dashboard
    const { data: dashboard, error: dashboardError } = await supabase
      .from('dashboards')
      .select('id, brand_name, metadata')
      .eq('id', brandId)
      .single()
    
    if (dashboardError || !dashboard) {
      console.error('[Competitors API] Dashboard not found:', dashboardError)
      return NextResponse.json({
        competitors: [],
        userRank: 0,
        totalInCategory: 0,
        category: 'Unknown'
      })
    }

    // Get category from metadata
    const userCategory = dashboard.metadata?.category || 'Unknown'
    console.log('[Competitors API] User category:', userCategory)

    // 2. Find the user's ai_profile (linked via dashboard_id)
    const { data: userProfile, error: profileError } = await supabase
      .from('ai_profiles')
      .select('id, brand_name, visibility_score, industry, rank_in_industry, rank_global')
      .eq('dashboard_id', brandId)
      .single()

    let userScore = 0
    let userRank = 0

    if (userProfile) {
      console.log('[Competitors API] Found user profile:', userProfile.brand_name, 'Score:', userProfile.visibility_score)
      userScore = userProfile.visibility_score || 0
      userRank = userProfile.rank_in_industry || 0
    } else {
      console.log('[Competitors API] No ai_profile found for dashboard, checking latest scan...')
      
      // Fallback: Get score from latest scan if no ai_profile exists yet
      const { data: latestScan } = await supabase
        .from('scans')
        .select('id')
        .eq('dashboard_id', brandId)
        .eq('status', 'done')
        .order('started_at', { ascending: false })
        .limit(1)
        .single()

      if (latestScan) {
        const { data: visScore } = await supabase
          .from('visibility_scores')
          .select('overall_score')
          .eq('scan_id', latestScan.id)
          .single()

        if (visScore) {
          userScore = visScore.overall_score || 0
          console.log('[Competitors API] Got score from scan:', userScore)
        }
      }
    }

    // 3. Get all competitors in the same industry
    const industryToMatch = userProfile?.industry || userCategory

    if (industryToMatch === 'Unknown') {
      console.warn('[Competitors API] Category is Unknown - user needs to set category in Brand Settings')
      return NextResponse.json({
        competitors: [],
        userRank: 0,
        totalInCategory: 1,
        category: 'Unknown'
      })
    }

    const { data: allCompetitors, error: compError } = await supabase
      .from('ai_profiles')
      .select('id, slug, brand_name, industry, visibility_score, rank_global, logo_url')
      .ilike('industry', `%${industryToMatch}%`)
      .not('visibility_score', 'is', null)
      .order('visibility_score', { ascending: false })
      .limit(100)

    if (compError) {
      console.error('[Competitors API] Error fetching competitors:', compError)
      return NextResponse.json({
        competitors: [],
        userRank: userRank || 0,
        totalInCategory: 1,
        category: industryToMatch
      })
    }

    console.log('[Competitors API] Found', allCompetitors?.length || 0, 'brands in industry')

    // 4. If no competitors found, try getting from scan_competitors as fallback
    if (!allCompetitors || allCompetitors.length === 0) {
      console.log('[Competitors API] No ai_profiles found, checking scan_competitors...')
      
      const { data: latestScan } = await supabase
        .from('scans')
        .select('id')
        .eq('dashboard_id', brandId)
        .eq('status', 'done')
        .order('started_at', { ascending: false })
        .limit(1)
        .single()

      if (latestScan) {
        const { data: scanComps } = await supabase
          .from('scan_competitors')
          .select('competitor_name, mention_count')
          .eq('scan_id', latestScan.id)
          .order('mention_count', { ascending: false })

        if (scanComps && scanComps.length > 0) {
          console.log('[Competitors API] Found', scanComps.length, 'competitors in scan_competitors')
          
          // Convert scan_competitors to competitor format
          const competitors = scanComps.map((comp, idx) => ({
            id: comp.competitor_name.toLowerCase().replace(/\s+/g, '-'),
            slug: comp.competitor_name.toLowerCase().replace(/\s+/g, '-'),
            brand_name: comp.competitor_name,
            industry: userCategory,
            visibility_score: Math.round((comp.mention_count / (scanComps[0].mention_count || 1)) * 100),
            rank_global: idx + 2 // User is #1
          }))

          return NextResponse.json({
            competitors: competitors.slice(0, 5),
            userRank: 1,
            totalInCategory: competitors.length + 1,
            category: userCategory
          })
        }
      }

      // Still nothing? Return empty
      return NextResponse.json({
        competitors: [],
        userRank: 0,
        totalInCategory: 0,
        category: userCategory
      })
    }

    // 5. Calculate rankings
    const allBrands = allCompetitors.filter(c => 
      c.id !== userProfile?.id && 
      c.brand_name.toLowerCase() !== dashboard.brand_name.toLowerCase()
    )

    // Add user to the mix if they have a profile
    if (userProfile) {
      allBrands.push(userProfile)
    } else {
      // Create temporary profile for user
      allBrands.push({
        id: 'user-temp',
        slug: dashboard.brand_name.toLowerCase().replace(/\s+/g, '-'),
        brand_name: dashboard.brand_name,
        industry: userCategory,
        visibility_score: userScore,
        rank_global: null,
        logo_url: null
      })
    }

    // Sort by score
    allBrands.sort((a, b) => (b.visibility_score || 0) - (a.visibility_score || 0))

    // Find user's rank
    const userIndex = allBrands.findIndex(b => 
      b.id === userProfile?.id || 
      b.brand_name.toLowerCase() === dashboard.brand_name.toLowerCase()
    )
    const calculatedUserRank = userIndex + 1

    // Get top 5 competitors (excluding user)
    const topCompetitors = allBrands
      .filter(b => b.id !== userProfile?.id && b.brand_name.toLowerCase() !== dashboard.brand_name.toLowerCase())
      .slice(0, 5)

    console.log('[Competitors API] Returning:', {
      competitors: topCompetitors.length,
      userRank: calculatedUserRank,
      totalInCategory: allBrands.length,
      category: industryToMatch
    })

    return NextResponse.json({
      competitors: topCompetitors,
      userRank: calculatedUserRank,
      totalInCategory: allBrands.length,
      category: industryToMatch
    })
    
  } catch (error) {
    console.error('[Competitors API] Critical error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch competitors', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}