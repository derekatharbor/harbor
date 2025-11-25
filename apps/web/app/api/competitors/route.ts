// apps/web/app/api/competitors/route.ts
// FIXED: Always calculate ranking dynamically from visibility_score

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

    const userCategory = dashboard.metadata?.category || 'Unknown'
    console.log('[Competitors API] User category:', userCategory)

    // 2. Find the user's ai_profile
    const { data: userProfile } = await supabase
      .from('ai_profiles')
      .select('id, slug, brand_name, visibility_score, industry, logo_url')
      .eq('dashboard_id', brandId)
      .single()

    // Get user's score (prefer ai_profile, fallback to latest scan)
    let userScore = userProfile?.visibility_score || 0
    
    if (!userScore) {
      // Fallback: Get score from latest scan
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

    console.log('[Competitors API] User score:', userScore)

    // 3. Handle Unknown category
    if (userCategory === 'Unknown') {
      console.warn('[Competitors API] Category is Unknown')
      return NextResponse.json({
        competitors: [],
        userRank: 0,
        totalInCategory: 1,
        category: 'Unknown'
      })
    }

    // 4. Get ALL brands in the same industry, sorted by visibility_score
    const industryToMatch = userProfile?.industry || userCategory
    
    const { data: allProfiles, error: compError } = await supabase
      .from('ai_profiles')
      .select('id, slug, brand_name, industry, visibility_score, logo_url')
      .ilike('industry', `%${industryToMatch}%`)
      .not('visibility_score', 'is', null)
      .order('visibility_score', { ascending: false })
      .limit(100)

    if (compError) {
      console.error('[Competitors API] Error fetching competitors:', compError)
      return NextResponse.json({
        competitors: [],
        userRank: 0,
        totalInCategory: 1,
        category: industryToMatch
      })
    }

    console.log('[Competitors API] Found', allProfiles?.length || 0, 'profiles in industry')

    // 5. Build the complete leaderboard
    let leaderboard: Array<{
      id: string
      slug: string
      brand_name: string
      industry: string
      visibility_score: number
      logo_url: string | null
      is_user: boolean
    }> = []

    // Add all profiles
    if (allProfiles) {
      leaderboard = allProfiles.map(p => ({
        id: p.id,
        slug: p.slug || p.brand_name.toLowerCase().replace(/\s+/g, '-'),
        brand_name: p.brand_name,
        industry: p.industry || industryToMatch,
        visibility_score: p.visibility_score || 0,
        logo_url: p.logo_url,
        is_user: p.id === userProfile?.id || p.brand_name.toLowerCase() === dashboard.brand_name.toLowerCase()
      }))
    }

    // If user not in leaderboard, add them
    const userInLeaderboard = leaderboard.some(b => b.is_user)
    if (!userInLeaderboard && userScore > 0) {
      leaderboard.push({
        id: userProfile?.id || 'user-temp',
        slug: dashboard.brand_name.toLowerCase().replace(/\s+/g, '-'),
        brand_name: dashboard.brand_name,
        industry: industryToMatch,
        visibility_score: userScore,
        logo_url: userProfile?.logo_url || null,
        is_user: true
      })
    }

    // 6. Sort by visibility_score (DESCENDING - highest first)
    leaderboard.sort((a, b) => (b.visibility_score || 0) - (a.visibility_score || 0))

    // 7. Calculate user's rank (1-indexed)
    const userIndex = leaderboard.findIndex(b => b.is_user)
    const userRank = userIndex >= 0 ? userIndex + 1 : 0

    console.log('[Competitors API] User rank:', userRank, 'of', leaderboard.length)

    // 8. Get top 5 competitors (excluding user)
    const competitors = leaderboard
      .filter(b => !b.is_user)
      .slice(0, 5)
      .map((c, idx) => ({
        id: c.id,
        slug: c.slug,
        brand_name: c.brand_name,
        industry: c.industry,
        visibility_score: c.visibility_score,
        logo_url: c.logo_url,
        rank_global: leaderboard.findIndex(l => l.id === c.id) + 1
      }))

    console.log('[Competitors API] Returning:', {
      userRank,
      totalInCategory: leaderboard.length,
      competitors: competitors.length,
      category: industryToMatch
    })

    return NextResponse.json({
      competitors,
      userRank,
      totalInCategory: leaderboard.length,
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