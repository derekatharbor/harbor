// apps/web/app/brands/[slug]/harbor.json/route.ts
// Canonical machine-readable AI profile feed

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Validate params
    if (!params.slug) {
      return new NextResponse('Slug required', { status: 400 })
    }

    // Fetch profile
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: profile, error } = await supabase
      .from('ai_profiles')
      .select('feed_data, visibility_score, rank_global, updated_at')
      .eq('slug', params.slug)
      .single()

    // Handle not found
    if (error || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Ensure feed_data exists
    if (!profile.feed_data) {
      return NextResponse.json(
        { error: 'Profile data not available' },
        { status: 500 }
      )
    }

    // Return the canonical feed
    // This is the permanent, machine-readable representation
    return NextResponse.json(profile.feed_data, {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
        'X-Robots-Tag': 'all',
        'Access-Control-Allow-Origin': '*', // Allow AI crawlers
        'Access-Control-Allow-Methods': 'GET',
        'Last-Modified': new Date(profile.updated_at || Date.now()).toUTCString(),
      }
    })
    
  } catch (error) {
    console.error('Harbor JSON feed error:', error)
    
    // Never leak internal errors to crawlers
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
