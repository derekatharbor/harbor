// apps/web/app/api/snapshots/route.ts
// Fetch historical scan snapshots for trend charts

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

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    const { searchParams } = new URL(req.url)
    
    const dashboardId = searchParams.get('dashboardId')
    const range = searchParams.get('range') || '30d' // 7d, 30d, 90d
    
    if (!dashboardId) {
      return NextResponse.json({ error: 'Dashboard ID required' }, { status: 400 })
    }
    
    // Calculate date range
    const days = range === '7d' ? 7 : range === '90d' ? 90 : 30
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    // Fetch user's snapshots
    const { data: snapshots, error: snapshotsError } = await supabase
      .from('scan_snapshots')
      .select('*')
      .eq('dashboard_id', dashboardId)
      .gte('snapshot_date', startDate.toISOString().split('T')[0])
      .order('snapshot_date', { ascending: true })
    
    if (snapshotsError) {
      console.error('Error fetching snapshots:', snapshotsError)
      return NextResponse.json({ error: snapshotsError.message }, { status: 500 })
    }
    
    // Fetch competitor snapshots for same period
    const { data: competitorSnapshots, error: compError } = await supabase
      .from('competitor_snapshots')
      .select('*')
      .eq('dashboard_id', dashboardId)
      .gte('snapshot_date', startDate.toISOString().split('T')[0])
      .order('snapshot_date', { ascending: true })
    
    if (compError) {
      console.error('Error fetching competitor snapshots:', compError)
      // Non-fatal, continue without competitor data
    }
    
    // Calculate deltas (current vs first in range, or vs 7 days ago)
    let delta = {
      shopping: 0,
      brand: 0,
      website: 0,
      harbor: 0
    }
    
    if (snapshots && snapshots.length >= 2) {
      const latest = snapshots[snapshots.length - 1]
      const previous = snapshots[0] // Or find one closest to 7 days ago
      
      delta = {
        shopping: latest.shopping_score - previous.shopping_score,
        brand: latest.brand_score - previous.brand_score,
        website: latest.website_score - previous.website_score,
        harbor: latest.harbor_score - previous.harbor_score
      }
    }
    
    return NextResponse.json({
      snapshots: snapshots || [],
      competitorSnapshots: competitorSnapshots || [],
      delta,
      range,
      startDate: startDate.toISOString().split('T')[0]
    })
    
  } catch (error) {
    console.error('Error in snapshots API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
