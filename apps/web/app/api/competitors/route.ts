// apps/web/app/api/competitors/route.ts
// UPDATED: Show tracked competitors first, then fill with category data

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
    
    const supabase = getSupabaseClient()
    
    // 1. Get the dashboard
    const { data: dashboard, error: dashboardError } = await supabase
      .from('dashboards')
      .select('id, brand_name, domain, metadata')
      .eq('id', brandId)
      .single()
    
    if (dashboardError || !dashboard) {
      return NextResponse.json({
        competitors: [],
        trackedCompetitors: [],
        userRank: 0,
        totalInCategory: 0,
        category: 'Unknown'
      })
    }

    const userCategory = dashboard.metadata?.category || 'Unknown'
    const userBrandName = dashboard.brand_name.toLowerCase().trim()
    
    // 2. Get user's tracked competitors from dashboard_competitors
    const { data: trackedCompetitors } = await supabase
      .from('dashboard_competitors')
      .select('*')
      .eq('dashboard_id', brandId)
      .eq('status', 'active')

    // 3. Get user's score from ai_profiles
    let userScore = 0
    let userProfileId: string | null = null
    
    const { data: linkedProfile } = await supabase
      .from('ai_profiles')
      .select('id, visibility_score')
      .eq('dashboard_id', brandId)
      .single()

    if (linkedProfile?.visibility_score) {
      userScore = linkedProfile.visibility_score
      userProfileId = linkedProfile.id
    } else {
      const { data: namedProfile } = await supabase
        .from('ai_profiles')
        .select('id, visibility_score')
        .ilike('brand_name', dashboard.brand_name)
        .single()
      
      if (namedProfile?.visibility_score) {
        userScore = namedProfile.visibility_score
        userProfileId = namedProfile.id
      }
    }

    // 4. Get visibility scores for tracked competitors
    const trackedWithScores = await Promise.all(
      (trackedCompetitors || []).map(async (tc) => {
        // Try to find in ai_profiles by domain or name
        const { data: profile } = await supabase
          .from('ai_profiles')
          .select('visibility_score, logo_url, slug')
          .or(`domain.eq.${tc.domain},brand_name.ilike.${tc.brand_name}`)
          .limit(1)
          .single()

        return {
          id: tc.id,
          slug: profile?.slug || tc.brand_name.toLowerCase().replace(/\s+/g, '-'),
          brand_name: tc.brand_name,
          domain: tc.domain,
          industry: userCategory,
          visibility_score: profile?.visibility_score || 0,
          logo_url: tc.logo_url || profile?.logo_url,
          is_tracked: true
        }
      })
    )

    // Sort tracked by visibility score
    trackedWithScores.sort((a, b) => b.visibility_score - a.visibility_score)

    // 5. Get category competitors to fill remaining slots
    let categoryCompetitors: any[] = []
    
    if (userCategory !== 'Unknown') {
      const trackedDomains = new Set(trackedCompetitors?.map(tc => tc.domain) || [])
      
      const { data: allProfiles } = await supabase
        .from('ai_profiles')
        .select('id, slug, brand_name, domain, industry, visibility_score, logo_url, dashboard_id')
        .eq('industry', userCategory)
        .not('visibility_score', 'is', null)
        .order('visibility_score', { ascending: false })
        .limit(50)

      categoryCompetitors = (allProfiles || [])
        .filter(p => {
          const isUser = p.id === userProfileId ||
                         p.dashboard_id === brandId || 
                         p.brand_name.toLowerCase().trim() === userBrandName ||
                         p.domain === dashboard.domain
          const isTracked = trackedDomains.has(p.domain)
          return !isUser && !isTracked
        })
        .map(p => ({
          id: p.id,
          slug: p.slug || p.brand_name.toLowerCase().replace(/\s+/g, '-'),
          brand_name: p.brand_name,
          domain: p.domain,
          industry: p.industry || userCategory,
          visibility_score: p.visibility_score || 0,
          logo_url: p.logo_url,
          is_tracked: false
        }))
    }

    // 6. Combine: tracked first, then category (up to 10 total)
    const allCompetitors = [
      ...trackedWithScores,
      ...categoryCompetitors.slice(0, Math.max(0, 10 - trackedWithScores.length))
    ]

    // 7. Calculate user rank among all competitors shown
    const higherScored = allCompetitors.filter(c => c.visibility_score > userScore).length
    const userRank = higherScored + 1

    // Assign ranks
    const competitorsWithRanks = allCompetitors
      .sort((a, b) => b.visibility_score - a.visibility_score)
      .map((c, idx) => {
        let actualRank = idx + 1
        if (c.visibility_score < userScore) {
          actualRank = idx + 2
        }
        return { ...c, rank_global: actualRank }
      })

    return NextResponse.json({
      competitors: competitorsWithRanks,
      trackedCount: trackedWithScores.length,
      userRank,
      userScore,
      totalInCategory: allCompetitors.length + 1,
      category: userCategory
    })
    
  } catch (error) {
    console.error('[Competitors API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch competitors' },
      { status: 500 }
    )
  }
}