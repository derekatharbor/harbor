// apps/web/app/api/scan/start/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
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

    // Check recent scans (weekly/monthly limits)
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const { data: recentScans } = await supabase
      .from('scans')
      .select('started_at')
      .eq('dashboard_id', dashboardId)
      .eq('type', 'fresh')
      .gte('started_at', weekAgo.toISOString())

    // Weekly limit check (Solo plan)
    if (planLimit.fresh_scans_week && recentScans) {
      const weeklyScans = recentScans.filter(
        (s) => new Date(s.started_at) >= weekAgo
      )
      if (weeklyScans.length >= planLimit.fresh_scans_week) {
        return NextResponse.json(
          {
            error: `Weekly scan limit reached (${planLimit.fresh_scans_week}/week). Next scan available in ${Math.ceil((weekAgo.getTime() + 7 * 24 * 60 * 60 * 1000 - now.getTime()) / (24 * 60 * 60 * 1000))} days.`,
            limitReached: true,
          },
          { status: 429 }
        )
      }
    }

    // Monthly limit check (Agency plan)
    if (planLimit.fresh_scans_month && recentScans) {
      const monthlyScans = recentScans.filter(
        (s) => new Date(s.started_at) >= monthAgo
      )
      if (monthlyScans.length >= planLimit.fresh_scans_month) {
        return NextResponse.json(
          {
            error: `Monthly scan limit reached (${planLimit.fresh_scans_month}/month).`,
            limitReached: true,
          },
          { status: 429 }
        )
      }
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