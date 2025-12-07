// app/api/prompts/list/route.ts
// Fetch prompts with execution statistics

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(request.url)
    const dashboardId = searchParams.get('dashboard_id')
    const includeSeeds = searchParams.get('include_seeds') !== 'false'

    // ============================================================
    // 1. Get prompts selected during onboarding (dashboard_prompts)
    // ============================================================
    let onboardingPrompts: any[] = []
    let onboardingPromptIds: Set<string> = new Set()
    
    if (dashboardId) {
      const { data: dashboardPromptLinks } = await supabase
        .from('dashboard_prompts')
        .select('prompt_id')
        .eq('dashboard_id', dashboardId)
      
      if (dashboardPromptLinks && dashboardPromptLinks.length > 0) {
        const promptIds = dashboardPromptLinks.map(dp => dp.prompt_id)
        onboardingPromptIds = new Set(promptIds)
        
        const { data: linkedPrompts } = await supabase
          .from('seed_prompts')
          .select('id, prompt_text, topic, intent, is_active, created_at')
          .in('id', promptIds)
        
        onboardingPrompts = linkedPrompts || []
      }
    }

    // ============================================================
    // 2. Get dismissed prompts (for inactive tab)
    // ============================================================
    let dismissedPrompts: any[] = []
    let dismissedPromptIds: Set<string> = new Set()
    
    if (dashboardId) {
      const { data: dismissedLinks } = await supabase
        .from('dashboard_dismissed_prompts')
        .select('prompt_id, dismissed_at')
        .eq('dashboard_id', dashboardId)
      
      if (dismissedLinks && dismissedLinks.length > 0) {
        const promptIds = dismissedLinks.map(dp => dp.prompt_id)
        dismissedPromptIds = new Set(promptIds)
        
        const { data: linkedPrompts } = await supabase
          .from('seed_prompts')
          .select('id, prompt_text, topic, intent, is_active, created_at')
          .in('id', promptIds)
        
        dismissedPrompts = (linkedPrompts || []).map(p => ({
          ...p,
          dismissed_at: dismissedLinks.find(d => d.prompt_id === p.id)?.dismissed_at
        }))
      }
    }

    // ============================================================
    // 3. Get user-added prompts (user_prompts table)
    // ============================================================
    let userPrompts: any[] = []
    if (dashboardId) {
      const { data } = await supabase
        .from('user_prompts')
        .select('id, prompt_text, topic, location, tags, status, is_active, created_at')
        .eq('dashboard_id', dashboardId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      
      userPrompts = data || []
    }

    // ============================================================
    // 4. Get seed prompts (exclude tracked and dismissed)
    // ============================================================
    let seedPrompts: any[] = []
    if (includeSeeds) {
      const { data: allSeeds } = await supabase
        .from('seed_prompts')
        .select('id, prompt_text, topic, intent, is_active, created_at')
        .eq('is_active', true)
        .order('topic', { ascending: true })
        .order('created_at', { ascending: true })
        .limit(100)
      
      // Filter out already tracked AND dismissed prompts
      seedPrompts = (allSeeds || []).filter(p => 
        !onboardingPromptIds.has(p.id) && !dismissedPromptIds.has(p.id)
      )
    }
    
    // ============================================================
    // 5. Get execution stats for all prompts
    // ============================================================
    const allPromptIds = [
      ...onboardingPrompts.map(p => p.id),
      ...userPrompts.map(p => p.id),
      ...seedPrompts.map(p => p.id),
      ...dismissedPrompts.map(p => p.id)
    ]

    let executions: any[] = []
    if (allPromptIds.length > 0) {
      const { data } = await supabase
        .from('prompt_executions')
        .select('prompt_id, model, executed_at, error')
        .in('prompt_id', allPromptIds)
        .is('error', null)
        .order('executed_at', { ascending: false })
      
      executions = data || []
    }

    // Build execution map with models
    const execMap = new Map<string, {
      execCount: number
      lastExecuted: string | null
      models: Set<string>
    }>()

    executions.forEach(exec => {
      const existing = execMap.get(exec.prompt_id) || {
        execCount: 0,
        lastExecuted: null,
        models: new Set<string>()
      }
      existing.execCount++
      if (!existing.lastExecuted || exec.executed_at > existing.lastExecuted) {
        existing.lastExecuted = exec.executed_at
      }
      existing.models.add(exec.model)
      execMap.set(exec.prompt_id, existing)
    })

    // ============================================================
    // 6. Format prompts for response
    // ============================================================
    const formatPrompt = (prompt: any, source: 'onboarding' | 'user' | 'seed' | 'dismissed') => {
      const stats = execMap.get(prompt.id)
      const volume = stats ? Math.min(100, stats.execCount * 20) : 0
      const visibility = stats ? Math.round((stats.execCount / 3) * 100) : 0
      
      return {
        id: prompt.id,
        prompt_text: prompt.prompt_text,
        topic: prompt.topic || prompt.intent || null,
        status: source === 'seed' ? 'suggested' as const : 
                source === 'dismissed' ? 'inactive' as const : 'active' as const,
        visibility_score: Math.min(100, visibility),
        sentiment: null,
        position: null,
        mentions: 0,
        volume,
        last_executed_at: stats?.lastExecuted || null,
        models_run: stats ? Array.from(stats.models) : [],
        source,
        dismissed_at: prompt.dismissed_at || null
      }
    }

    // Active = onboarding selections + user-added
    const activePrompts = [
      ...onboardingPrompts.map(p => formatPrompt(p, 'onboarding')),
      ...userPrompts.map(p => formatPrompt(p, 'user'))
    ]

    // Suggested = remaining seed prompts
    const suggestedPrompts = seedPrompts.map(p => formatPrompt(p, 'seed'))

    // Inactive = dismissed prompts
    const inactivePrompts = dismissedPrompts.map(p => formatPrompt(p, 'dismissed'))

    // Get all unique topics
    const allTopics = [...new Set([
      ...activePrompts.map(p => p.topic),
      ...suggestedPrompts.map(p => p.topic),
      ...inactivePrompts.map(p => p.topic)
    ].filter(Boolean))]

    return NextResponse.json({
      prompts: activePrompts,
      suggested: suggestedPrompts.slice(0, 25),
      all_suggested: suggestedPrompts,
      inactive: inactivePrompts,
      total: activePrompts.length,
      topics: allTopics
    })

  } catch (error) {
    console.error('Error fetching prompts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch prompts', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}