// apps/web/app/api/brands/[slug]/update-score/route.ts
// Updates AI profile score after scan completes and records delta

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

/**
 * This endpoint is called AFTER a scan completes to:
 * 1. Calculate the new visibility score from scan results
 * 2. Update the ai_profiles table with the delta
 * 3. Record the scan in scan_history
 * 
 * Called by: Client after polling /api/scan/status shows 'done'
 */

export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { scanId } = await request.json()

    if (!scanId) {
      return NextResponse.json({ error: 'Scan ID required' }, { status: 400 })
    }

    const supabase = createRouteHandlerClient({ cookies })

    // Get the profile
    const { data: profile, error: profileError } = await supabase
      .from('ai_profiles')
      .select('*')
      .eq('slug', params.slug)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Get scan results to calculate new score
    const { data: scan } = await supabase
      .from('scans')
      .select('*')
      .eq('id', scanId)
      .single()

    if (!scan || scan.status !== 'done') {
      return NextResponse.json({ 
        error: 'Scan not complete',
        status: scan?.status 
      }, { status: 400 })
    }

    // Calculate new visibility score from scan results
    const newScore = await calculateVisibilityScore(supabase, scanId)

    // Use the database function to record the scan
    const { error: recordError } = await supabase.rpc('record_scan', {
      p_profile_id: profile.id,
      p_new_score: newScore,
      p_scan_type: 'rescan',
      p_triggered_by: (await supabase.auth.getUser()).data.user?.id || null
    })

    if (recordError) {
      console.error('Error recording scan:', recordError)
      return NextResponse.json({ 
        error: 'Failed to record scan results' 
      }, { status: 500 })
    }

    // Fetch updated profile with delta
    const { data: updatedProfile } = await supabase
      .from('ai_profiles')
      .select('visibility_score, previous_visibility_score, score_change, last_scan_at, scan_count')
      .eq('id', profile.id)
      .single()

    const delta = updatedProfile?.score_change || 0
    const message = delta >= 0 
      ? `Score improved by ${delta.toFixed(1)}%!`
      : `Score decreased by ${Math.abs(delta).toFixed(1)}%`

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
      delta,
      message
    })

  } catch (error: any) {
    console.error('Update score error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

/**
 * Calculate visibility score from scan results
 * This mirrors the logic from generate-profiles.ts
 */
async function calculateVisibilityScore(supabase: any, scanId: string): Promise<number> {
  
  // Get all scan results
  const [
    { data: shoppingResults },
    { data: brandResults },
    { data: conversationResults },
    { data: siteResults }
  ] = await Promise.all([
    supabase.from('results_shopping').select('*').eq('scan_id', scanId),
    supabase.from('results_brand').select('*').eq('scan_id', scanId),
    supabase.from('results_conversations').select('*').eq('scan_id', scanId),
    supabase.from('results_site').select('*').eq('scan_id', scanId)
  ])

  // Calculate subscores (simplified version)
  // TODO: Make this match your exact scoring logic from generate-profiles.ts
  
  let score = 0

  // Shopping visibility (0-25 points)
  if (shoppingResults && shoppingResults.length > 0) {
    const avgRank = shoppingResults.reduce((sum: number, r: any) => sum + r.rank, 0) / shoppingResults.length
    const shoppingScore = Math.max(0, 25 - (avgRank / 4)) // Lower rank = better
    score += shoppingScore
  }

  // Brand clarity (0-25 points)
  if (brandResults && brandResults.length > 0) {
    const positiveDescriptors = brandResults.filter((r: any) => r.sentiment === 'pos').length
    const brandScore = Math.min(25, (positiveDescriptors / brandResults.length) * 25)
    score += brandScore
  }

  // Conversation coverage (0-20 points)
  if (conversationResults && conversationResults.length > 0) {
    const avgScore = conversationResults.reduce((sum: number, r: any) => sum + (r.score || 0), 0) / conversationResults.length
    const conversationScore = (avgScore / 100) * 20
    score += conversationScore
  }

  // Website structure (0-30 points)
  if (siteResults) {
    const totalIssues = siteResults.length
    const highIssues = siteResults.filter((r: any) => r.severity === 'high').length
    
    // Deduct points for issues
    let siteScore = 30
    siteScore -= (highIssues * 3) // -3 pts per high issue
    siteScore -= ((totalIssues - highIssues) * 1) // -1 pt per other issue
    siteScore = Math.max(0, siteScore)
    
    score += siteScore
  }

  // Cap at 100
  return Math.min(100, Math.max(0, score))
}
