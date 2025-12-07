// app/api/dashboard/[id]/competitors/route.ts
// Show user's brand + competitors + top SaaS brands (excluding universities)

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const COLORS = [
  '#FF6B4A', '#3B82F6', '#22C55E', '#8B5CF6', 
  '#F59E0B', '#EC4899', '#06B6D4', '#EF4444',
]

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: dashboardId } = await params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    
    const supabase = getSupabase()

    // 1. Get dashboard info
    const { data: dashboard, error: dashError } = await supabase
      .from('dashboards')
      .select('brand_name, domain')
      .eq('id', dashboardId)
      .single()

    if (dashError || !dashboard) {
      return NextResponse.json({ error: 'Dashboard not found' }, { status: 404 })
    }

    // 2. Get user's selected competitors
    const { data: dashboardCompetitors } = await supabase
      .from('dashboard_competitors')
      .select(`
        profile_id,
        ai_profiles:profile_id (
          id, brand_name, domain, logo_url,
          visibility_score, sentiment_score, avg_position, total_mentions
        )
      `)
      .eq('dashboard_id', dashboardId)

    // 3. Get execution IDs for non-university prompts
    const { data: nonUniExecutions } = await supabase
      .from('prompt_executions')
      .select('id, seed_prompts!inner(topic)')
      .neq('seed_prompts.topic', 'universities')

    const executionIds = nonUniExecutions?.map((e: any) => e.id) || []

    if (executionIds.length === 0) {
      // No non-university data, return user + competitors only
      const competitors: any[] = [{
        rank: 0,
        name: dashboard.brand_name,
        domain: dashboard.domain,
        logo: `https://cdn.brandfetch.io/${dashboard.domain}?c=1id1Fyz-h7an5-5KR_y`,
        visibility: 0, visibilityDelta: null,
        sentiment: 0, sentimentDelta: null,
        position: 0, positionDelta: null,
        mentions: 0, isUser: true, isTrackedCompetitor: false,
        color: COLORS[0]
      }]
      return NextResponse.json({ competitors, total_brands_found: 0, user_rank: null })
    }

    // 4. Get brand mentions from those executions
    const { data: mentions } = await supabase
      .from('prompt_brand_mentions')
      .select('brand_name, position, sentiment')
      .in('execution_id', executionIds)

    // 5. Aggregate by brand
    const brandStats = new Map<string, {
      mentions: number
      positions: number[]
      sentiments: { pos: number, neu: number, neg: number }
    }>()

    mentions?.forEach((m: any) => {
      const name = m.brand_name?.trim()
      if (!name) return
      
      const existing = brandStats.get(name) || {
        mentions: 0, positions: [], sentiments: { pos: 0, neu: 0, neg: 0 }
      }
      
      existing.mentions++
      if (m.position) existing.positions.push(m.position)
      
      const sent = (m.sentiment || 'neutral').toLowerCase()
      if (sent === 'positive' || sent === 'pos') existing.sentiments.pos++
      else if (sent === 'negative' || sent === 'neg') existing.sentiments.neg++
      else existing.sentiments.neu++
      
      brandStats.set(name, existing)
    })

    // 6. Convert to sorted array
    const topBrands = Array.from(brandStats.entries())
      .map(([name, stats]) => {
        const avgPos = stats.positions.length > 0
          ? stats.positions.reduce((a, b) => a + b, 0) / stats.positions.length : 0
        const total = stats.sentiments.pos + stats.sentiments.neu + stats.sentiments.neg
        const sentimentScore = total > 0 ? Math.round((stats.sentiments.pos / total) * 100) : 50
        return { name, mentions: stats.mentions, position: Math.round(avgPos * 10) / 10, sentiment: sentimentScore }
      })
      .sort((a, b) => b.mentions - a.mentions)

    const maxMentions = topBrands.length > 0 ? topBrands[0].mentions : 1

    // 7. Build competitors list
    const competitors: any[] = []
    const addedNames = new Set<string>()
    const userBrandLower = dashboard.brand_name.toLowerCase()

    // Find user in top brands
    const userInTop = topBrands.find(b => 
      b.name.toLowerCase() === userBrandLower ||
      b.name.toLowerCase().includes(userBrandLower) ||
      userBrandLower.includes(b.name.toLowerCase())
    )

    // Add user first
    competitors.push({
      rank: userInTop ? topBrands.indexOf(userInTop) + 1 : 0,
      name: dashboard.brand_name,
      domain: dashboard.domain,
      logo: `https://cdn.brandfetch.io/${dashboard.domain}?c=1id1Fyz-h7an5-5KR_y`,
      visibility: userInTop ? Math.round((userInTop.mentions / maxMentions) * 100) : 0,
      visibilityDelta: null,
      sentiment: userInTop?.sentiment || 0,
      sentimentDelta: null,
      position: userInTop?.position || 0,
      positionDelta: null,
      mentions: userInTop?.mentions || 0,
      isUser: true,
      isTrackedCompetitor: false,
      color: COLORS[0]
    })
    addedNames.add(userBrandLower)

    // Add selected competitors
    let colorIdx = 1
    dashboardCompetitors?.forEach((dc: any) => {
      if (dc.ai_profiles) {
        const p = dc.ai_profiles
        const nameLower = p.brand_name.toLowerCase()
        const inTop = topBrands.find(b => b.name.toLowerCase() === nameLower)

        competitors.push({
          rank: inTop ? topBrands.indexOf(inTop) + 1 : 0,
          name: p.brand_name,
          domain: p.domain,
          logo: p.logo_url || `https://cdn.brandfetch.io/${p.domain}?c=1id1Fyz-h7an5-5KR_y`,
          visibility: inTop ? Math.round((inTop.mentions / maxMentions) * 100) : 0,
          visibilityDelta: null,
          sentiment: inTop?.sentiment || 0,
          sentimentDelta: null,
          position: inTop?.position || 0,
          positionDelta: null,
          mentions: inTop?.mentions || 0,
          isUser: false,
          isTrackedCompetitor: true,
          color: COLORS[colorIdx % COLORS.length]
        })
        addedNames.add(nameLower)
        colorIdx++
      }
    })

    // Fill with top SaaS brands
    for (const brand of topBrands) {
      if (competitors.length >= limit) break
      if (addedNames.has(brand.name.toLowerCase())) continue

      competitors.push({
        rank: topBrands.indexOf(brand) + 1,
        name: brand.name,
        domain: null,
        logo: `https://cdn.brandfetch.io/${brand.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com?c=1id1Fyz-h7an5-5KR_y`,
        visibility: Math.round((brand.mentions / maxMentions) * 100),
        visibilityDelta: null,
        sentiment: brand.sentiment,
        sentimentDelta: null,
        position: brand.position,
        positionDelta: null,
        mentions: brand.mentions,
        isUser: false,
        isTrackedCompetitor: false,
        color: COLORS[colorIdx % COLORS.length]
      })
      addedNames.add(brand.name.toLowerCase())
      colorIdx++
    }

    // Sort: user first, then by visibility
    competitors.sort((a, b) => {
      if (a.isUser) return -1
      if (b.isUser) return 1
      return b.visibility - a.visibility
    })

    return NextResponse.json({
      competitors,
      total_brands_found: topBrands.length,
      user_rank: userInTop ? topBrands.indexOf(userInTop) + 1 : null
    })

  } catch (error) {
    console.error('Error in competitors API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}