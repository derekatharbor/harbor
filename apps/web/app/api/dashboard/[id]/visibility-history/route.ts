// GET /api/dashboard/[id]/visibility-history
// Returns historical visibility data for trend charts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: dashboardId } = await params
  const { searchParams } = new URL(request.url)
  const days = parseInt(searchParams.get('days') || '7')
  
  const supabase = getSupabase()
  
  try {
    // Get dashboard info
    const { data: dashboard } = await supabase
      .from('dashboards')
      .select('id, brand_name, domain')
      .eq('id', dashboardId)
      .single()
    
    if (!dashboard) {
      return NextResponse.json({ error: 'Dashboard not found' }, { status: 404 })
    }
    
    // Get historical snapshots
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    const { data: snapshots, error } = await supabase
      .from('dashboard_visibility_snapshots')
      .select('*')
      .eq('dashboard_id', dashboardId)
      .gte('snapshot_date', startDate.toISOString().split('T')[0])
      .order('snapshot_date', { ascending: true })
    
    if (error) throw error
    
    // Get competitor snapshots too (from dashboard_competitors)
    const { data: competitors } = await supabase
      .from('dashboard_competitors')
      .select('competitor_name, competitor_domain')
      .eq('dashboard_id', dashboardId)
      .limit(4)
    
    // Build date range with all days (fill gaps with null)
    const dateRange: string[] = []
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      dateRange.push(date.toISOString().split('T')[0])
    }
    
    // Map snapshots to date range
    const snapshotMap = new Map(
      snapshots?.map(s => [s.snapshot_date, s]) || []
    )
    
    const history = dateRange.map(date => {
      const snapshot = snapshotMap.get(date)
      const displayDate = new Date(date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
      
      return {
        date,
        displayDate,
        visibility: snapshot?.visibility_score ?? null,
        position: snapshot?.avg_position ?? null,
        sentiment: snapshot?.sentiment_score ?? null,
        executions: snapshot?.total_executions ?? 0,
        mentions: snapshot?.mention_count ?? 0
      }
    })
    
    // Calculate current values (most recent non-null)
    const latest = snapshots?.[snapshots.length - 1]
    
    return NextResponse.json({
      dashboard: {
        id: dashboard.id,
        brand_name: dashboard.brand_name,
        domain: dashboard.domain
      },
      history,
      current: {
        visibility: latest?.visibility_score ?? 0,
        position: latest?.avg_position ?? null,
        sentiment: latest?.sentiment_score ?? 50
      },
      competitors: competitors?.map(c => ({
        name: c.competitor_name,
        domain: c.competitor_domain
      })) || [],
      has_data: snapshots && snapshots.length > 0
    })
    
  } catch (error) {
    console.error('Visibility history API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch visibility history' },
      { status: 500 }
    )
  }
}
