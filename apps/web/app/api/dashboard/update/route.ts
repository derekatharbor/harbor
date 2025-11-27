// apps/web/app/api/dashboard/update/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { dashboardId, brandName, domain, industry } = await request.json()

    if (!dashboardId) {
      return NextResponse.json(
        { error: 'Dashboard ID required' },
        { status: 400 }
      )
    }

    // Verify user is authenticated
    const cookieStore = cookies()
    const supabaseAuth = createRouteHandlerClient({ cookies: () => cookieStore })
    
    const { data: { session }, error: sessionError } = await supabaseAuth.auth.getSession()
    
    if (sessionError || !session?.user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Use service role client for the update
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Verify user owns this dashboard
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('org_id')
      .eq('user_id', session.user.id)
      .single()

    const { data: dashboard } = await supabase
      .from('dashboards')
      .select('org_id, metadata')
      .eq('id', dashboardId)
      .single()

    if (!userRole || !dashboard || userRole.org_id !== dashboard.org_id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Clean domain
    const cleanDomain = domain
      ?.trim()
      .toLowerCase()
      .replace(/^(https?:\/\/)?(www\.)?/, '')
      .replace(/\/.*$/, '')

    // Build update object
    const updates: any = {}
    
    if (brandName?.trim()) {
      updates.brand_name = brandName.trim()
    }
    
    if (cleanDomain) {
      updates.domain = cleanDomain
    }
    
    // Merge industry into existing metadata
    if (industry) {
      updates.metadata = {
        ...(dashboard.metadata || {}),
        category: industry,
      }
    }

    // Update dashboard
    const { data: updated, error: updateError } = await supabase
      .from('dashboards')
      .update(updates)
      .eq('id', dashboardId)
      .select()
      .single()

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update dashboard' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      dashboard: updated,
    })

  } catch (error) {
    console.error('Dashboard update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
