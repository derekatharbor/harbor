// apps/web/app/api/onboarding/create-dashboard/route.ts
import { createClient } from '@supabase/supabase-js'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { brandName, domain, industry } = await request.json()

    if (!brandName || !domain) {
      return NextResponse.json(
        { error: 'Brand name and domain are required' },
        { status: 400 }
      )
    }

    // Get the authenticated user from the session
    const cookieStore = cookies()
    const supabaseAuth = createRouteHandlerClient({ cookies: () => cookieStore })
    
    const { data: { session }, error: sessionError } = await supabaseAuth.auth.getSession()
    
    if (sessionError || !session?.user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const user = session.user

    // Use service role client to bypass RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    // Get user's org
    const { data: userRole, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('org_id')
      .eq('user_id', user.id)
      .single()

    if (roleError || !userRole?.org_id) {
      console.error('No org found for user:', user.id, roleError)
      return NextResponse.json(
        { error: 'No organization found. Please try signing up again.' },
        { status: 400 }
      )
    }

    // Check if user already has a dashboard
    const { data: existingDashboards } = await supabaseAdmin
      .from('dashboards')
      .select('id')
      .eq('org_id', userRole.org_id)
      .limit(1)

    if (existingDashboards && existingDashboards.length > 0) {
      return NextResponse.json({
        success: true,
        dashboard: existingDashboards[0],
        existing: true
      })
    }

    // Clean domain
    const cleanDomain = domain
      .trim()
      .toLowerCase()
      .replace(/^(https?:\/\/)?(www\.)?/, '')
      .replace(/\/.*$/, '')

    // Check if domain is already claimed
    const { data: existingDomainDashboard } = await supabaseAdmin
      .from('dashboards')
      .select('id, org_id, brand_name')
      .eq('domain', cleanDomain)
      .single()

    if (existingDomainDashboard) {
      // If it's this user's org, return it as existing
      if (existingDomainDashboard.org_id === userRole.org_id) {
        return NextResponse.json({
          success: true,
          dashboard: existingDomainDashboard,
          existing: true
        })
      }
      // Different org owns this domain
      return NextResponse.json(
        { 
          error: `This domain is already claimed. If this is your brand, please contact support or sign in with the account that owns it.`,
          code: 'DOMAIN_CLAIMED'
        },
        { status: 409 }
      )
    }

    // Create dashboard with industry in metadata
    const { data: dashboard, error: dashboardError } = await supabaseAdmin
      .from('dashboards')
      .insert({
        org_id: userRole.org_id,
        brand_name: brandName.trim(),
        domain: cleanDomain,
        plan: 'solo',
        metadata: {
          category: industry || null,
          categorySource: industry ? 'user' : null,
        }
      })
      .select()
      .single()

    if (dashboardError) {
      console.error('Error creating dashboard:', dashboardError)
      return NextResponse.json(
        { error: 'Failed to create dashboard' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      dashboard,
      existing: false
    })

  } catch (error) {
    console.error('Create dashboard error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}