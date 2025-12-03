// apps/web/app/api/dashboard/[id]/competitors/route.ts
// API for managing dashboard competitors

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - List competitors for a dashboard
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const dashboardId = params.id

  try {
    // Get active competitors
    const { data: competitors, error } = await supabase
      .from('dashboard_competitors')
      .select('*')
      .eq('dashboard_id', dashboardId)
      .eq('status', 'active')
      .order('created_at', { ascending: true })

    if (error) throw error

    // Get dashboard info for category-based suggestions
    const { data: dashboard } = await supabase
      .from('dashboards')
      .select('metadata, domain')
      .eq('id', dashboardId)
      .single()

    const category = dashboard?.metadata?.category

    // Get suggested competitors from ai_profiles in same category
    let suggested: any[] = []
    if (category) {
      const { data: suggestions } = await supabase
        .from('ai_profiles')
        .select('brand_name, domain, logo_url, visibility_score')
        .eq('industry', category)
        .neq('domain', dashboard?.domain) // Exclude self
        .order('visibility_score', { ascending: false })
        .limit(15)

      // Filter out already tracked competitors
      const trackedDomains = new Set(competitors?.map(c => c.domain) || [])
      
      // Also get rejected domains
      const { data: rejected } = await supabase
        .from('dashboard_competitors')
        .select('domain')
        .eq('dashboard_id', dashboardId)
        .eq('status', 'rejected')
      
      const rejectedDomains = new Set(rejected?.map(r => r.domain) || [])

      suggested = (suggestions || [])
        .filter(s => !trackedDomains.has(s.domain) && !rejectedDomains.has(s.domain))
        .slice(0, 8)
    }

    return NextResponse.json({
      competitors: competitors || [],
      suggested,
      category
    })
  } catch (error: any) {
    console.error('Error fetching competitors:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch competitors' },
      { status: 500 }
    )
  }
}

// POST - Add a competitor
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const dashboardId = params.id

  try {
    const body = await request.json()
    const { brand_name, domain, logo_url, source = 'manual' } = body

    if (!brand_name) {
      return NextResponse.json(
        { error: 'Brand name is required' },
        { status: 400 }
      )
    }

    // Check competitor limit based on plan
    const { data: dashboard } = await supabase
      .from('dashboards')
      .select('plan')
      .eq('id', dashboardId)
      .single()

    const { count } = await supabase
      .from('dashboard_competitors')
      .select('*', { count: 'exact', head: true })
      .eq('dashboard_id', dashboardId)
      .eq('status', 'active')

    const limits: Record<string, number> = {
      solo: 5,
      agency: 10,
      enterprise: 50
    }
    const limit = limits[dashboard?.plan || 'solo'] || 5

    if ((count || 0) >= limit) {
      return NextResponse.json(
        { error: `You can track up to ${limit} competitors on your ${dashboard?.plan} plan` },
        { status: 400 }
      )
    }

    // Check if already exists
    if (domain) {
      const { data: existing } = await supabase
        .from('dashboard_competitors')
        .select('id, status')
        .eq('dashboard_id', dashboardId)
        .eq('domain', domain)
        .single()

      if (existing) {
        if (existing.status === 'rejected') {
          // Reactivate rejected competitor
          const { data: updated, error } = await supabase
            .from('dashboard_competitors')
            .update({ status: 'active', brand_name, logo_url })
            .eq('id', existing.id)
            .select()
            .single()

          if (error) throw error
          return NextResponse.json({ competitor: updated })
        }
        return NextResponse.json(
          { error: 'This competitor is already being tracked' },
          { status: 400 }
        )
      }
    }

    // Generate logo URL if not provided
    const finalLogoUrl = logo_url || (domain ? `https://cdn.brandfetch.io/${domain}?c=1id1Fyz-h7an5-5KR_y` : null)

    // Insert new competitor
    const { data: competitor, error } = await supabase
      .from('dashboard_competitors')
      .insert({
        dashboard_id: dashboardId,
        brand_name,
        domain,
        logo_url: finalLogoUrl,
        tracked_names: [brand_name],
        source,
        status: 'active'
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ competitor })
  } catch (error: any) {
    console.error('Error adding competitor:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to add competitor' },
      { status: 500 }
    )
  }
}

// DELETE - Remove a competitor
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const dashboardId = params.id

  try {
    const { searchParams } = new URL(request.url)
    const competitorId = searchParams.get('competitorId')

    if (!competitorId) {
      return NextResponse.json(
        { error: 'Competitor ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('dashboard_competitors')
      .delete()
      .eq('id', competitorId)
      .eq('dashboard_id', dashboardId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error removing competitor:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to remove competitor' },
      { status: 500 }
    )
  }
}

// PATCH - Reject a suggested competitor
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const dashboardId = params.id

  try {
    const body = await request.json()
    const { domain, brand_name, action } = body

    if (action === 'reject' && domain) {
      // Insert as rejected so it won't be suggested again
      const { error } = await supabase
        .from('dashboard_competitors')
        .insert({
          dashboard_id: dashboardId,
          brand_name: brand_name || domain,
          domain,
          status: 'rejected',
          source: 'suggested'
        })

      if (error && !error.message.includes('duplicate')) throw error
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error updating competitor:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update competitor' },
      { status: 500 }
    )
  }
}
