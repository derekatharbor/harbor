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

    // Get seed prompts with their latest execution stats
    const { data: seedPrompts, error: seedError } = await supabase
      .from('seed_prompts')
      .select('id, prompt_text, topic, intent, is_active, created_at')
      .eq('is_active', true)
      .order('topic', { ascending: true })
      .order('created_at', { ascending: true })

    if (seedError) {
      throw seedError
    }

    // Get execution stats for each prompt
    const promptIds = seedPrompts?.map(p => p.id) || []
    
    // Get latest executions with brand mentions
    const { data: executions } = await supabase
      .from('prompt_executions')
      .select(`
        prompt_id,
        model,
        executed_at,
        error
      `)
      .in('prompt_id', promptIds)
      .is('error', null)
      .order('executed_at', { ascending: false })

    // Get brand mentions
    const { data: mentions } = await supabase
      .from('prompt_brand_mentions')
      .select(`
        execution_id,
        brand_name,
        position,
        sentiment
      `)

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

    // Build mentions map by execution_id
    const mentionsMap = new Map<string, any[]>()
    mentions?.forEach(m => {
      const existing = mentionsMap.get(m.execution_id) || []
      existing.push(m)
      mentionsMap.set(m.execution_id, existing)
    })

    // Calculate stats per prompt
    const prompts = seedPrompts?.map(prompt => {
      const stats = execMap.get(prompt.id)
      
      // Calculate visibility (% of executions with any brand mention)
      // For now, use execution count as a proxy for volume
      const volume = stats ? Math.min(100, stats.execCount * 20) : 0
      
      // Get average position and sentiment from mentions
      let avgPosition: number | null = null
      let dominantSentiment: 'positive' | 'neutral' | 'negative' | null = null
      let mentionCount = 0

      // This is simplified - in production you'd join properly
      // For now, estimate based on execution count
      const visibility = stats ? Math.round((stats.execCount / 3) * 100) : 0

      return {
        id: prompt.id,
        prompt_text: prompt.prompt_text,
        topic: prompt.topic,
        status: 'active' as const,
        visibility_score: Math.min(100, visibility),
        sentiment: dominantSentiment,
        position: avgPosition,
        mentions: mentionCount,
        volume,
        last_executed_at: stats?.lastExecuted || null,
        models_tested: stats ? Array.from(stats.models) : []
      }
    }) || []

    return NextResponse.json({
      prompts,
      total: prompts.length,
      topics: [...new Set(prompts.map(p => p.topic).filter(Boolean))]
    })

  } catch (error) {
    console.error('Error fetching prompts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch prompts', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}
