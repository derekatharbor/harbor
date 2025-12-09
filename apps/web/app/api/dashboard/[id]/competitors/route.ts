// app/api/dashboard/[id]/competitors/route.ts
// Shows competitors based on ACTUAL mentions in user's prompt responses

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
  '#10B981', // Emerald (user's brand)
  '#3B82F6', '#8B5CF6', '#F59E0B', 
  '#EC4899', '#06B6D4', '#EF4444', '#84CC16'
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

    // 2. Get all user_prompts for this dashboard
    const { data: userPrompts } = await supabase
      .from('user_prompts')
      .select('id')
      .eq('dashboard_id', dashboardId)
      .eq('is_active', true)

    const promptIds = userPrompts?.map(p => p.id) || []

    if (promptIds.length === 0) {
      // No prompts yet - return just user's brand
      return NextResponse.json({
        competitors: [{
          rank: 1,
          name: dashboard.brand_name,
          domain: dashboard.domain,
          logo: `https://cdn.brandfetch.io/${dashboard.domain}?c=1id1Fyz-h7an5-5KR_y`,
          visibility: 0,
          mentions: 0,
          isUser: true,
          color: COLORS[0]
        }],
        total_brands_found: 0,
        user_rank: null
      })
    }

    // 3. Get all executions for these prompts
    const { data: executions } = await supabase
      .from('prompt_executions')
      .select('id')
      .in('prompt_id', promptIds)

    const executionIds = executions?.map(e => e.id) || []

    if (executionIds.length === 0) {
      // No executions yet
      return NextResponse.json({
        competitors: [{
          rank: 1,
          name: dashboard.brand_name,
          domain: dashboard.domain,
          logo: `https://cdn.brandfetch.io/${dashboard.domain}?c=1id1Fyz-h7an5-5KR_y`,
          visibility: 0,
          mentions: 0,
          isUser: true,
          color: COLORS[0]
        }],
        total_brands_found: 0,
        user_rank: null
      })
    }

    // 4. Get brand mentions from these executions
    const { data: mentions } = await supabase
      .from('prompt_brand_mentions')
      .select('brand_name, position, sentiment')
      .in('execution_id', executionIds)

    // 5. Aggregate by brand name
    const brandCounts = new Map<string, { mentions: number; avgPosition: number; sentiment: number }>()
    
    mentions?.forEach(m => {
      const name = m.brand_name?.trim()
      if (!name) return
      
      const existing = brandCounts.get(name) || { mentions: 0, avgPosition: 0, sentiment: 0 }
      existing.mentions++
      existing.avgPosition += (m.position || 5)
      existing.sentiment += (m.sentiment || 50)
      brandCounts.set(name, existing)
    })

    // 6. Check if user's brand was mentioned
    const userBrandLower = dashboard.brand_name.toLowerCase()
    let userMentions = 0
    let userPosition = 0
    
    // Look for variations of user's brand name
    brandCounts.forEach((data, name) => {
      if (name.toLowerCase().includes(userBrandLower) || 
          userBrandLower.includes(name.toLowerCase())) {
        userMentions += data.mentions
        userPosition = data.avgPosition / data.mentions
        brandCounts.delete(name) // Remove so we don't double-count
      }
    })

    // 7. Sort brands by mentions
    const sortedBrands = Array.from(brandCounts.entries())
      .map(([name, data]) => ({
        name,
        mentions: data.mentions,
        avgPosition: data.avgPosition / data.mentions,
        sentiment: Math.round(data.sentiment / data.mentions)
      }))
      .sort((a, b) => b.mentions - a.mentions)
      .slice(0, limit - 1) // Leave room for user's brand

    const maxMentions = Math.max(
      userMentions,
      sortedBrands[0]?.mentions || 1
    )

    // 8. Build response - user first, then competitors by mention count
    const competitors: any[] = []

    // User's brand always first
    competitors.push({
      rank: 1,
      name: dashboard.brand_name,
      domain: dashboard.domain,
      logo: `https://cdn.brandfetch.io/${dashboard.domain}?c=1id1Fyz-h7an5-5KR_y`,
      visibility: maxMentions > 0 ? Math.round((userMentions / maxMentions) * 100) : 0,
      visibilityDelta: null,
      sentiment: 50,
      sentimentDelta: null,
      position: userPosition || 0,
      positionDelta: null,
      mentions: userMentions,
      isUser: true,
      color: COLORS[0]
    })

    // Add competitors from mentions
    sortedBrands.forEach((brand, idx) => {
      // Try to guess domain from brand name
      const guessedDomain = brand.name.toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .slice(0, 30) + '.com'

      competitors.push({
        rank: idx + 2,
        name: brand.name,
        domain: guessedDomain,
        logo: `https://cdn.brandfetch.io/${guessedDomain}?c=1id1Fyz-h7an5-5KR_y`,
        visibility: Math.round((brand.mentions / maxMentions) * 100),
        visibilityDelta: null,
        sentiment: brand.sentiment,
        sentimentDelta: null,
        position: brand.avgPosition,
        positionDelta: null,
        mentions: brand.mentions,
        isUser: false,
        color: COLORS[(idx + 1) % COLORS.length]
      })
    })

    // Calculate user's rank
    const userRank = userMentions > 0 
      ? sortedBrands.filter(b => b.mentions > userMentions).length + 1
      : null

    return NextResponse.json({
      competitors,
      total_brands_found: brandCounts.size,
      user_rank: userRank,
      user_mentions: userMentions,
      total_executions: executionIds.length
    })

  } catch (error) {
    console.error('Error in competitors API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}