// Weekly snapshot cron - captures brand and university visibility snapshots
// Runs every Sunday to preserve historical trends

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const maxDuration = 30

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(request: NextRequest) {
  const supabase = getSupabase()
  
  // Check last snapshot dates
  const { data: lastBrandSnapshot } = await supabase
    .from('brand_visibility_snapshots')
    .select('snapshot_date')
    .order('snapshot_date', { ascending: false })
    .limit(1)
    .single()

  const { data: lastUniSnapshot } = await supabase
    .from('university_visibility_snapshots')
    .select('snapshot_date')
    .order('snapshot_date', { ascending: false })
    .limit(1)
    .single()

  return NextResponse.json({
    status: 'ok',
    last_brand_snapshot: lastBrandSnapshot?.snapshot_date || 'never',
    last_university_snapshot: lastUniSnapshot?.snapshot_date || 'never'
  })
}

export async function POST(request: NextRequest) {
  const supabase = getSupabase()
  
  const results = {
    brands: { success: false, count: 0, error: null as string | null },
    universities: { success: false, count: 0, error: null as string | null }
  }

  // Update visibility scores first
  try {
    await supabase.rpc('update_brand_visibility')
  } catch (e) {
    console.log('update_brand_visibility not available:', e)
  }

  try {
    await supabase.rpc('update_university_visibility')
  } catch (e) {
    console.log('update_university_visibility not available:', e)
  }

  // Snapshot brands
  try {
    const { data, error } = await supabase.rpc('snapshot_brand_scores')
    if (error) throw error
    results.brands.success = true
    results.brands.count = data || 0
  } catch (e) {
    results.brands.error = e instanceof Error ? e.message : 'Unknown error'
  }

  // Snapshot universities
  try {
    const { data, error } = await supabase.rpc('snapshot_university_scores')
    if (error) throw error
    results.universities.success = true
    results.universities.count = data || 0
  } catch (e) {
    results.universities.error = e instanceof Error ? e.message : 'Unknown error'
  }

  return NextResponse.json({
    success: results.brands.success || results.universities.success,
    timestamp: new Date().toISOString(),
    results
  })
}
