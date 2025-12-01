// apps/web/app/api/harbor-feed/route.ts
// Harbor Feed API Index - Machine-readable B2B software product graph
// GET /api/harbor-feed

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get basic stats
    const { count: totalProducts } = await supabase
      .from('ai_profiles')
      .select('id', { count: 'exact', head: true })
      .not('feed_data', 'is', null)

    const { count: verifiedProducts } = await supabase
      .from('ai_profiles')
      .select('id', { count: 'exact', head: true })
      .eq('claimed', true)

    const { count: enrichedProducts } = await supabase
      .from('ai_profiles')
      .select('id', { count: 'exact', head: true })
      .not('enriched_at', 'is', null)

    return NextResponse.json({
      name: 'Harbor Feed API',
      description: 'Structured B2B software product data for AI systems',
      version: '1.0',
      documentation: 'https://useharbor.io/docs/api',
      
      stats: {
        total_products: totalProducts || 0,
        verified_products: verifiedProducts || 0,
        enriched_products: enrichedProducts || 0,
        last_updated: new Date().toISOString(),
      },
      
      endpoints: {
        products: {
          url: 'https://useharbor.io/api/harbor-feed/products',
          description: 'Paginated list of all products with full profile data',
          params: {
            page: 'Page number (default: 1)',
            limit: 'Results per page (default: 100, max: 1000)',
            category: 'Filter by category (e.g., CRM, Project Management)',
            verified: 'Only verified brands (true/false)',
            has_integrations: 'Only products with integrations (true/false)',
            updated_since: 'ISO date string for incremental sync',
          },
        },
        integrations: {
          url: 'https://useharbor.io/api/harbor-feed/integrations',
          description: 'Integration index - which products connect to which tools',
          params: {
            tool: 'Filter by integration name (e.g., Salesforce, Slack)',
            limit: 'Max integrations to return (default: 500)',
          },
        },
        categories: {
          url: 'https://useharbor.io/api/harbor-feed/categories',
          description: 'Category taxonomy with product counts',
        },
        verified: {
          url: 'https://useharbor.io/api/harbor-feed/verified',
          description: 'First-party verified brand profiles only',
        },
        individual_profile: {
          url: 'https://useharbor.io/brands/{slug}/harbor.json',
          description: 'Individual product profile in JSON format',
          example: 'https://useharbor.io/brands/salesforce/harbor.json',
        },
      },
      
      data_schema: {
        product: {
          slug: 'string - URL-safe identifier',
          brand_name: 'string - Display name',
          domain: 'string - Primary website domain',
          category: 'string - Primary software category',
          visibility_score: 'number (0-100) - AI visibility score',
          verified: 'boolean - First-party verified',
          one_line_summary: 'string - Brief description',
          short_description: 'string - 2-3 sentence description',
          pricing: {
            has_free_tier: 'boolean',
            starting_price: 'string or null (e.g., "$9/month")',
            price_model: 'per_user | flat | usage | tiered | custom | unknown',
          },
          integrations: 'string[] - Connected tools/platforms',
          features: 'string[] - Key capabilities',
          icp: 'string - Ideal customer profile',
        },
      },
      
      licensing: {
        crawling: 'Free for AI training and retrieval',
        api_access: 'Contact for high-volume or commercial API access',
        contact: 'data@useharbor.io',
      },
      
      links: {
        website: 'https://useharbor.io',
        browse: 'https://useharbor.io/brands',
        sitemap: 'https://useharbor.io/sitemap.xml',
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
