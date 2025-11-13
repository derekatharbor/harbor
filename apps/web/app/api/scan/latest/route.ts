// app/api/scan/latest/route.ts

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
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
      .select('id, brand_name')
      .eq('org_id', userRole.org_id)
      .single()

    if (!dashboard) {
      return NextResponse.json({ error: 'No dashboard found' }, { status: 404 })
    }

    // Get latest completed scan
    const { data: scan } = await supabase
      .from('scans')
      .select('id, status, started_at, finished_at')
      .eq('dashboard_id', dashboard.id)
      .in('status', ['done', 'partial'])
      .order('started_at', { ascending: false })
      .limit(1)
      .single()

    if (!scan) {
      return NextResponse.json({ 
        hasScans: false,
        message: 'No completed scans found' 
      })
    }

    // Fetch all results for this scan
    const [shoppingResults, brandResults, conversationsResults, siteResults] = await Promise.all([
      supabase
        .from('results_shopping')
        .select('*')
        .eq('scan_id', scan.id),
      
      supabase
        .from('results_brand')
        .select('*')
        .eq('scan_id', scan.id),
      
      supabase
        .from('results_conversations')
        .select('*')
        .eq('scan_id', scan.id),
      
      supabase
        .from('results_site')
        .select('*')
        .eq('scan_id', scan.id)
    ])

    return NextResponse.json({
      hasScans: true,
      scan: {
        id: scan.id,
        status: scan.status,
        startedAt: scan.started_at,
        finishedAt: scan.finished_at
      },
      results: {
        shopping: shoppingResults.data || [],
        brand: brandResults.data || [],
        conversations: conversationsResults.data || [],
        site: siteResults.data || []
      }
    })

  } catch (error) {
    console.error('Latest scan fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
