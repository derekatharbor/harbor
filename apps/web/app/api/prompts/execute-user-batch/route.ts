// POST /api/prompts/execute-user-batch
// Execute batch of USER prompts (from dashboards) - called by cron job
// Similar to execute-batch but for user_prompts table instead of seed_prompts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const maxDuration = 60 // 1 minute max

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  
  const { searchParams } = new URL(request.url)
  if (searchParams.get('manual') === 'true') {
    if (process.env.NODE_ENV === 'development') return true
    if (cronSecret && authHeader === `Bearer ${cronSecret}`) return true
    return false
  }
  
  if (!cronSecret) return true
  return authHeader === `Bearer ${cronSecret}`
}

export async function POST(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getSupabase()

  try {
    const body = await request.json().catch(() => ({}))
    const batchSize = body.batch_size || 3 // Small batches to avoid timeout
    const force = body.force || false

    // Get all active user prompts with their dashboards
    const { data: prompts, error: promptsError } = await supabase
      .from('user_prompts')
      .select(`
        id,
        prompt_text,
        dashboard_id,
        dashboards!inner (
          id,
          brand_name,
          domain,
          plan
        )
      `)
      .eq('is_active', true)
      .limit(50) // Get more, we'll filter by staleness

    if (promptsError) {
      throw new Error('Failed to fetch prompts: ' + promptsError.message)
    }

    if (!prompts || prompts.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No active user prompts found',
        executed: 0
      })
    }

    // Get latest execution for each prompt
    const promptIds = prompts.map(p => p.id)
    const { data: latestExecs } = await supabase
      .from('prompt_executions')
      .select('prompt_id, executed_at')
      .in('prompt_id', promptIds)
      .order('executed_at', { ascending: false })

    // Build map of prompt_id -> latest execution time
    const lastExecMap = new Map<string, string>()
    latestExecs?.forEach(exec => {
      if (!lastExecMap.has(exec.prompt_id)) {
        lastExecMap.set(exec.prompt_id, exec.executed_at)
      }
    })

    // Filter to stale prompts (not executed in last 24 hours)
    const staleThreshold = Date.now() - 24 * 60 * 60 * 1000
    let stalePrompts = prompts

    if (!force) {
      stalePrompts = prompts.filter(p => {
        const lastExec = lastExecMap.get(p.id)
        if (!lastExec) return true // Never executed
        return new Date(lastExec).getTime() < staleThreshold
      })
    }

    // Sort by oldest execution first, limit to batch size
    stalePrompts.sort((a, b) => {
      const aTime = lastExecMap.get(a.id) ? new Date(lastExecMap.get(a.id)!).getTime() : 0
      const bTime = lastExecMap.get(b.id) ? new Date(lastExecMap.get(b.id)!).getTime() : 0
      return aTime - bTime
    })
    stalePrompts = stalePrompts.slice(0, batchSize)

    if (stalePrompts.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No stale user prompts to execute - all prompts are fresh',
        executed: 0,
        total_prompts: prompts.length,
        hint: 'Use force=true to run regardless of freshness'
      })
    }

    const results = {
      executed: 0,
      failed: 0,
      errors: [] as string[]
    }

    const models = ['chatgpt', 'claude', 'perplexity']

    for (const prompt of stalePrompts) {
      const dashboard = prompt.dashboards as any
      
      // Execute on each model
      for (const model of models) {
        try {
          const execResponse = await fetch(
            `${process.env.NEXT_PUBLIC_APP_URL || 'https://useharbor.io'}/api/prompts/execute-single`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                prompt_id: prompt.id,
                prompt_text: prompt.prompt_text,
                model,
                brand: dashboard.brand_name,
                dashboard_id: dashboard.id
              })
            }
          )

          if (execResponse.ok) {
            results.executed++
          } else {
            const errText = await execResponse.text().catch(() => 'unknown')
            results.errors.push(`${prompt.id}/${model}: ${execResponse.status}`)
            results.failed++
          }

          // Rate limit protection
          await new Promise(r => setTimeout(r, 500))

        } catch (e) {
          results.failed++
          results.errors.push(`${prompt.id}/${model}: ${e instanceof Error ? e.message : 'error'}`)
        }
      }
    }

    return NextResponse.json({
      success: true,
      prompts_processed: stalePrompts.length,
      executions: results.executed,
      failed: results.failed,
      errors: results.errors.length > 0 ? results.errors.slice(0, 5) : undefined
    })

  } catch (error) {
    console.error('User batch execution error:', error)
    return NextResponse.json(
      { error: 'Batch execution failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// GET endpoint to check stale user prompts
export async function GET(request: NextRequest) {
  const supabase = getSupabase()
  
  // Get all active user prompts
  const { data: prompts } = await supabase
    .from('user_prompts')
    .select('id, prompt_text, dashboard_id')
    .eq('is_active', true)
    .limit(100)

  if (!prompts || prompts.length === 0) {
    return NextResponse.json({ stale_count: 0, total: 0, sample: [] })
  }

  // Get latest execution for each
  const promptIds = prompts.map(p => p.id)
  const { data: latestExecs } = await supabase
    .from('prompt_executions')
    .select('prompt_id, executed_at')
    .in('prompt_id', promptIds)
    .order('executed_at', { ascending: false })

  const lastExecMap = new Map<string, string>()
  latestExecs?.forEach(exec => {
    if (!lastExecMap.has(exec.prompt_id)) {
      lastExecMap.set(exec.prompt_id, exec.executed_at)
    }
  })

  const staleThreshold = Date.now() - 24 * 60 * 60 * 1000
  const stalePrompts = prompts.filter(p => {
    const lastExec = lastExecMap.get(p.id)
    if (!lastExec) return true
    return new Date(lastExec).getTime() < staleThreshold
  })

  return NextResponse.json({
    stale_count: stalePrompts.length,
    total: prompts.length,
    sample: stalePrompts.slice(0, 10).map(p => ({
      id: p.id,
      prompt: p.prompt_text.slice(0, 50) + '...',
      last_run: lastExecMap.get(p.id) || null
    }))
  })
}
