// app/api/scan/status/route.ts

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// Force dynamic rendering - required when using cookies()
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Get current user
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's dashboard and plan
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('org_id')
      .eq('user_id', session.user.id)
      .single()

    if (!userRole?.org_id) {
      return NextResponse.json(
        { error: 'No organization found' },
        { status: 404 }
      )
    }

    const { data: dashboard } = await supabase
      .from('dashboards')
      .select('id, brand_name, plan, last_fresh_scan_at')
      .eq('org_id', userRole.org_id)
      .single()

    if (!dashboard) {
      return NextResponse.json({ error: 'No dashboard found' }, { status: 404 })
    }

    // Get plan limits
    const { data: planLimits } = await supabase
      .from('plan_limits')
      .select('*')
      .eq('plan', dashboard.plan)
      .single()

    if (!planLimits) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    // Check if there's a scan currently running
    const { data: runningScan } = await supabase
      .from('scans')
      .select('id, status')
      .eq('dashboard_id', dashboard.id)
      .in('status', ['queued', 'running'])
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (runningScan) {
      return NextResponse.json({
        canScan: false,
        reason: 'scanning',
        scansRemaining: 0,
        totalScans: planLimits.fresh_scans_month || planLimits.fresh_scans_week || 1,
        nextAvailableAt: null,
        planTier: dashboard.plan,
        hasUsedFreeScan: false,
        currentScanId: runningScan.id,
      })
    }

    // Count scans this month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { count: scansThisMonth } = await supabase
      .from('scans')
      .select('*', { count: 'exact', head: true })
      .eq('dashboard_id', dashboard.id)
      .eq('type', 'fresh')
      .gte('started_at', startOfMonth.toISOString())

    const totalScans = planLimits.fresh_scans_month || planLimits.fresh_scans_week || 1
    const scansUsed = scansThisMonth || 0
    const scansRemaining = Math.max(0, totalScans - scansUsed)

    // FREE TIER - Check if they've used their one scan
    if (dashboard.plan === 'free') {
      const { count: totalFreeScans } = await supabase
        .from('scans')
        .select('*', { count: 'exact', head: true })
        .eq('dashboard_id', dashboard.id)
        .eq('type', 'fresh')

      if (totalFreeScans && totalFreeScans >= 1) {
        return NextResponse.json({
          canScan: false,
          reason: 'limit_reached',
          scansRemaining: 0,
          totalScans: 1,
          nextAvailableAt: null,
          planTier: 'free',
          hasUsedFreeScan: true,
        })
      }

      return NextResponse.json({
        canScan: true,
        reason: 'ready',
        scansRemaining: 1,
        totalScans: 1,
        nextAvailableAt: null,
        planTier: 'free',
        hasUsedFreeScan: false,
      })
    }

    // Check if limit reached
    if (scansRemaining <= 0) {
      return NextResponse.json({
        canScan: false,
        reason: 'limit_reached',
        scansRemaining: 0,
        totalScans,
        nextAvailableAt: null,
        planTier: dashboard.plan,
        hasUsedFreeScan: false,
      })
    }

    // Check cooldown period
    if (dashboard.last_fresh_scan_at) {
      const lastScan = new Date(dashboard.last_fresh_scan_at)
      const now = new Date()
      const hoursSinceLastScan =
        (now.getTime() - lastScan.getTime()) / (1000 * 60 * 60)

      // Cooldown periods by plan
      const cooldownHours =
        dashboard.plan === 'premium' ? 1 : dashboard.plan === 'pro' ? 6 : 24

      if (hoursSinceLastScan < cooldownHours) {
        const nextAvailable = new Date(
          lastScan.getTime() + cooldownHours * 60 * 60 * 1000
        )

        return NextResponse.json({
          canScan: false,
          reason: 'cooldown',
          scansRemaining,
          totalScans,
          nextAvailableAt: nextAvailable.toISOString(),
          planTier: dashboard.plan,
          hasUsedFreeScan: false,
        })
      }
    }

    // Ready to scan!
    return NextResponse.json({
      canScan: true,
      reason: 'ready',
      scansRemaining,
      totalScans,
      nextAvailableAt: null,
      planTier: dashboard.plan,
      hasUsedFreeScan: false,
    })
  } catch (error: any) {
    console.error('Scan status error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch scan status' },
      { status: 500 }
    )
  }
}