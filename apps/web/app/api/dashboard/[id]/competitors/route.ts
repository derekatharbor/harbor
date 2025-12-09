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
  '#6B8AFD', // Soft blue (user's brand)
  '#8B8B9E', // Muted lavender-gray
  '#7A9E9A', // Muted teal
  '#A89080', // Muted taupe
  '#9A8BA3', // Muted mauve
  '#7D8A7D', // Muted sage
  '#A3908B', // Muted rose-gray
  '#8A8FA3', // Muted slate
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
    const brandCounts = new Map<string, { 
      mentions: number
      totalPosition: number
      sentiments: { positive: number; neutral: number; negative: number }
    }>()
    
    mentions?.forEach(m => {
      const name = m.brand_name?.trim()
      if (!name) return
      
      const existing = brandCounts.get(name) || { 
        mentions: 0, 
        totalPosition: 0, 
        sentiments: { positive: 0, neutral: 0, negative: 0 }
      }
      existing.mentions++
      existing.totalPosition += (m.position || 5)
      
      // Count sentiment occurrences
      const sentiment = m.sentiment as 'positive' | 'neutral' | 'negative'
      if (sentiment && existing.sentiments[sentiment] !== undefined) {
        existing.sentiments[sentiment]++
      } else {
        existing.sentiments.neutral++
      }
      
      brandCounts.set(name, existing)
    })

    // Helper to get dominant sentiment
    const getDominantSentiment = (sentiments: { positive: number; neutral: number; negative: number }) => {
      if (sentiments.positive >= sentiments.neutral && sentiments.positive >= sentiments.negative) {
        return 'positive'
      }
      if (sentiments.negative > sentiments.positive && sentiments.negative >= sentiments.neutral) {
        return 'negative'
      }
      return 'neutral'
    }

    // 6. Check if user's brand was mentioned
    const userBrandLower = dashboard.brand_name.toLowerCase()
    let userMentions = 0
    let userPosition = 0
    let userSentiment = 'neutral'
    
    // Look for variations of user's brand name
    brandCounts.forEach((data, name) => {
      if (name.toLowerCase().includes(userBrandLower) || 
          userBrandLower.includes(name.toLowerCase())) {
        userMentions += data.mentions
        userPosition = Math.round((data.totalPosition / data.mentions) * 10) / 10
        userSentiment = getDominantSentiment(data.sentiments)
        brandCounts.delete(name) // Remove so we don't double-count
      }
    })

    // 7. Sort brands by mentions
    const sortedBrands = Array.from(brandCounts.entries())
      .map(([name, data]) => ({
        name,
        mentions: data.mentions,
        avgPosition: Math.round((data.totalPosition / data.mentions) * 10) / 10,
        sentiment: getDominantSentiment(data.sentiments)
      }))
      .sort((a, b) => b.mentions - a.mentions)
      .slice(0, limit - 1) // Leave room for user's brand

    const maxMentions = Math.max(
      userMentions,
      sortedBrands[0]?.mentions || 1
    )

    // Helper to get logo with fallback
    const getLogo = (brandName: string, domain: string) => {
      // Try Brandfetch first, with fallback to UI Avatars
      return `https://cdn.brandfetch.io/${domain}?c=1id1Fyz-h7an5-5KR_y`
    }
    
    const getFallbackLogo = (brandName: string) => {
      // UI Avatars as fallback
      const initials = brandName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=1a1a1a&color=ffffff&size=64`
    }

    // 8. Build response - user first, then competitors by mention count
    const competitors: any[] = []

    // User's brand always first
    competitors.push({
      rank: 1,
      name: dashboard.brand_name,
      domain: dashboard.domain,
      logo: getLogo(dashboard.brand_name, dashboard.domain),
      fallbackLogo: getFallbackLogo(dashboard.brand_name),
      visibility: maxMentions > 0 ? Math.round((userMentions / maxMentions) * 100) : 0,
      visibilityDelta: null,
      sentiment: userSentiment,
      sentimentDelta: null,
      position: userPosition || null,
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
        logo: getLogo(brand.name, guessedDomain),
        fallbackLogo: getFallbackLogo(brand.name),
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