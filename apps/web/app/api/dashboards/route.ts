// apps/web/app/api/dashboards/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Force dynamic rendering - don't pre-render at build time
export const dynamic = 'force-dynamic'

// Helper to create Supabase client with user's session
function getSupabaseClient() {
  const cookieStore = cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // ✅ Use ANON key to respect RLS
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}

// GET /api/dashboards - List all dashboards user has access to
export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    
    // Get current user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // RLS will automatically filter to only dashboards user has access to
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
    const supabase = getSupabaseClient()
    
    // Get current user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const body = await req.json()
    const { brand_name, domain, category } = body

    if (!brand_name || !domain) {
      return NextResponse.json(
        { error: 'Brand name and domain are required' },
        { status: 400 }
      )
    }

    // Get user's org from user_roles
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('org_id')
      .eq('user_id', user.id)
      .limit(1)
      .single()

    if (!userRole) {
      return NextResponse.json(
        { error: 'No organization found for user' },
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