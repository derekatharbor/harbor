// apps/web/app/api/competitors/route.ts
// FIXED: Properly identify user in leaderboard and calculate rank

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
    const userBrandName = dashboard.brand_name.toLowerCase().trim()
    
    console.log('[Competitors API] User:', dashboard.brand_name, 'Category:', userCategory)

    // 2. Get user's AI Readiness score from ai_profiles (same source as competitors)
    let userScore = 0
    let userProfileId: string | null = null
    
    // First try to find by dashboard_id link
    const { data: linkedProfile } = await supabase
      .from('ai_profiles')
      .select('id, visibility_score')
      .eq('dashboard_id', brandId)
      .single()

    if (linkedProfile?.visibility_score) {
      userScore = linkedProfile.visibility_score
      userProfileId = linkedProfile.id
      console.log('[Competitors API] User score from linked ai_profile:', userScore)
    } else {
      // Fallback: find by brand name match
      const { data: namedProfile } = await supabase
        .from('ai_profiles')
        .select('id, visibility_score')
        .ilike('brand_name', dashboard.brand_name)
        .single()
      
      if (namedProfile?.visibility_score) {
        userScore = namedProfile.visibility_score
        userProfileId = namedProfile.id
        console.log('[Competitors API] User score from name-matched ai_profile:', userScore)
      }
    }

    // If still no score, they haven't been crawled yet
    if (!userScore) {
      console.log('[Competitors API] No ai_profile found for user - not yet crawled')
      return NextResponse.json({
        competitors: [],
        userRank: 0,
        totalInCategory: 0,
        category: userCategory,
        message: 'Brand not yet indexed'
      })
    }

    console.log('[Competitors API] Final user score:', userScore)

    // 3. Handle Unknown category
    if (userCategory === 'Unknown') {
      return NextResponse.json({
        competitors: [],
        userRank: 1,
        totalInCategory: 1,
        category: 'Unknown'
      })
    }

    // 4. Get ALL competitor profiles in the same industry
    // After consolidation, we can use exact matching
    const { data: allProfiles, error: compError } = await supabase
      .from('ai_profiles')
      .select('id, slug, brand_name, industry, visibility_score, logo_url, dashboard_id')
      .eq('industry', userCategory)
      .not('visibility_score', 'is', null)
      .order('visibility_score', { ascending: false })
      .limit(200)

    if (compError) {
      console.error('[Competitors API] Error fetching competitors:', compError)
    }

    console.log('[Competitors API] Found', allProfiles?.length || 0, 'profiles in industry:', userCategory)

    // 5. Build leaderboard - EXCLUDING the user first
    const competitors = (allProfiles || [])
      .filter(p => {
        // Exclude user by profile ID, dashboard_id, OR brand name
        const isUser = p.id === userProfileId ||
                       p.dashboard_id === brandId || 
                       p.brand_name.toLowerCase().trim() === userBrandName
        return !isUser
      })
      .map(p => ({
        id: p.id,
        slug: p.slug || p.brand_name.toLowerCase().replace(/\s+/g, '-'),
        brand_name: p.brand_name,
        industry: p.industry || userCategory,
        visibility_score: p.visibility_score || 0,
        logo_url: p.logo_url
      }))

    console.log('[Competitors API] Competitors after filtering:', competitors.length)

    // 6. Calculate user's rank by counting how many have higher scores
    const higherScored = competitors.filter(c => c.visibility_score > userScore).length
    const userRank = higherScored + 1 // User is ranked after all with higher scores

    console.log('[Competitors API] Competitors with higher score:', higherScored)
    console.log('[Competitors API] User rank:', userRank)

    // 7. Get top 5 competitors and assign their actual ranks
    const topCompetitors = competitors
      .sort((a, b) => b.visibility_score - a.visibility_score)
      .slice(0, 5)
      .map((c, idx) => {
        // Calculate actual rank considering user's position
        let actualRank = idx + 1
        if (c.visibility_score < userScore) {
          actualRank = idx + 2 // User is ahead, so bump their rank
        }
        return {
          ...c,
          rank_global: actualRank
        }
      })

    const totalInCategory = competitors.length + 1 // +1 for user

    console.log('[Competitors API] Returning:', {
      userRank,
      userScore,
      totalInCategory,
      topCompetitors: topCompetitors.length
    })

    return NextResponse.json({
      competitors: topCompetitors,
      userRank,
      userScore, // Include user's AI Readiness score
      totalInCategory,
      category: userCategory
    })
    
  } catch (error) {
    console.error('[Competitors API] Critical error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch competitors', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}