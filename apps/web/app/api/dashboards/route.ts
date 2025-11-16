// apps/web/app/api/dashboards/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// GET /api/dashboards - List all dashboards user has access to
export async function GET(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get current user from session
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    
    if (authError || !session?.user) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { error: 'Unauthorized', details: authError?.message || 'No session' },
        { status: 401 }
      )
    }

    const user = session.user
    console.log('✅ User authenticated:', user.id, user.email)

    // RLS will automatically filter to only dashboards user has access to
    const { data: dashboards, error } = await supabase
      .from('dashboards')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching dashboards:', error)
      return NextResponse.json(
        { error: 'Failed to fetch dashboards', details: error.message },
        { status: 500 }
      )
    }

    console.log('✅ Dashboards fetched:', dashboards?.length || 0)

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
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get current user from session
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    
    if (authError || !session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = session.user
    const body = await req.json()
    const { brand_name, domain, category } = body

    if (!brand_name || !domain) {
      return NextResponse.json(
        { error: 'Brand name and domain are required' },
        { status: 400 }
      )
    }

    // Get user's org from user_roles
    const { data: userRole, error: roleError } = await supabase
      .from('user_roles')
      .select('org_id')
      .eq('user_id', user.id)
      .limit(1)
      .single()

    if (roleError || !userRole) {
      console.error('No org found for user:', user.id, roleError)
      return NextResponse.json(
        { error: 'No organization found for user. Please complete onboarding first.' },
        { status: 404 }
      )
    }

    // Check how many dashboards this org has
    const { data: existingDashboards } = await supabase
      .from('dashboards')
      .select('id, plan')
      .eq('org_id', userRole.org_id)

    if (!existingDashboards) {
      return NextResponse.json(
        { error: 'Failed to check dashboard limit' },
        { status: 500 }
      )
    }

    // Determine plan and check limits
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
        org_id: userRole.org_id,
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