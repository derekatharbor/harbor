// API Route: GET /api/index/brands/[slug]
// Returns individual brand profile for the brand page

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    const { data: profile, error } = await supabase
      .from('ai_profiles')
      .select(`
        id,
        brand_name,
        slug,
        domain,
        logo_url,
        visibility_score,
        industry,
        rank_global,
        rank_in_industry,
        claimed,
        feed_url,
        feed_data,
        last_updated_at
      `)
      .eq('slug', slug)
      .single()

    if (error) {
      throw error
    }

    if (!profile) {
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      )
    }

    // Get access count from analytics (last 30 days)
    const { data: analytics } = await supabase
      .from('feed_analytics_daily')
      .select('total_accesses')
      .eq('profile_id', profile.id)
      .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

    const accesses_last_30_days = analytics?.reduce(
      (sum, day) => sum + (day.total_accesses || 0),
      0
    ) || 0

    return NextResponse.json({
      ...profile,
      accesses_last_30_days,
    })
  } catch (error: any) {
    console.error('Error fetching brand profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch brand profile' },
      { status: 500 }
    )
  }
}
