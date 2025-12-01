// apps/web/app/api/harbor-feed/integrations/route.ts
// Integration index - which products connect to which tools
// GET /api/harbor-feed/integrations?tool=Salesforce

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tool = searchParams.get('tool') // Filter by specific integration
    const limit = Math.min(1000, parseInt(searchParams.get('limit') || '500'))

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Fetch all profiles with integrations
    const { data: profiles, error } = await supabase
      .from('ai_profiles')
      .select('slug, brand_name, domain, category, feed_data, visibility_score, claimed')
      .not('feed_data', 'is', null)
      .order('visibility_score', { ascending: false })
      .limit(10000) // Get all to aggregate

    if (error) {
      console.error('Harbor feed error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    // Build integration index
    const integrationMap = new Map<string, {
      integration: string;
      product_count: number;
      products: Array<{
        slug: string;
        brand_name: string;
        domain: string;
        category: string;
        verified: boolean;
      }>;
    }>()

    for (const profile of profiles || []) {
      const feedData = typeof profile.feed_data === 'string'
        ? JSON.parse(profile.feed_data)
        : profile.feed_data

      const integrations = feedData?.integrations || []
      
      for (const integration of integrations) {
        const normalized = integration.trim()
        if (!normalized) continue

        // Apply tool filter if specified
        if (tool && !normalized.toLowerCase().includes(tool.toLowerCase())) {
          continue
        }

        if (!integrationMap.has(normalized)) {
          integrationMap.set(normalized, {
            integration: normalized,
            product_count: 0,
            products: [],
          })
        }

        const entry = integrationMap.get(normalized)!
        entry.product_count++
        entry.products.push({
          slug: profile.slug,
          brand_name: profile.brand_name,
          domain: profile.domain,
          category: profile.category || feedData?.category || 'Software',
          verified: profile.claimed || false,
        })
      }
    }

    // Convert to sorted array
    const integrations = Array.from(integrationMap.values())
      .sort((a, b) => b.product_count - a.product_count)
      .slice(0, limit)
      .map(entry => ({
        ...entry,
        products: entry.products.slice(0, 50), // Limit products per integration
      }))

    return NextResponse.json({
      meta: {
        feed: 'harbor-integrations',
        version: '1.0',
        generated_at: new Date().toISOString(),
        total_integrations: integrations.length,
        filter: tool || null,
      },
      integrations,
      links: {
        self: `https://useharbor.io/api/harbor-feed/integrations${tool ? `?tool=${encodeURIComponent(tool)}` : ''}`,
        products: 'https://useharbor.io/api/harbor-feed/products',
        categories: 'https://useharbor.io/api/harbor-feed/categories',
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
