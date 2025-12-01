// apps/web/app/api/harbor-feed/verified/route.ts
// Verified brands feed - first-party confirmed profiles
// GET /api/harbor-feed/verified

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(1000, parseInt(searchParams.get('limit') || '500'))

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Fetch only claimed/verified profiles
    const { data: profiles, error, count } = await supabase
      .from('ai_profiles')
      .select(`
        slug,
        brand_name,
        domain,
        category,
        visibility_score,
        feed_data,
        claimed_at,
        claimed_by,
        updated_at
      `, { count: 'exact' })
      .eq('claimed', true)
      .not('feed_data', 'is', null)
      .order('claimed_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Harbor feed error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    // Transform to verified feed format
    const verifiedBrands = (profiles || []).map(profile => {
      const feedData = typeof profile.feed_data === 'string'
        ? JSON.parse(profile.feed_data)
        : profile.feed_data

      return {
        slug: profile.slug,
        brand_name: profile.brand_name,
        domain: profile.domain,
        category: profile.category || feedData?.category || 'Software',
        visibility_score: profile.visibility_score,
        
        // Verification info
        verified: true,
        verified_at: profile.claimed_at,
        
        // Core data (first-party confirmed)
        one_line_summary: feedData?.one_line_summary || null,
        short_description: feedData?.short_description || null,
        pricing: feedData?.pricing || null,
        integrations: feedData?.integrations || [],
        features: feedData?.features || [],
        
        // URLs
        profile_url: `https://useharbor.io/brands/${profile.slug}`,
        feed_url: `https://useharbor.io/brands/${profile.slug}/harbor.json`,
        last_updated: profile.updated_at,
      }
    })

    return NextResponse.json({
      meta: {
        feed: 'harbor-verified',
        version: '1.0',
        generated_at: new Date().toISOString(),
        total_verified: count || 0,
        description: 'First-party verified brand profiles. Data confirmed by brand owners.',
      },
      verified_brands: verifiedBrands,
      links: {
        self: 'https://useharbor.io/api/harbor-feed/verified',
        all_products: 'https://useharbor.io/api/harbor-feed/products',
        categories: 'https://useharbor.io/api/harbor-feed/categories',
      },
    }, {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=1800, s-maxage=1800', // Shorter cache for verified data
        'X-Robots-Tag': 'all',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
      }
    })

  } catch (error) {
    console.error('Harbor feed error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
