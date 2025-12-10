// API Route: GET /api/index/brands
// Returns featured brands with real visibility scores for leaderboard
// Plus all brands for search

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Brandfetch logo URL helper
function getBrandfetchLogo(domain: string): string {
  return `https://cdn.brandfetch.io/${domain}?c=1id1Fyz-h7an5-5KR_y`
}

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get featured brands with their latest visibility snapshots
    const { data: featured, error: featuredError } = await supabase
      .from('featured_brands')
      .select(`
        industry,
        priority,
        profile:ai_profiles(
          id,
          brand_name,
          slug,
          domain,
          logo_url,
          industry,
          category
        )
      `)
      .eq('enabled', true)
      .order('priority', { ascending: false })

    if (featuredError) {
      console.error('Error fetching featured brands:', featuredError)
    }

    // Get visibility snapshots for featured brands (last 7 days for deltas)
    const profileIds = featured?.map(f => (f.profile as any)?.id).filter(Boolean) || []
    
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const today = new Date().toISOString().split('T')[0]

    const { data: snapshots } = await supabase
      .from('brand_visibility_snapshots')
      .select('profile_id, snapshot_date, visibility_score, total_mentions, avg_position')
      .in('profile_id', profileIds)
      .gte('snapshot_date', sevenDaysAgo)
      .order('snapshot_date', { ascending: false })

    // Build snapshot lookup: { profile_id: { latest: snapshot, previous: snapshot } }
    const snapshotMap: Record<string, { latest?: any; previous?: any }> = {}
    
    for (const snap of snapshots || []) {
      if (!snapshotMap[snap.profile_id]) {
        snapshotMap[snap.profile_id] = {}
      }
      
      if (!snapshotMap[snap.profile_id].latest) {
        snapshotMap[snap.profile_id].latest = snap
      } else if (!snapshotMap[snap.profile_id].previous) {
        snapshotMap[snap.profile_id].previous = snap
      }
    }

    // Transform featured brands with scores
    const leaderboard = (featured || [])
      .map(f => {
        const profile = f.profile as any
        if (!profile) return null

        const snapData = snapshotMap[profile.id]
        const latestScore = snapData?.latest?.visibility_score || 0
        const previousScore = snapData?.previous?.visibility_score || null
        const delta = previousScore !== null ? latestScore - previousScore : null

        return {
          id: profile.id,
          brand_name: profile.brand_name,
          slug: profile.slug,
          domain: profile.domain,
          logo_url: getBrandfetchLogo(profile.domain),
          industry: f.industry,
          visibility_score: latestScore,
          total_mentions: snapData?.latest?.total_mentions || 0,
          avg_position: snapData?.latest?.avg_position || null,
          delta_7d: delta,
          featured: true
        }
      })
      .filter(Boolean)
      .sort((a, b) => (b?.visibility_score || 0) - (a?.visibility_score || 0))

    // Get all brands for search (lighter payload)
    const { data: allBrands, error: allError } = await supabase
      .from('ai_profiles')
      .select('id, brand_name, slug, domain, industry')
      .order('brand_name')
      .limit(50000)

    if (allError) {
      console.error('Error fetching all brands:', allError)
    }

    // Add Brandfetch URLs to all brands
    const directory = (allBrands || []).map(b => ({
      ...b,
      logo_url: getBrandfetchLogo(b.domain)
    }))

    console.log(`📊 Index API: ${leaderboard.length} featured, ${directory.length} total`)

    return NextResponse.json({
      leaderboard,
      directory
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      }
    })
  } catch (error: any) {
    console.error('Error in index/brands API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch brands' },
      { status: 500 }
    )
  }
}