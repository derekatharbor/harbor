// app/api/dashboard/[id]/competitors/route.ts
// Returns both tracked competitors and discovered brands from AI responses

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Plan limits for competitor tracking
const PLAN_LIMITS: Record<string, number> = {
  free: 3,
  solo: 5,
  growth: 10,
  agency: 25,
  enterprise: 50
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: dashboardId } = await params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '25')
    const includeTracked = searchParams.get('include_tracked') === 'true'
    
    const supabase = getSupabase()

    // 1. Get dashboard info
    const { data: dashboard, error: dashError } = await supabase
      .from('dashboards')
      .select('brand_name, domain, plan')
      .eq('id', dashboardId)
      .single()

    if (dashError || !dashboard) {
      return NextResponse.json({ error: 'Dashboard not found' }, { status: 404 })
    }

    const plan = dashboard.plan || 'free'
    const maxCompetitors = PLAN_LIMITS[plan] || PLAN_LIMITS.free

    // 2. Get tracked competitors (joined with ai_profiles)
    let tracked: any[] = []
    if (includeTracked) {
      const { data: trackedData } = await supabase
        .from('dashboard_competitors')
        .select(`
          id,
          profile_id,
          added_at,
          ai_profiles (
            brand_name,
            domain,
            logo_url
          )
        `)
        .eq('dashboard_id', dashboardId)
        .limit(maxCompetitors)

      tracked = (trackedData || []).map(t => ({
        id: t.id,
        profile_id: t.profile_id,
        brand_name: (t.ai_profiles as any)?.brand_name || 'Unknown',
        domain: (t.ai_profiles as any)?.domain || null,
        logo_url: (t.ai_profiles as any)?.logo_url || null,
        added_at: t.added_at,
        // Metrics will be populated below
        mentions: 0,
        visibility: 0,
        sentiment: 'neutral',
        avg_position: null
      }))
    }

    // 3. Get all user_prompts for this dashboard
    const { data: userPrompts } = await supabase
      .from('user_prompts')
      .select('id')
      .eq('dashboard_id', dashboardId)
      .eq('is_active', true)

    const promptIds = userPrompts?.map(p => p.id) || []

    // 4. Get all executions for these prompts
    const { data: executions } = await supabase
      .from('prompt_executions')
      .select('id')
      .in('prompt_id', promptIds.length > 0 ? promptIds : ['none'])

    const executionIds = executions?.map(e => e.id) || []

    // 5. Get brand mentions from these executions
    const { data: mentions } = await supabase
      .from('prompt_brand_mentions')
      .select('brand_name, position, sentiment, profile_id')
      .in('execution_id', executionIds.length > 0 ? executionIds : ['none'])

    // 6. Aggregate by brand name
    const brandCounts = new Map<string, { 
      mentions: number
      totalPosition: number
      sentiments: { positive: number; neutral: number; negative: number }
      profile_id?: string
    }>()
    
    mentions?.forEach(m => {
      const name = m.brand_name?.trim()
      if (!name) return
      
      const existing = brandCounts.get(name) || { 
        mentions: 0, 
        totalPosition: 0, 
        sentiments: { positive: 0, neutral: 0, negative: 0 },
        profile_id: m.profile_id || undefined
      }
      existing.mentions++
      existing.totalPosition += (m.position || 5)
      
      const sentiment = m.sentiment as 'positive' | 'neutral' | 'negative'
      if (sentiment && existing.sentiments[sentiment] !== undefined) {
        existing.sentiments[sentiment]++
      } else {
        existing.sentiments.neutral++
      }
      
      brandCounts.set(name, existing)
    })

    // Helper to get dominant sentiment
    const getDominantSentiment = (sentiments: { positive: number; neutral: number; negative: number }): string => {
      if (sentiments.positive >= sentiments.neutral && sentiments.positive >= sentiments.negative) {
        return 'positive'
      }
      if (sentiments.negative > sentiments.positive && sentiments.negative >= sentiments.neutral) {
        return 'negative'
      }
      return 'neutral'
    }

    // 7. Calculate user's data
    const userBrandLower = dashboard.brand_name?.toLowerCase() || ''
    let userMentions = 0
    let userPosition = 0
    let userSentiment = 'neutral'
    
    brandCounts.forEach((data, name) => {
      if (name.toLowerCase().includes(userBrandLower) || 
          userBrandLower.includes(name.toLowerCase())) {
        userMentions += data.mentions
        userPosition = data.mentions > 0 
          ? Math.round((data.totalPosition / data.mentions) * 10) / 10
          : 0
        userSentiment = getDominantSentiment(data.sentiments)
        brandCounts.delete(name)
      }
    })

    const maxMentions = Math.max(
      userMentions,
      Array.from(brandCounts.values()).reduce((max, b) => Math.max(max, b.mentions), 0)
    ) || 1

    // 8. Update tracked competitors with actual metrics
    const trackedNames = new Set(tracked.map(t => t.brand_name.toLowerCase()))
    
    tracked = tracked.map(t => {
      const brandData = Array.from(brandCounts.entries()).find(
        ([name]) => name.toLowerCase() === t.brand_name.toLowerCase()
      )
      
      if (brandData) {
        const [, data] = brandData
        return {
          ...t,
          mentions: data.mentions,
          visibility: Math.round((data.mentions / maxMentions) * 100),
          sentiment: getDominantSentiment(data.sentiments),
          avg_position: data.mentions > 0 
            ? Math.round((data.totalPosition / data.mentions) * 10) / 10
            : null
        }
      }
      return t
    })

    // 9. Build discovered brands list (excluding user and already tracked)
    const discovered = Array.from(brandCounts.entries())
      .map(([name, data]) => ({
        name,
        mentions: data.mentions,
        avgPosition: Math.round((data.totalPosition / data.mentions) * 10) / 10,
        sentiment: getDominantSentiment(data.sentiments),
        profile_id: data.profile_id
      }))
      .sort((a, b) => b.mentions - a.mentions)
      .slice(0, limit)
      .map((brand, idx) => {
        // Try to guess domain from brand name
        const guessedDomain = brand.name.toLowerCase()
          .replace(/[^a-z0-9]/g, '')
          .slice(0, 30) + '.com'

        return {
          rank: idx + 1,
          name: brand.name,
          domain: guessedDomain,
          logo: `https://cdn.brandfetch.io/${guessedDomain}?c=1id1Fyz-h7an5-5KR_y`,
          visibility: Math.round((brand.mentions / maxMentions) * 100),
          sentiment: brand.sentiment,
          position: brand.avgPosition,
          mentions: brand.mentions,
          isUser: false,
          isTracked: trackedNames.has(brand.name.toLowerCase()),
          profile_id: brand.profile_id
        }
      })

    // 10. Calculate user's rank
    const userRank = userMentions > 0 
      ? discovered.filter(b => b.mentions > userMentions).length + 1
      : null

    return NextResponse.json({
      tracked,
      discovered,
      user_data: {
        visibility: maxMentions > 0 ? Math.round((userMentions / maxMentions) * 100) : 0,
        mentions: userMentions,
        sentiment: userSentiment,
        position: userPosition || null
      },
      total_brands_found: brandCounts.size,
      user_rank: userRank,
      plan_limits: {
        current: tracked.length,
        max: maxCompetitors,
        plan: plan
      }
    })

  } catch (error) {
    console.error('Error in competitors API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Add a competitor to tracking
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: dashboardId } = await params
    const body = await request.json()
    const { profile_id, brand_name, domain } = body

    if (!profile_id && !brand_name) {
      return NextResponse.json({ error: 'profile_id or brand_name required' }, { status: 400 })
    }

    const supabase = getSupabase()

    // Check dashboard exists and get plan
    const { data: dashboard } = await supabase
      .from('dashboards')
      .select('plan')
      .eq('id', dashboardId)
      .single()

    if (!dashboard) {
      return NextResponse.json({ error: 'Dashboard not found' }, { status: 404 })
    }

    const plan = dashboard.plan || 'free'
    const maxCompetitors = PLAN_LIMITS[plan] || PLAN_LIMITS.free

    // Check current count
    const { count } = await supabase
      .from('dashboard_competitors')
      .select('*', { count: 'exact', head: true })
      .eq('dashboard_id', dashboardId)

    if ((count || 0) >= maxCompetitors) {
      return NextResponse.json({ 
        error: 'Competitor limit reached', 
        limit: maxCompetitors,
        plan: plan 
      }, { status: 403 })
    }

    // If we have profile_id, use it directly
    let finalProfileId = profile_id

    // If no profile_id, try to find or create profile
    if (!finalProfileId && brand_name) {
      // Try to find existing profile
      const { data: existingProfile } = await supabase
        .from('ai_profiles')
        .select('id')
        .ilike('brand_name', brand_name)
        .limit(1)
        .single()

      if (existingProfile) {
        finalProfileId = existingProfile.id
      } else if (domain) {
        // Create new profile
        const { data: newProfile } = await supabase
          .from('ai_profiles')
          .insert({
            brand_name,
            domain,
            logo_url: `https://cdn.brandfetch.io/${domain}?c=1id1Fyz-h7an5-5KR_y`
          })
          .select('id')
          .single()

        if (newProfile) {
          finalProfileId = newProfile.id
        }
      }
    }

    if (!finalProfileId) {
      return NextResponse.json({ error: 'Could not resolve profile' }, { status: 400 })
    }

    // Check if already tracking
    const { data: existing } = await supabase
      .from('dashboard_competitors')
      .select('id')
      .eq('dashboard_id', dashboardId)
      .eq('profile_id', finalProfileId)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Already tracking this competitor' }, { status: 409 })
    }

    // Add competitor
    const { data: competitor, error } = await supabase
      .from('dashboard_competitors')
      .insert({
        dashboard_id: dashboardId,
        profile_id: finalProfileId
      })
      .select('id')
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ 
      success: true, 
      competitor_id: competitor.id 
    })

  } catch (error) {
    console.error('Error adding competitor:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Remove a competitor from tracking
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: dashboardId } = await params
    const { searchParams } = new URL(request.url)
    const competitorId = searchParams.get('competitor_id')
    const profileId = searchParams.get('profile_id')

    if (!competitorId && !profileId) {
      return NextResponse.json({ error: 'competitor_id or profile_id required' }, { status: 400 })
    }

    const supabase = getSupabase()

    let query = supabase
      .from('dashboard_competitors')
      .delete()
      .eq('dashboard_id', dashboardId)

    if (competitorId) {
      query = query.eq('id', competitorId)
    } else if (profileId) {
      query = query.eq('profile_id', profileId)
    }

    const { error } = await query

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error removing competitor:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}