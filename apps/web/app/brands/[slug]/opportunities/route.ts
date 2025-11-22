// apps/web/app/api/brands/[slug]/opportunities/route.ts
// Generates and fetches visibility opportunities for a brand

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get brand profile
    const { data: brand, error: brandError } = await supabase
      .from('ai_profiles')
      .select('feed_data, visibility_score')
      .eq('slug', params.slug)
      .single()

    if (brandError || !brand) {
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      )
    }

    // Check if opportunities already exist
    const { data: existingOpps, error: oppsError } = await supabase
      .from('visibility_opportunities')
      .select('*')
      .eq('brand_slug', params.slug)
      .eq('status', 'open')

    if (oppsError) {
      throw oppsError
    }

    // If opportunities exist, return them
    if (existingOpps && existingOpps.length > 0) {
      return NextResponse.json({
        opportunities: groupOpportunitiesByCategory(existingOpps),
        total_points_available: existingOpps.reduce((sum, opp) => sum + opp.impact_points, 0)
      })
    }

    // Generate opportunities based on profile analysis
    const opportunities = generateOpportunities(brand.feed_data, params.slug)

    // Save to database
    if (opportunities.length > 0) {
      const { error: insertError } = await supabase
        .from('visibility_opportunities')
        .insert(opportunities)

      if (insertError) {
        console.error('Failed to save opportunities:', insertError)
      }
    }

    return NextResponse.json({
      opportunities: groupOpportunitiesByCategory(opportunities),
      total_points_available: opportunities.reduce((sum: number, opp: any) => sum + opp.impact_points, 0)
    })

  } catch (error: any) {
    console.error('Opportunities API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Generate opportunities based on profile completeness
function generateOpportunities(feedData: any, brandSlug: string) {
  const opportunities: any[] = []

  // Trust & Basics (20 pts total)
  const companyInfo = feedData?.company_info || {}
  
  if (!companyInfo.founded_year) {
    opportunities.push({
      brand_slug: brandSlug,
      category: 'trust_and_basics',
      title: 'Add founding year',
      description: 'Help AI models understand your brand\'s history and credibility',
      impact_points: 5
    })
  }

  if (!companyInfo.hq_location) {
    opportunities.push({
      brand_slug: brandSlug,
      category: 'trust_and_basics',
      title: 'Add headquarters location',
      description: 'Establish geographic presence for local search queries',
      impact_points: 5
    })
  }

  if (!companyInfo.employee_band || companyInfo.employee_band === 'unknown') {
    opportunities.push({
      brand_slug: brandSlug,
      category: 'trust_and_basics',
      title: 'Add company size',
      description: 'Provide scale context for AI models',
      impact_points: 5
    })
  }

  if (!feedData?.company_info?.industry_tags || feedData.company_info.industry_tags.length === 0) {
    opportunities.push({
      brand_slug: brandSlug,
      category: 'trust_and_basics',
      title: 'Add industry tags',
      description: 'Help AI categorize your brand correctly',
      impact_points: 5
    })
  }

  // Brand Clarity (25 pts total)
  const description = feedData?.short_description || ''
  
  if (!description) {
    opportunities.push({
      brand_slug: brandSlug,
      category: 'brand_clarity',
      title: 'Add brand description',
      description: 'Write a clear 2-3 sentence explanation of what you do',
      impact_points: 15
    })
  } else if (description.length < 100) {
    opportunities.push({
      brand_slug: brandSlug,
      category: 'brand_clarity',
      title: 'Expand brand description',
      description: 'Add more detail (aim for 150-250 characters)',
      impact_points: 10
    })
  }

  if (!feedData?.one_line_summary) {
    opportunities.push({
      brand_slug: brandSlug,
      category: 'brand_clarity',
      title: 'Add one-line summary',
      description: 'Create a concise elevator pitch for your brand',
      impact_points: 10
    })
  }

  // Offerings Clarity (25 pts total)
  const offerings = feedData?.offerings || []
  
  if (offerings.length === 0) {
    opportunities.push({
      brand_slug: brandSlug,
      category: 'offerings_clarity',
      title: 'Add products or services',
      description: 'List at least 3 core offerings with descriptions',
      impact_points: 25
    })
  } else if (offerings.length < 3) {
    opportunities.push({
      brand_slug: brandSlug,
      category: 'offerings_clarity',
      title: 'Add more offerings',
      description: `Add ${3 - offerings.length} more product(s) or service(s)`,
      impact_points: 15
    })
  } else {
    // Check if offerings have descriptions
    const offeringsWithoutDesc = offerings.filter((o: any) => !o.description || o.description.length < 50)
    if (offeringsWithoutDesc.length > 0) {
      opportunities.push({
        brand_slug: brandSlug,
        category: 'offerings_clarity',
        title: 'Expand offering descriptions',
        description: `${offeringsWithoutDesc.length} offering(s) need more detailed descriptions`,
        impact_points: 10
      })
    }
  }

  // Breadth of Coverage (10 pts total)
  const faqs = feedData?.faqs || []
  
  if (faqs.length === 0) {
    opportunities.push({
      brand_slug: brandSlug,
      category: 'breadth_of_coverage',
      title: 'Add FAQs',
      description: 'Answer common questions AI models ask about brands like yours',
      impact_points: 10
    })
  } else if (faqs.length < 5) {
    opportunities.push({
      brand_slug: brandSlug,
      category: 'breadth_of_coverage',
      title: 'Add more FAQs',
      description: `Add ${5 - faqs.length} more FAQ(s) to improve coverage`,
      impact_points: 5
    })
  }

  return opportunities
}

// Group opportunities by category with scoring
function groupOpportunitiesByCategory(opportunities: any[]) {
  const categories = {
    trust_and_basics: {
      title: 'Trust & Basics',
      max_points: 20,
      earned_points: 0,
      opportunities: [] as any[]
    },
    brand_clarity: {
      title: 'Brand Clarity',
      max_points: 25,
      earned_points: 0,
      opportunities: [] as any[]
    },
    offerings_clarity: {
      title: 'Offerings Clarity',
      max_points: 25,
      earned_points: 0,
      opportunities: [] as any[]
    },
    breadth_of_coverage: {
      title: 'Breadth of Coverage',
      max_points: 10,
      earned_points: 0,
      opportunities: [] as any[]
    },
    structure_for_ai: {
      title: 'Structure for AI',
      max_points: 20,
      earned_points: 0,
      opportunities: [] as any[]
    }
  }

  opportunities.forEach(opp => {
    const category = categories[opp.category as keyof typeof categories]
    if (category) {
      category.opportunities.push(opp)
      if (opp.status === 'completed') {
        category.earned_points += opp.impact_points
      }
    }
  })

  // Calculate missing points
  Object.values(categories).forEach(cat => {
    const totalOpportunityPoints = cat.opportunities.reduce((sum, opp) => sum + opp.impact_points, 0)
    cat.earned_points = cat.max_points - totalOpportunityPoints
  })

  return categories
}
