// app/api/cron/daily-dashboard/route.ts
// Daily dashboard cron - re-executes user prompts and stores visibility snapshots
// Vercel crons use GET requests with Authorization header
//
// GET (with auth) → runs the cron job
// GET (no auth) → returns stats for debugging
// POST (with auth) → runs with custom params (manual trigger)

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes (Vercel Pro limit)

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Verify cron secret - returns true if authorized
function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  
  // Allow manual trigger in dev
  const { searchParams } = new URL(request.url)
  if (searchParams.get('manual') === 'true') {
    // In production, still require secret for manual
    if (process.env.NODE_ENV === 'development') return true
    if (cronSecret && authHeader === `Bearer ${cronSecret}`) return true
    return false
  }
  
  // Vercel cron sets this header automatically
  if (!cronSecret) {
    console.warn('[Cron] CRON_SECRET not set')
    return false
  }
  
  return authHeader === `Bearer ${cronSecret}`
}

// Check if dashboard should get scans
function isEligibleForScans(dashboard: { plan?: string | null }): boolean {
  const eligiblePlans = ['pro', 'growth', 'enterprise', 'solo', 'agency', 'free']
  if (!dashboard.plan) return true
  return eligiblePlans.includes(dashboard.plan.toLowerCase())
}

// ============================================================================
// CORE EXECUTION LOGIC
// ============================================================================

async function runDailyCron(options: {
  dashboardId?: string
  skipExecution?: boolean
  limit?: number
}) {
  const supabase = getSupabase()
  const today = new Date().toISOString().split('T')[0]
  // Default to skipping execution - cron just snapshots existing data
  // Set skipExecution=false explicitly to run prompts (manual trigger only)
  const { dashboardId, skipExecution = true, limit = 100 } = options
  
  const results = {
    date: today,
    dashboards_processed: 0,
    dashboards_skipped: 0,
    prompts_executed: 0,
    snapshots_created: 0,
    errors: [] as string[]
  }
  
  try {
    // Get dashboards to process
    let dashboardQuery = supabase
      .from('dashboards')
      .select('id, brand_name, domain, plan')
      .not('brand_name', 'is', null)
    
    if (dashboardId) {
      dashboardQuery = dashboardQuery.eq('id', dashboardId)
    }
    
    const { data: dashboards, error: dbError } = await dashboardQuery.limit(limit * 2)
    
    if (dbError || !dashboards) {
      throw new Error('Failed to fetch dashboards: ' + dbError?.message)
    }
    
    console.log(`[Cron] Processing ${dashboards.length} dashboards`)
    
    for (const dashboard of dashboards) {
      if (!isEligibleForScans(dashboard)) {
        results.dashboards_skipped++
        continue
      }
      
      if (results.dashboards_processed >= limit) break
      
      try {
        // Get active prompts
        const { data: prompts } = await supabase
          .from('user_prompts')
          .select('id, prompt_text')
          .eq('dashboard_id', dashboard.id)
          .eq('is_active', true)
          .limit(10) // Reduced to stay within timeout
        
        if (!prompts || prompts.length === 0) {
          results.dashboards_skipped++
          continue
        }
        
        // Execute prompts against AI models
        if (!skipExecution) {
          const models = ['chatgpt', 'claude', 'perplexity']
          
          for (const prompt of prompts.slice(0, 5)) { // Max 5 prompts per dashboard
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
                  results.prompts_executed++
                } else {
                  const errText = await execResponse.text().catch(() => '')
                  results.errors.push(`${prompt.id}/${model}: ${execResponse.status}`)
                }
                
                // Rate limit protection
                await new Promise(r => setTimeout(r, 300))
                
              } catch (e) {
                results.errors.push(`${prompt.id}/${model}: ${e instanceof Error ? e.message : 'error'}`)
              }
            }
          }
        }
        
        // Calculate visibility metrics from recent executions (last 7 days)
        const { data: executions } = await supabase
          .from('prompt_executions')
          .select(`
            id,
            prompt_brand_mentions (brand_name, sentiment, position)
          `)
          .in('prompt_id', prompts.map(p => p.id))
          .gte('executed_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        
        // Calculate metrics
        let totalExecutions = executions?.length || 0
        let mentionCount = 0
        let positionSum = 0
        let positionCount = 0
        let sentimentSum = 0
        let sentimentCount = 0
        
        const brandNameLower = dashboard.brand_name?.toLowerCase() || ''
        
        for (const exec of executions || []) {
          const mentions = exec.prompt_brand_mentions as any[] || []
          
          const brandMention = mentions.find(m => {
            const mentionLower = m.brand_name?.toLowerCase() || ''
            return mentionLower === brandNameLower ||
                   brandNameLower.includes(mentionLower) ||
                   mentionLower.includes(brandNameLower)
          })
          
          if (brandMention) {
            mentionCount++
            if (brandMention.position) {
              positionSum += brandMention.position
              positionCount++
            }
            if (brandMention.sentiment) {
              sentimentCount++
              if (brandMention.sentiment === 'positive') sentimentSum += 100
              else if (brandMention.sentiment === 'neutral') sentimentSum += 50
            }
          }
        }
        
        const visibility = totalExecutions > 0 ? Math.round((mentionCount / totalExecutions) * 100) : 0
        const avgPosition = positionCount > 0 ? positionSum / positionCount : null
        const avgSentiment = sentimentCount > 0 ? Math.round(sentimentSum / sentimentCount) : 50
        
        // Upsert today's snapshot
        const { error: snapshotError } = await supabase
          .from('dashboard_visibility_snapshots')
          .upsert({
            dashboard_id: dashboard.id,
            snapshot_date: today,
            visibility_score: visibility,
            avg_position: avgPosition,
            sentiment_score: avgSentiment,
            total_executions: totalExecutions,
            mention_count: mentionCount,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'dashboard_id,snapshot_date'
          })
        
        if (!snapshotError) {
          results.snapshots_created++
        } else {
          results.errors.push(`snapshot/${dashboard.id}: ${snapshotError.message}`)
        }
        
        results.dashboards_processed++
        
      } catch (e) {
        results.errors.push(`dashboard/${dashboard.id}: ${e instanceof Error ? e.message : 'error'}`)
      }
    }
    
    console.log(`[Cron] Complete:`, results)
    return { success: true, results }
    
  } catch (error) {
    console.error('[Cron] Fatal error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      results 
    }
  }
}

