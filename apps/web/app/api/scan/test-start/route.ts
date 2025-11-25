// app/api/scan/test-start/route.ts
// Test version of scan/start that uses test-process

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

    console.log('[Test Start] Creating test scan for dashboard:', dashboardId)

    // Get dashboard details
    const { data: dashboard, error: dashboardError } = await supabase
      .from('dashboards')
      .select('*')
      .eq('id', dashboardId)
      .single()

    if (dashboardError || !dashboard) {
      console.error('[Test Start] Dashboard not found:', dashboardError)
      return NextResponse.json(
        { error: 'Dashboard not found' },
        { status: 404 }
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
      console.error('[Test Start] Error creating scan:', scanError)
      return NextResponse.json(
        { error: 'Failed to create scan' },
        { status: 500 }
      )
    }

    console.log('[Test Start] Scan created:', scan.id)

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
      console.error('[Test Start] Error creating scan jobs:', jobsError)
      return NextResponse.json(
        { error: 'Failed to create scan jobs' },
        { status: 500 }
      )
    }

    console.log('[Test Start] Jobs created, triggering test-process')

    // Trigger TEST background processing
    const processUrl = `${req.nextUrl.origin}/api/scan/test-process`
    console.log('[Test Start] Calling:', processUrl)

    fetch(processUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scanId: scan.id }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const error = await res.text()
          console.error('[Test Start] Test process failed:', error)
        } else {
          const data = await res.json()
          console.log('[Test Start] Test process response:', data)
        }
      })
      .catch((err) => {
        console.error('[Test Start] Error triggering test process:', err)
      })

    return NextResponse.json({
      scan,
      message: 'Test scan started successfully',
    })
  } catch (error) {
    console.error('[Test Start] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
