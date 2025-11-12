// app/api/scan/start/route.ts

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get current user
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's dashboard
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('org_id')
      .eq('user_id', session.user.id)
      .single()

    if (!userRole?.org_id) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 })
    }

    const { data: dashboard } = await supabase
      .from('dashboards')
      .select('id, brand_name, plan')
      .eq('org_id', userRole.org_id)
      .single()

    if (!dashboard) {
      return NextResponse.json({ error: 'No dashboard found' }, { status: 404 })
    }

    // Check plan limits (for now, just log - we'll enforce later)
    console.log(`Starting scan for dashboard: ${dashboard.id}, plan: ${dashboard.plan}`)

    // Create scan record
    const { data: scan, error: scanError } = await supabase
      .from('scans')
      .insert({
        dashboard_id: dashboard.id,
        type: 'fresh',
        status: 'queued',
        started_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (scanError) {
      console.error('Scan creation error:', scanError)
      return NextResponse.json({ error: 'Failed to create scan' }, { status: 500 })
    }

    // Create scan jobs for each module
    const modules = ['shopping', 'brand', 'conversations', 'website']
    const jobs = modules.map(module => ({
      scan_id: scan.id,
      module,
      status: 'queued',
      started_at: new Date().toISOString(),
    }))

    const { error: jobsError } = await supabase
      .from('scan_jobs')
      .insert(jobs)

    if (jobsError) {
      console.error('Jobs creation error:', jobsError)
      return NextResponse.json({ error: 'Failed to create scan jobs' }, { status: 500 })
    }

    // Update dashboard last_fresh_scan_at
    await supabase
      .from('dashboards')
      .update({ last_fresh_scan_at: new Date().toISOString() })
      .eq('id', dashboard.id)

    // Mark scan as running
    await supabase
      .from('scans')
      .update({ status: 'running' })
      .eq('id', scan.id)

    // Trigger scan processing asynchronously
    // Using fetch with no await so it runs in background
    const baseUrl = request.url.split('/api')[0]
    fetch(`${baseUrl}/api/scan/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scanId: scan.id })
    }).catch(err => console.error('Background scan trigger error:', err))

    return NextResponse.json({ 
      success: true, 
      scanId: scan.id,
      message: 'Scan started successfully'
    })

  } catch (error) {
    console.error('Scan start error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}