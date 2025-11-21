// apps/web/app/api/feed/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    if (!params.slug) {
      return NextResponse.json({ error: 'Slug required' }, { status: 400 })
    }

    // DEBUG: Log what we're searching for
    console.log('🔍 Searching for slug:', params.slug)

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // DEBUG: Log Supabase connection
    console.log('📡 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...')

    const { data: profile, error } = await supabase
      .from('ai_profiles')
      .select('feed_data, visibility_score, rank_global, updated_at, slug, brand_name')
      .eq('slug', params.slug)
      .single()

    // DEBUG: Log query result
    console.log('📊 Query result:', { 
      found: !!profile, 
      error: error?.message,
      brandName: profile?.brand_name 
    })

    if (error || !profile) {
      console.error('❌ Profile not found:', { slug: params.slug, error })
      return NextResponse.json(
        { 
          error: 'Profile not found',
          slug: params.slug,
          hint: 'Check if this brand exists in ai_profiles table'
        },
        { status: 404 }
      )
    }

    if (!profile.feed_data) {
      console.error('❌ No feed_data:', profile.brand_name)
      return NextResponse.json(
        { 
          error: 'Profile data not available',
          brand: profile.brand_name
        },
        { status: 500 }
      )
    }

    console.log('✅ Success! Returning feed for:', profile.brand_name)

    return NextResponse.json(profile.feed_data, {
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
    console.error('💥 Harbor feed error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}