// ============================================================================
// ROUTE HANDLERS
// ============================================================================

export async function GET(request: NextRequest) {
  const isAuthorized = verifyCronSecret(request)
  
  // If authorized (Vercel cron or manual with secret), run the job
  if (isAuthorized) {
    console.log('[Cron] Starting daily-dashboard cron (GET)')
    const result = await runDailyCron({})
    return NextResponse.json(result)
  }
  
  // Not authorized - just return stats for debugging
  const supabase = getSupabase()
  
  const { data: dashboards } = await supabase
    .from('dashboards')
    .select('id, brand_name, plan')
    .not('brand_name', 'is', null)
  
  const eligibleDashboards = dashboards?.filter(isEligibleForScans) || []
  
  const { data: lastSnapshot } = await supabase
    .from('dashboard_visibility_snapshots')
    .select('snapshot_date')
    .order('snapshot_date', { ascending: false })
    .limit(1)
    .single()
  
  const eligibleIds = eligibleDashboards.map(d => d.id)
  const { count: totalPrompts } = await supabase
    .from('user_prompts')
    .select('*', { count: 'exact', head: true })
    .in('dashboard_id', eligibleIds.length > 0 ? eligibleIds : ['none'])
    .eq('is_active', true)
  
  return NextResponse.json({
    status: 'ready',
    total_dashboards: dashboards?.length || 0,
    eligible_dashboards: eligibleDashboards.length,
    total_active_prompts: totalPrompts || 0,
    last_snapshot: lastSnapshot?.snapshot_date || 'never',
    hint: 'Add Authorization header to trigger execution'
  })
}

// POST for manual triggers with custom options
export async function POST(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const body = await request.json().catch(() => ({}))
  
  console.log('[Cron] Starting daily-dashboard cron (POST)', body)
  const result = await runDailyCron({
    dashboardId: body.dashboard_id,
    skipExecution: body.skip_execution,
    limit: body.limit
  })
  
  return NextResponse.json(result)
}