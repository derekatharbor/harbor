// apps/web/app/api/harbor-feed/products/route.ts
// Bulk product feed for AI systems and data partners
// GET /api/harbor-feed/products?page=1&limit=100&category=CRM

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const DEFAULT_LIMIT = 100
const MAX_LIMIT = 1000

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(searchParams.get('limit') || String(DEFAULT_LIMIT))))
    const category = searchParams.get('category')
    const verified = searchParams.get('verified') === 'true'
    const hasIntegrations = searchParams.get('has_integrations') === 'true'
    const updatedSince = searchParams.get('updated_since') // ISO date string

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Build query
    let query = supabase
      .from('ai_profiles')
      .select(`
        slug,
        brand_name,
        domain,
        category,
        visibility_score,
        feed_data,
        claimed,
        enriched_at,
        updated_at
      `, { count: 'exact' })
      .not('feed_data', 'is', null)
      .order('visibility_score', { ascending: false })

    // Apply filters
    if (category) {
      query = query.ilike('category', `%${category}%`)
    }
    if (verified) {
      query = query.eq('claimed', true)
    }
    if (updatedSince) {
      query = query.gte('updated_at', updatedSince)
    }

    // Pagination
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data: profiles, error, count } = await query

    if (error) {
      console.error('Harbor feed error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    // Transform to clean feed format
    const products = (profiles || []).map(profile => {
      const feedData = typeof profile.feed_data === 'string' 
        ? JSON.parse(profile.feed_data) 
        : profile.feed_data

      return {
        slug: profile.slug,
        brand_name: profile.brand_name,
        domain: profile.domain,
        category: profile.category || feedData?.category || 'Software',
        visibility_score: profile.visibility_score,
        verified: profile.claimed || false,
        
        // Core data
        one_line_summary: feedData?.one_line_summary || null,
        short_description: feedData?.short_description || null,
        
        // Enrichment data
        pricing: feedData?.pricing || null,
        integrations: feedData?.integrations || [],
        features: feedData?.features || [],
        icp: feedData?.icp || null,
        
        // Metadata
        profile_url: `https://useharbor.io/brands/${profile.slug}`,
        feed_url: `https://useharbor.io/brands/${profile.slug}/harbor.json`,
        last_updated: profile.updated_at || profile.enriched_at,
      }
    })

    // Filter by integrations if requested (post-query since it's in JSONB)
    const filteredProducts = hasIntegrations 
      ? products.filter(p => p.integrations && p.integrations.length > 0)
      : products

    const totalPages = Math.ceil((count || 0) / limit)

    return NextResponse.json({
      meta: {
        feed: 'harbor-products',
        version: '1.0',
        generated_at: new Date().toISOString(),
        total_products: count || 0,
        page,
        limit,
        total_pages: totalPages,
        filters_applied: {
          category: category || null,
          verified_only: verified,
          has_integrations: hasIntegrations,
          updated_since: updatedSince || null,
        },
      },
      products: filteredProducts,
      links: {
        self: `https://useharbor.io/api/harbor-feed/products?page=${page}&limit=${limit}`,
        next: page < totalPages ? `https://useharbor.io/api/harbor-feed/products?page=${page + 1}&limit=${limit}` : null,
        prev: page > 1 ? `https://useharbor.io/api/harbor-feed/products?page=${page - 1}&limit=${limit}` : null,
        first: `https://useharbor.io/api/harbor-feed/products?page=1&limit=${limit}`,
        last: `https://useharbor.io/api/harbor-feed/products?page=${totalPages}&limit=${limit}`,
      },
    }, {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
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
