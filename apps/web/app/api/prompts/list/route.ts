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

    // Get user prompts for this dashboard
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

    // Get seed prompts (suggested/system prompts)
    let seedPrompts: any[] = []
    if (includeSeeds) {
      const { data, error: seedError } = await supabase
        .from('seed_prompts')
        .select('id, prompt_text, topic, intent, is_active, created_at')
        .eq('is_active', true)
        .order('topic', { ascending: true })
        .order('created_at', { ascending: true })
        .limit(50) // Limit seed prompts shown
      
      seedPrompts = data || []
    }
    
    // Combine for processing
    const allPromptIds = [
      ...userPrompts.map(p => p.id),
      ...seedPrompts.map(p => p.id)
    ]

    // Get execution stats
    const { data: executions } = await supabase
      .from('prompt_executions')
      .select('prompt_id, model, executed_at, error')
      .in('prompt_id', allPromptIds)
      .is('error', null)
      .order('executed_at', { ascending: false })

    // Get brand mentions
    const { data: mentions } = await supabase
      .from('prompt_brand_mentions')
      .select('execution_id, brand_name, position, sentiment')

    // Build execution map
    const execMap = new Map<string, {
      execCount: number
      lastExecuted: string | null
      models: Set<string>
    }>()

    executions?.forEach(exec => {
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

    // Format user prompts (active)
    const activePrompts = userPrompts.map(prompt => {
      const stats = execMap.get(prompt.id)
      const volume = stats ? Math.min(100, stats.execCount * 20) : 0
      const visibility = stats ? Math.round((stats.execCount / 3) * 100) : 0
      
      return {
        id: prompt.id,
        prompt_text: prompt.prompt_text,
        topic: prompt.topic,
        status: 'active' as const,
        visibility_score: Math.min(100, visibility),
        sentiment: null,
        position: null,
        mentions: 0,
        volume,
        last_executed_at: stats?.lastExecuted || null,
        source: 'user'
      }
    })

    // Format seed prompts (suggested)
    const suggestedPrompts = seedPrompts.map(prompt => {
      const stats = execMap.get(prompt.id)
      const volume = stats ? Math.min(100, stats.execCount * 20) : 0
      const visibility = stats ? Math.round((stats.execCount / 3) * 100) : 0
      
      return {
        id: prompt.id,
        prompt_text: prompt.prompt_text,
        topic: prompt.topic,
        status: 'suggested' as const,
        visibility_score: Math.min(100, visibility),
        sentiment: null,
        position: null,
        mentions: 0,
        volume,
        last_executed_at: stats?.lastExecuted || null,
        source: 'seed'
      }
    })

    // Get all unique topics
    const allTopics = [...new Set([
      ...activePrompts.map(p => p.topic),
      ...suggestedPrompts.map(p => p.topic)
    ].filter(Boolean))]

    return NextResponse.json({
      prompts: activePrompts,
      suggested: suggestedPrompts.slice(0, 5), // Top 5 suggestions
      all_suggested: suggestedPrompts,
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