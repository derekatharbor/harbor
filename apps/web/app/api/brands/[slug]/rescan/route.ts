// apps/web/app/api/brands/[slug]/rescan/route.ts
// Re-scan a claimed brand profile and track delta

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

// ============================================================================
// POST - Trigger Re-scan
// ============================================================================

export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the AI profile (which has the brand info)
    const { data: profile, error: profileError } = await supabase
      .from('ai_profiles')
      .select('*')
      .eq('slug', params.slug)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
    }

    // Find the app user record linked to this auth user
    const { data: appUser, error: appUserError } = await supabase
      .from('users')
      .select('id')
      .eq('supabase_uid', user.id)
      .single()

    if (appUserError || !appUser) {
      return NextResponse.json({ 
        error: 'User account not found. Please contact support.' 
      }, { status: 404 })
    }

    // Verify user owns this brand (check verified_profiles with app user id)
    const { data: verified, error: verifyError } = await supabase
      .from('verified_profiles')
      .select('user_id, dashboard_id')
      .eq('profile_id', profile.id)
      .eq('user_id', appUser.id)  // Use app user id, not auth user id
      .single()

    if (verifyError || !verified) {
      return NextResponse.json({ 
        error: 'Not authorized to re-scan this brand. Please claim it first.' 
      }, { status: 403 })
    }

    // Check rate limits (max 5 rescans per day)
    const { data: recentScans } = await supabase
      .from('scan_history')
      .select('id')
      .eq('profile_id', profile.id)
      .gte('scanned_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    if (recentScans && recentScans.length >= 5) {
      return NextResponse.json({ 
        error: 'Rate limit exceeded. Maximum 5 re-scans per day.',
        scansRemaining: 0
      }, { status: 429 })
    }

    // Check cooldown (minimum 1 hour between scans)
    if (profile.last_scan_at) {
      const lastScan = new Date(profile.last_scan_at).getTime()
      const now = Date.now()
      const hourInMs = 60 * 60 * 1000
      
      if (now - lastScan < hourInMs) {
        const minutesRemaining = Math.ceil((hourInMs - (now - lastScan)) / 60000)
        return NextResponse.json({
          error: `Cooldown active. Please wait ${minutesRemaining} minutes.`,
          cooldownMinutes: minutesRemaining
        }, { status: 429 })
      }
    }

    // Get the dashboard for this brand
    const { data: dashboard, error: dashError } = await supabase
      .from('dashboards')
      .select('*')
      .eq('id', verified.dashboard_id)
      .single()

    if (dashError || !dashboard) {
      return NextResponse.json({ 
        error: 'Dashboard not found' 
      }, { status: 404 })
    }

    // Create a new scan record
    const { data: scan, error: scanError } = await supabase
      .from('scans')
      .insert({
        dashboard_id: dashboard.id,
        type: 'verification', // Mark as verification scan
        status: 'queued',
      })
      .select()
      .single()

    if (scanError || !scan) {
      console.error('Error creating scan:', scanError)
      return NextResponse.json({ 
        error: 'Failed to create scan' 
      }, { status: 500 })
    }

    // Trigger the scan processing
    // This calls your existing scan/process endpoint
    try {
      const protocol = request.headers.get('x-forwarded-proto') || 'http'
      const host = request.headers.get('host')
      const baseUrl = `${protocol}://${host}`

      const processResponse = await fetch(`${baseUrl}/api/scan/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ scanId: scan.id }),
      })

      if (!processResponse.ok) {
        throw new Error('Scan processing failed')
      }

      // Note: The scan runs async, so we return immediately
      // Client should poll /api/scan/status/[scanId] for updates

      return NextResponse.json({
        success: true,
        scanId: scan.id,
        message: 'Re-scan started. This may take 30-60 seconds.',
        statusUrl: `/api/scan/status/${scan.id}`
      })

    } catch (error: any) {
      console.error('Error triggering scan:', error)
      
      // Clean up failed scan
      await supabase
        .from('scans')
        .update({ status: 'failed' })
        .eq('id', scan.id)

      return NextResponse.json({ 
        error: 'Failed to start scan' 
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error('Re-scan error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

// ============================================================================
// GET - Check Re-scan Availability
// ============================================================================

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ 
        canRescan: false, 
        reason: 'Not authenticated' 
      })
    }

    // Get profile
    const { data: profile } = await supabase
      .from('ai_profiles')
      .select('id, last_scan_at')
      .eq('slug', params.slug)
      .single()

    if (!profile) {
      return NextResponse.json({ 
        canRescan: false, 
        reason: 'Brand not found' 
      })
    }

    // Find the app user record linked to this auth user
    const { data: appUser } = await supabase
      .from('users')
      .select('id')
      .eq('supabase_uid', user.id)
      .single()

    if (!appUser) {
      return NextResponse.json({ 
        canRescan: false, 
        reason: 'User account not found' 
      })
    }

    // Check if user owns this brand
    const { data: verified } = await supabase
      .from('verified_profiles')
      .select('user_id')
      .eq('profile_id', profile.id)
      .eq('user_id', appUser.id)  // Use app user id
      .single()

    if (!verified) {
      return NextResponse.json({ 
        canRescan: false, 
        reason: 'Not authorized - claim this brand first' 
      })
    }

    // Check rate limits
    const { data: recentScans } = await supabase
      .from('scan_history')
      .select('id')
      .eq('profile_id', profile.id)
      .gte('scanned_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    const scansRemaining = 5 - (recentScans?.length || 0)

    // Check cooldown
    const lastScan = profile.last_scan_at ? new Date(profile.last_scan_at) : null
    const now = Date.now()
    const hourInMs = 60 * 60 * 1000
    
    let cooldownMinutes = 0
    let canRescanNow = true

    if (lastScan) {
      const timeSinceLastScan = now - lastScan.getTime()
      if (timeSinceLastScan < hourInMs) {
        cooldownMinutes = Math.ceil((hourInMs - timeSinceLastScan) / 60000)
        canRescanNow = false
      }
    }

    return NextResponse.json({
      canRescan: canRescanNow && scansRemaining > 0,
      scansRemaining,
      cooldownMinutes,
      lastScannedAt: profile.last_scan_at,
      reason: !canRescanNow 
        ? `Cooldown active (${cooldownMinutes} min remaining)` 
        : scansRemaining === 0 
        ? 'Daily limit reached (5/5 scans used)'
        : null
    })

  } catch (error: any) {
    console.error('Re-scan check error:', error)
    return NextResponse.json({ 
      canRescan: false, 
      reason: 'Error checking status' 
    })
  }
}