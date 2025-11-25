// apps/web/app/api/scan/start/route.ts
// Return immediately - client will trigger process

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  return createClient(supabaseUrl, supabaseKey)
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    
    const body = await req.json()
    const { dashboardId } = body

    if (!dashboardId) {
      return NextResponse.json(
        { error: 'Dashboard ID is required' },
        { status: 400 }
      )
    }

    console.log('[Scan Start] Creating scan for dashboard:', dashboardId)

    // Get dashboard details
    const { data: dashboard, error: dashboardError } = await supabase
      .from('dashboards')
      .select('*')
      .eq('id', dashboardId)
      .single()

    if (dashboardError || !dashboard) {
      return NextResponse.json(
        { error: 'Dashboard not found' },
        { status: 404 }
      )
    }

    // Check plan limits
    const { data: planLimit } = await supabase
      .from('plan_limits')
      .select('*')
      .eq('plan', dashboard.plan)
      .single()

    if (!planLimit) {
      return NextResponse.json(
        { error: 'Invalid plan configuration' },
        { status: 500 }
      )
    }

    // Determine time window
    let timeWindowStart: Date
    let isWeeklyPlan = false
    
    if (planLimit.fresh_scans_week) {
      timeWindowStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      isWeeklyPlan = true
    } else {
      timeWindowStart = new Date()
      timeWindowStart.setDate(1)
      timeWindowStart.setHours(0, 0, 0, 0)
    }

    // Count scans
    const { count: scansInPeriod } = await supabase
      .from('scans')
      .select('*', { count: 'exact', head: true })
      .eq('dashboard_id', dashboardId)
      .eq('type', 'fresh')
      .gte('started_at', timeWindowStart.toISOString())

    const scansUsed = scansInPeriod || 0
    const scanLimit = isWeeklyPlan ? planLimit.fresh_scans_week : planLimit.fresh_scans_month
    
    if (scansUsed >= scanLimit) {
      const period = isWeeklyPlan ? 'week' : 'month'
      return NextResponse.json(
        { error: `Scan limit reached (${scansUsed}/${scanLimit} per ${period}).`, limitReached: true },
        { status: 429 }
      )
    }

    // Create scan
    const { data: scan, error: scanError } = await supabase
      .from('scans')
      .insert({
        dashboard_id: dashboardId,
        type: 'fresh',
        status: 'queued',
        started_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (scanError || !scan) {
      console.error('[Scan Start] Error creating scan:', scanError)
      return NextResponse.json({ error: 'Failed to create scan' }, { status: 500 })
    }

    console.log('[Scan Start] Scan created:', scan.id)

    // Create jobs
    const modules = ['shopping', 'brand', 'conversations', 'website']
    const jobInserts = modules.map((module) => ({
      scan_id: scan.id,
      module,
      status: 'queued',
    }))

    const { error: jobsError } = await supabase
      .from('scan_jobs')
      .insert(jobInserts)

    if (jobsError) {
      console.error('[Scan Start] Error creating jobs:', jobsError)
      return NextResponse.json({ error: 'Failed to create scan jobs' }, { status: 500 })
    }

    console.log('[Scan Start] Jobs created successfully')

    // Return immediately - client will trigger /api/scan/process
    return NextResponse.json({
      scan,
      message: 'Scan created - ready to process',
    })
    
  } catch (error) {
    console.error('[Scan Start] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}