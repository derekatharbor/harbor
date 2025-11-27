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
    // Use smarter matching - try exact first, then fuzzy on key terms
    let allProfiles: any[] = []
    
    // First try exact-ish match
    const { data: exactMatches, error: exactError } = await supabase
      .from('ai_profiles')
      .select('id, slug, brand_name, industry, visibility_score, logo_url, dashboard_id')
      .ilike('industry', `%${userCategory}%`)
      .not('visibility_score', 'is', null)
      .order('visibility_score', { ascending: false })
      .limit(200)

    if (!exactError && exactMatches && exactMatches.length > 0) {
      allProfiles = exactMatches
      console.log('[Competitors API] Found', allProfiles.length, 'profiles with exact category match')
    } else {
      // No exact match - try matching on key terms
      // Extract meaningful words from category (skip common words)
      const skipWords = ['software', 'platform', 'tool', 'tools', 'service', 'services', 'solution', 'solutions', 'the', 'and', 'for', 'of', 'a', 'an']
      const categoryWords = userCategory
        .toLowerCase()
        .split(/[\s,]+/)
        .filter(word => word.length > 2 && !skipWords.includes(word))
      
      console.log('[Competitors API] No exact match, trying key terms:', categoryWords)
      
      // Try each key term
      for (const term of categoryWords) {
        const { data: termMatches } = await supabase
          .from('ai_profiles')
          .select('id, slug, brand_name, industry, visibility_score, logo_url, dashboard_id')
          .ilike('industry', `%${term}%`)
          .not('visibility_score', 'is', null)
          .order('visibility_score', { ascending: false })
          .limit(200)
        
        if (termMatches && termMatches.length > 5) {
          allProfiles = termMatches
          console.log('[Competitors API] Found', allProfiles.length, 'profiles matching term:', term)
          break
        }
      }
      
      // If still nothing, try broader category matches
      if (allProfiles.length === 0) {
        // Try common category mappings
        const broadCategories = [
          { terms: ['project', 'management', 'productivity', 'collaboration'], search: 'project' },
          { terms: ['marketing', 'advertising', 'seo', 'content'], search: 'marketing' },
          { terms: ['sales', 'crm', 'customer'], search: 'sales' },
          { terms: ['finance', 'accounting', 'payment', 'fintech'], search: 'finance' },
          { terms: ['ecommerce', 'retail', 'shopping', 'store'], search: 'commerce' },
          { terms: ['health', 'medical', 'healthcare', 'wellness'], search: 'health' },
          { terms: ['education', 'learning', 'training', 'course'], search: 'education' },
          { terms: ['security', 'cyber', 'privacy'], search: 'security' },
          { terms: ['analytics', 'data', 'business intelligence', 'bi'], search: 'analytics' },
          { terms: ['hr', 'human resources', 'recruiting', 'hiring'], search: 'hr' },
        ]
        
        const categoryLower = userCategory.toLowerCase()
        for (const mapping of broadCategories) {
          if (mapping.terms.some(t => categoryLower.includes(t))) {
            const { data: broadMatches } = await supabase
              .from('ai_profiles')
              .select('id, slug, brand_name, industry, visibility_score, logo_url, dashboard_id')
              .ilike('industry', `%${mapping.search}%`)
              .not('visibility_score', 'is', null)
              .order('visibility_score', { ascending: false })
              .limit(200)
            
            if (broadMatches && broadMatches.length > 0) {
              allProfiles = broadMatches
              console.log('[Competitors API] Found', allProfiles.length, 'profiles with broad category:', mapping.search)
              break
            }
          }
        }
      }
    }

    if (allProfiles.length === 0) {
      console.log('[Competitors API] No competitors found for category:', userCategory)
    }

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