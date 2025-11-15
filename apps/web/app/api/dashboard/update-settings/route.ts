// apps/web/app/api/dashboard/update-settings/route.ts
// IMPORTANT: This file should be placed at: apps/web/app/api/dashboard/update-settings/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { dashboardId, settings } = await request.json()

    if (!dashboardId || !settings) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Initialize Supabase client with proper error handling
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // The logo_url should already be a Supabase Storage public URL
    // uploaded via the /api/upload/logo endpoint
    
    // Update the dashboard with the new settings
    const { data, error } = await supabase
      .from('dashboards')
      .update({
        brand_name: settings.brand_name,
        domain: settings.domain,
        logo_url: settings.logo_url, // TODO: Upload to Storage first if it's a blob
        metadata: {
          category: settings.category,
          description: settings.description,
          founding_year: settings.founding_year,
          headquarters: settings.headquarters,
          products: settings.products,
          competitors: settings.competitors,
          social_links: settings.social_links,
          target_keywords: settings.target_keywords,
        }
      })
      .eq('id', dashboardId)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to update dashboard', message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}