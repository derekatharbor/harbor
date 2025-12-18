// app/api/cron/daily-dashboard/route.ts
// Daily dashboard cron - re-executes user prompts and stores visibility snapshots
// Run daily via GitHub Actions
// 
// IMPORTANT: Only runs for PAID users and ACTIVE TRIALS
// Does NOT run for free users or expired trials

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const maxDuration = 600 // 10 minutes max

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Verify cron secret
function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  
  const { searchParams } = new URL(request.url)
  if (searchParams.get('manual') === 'true' && process.env.NODE_ENV === 'development') {
    return true
  }
  
  if (!cronSecret) {
    console.warn('CRON_SECRET not set - rejecting request')
    return false
  }
  return authHeader === `Bearer ${cronSecret}`
}

// Check if user should get scans (paid or active trial)
function isEligibleForScans(dashboard: {
  plan?: string | null
  trial_ends_at?: string | null
  created_at?: string | null
}): boolean {
  // Paid plans always eligible
  const paidPlans = ['pro', 'growth', 'enterprise', 'solo', 'agency']
  if (dashboard.plan && paidPlans.includes(dashboard.plan.toLowerCase())) {
    return true
  }
  
  // Check trial status
  if (dashboard.trial_ends_at) {
    const trialEnd = new Date(dashboard.trial_ends_at)
    if (trialEnd > new Date()) {
      return true // Active trial
    }
  }
  
  // Fallback: 7-day trial from account creation if no explicit trial_ends_at
  if (dashboard.created_at && !dashboard.plan) {
    const createdAt = new Date(dashboard.created_at)
    const trialEnd = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000)
    if (trialEnd > new Date()) {
      return true // Within implicit 7-day trial
    }
  }
  
  return false
}

export async function GET(request: NextRequest) {
  const supabase = getSupabase()
  
  // Get stats on dashboards and their prompts
  const { data: dashboards } = await supabase
    .from('dashboards')
    .select('id, brand_name, plan, trial_ends_at, created_at')
    .not('brand_name', 'is', null)
  
  // Filter to eligible dashboards
  const eligibleDashboards = dashboards?.filter(isEligibleForScans) || []
  const ineligibleCount = (dashboards?.length || 0) - eligibleDashboards.length
  
  const { data: lastSnapshot } = await supabase
    .from('dashboard_visibility_snapshots')
    .select('snapshot_date')
    .order('snapshot_date', { ascending: false })
    .limit(1)
    .single()
  
  // Count prompts for eligible dashboards only
  const eligibleIds = eligibleDashboards.map(d => d.id)
  const { count: totalPrompts } = await supabase
    .from('user_prompts')
    .select('*', { count: 'exact', head: true })
    .in('dashboard_id', eligibleIds)
    .eq('is_active', true)
  
  return NextResponse.json({
    status: 'ok',
    total_dashboards: dashboards?.length || 0,
    eligible_dashboards: eligibleDashboards.length,
    ineligible_skipped: ineligibleCount,
    total_active_prompts: totalPrompts || 0,
    last_snapshot: lastSnapshot?.snapshot_date || 'never',
    hint: 'POST to execute prompts and create snapshots (paid/trial users only)'
  })
}

export async function POST(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const supabase = getSupabase()
  const today = new Date().toISOString().split('T')[0]
  
  const body = await request.json().catch(() => ({}))
  const dashboardId = body.dashboard_id // Optional: run for specific dashboard
  const skipExecution = body.skip_execution || false // Just snapshot, don't re-run
  const limit = body.limit || 50 // Max dashboards to process
  
  const results = {
    dashboards_processed: 0,
    dashboards_skipped_not_eligible: 0,
    prompts_executed: 0,
    snapshots_created: 0,
    errors: [] as string[]
  }
  
  try {
    // Get dashboards to process - include plan and trial info
    let dashboardQuery = supabase
      .from('dashboards')
      .select('id, brand_name, domain, plan, trial_ends_at, created_at')
      .not('brand_name', 'is', null)
    
    if (dashboardId) {
      dashboardQuery = dashboardQuery.eq('id', dashboardId)
    }
    
    const { data: dashboards, error: dbError } = await dashboardQuery.limit(limit * 2) // Fetch more since some will be filtered
    
    if (dbError || !dashboards) {
      throw new Error('Failed to fetch dashboards: ' + dbError?.message)
    }
    
    for (const dashboard of dashboards) {
      // CHECK ELIGIBILITY - skip free/expired users
      if (!isEligibleForScans(dashboard)) {
        results.dashboards_skipped_not_eligible++
        continue
      }
      
      // Stop if we've hit our limit
      if (results.dashboards_processed >= limit) break
      
      try {
        // Get active prompts for this dashboard
        const { data: prompts } = await supabase
          .from('user_prompts')
          .select('id, prompt_text')
          .eq('dashboard_id', dashboard.id)
          .eq('is_active', true)
          .limit(20) // Max 20 prompts per dashboard
        
        if (!prompts || prompts.length === 0) continue
        
        // Execute prompts if not skipping
        if (!skipExecution) {
          const models = ['chatgpt', 'claude', 'perplexity']
          
          for (const prompt of prompts) {
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
                      model: model,
                      brand: dashboard.brand_name,
                      dashboard_id: dashboard.id
                    })
                  }
                )
                
                if (execResponse.ok) {
                  results.prompts_executed++
                } else {
                  const errData = await execResponse.json().catch(() => ({}))
                  results.errors.push(`Prompt ${prompt.id} (${model}): ${errData.error || execResponse.status}`)
                }
                
                // Small delay to avoid rate limits
                await new Promise(r => setTimeout(r, 500))
                
              } catch (e) {
                results.errors.push(`Prompt ${prompt.id} (${model}): ${e instanceof Error ? e.message : 'Failed'}`)
              }
            }
          }
        }
        
        // Calculate visibility metrics from recent executions
        const { data: executions } = await supabase
          .from('prompt_executions')
          .select(`
            id,
            model,
            prompt_brand_mentions (brand_name, sentiment, position)
          `)
          .in('prompt_id', prompts.map(p => p.id))
          .gte('executed_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        
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
        
        // Upsert snapshot for today
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
        }
        
        results.dashboards_processed++
        
      } catch (e) {
        results.errors.push(`Dashboard ${dashboard.id}: ${e instanceof Error ? e.message : 'Failed'}`)
      }
    }
    
    return NextResponse.json({
      success: true,
      date: today,
      results
    })
    
  } catch (error) {
    console.error('Daily dashboard cron error:', error)
    return NextResponse.json(
      { error: 'Cron failed', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}