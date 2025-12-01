// apps/web/app/api/harbor-feed/categories/route.ts
// Category taxonomy - all product categories with counts
// GET /api/harbor-feed/categories

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Fetch all profiles to aggregate categories
    const { data: profiles, error } = await supabase
      .from('ai_profiles')
      .select('category, feed_data, visibility_score, claimed')
      .not('feed_data', 'is', null)

    if (error) {
      console.error('Harbor feed error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    // Build category index
    const categoryMap = new Map<string, {
      category: string;
      product_count: number;
      verified_count: number;
      avg_visibility_score: number;
      scores: number[];
    }>()

    for (const profile of profiles || []) {
      const feedData = typeof profile.feed_data === 'string'
        ? JSON.parse(profile.feed_data)
        : profile.feed_data

      const category = profile.category || feedData?.category || 'Software'
      const normalized = category.trim()
      
      if (!normalized) continue

      if (!categoryMap.has(normalized)) {
        categoryMap.set(normalized, {
          category: normalized,
          product_count: 0,
          verified_count: 0,
          avg_visibility_score: 0,
          scores: [],
        })
      }

      const entry = categoryMap.get(normalized)!
      entry.product_count++
      if (profile.claimed) entry.verified_count++
      if (profile.visibility_score) entry.scores.push(profile.visibility_score)
    }

    // Calculate averages and convert to array
    const categories = Array.from(categoryMap.values())
      .map(entry => ({
        category: entry.category,
        product_count: entry.product_count,
        verified_count: entry.verified_count,
        avg_visibility_score: entry.scores.length > 0 
          ? Math.round(entry.scores.reduce((a, b) => a + b, 0) / entry.scores.length)
          : null,
        browse_url: `https://useharbor.io/brands?category=${encodeURIComponent(entry.category)}`,
        feed_url: `https://useharbor.io/api/harbor-feed/products?category=${encodeURIComponent(entry.category)}`,
      }))
      .filter(c => c.product_count >= 1) // Only include categories with products
      .sort((a, b) => b.product_count - a.product_count)

    const totalProducts = categories.reduce((sum, c) => sum + c.product_count, 0)
    const totalVerified = categories.reduce((sum, c) => sum + c.verified_count, 0)

    return NextResponse.json({
      meta: {
        feed: 'harbor-categories',
        version: '1.0',
        generated_at: new Date().toISOString(),
        total_categories: categories.length,
        total_products: totalProducts,
        total_verified: totalVerified,
      },
      categories,
      links: {
        self: 'https://useharbor.io/api/harbor-feed/categories',
        products: 'https://useharbor.io/api/harbor-feed/products',
        integrations: 'https://useharbor.io/api/harbor-feed/integrations',
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
