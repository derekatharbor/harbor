// app/api/prompts/list/route.ts
// Fetch prompts - filters suggested by user's industry

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Map dashboard industries to relevant seed_prompt topics
const INDUSTRY_TOPICS: Record<string, string[]> = {
  'Technology & SaaS': ['AI & Automation', 'Developer Tools', 'Project Management', 'Analytics & BI'],
  'E-commerce & Retail': ['E-commerce', 'Marketing & SEO', 'Customer Support'],
  'Food & Beverage': ['Food & Beverage', 'E-commerce', 'Marketing & SEO'],
  'Finance & Accounting': ['Finance & Accounting', 'Analytics & BI', 'Security'],
  'Marketing & Advertising': ['Marketing & SEO', 'AI & Automation', 'Design & Creative'],
  'Healthcare & Medical': ['Healthcare', 'Customer Support', 'Security'],
  'Education & E-learning': ['Education', 'AI & Automation', 'Communication'],
  'Sales & CRM': ['CRM & Sales', 'Marketing & SEO', 'Communication'],
  'HR & Recruiting': ['HR & Recruiting', 'Communication', 'AI & Automation'],
  'Developer Tools': ['Developer Tools', 'AI & Automation', 'Security'],
  'Customer Support': ['Customer Support', 'Communication', 'AI & Automation'],
  'Project Management': ['Project Management', 'Communication', 'AI & Automation'],
  'Analytics & Business Intelligence': ['Analytics & BI', 'AI & Automation', 'Developer Tools'],
  'Cybersecurity': ['Security', 'Developer Tools', 'Communication'],
  'Design & Creative': ['Design & Creative', 'AI & Automation', 'Marketing & SEO'],
  'Media & Entertainment': ['Media & Entertainment', 'Marketing & SEO', 'Design & Creative'],
  'Real Estate': ['Real Estate', 'CRM & Sales', 'Marketing & SEO'],
  'Travel & Hospitality': ['Travel & Hospitality', 'E-commerce', 'Customer Support'],
  'Legal & Compliance': ['Legal', 'Security', 'Communication'],
  'Nonprofit & Government': ['Communication', 'Project Management', 'Analytics & BI'],
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(request.url)
    const dashboardId = searchParams.get('dashboard_id')

    if (!dashboardId) {
      return NextResponse.json({ prompts: [], all_suggested: [], inactive: [], total: 0, topics: [] })
    }

    // Get dashboard to find industry and brand name
    const { data: dashboard } = await supabase
      .from('dashboards')
      .select('id, metadata, brand_name')
      .eq('id', dashboardId)
      .single()

    const userIndustry = dashboard?.metadata?.category || null
    const brandName = dashboard?.brand_name?.toLowerCase() || ''
    const relevantTopics = userIndustry ? (INDUSTRY_TOPICS[userIndustry] || []) : []

    // 1. Get tracked prompts (dashboard_prompts)
    let trackedPrompts: any[] = []
    let trackedIds = new Set<string>()
    
    const { data: trackedLinks } = await supabase
      .from('dashboard_prompts')
      .select('prompt_id')
      .eq('dashboard_id', dashboardId)
    
    if (trackedLinks && trackedLinks.length > 0) {
      const ids = trackedLinks.map(dp => dp.prompt_id)
      trackedIds = new Set(ids)
      
      const { data } = await supabase
        .from('seed_prompts')
        .select('id, prompt_text, topic, intent, is_active, created_at')
        .in('id', ids)
      
      trackedPrompts = data || []
    }

    // 2. Get dismissed prompts
    let dismissedPrompts: any[] = []
    let dismissedIds = new Set<string>()
    
    const { data: dismissedLinks } = await supabase
      .from('dashboard_dismissed_prompts')
      .select('prompt_id, dismissed_at')
      .eq('dashboard_id', dashboardId)
    
    if (dismissedLinks && dismissedLinks.length > 0) {
      const ids = dismissedLinks.map(dp => dp.prompt_id)
      dismissedIds = new Set(ids)
      
      const { data } = await supabase
        .from('seed_prompts')
        .select('id, prompt_text, topic, intent, is_active, created_at')
        .in('id', ids)
      
      dismissedPrompts = (data || []).map(p => ({
        ...p,
        dismissed_at: dismissedLinks.find(d => d.prompt_id === p.id)?.dismissed_at
      }))
    }

    // 3. Get user-added prompts
    const { data: userPrompts } = await supabase
      .from('user_prompts')
      .select('id, prompt_text, topic, location, tags, status, is_active, created_at')
      .eq('dashboard_id', dashboardId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    // 4. Get suggested prompts - FILTERED BY INDUSTRY
    let seedQuery = supabase
      .from('seed_prompts')
      .select('id, prompt_text, topic, intent, is_active, created_at')
      .eq('is_active', true)

    // Only show prompts relevant to user's industry
    if (relevantTopics.length > 0) {
      seedQuery = seedQuery.in('topic', relevantTopics)
    }

    const { data: allSeeds } = await seedQuery
      .order('topic', { ascending: true })
      .limit(100)
    
    // Exclude already tracked or dismissed
    const seedPrompts = (allSeeds || []).filter(p => 
      !trackedIds.has(p.id) && !dismissedIds.has(p.id)
    )

    // 5. Get execution stats
    const allIds = [
      ...trackedPrompts.map(p => p.id),
      ...(userPrompts || []).map(p => p.id),
      ...seedPrompts.map(p => p.id),
      ...dismissedPrompts.map(p => p.id)
    ]

    const execMap = new Map<string, { count: number; last: string | null; execIds: string[] }>()
    
    if (allIds.length > 0) {
      const { data: execs } = await supabase
        .from('prompt_executions')
        .select('id, prompt_id, executed_at')
        .in('prompt_id', allIds)
        .is('error', null)

      const execList = execs as Array<{ id: string; prompt_id: string; executed_at: string }> | null
      (execList || []).forEach(e => {
        const cur = execMap.get(e.prompt_id) || { count: 0, last: null as string | null, execIds: [] as string[] }
        cur.count++
        cur.execIds.push(e.id)
        if (!cur.last || e.executed_at > cur.last) cur.last = e.executed_at
        execMap.set(e.prompt_id, cur)
      })
    }

    // 6. Get brand mentions for all executions
    const allExecIds = Array.from(execMap.values()).flatMap(e => e.execIds)
    const mentionsMap = new Map<string, { mentions: number; sentiment: string | null; position: number | null }>()
    
    if (allExecIds.length > 0 && brandName) {
      const { data: mentions } = await supabase
        .from('prompt_brand_mentions')
        .select('execution_id, brand_name, sentiment, position')
        .in('execution_id', allExecIds)
      
      // Group mentions by prompt_id (via execution_id)
      const execToPrompt = new Map<string, string>()
      execMap.forEach((val, promptId) => {
        val.execIds.forEach(execId => execToPrompt.set(execId, promptId))
      })
      
      // Aggregate mentions per prompt
      const promptMentions = new Map<string, { count: number; sentiments: string[]; positions: number[] }>()
      
      ;(mentions || []).forEach(m => {
        const promptId = execToPrompt.get(m.execution_id)
        if (!promptId) return
        
        // Check if this mention is for the user's brand
        const mentionName = m.brand_name?.toLowerCase() || ''
        const isBrandMention = mentionName.includes(brandName) || brandName.includes(mentionName)
        
        if (isBrandMention) {
          const cur = promptMentions.get(promptId) || { count: 0, sentiments: [], positions: [] }
          cur.count++
          if (m.sentiment) cur.sentiments.push(m.sentiment)
          if (m.position) cur.positions.push(m.position)
          promptMentions.set(promptId, cur)
        }
      })
      
      // Calculate averages
      promptMentions.forEach((val, promptId) => {
        // Most common sentiment
        let sentiment: string | null = null
        if (val.sentiments.length > 0) {
          const counts = val.sentiments.reduce((acc, s) => {
            acc[s] = (acc[s] || 0) + 1
            return acc
          }, {} as Record<string, number>)
          sentiment = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || null
        }
        
        // Average position
        let position: number | null = null
        if (val.positions.length > 0) {
          position = Math.round(val.positions.reduce((a, b) => a + b, 0) / val.positions.length * 10) / 10
        }
        
        mentionsMap.set(promptId, {
          mentions: val.count,
          sentiment,
          position
        })
      })
    }

    // 7. Format
    const format = (p: any, source: string) => {
      const stats = execMap.get(p.id)
      const mentionStats = mentionsMap.get(p.id)
      return {
        id: p.id,
        prompt_text: p.prompt_text,
        topic: p.topic || p.intent || null,
        status: source === 'seed' ? 'suggested' : source === 'dismissed' ? 'inactive' : 'active',
        visibility_score: stats ? Math.min(100, Math.round((stats.count / 3) * 100)) : 0,
        sentiment: mentionStats?.sentiment || null,
        position: mentionStats?.position || null,
        mentions: mentionStats?.mentions || 0,
        volume: stats ? Math.min(100, stats.count * 20) : 0,
        last_executed_at: stats?.last || null,
        created_at: p.created_at,
        dismissed_at: p.dismissed_at || null,
        source
      }
    }

    const active = [
      ...trackedPrompts.map(p => format(p, 'onboarding')),
      ...(userPrompts || []).map(p => format(p, 'user'))
    ]
    const suggested = seedPrompts.map(p => format(p, 'seed'))
    const inactive = dismissedPrompts.map(p => format(p, 'dismissed'))

    return NextResponse.json({
      prompts: active,
      all_suggested: suggested,
      inactive,
      total: active.length,
      topics: [...new Set([...active, ...suggested, ...inactive].map(p => p.topic).filter(Boolean))],
      industry: userIndustry
    })

  } catch (error) {
    console.error('Error fetching prompts:', error)
    return NextResponse.json({ error: 'Failed to fetch prompts' }, { status: 500 })
  }
}