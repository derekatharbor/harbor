// apps/web/app/api/feed/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
// NO EDGE RUNTIME - use nodejs like your other routes

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    if (!params.slug) {
      return NextResponse.json({ error: 'Slug required' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: profile, error } = await supabase
      .from('ai_profiles')
      .select('feed_data, visibility_score, rank_global, updated_at, slug, brand_name')
      .eq('slug', params.slug)
      .single()

    if (error || !profile) {
      console.error('Profile not found:', params.slug, error)
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    if (!profile.feed_data) {
      return NextResponse.json(
        { error: 'Profile data not available' },
        { status: 500 }
      )
    }

    // Parse feed_data if it's a string
    const feedData = typeof profile.feed_data === 'string' 
      ? JSON.parse(profile.feed_data)
      : profile.feed_data

    return NextResponse.json(feedData, {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
        'X-Robots-Tag': 'all',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Last-Modified': new Date(profile.updated_at || Date.now()).toUTCString(),
      }
    })
    
  } catch (error) {
    console.error('Feed error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}