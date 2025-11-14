// apps/web/app/api/scan/start/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Force dynamic rendering - don't pre-render at build time
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

    // Determine time window based on plan type
    let timeWindowStart: Date
    let isWeeklyPlan = false
    
    if (planLimit.fresh_scans_week) {
      // Weekly plan (Solo) - count from 7 days ago
      timeWindowStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      isWeeklyPlan = true
    } else {
      // Monthly plan (Agency/Enterprise) - count from start of month
      timeWindowStart = new Date()
      timeWindowStart.setDate(1)
      timeWindowStart.setHours(0, 0, 0, 0)
    }

    // Count scans in the appropriate time window
    const { count: scansInPeriod } = await supabase
      .from('scans')
      .select('*', { count: 'exact', head: true })
      .eq('dashboard_id', dashboardId)
      .eq('type', 'fresh')
      .gte('started_at', timeWindowStart.toISOString())

    const scansUsed = scansInPeriod || 0
    const scanLimit = isWeeklyPlan ? planLimit.fresh_scans_week : planLimit.fresh_scans_month
    
    // Check if limit reached
    if (scansUsed >= scanLimit) {
      const period = isWeeklyPlan ? 'week' : 'month'
      return NextResponse.json(
        {
          error: `Scan limit reached (${scansUsed}/${scanLimit} per ${period}).`,
          limitReached: true,
        },
        { status: 429 }
      )
    }

    // Create scan record
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
      console.error('Error creating scan:', scanError)
      return NextResponse.json(
        { error: 'Failed to create scan' },
        { status: 500 }
      )
    }

    // Create scan jobs for each module
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
      console.error('Error creating scan jobs:', jobsError)
      return NextResponse.json(
        { error: 'Failed to create scan jobs' },
        { status: 500 }
      )
    }

    // Trigger background processing
    fetch(`${req.nextUrl.origin}/api/scan/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scanId: scan.id }),
    }).catch((err) => console.error('Error triggering scan process:', err))

    return NextResponse.json({
      scan,
      message: 'Scan started successfully',
    })
  } catch (error) {
    console.error('Error in POST /api/scan/start:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}