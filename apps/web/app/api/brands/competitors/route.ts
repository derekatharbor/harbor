// apps/web/app/api/brands/competitors/route.ts
// API endpoint to fetch competitors for a brand

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const brandId = searchParams.get('brandId')
    
    if (!brandId) {
      return NextResponse.json(
        { error: 'brandId is required' },
        { status: 400 }
      )
    }
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    // Get the brand
    const { data: brand, error: brandError } = await supabase
      .from('ai_profiles')
      .select('id, industry, visibility_score')
      .eq('id', brandId)
      .single()
    
    if (brandError || !brand || !brand.industry) {
      return NextResponse.json({
        competitors: [],
        userRank: 0,
        totalInCategory: 0,
        category: 'Unknown'
      })
    }
    
    // Get all brands in similar industries (fuzzy match)
    const { data: allCompetitors, error: compError } = await supabase
      .from('ai_profiles')
      .select('id, slug, brand_name, industry, visibility_score, rank_global, logo_url')
      .neq('id', brandId)
      .not('visibility_score', 'is', null)
      .ilike('industry', `%${brand.industry}%`)
      .order('visibility_score', { ascending: false })
      .limit(100) // Get more for ranking calculation
    
    if (compError || !allCompetitors) {
      console.error('Error fetching competitors:', compError)
      return NextResponse.json({
        competitors: [],
        userRank: 0,
        totalInCategory: 0,
        category: brand.industry
      })
    }
    
    // Calculate user's rank in this category
    const allBrands = [brand, ...allCompetitors].sort(
      (a, b) => (b.visibility_score || 0) - (a.visibility_score || 0)
    )
    const userRank = allBrands.findIndex(b => b.id === brand.id) + 1
    
    // Return top 5 competitors only
    const topCompetitors = allCompetitors.slice(0, 5)
    
    return NextResponse.json({
      competitors: topCompetitors,
      userRank,
      totalInCategory: allBrands.length,
      category: brand.industry
    })
    
  } catch (error) {
    console.error('Competitors API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch competitors' },
      { status: 500 }
    )
  }
}