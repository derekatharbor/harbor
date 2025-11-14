// apps/web/app/api/dashboards/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET /api/dashboards - List all dashboards user has access to
export async function GET(req: NextRequest) {
  try {
    // TODO: Get actual user ID from auth session
    // For now, we'll return all dashboards (remove this in production)
    const { data: dashboards, error } = await supabase
      .from('dashboards')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching dashboards:', error)
      return NextResponse.json(
        { error: 'Failed to fetch dashboards' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      dashboards: dashboards || [],
    })
  } catch (error) {
    console.error('Error in GET /api/dashboards:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/dashboards - Create new dashboard
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { brand_name, domain, category } = body

    if (!brand_name || !domain) {
      return NextResponse.json(
        { error: 'Brand name and domain are required' },
        { status: 400 }
      )
    }

    // TODO: Get actual user ID and org ID from auth session
    // For now, get the first org (remove this in production)
    const { data: orgs } = await supabase
      .from('orgs')
      .select('id')
      .limit(1)
      .single()

    if (!orgs) {
      return NextResponse.json(
        { error: 'No organization found' },
        { status: 404 }
      )
    }

    // Check how many dashboards this org has
    const { data: existingDashboards } = await supabase
      .from('dashboards')
      .select('id, plan')
      .eq('org_id', orgs.id)

    if (!existingDashboards) {
      return NextResponse.json(
        { error: 'Failed to check dashboard limit' },
        { status: 500 }
      )
    }

    // Determine plan and check limits
    // If first dashboard, default to 'solo'
    // If more, get plan from existing dashboard
    let plan = 'solo'
    if (existingDashboards.length > 0) {
      plan = existingDashboards[0].plan
      
      // Check limits
      if (plan === 'solo' && existingDashboards.length >= 1) {
        return NextResponse.json(
          { error: 'Solo plan limited to 1 dashboard. Upgrade to Agency plan for more.' },
          { status: 403 }
        )
      }
      if (plan === 'agency' && existingDashboards.length >= 5) {
        return NextResponse.json(
          { error: 'Agency plan limited to 5 dashboards. Upgrade to Enterprise for unlimited.' },
          { status: 403 }
        )
      }
    }

    // Create dashboard with metadata
    const metadata: any = {}
    if (category) metadata.category = category

    const { data: dashboard, error } = await supabase
      .from('dashboards')
      .insert({
        org_id: orgs.id,
        brand_name,
        domain,
        plan,
        metadata,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating dashboard:', error)
      return NextResponse.json(
        { error: 'Failed to create dashboard' },
        { status: 500 }
      )
    }

    // TODO: Create user_role entry (owner) when auth is implemented

    return NextResponse.json({
      dashboard,
      message: 'Dashboard created successfully',
    })
  } catch (error) {
    console.error('Error in POST /api/dashboards:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
