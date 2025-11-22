// apps/web/app/api/brands/[slug]/scan/route.ts
// Triggers a new scan for a brand profile

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get authenticated user
    const cookieStore = await cookies()
    const authCookie = cookieStore.get('sb-access-token')
    
    if (!authCookie) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }

    // Verify user owns this brand
    const { data: brand, error: brandError } = await supabase
      .from('ai_profiles')
      .select('claimed, claimed_by_user_id, last_scan_at')
      .eq('slug', params.slug)
      .single()

    if (brandError || !brand) {
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      )
    }

    if (!brand.claimed) {
      return NextResponse.json(
        { error: 'This brand has not been claimed yet' },
        { status: 403 }
      )
    }

    // Check rate limiting - no more than 1 scan per hour
    if (brand.last_scan_at) {
      const lastScan = new Date(brand.last_scan_at)
      const hourAgo = new Date(Date.now() - 60 * 60 * 1000)
      
      if (lastScan > hourAgo) {
        const minutesUntilNext = Math.ceil((lastScan.getTime() - hourAgo.getTime()) / (60 * 1000))
        return NextResponse.json(
          { 
            error: 'Rate limit exceeded',
            message: `Please wait ${minutesUntilNext} minutes before requesting another scan`,
            next_available_at: new Date(lastScan.getTime() + 60 * 60 * 1000).toISOString()
          },
          { status: 429 }
        )
      }
    }

    // Create scan request
    const { data: scanRequest, error: scanError } = await supabase
      .from('scan_requests')
      .insert({
        brand_slug: params.slug,
        requested_by_user_id: brand.claimed_by_user_id,
        scan_type: 'full',
        status: 'queued'
      })
      .select()
      .single()

    if (scanError) {
      console.error('Failed to create scan request:', scanError)
      return NextResponse.json(
        { error: 'Failed to queue scan' },
        { status: 500 }
      )
    }

    // Log the action
    await supabase.rpc('log_brand_change', {
      p_brand_slug: params.slug,
      p_user_id: brand.claimed_by_user_id,
      p_change_type: 'scan_triggered',
      p_description: 'Manual scan requested by brand owner'
    })

    // Update last_scan_at
    await supabase
      .from('ai_profiles')
      .update({ 
        last_scan_at: new Date().toISOString(),
        next_scan_scheduled_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // +7 days
      })
      .eq('slug', params.slug)

    return NextResponse.json({
      success: true,
      scan_id: scanRequest.id,
      status: 'queued',
      message: 'Scan queued successfully. This typically takes 2-3 minutes.',
      estimated_completion: new Date(Date.now() + 3 * 60 * 1000).toISOString()
    })

  } catch (error: any) {
    console.error('Scan API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get scan status
export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: latestScan, error } = await supabase
      .from('scan_requests')
      .select('*')
      .eq('brand_slug', params.slug)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error
    }

    if (!latestScan) {
      return NextResponse.json({
        scan: null,
        message: 'No scans found'
      })
    }

    return NextResponse.json({
      scan: latestScan,
      is_running: latestScan.status === 'queued' || latestScan.status === 'running'
    })

  } catch (error: any) {
    console.error('Scan status API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
