// API Route: /api/producthunt/leaderboard
// Returns ranked Product Hunt products based on AI visibility
//
// GET - Returns leaderboard with visibility scores

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function getBrandfetchLogo(domain: string): string {
  return `https://cdn.brandfetch.io/${domain}/w/400/h/400?c=1id1Fyz-h7an5-5KR_y`
}

interface ProductScore {
  id: string
  name: string
  domain: string
  slug: string
  category: string
  logo_url: string
  mention_count: number
  avg_position: number
  positive_mentions: number
  visibility_score: number
}

export async function GET(request: NextRequest) {
  const supabase = getSupabase()
  
  // Get all products
  const { data: products, error: productsError } = await supabase
    .from('ph_products')
    .select('id, name, domain, slug, category')
  
  if (productsError || !products) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
  
  // Get all results with brand mentions
  const { data: results, error: resultsError } = await supabase
    .from('ph_results')
    .select('brands_mentioned, model')
  
  if (resultsError) {
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 })
  }
  
  // Count total prompts executed (for calculating mention rate)
  const totalPrompts = results?.length || 1
  
  // Aggregate mentions per product
  const productStats: Record<string, {
    mentions: number
    positions: number[]
    positive: number
    neutral: number
    negative: number
  }> = {}
  
  // Initialize all products
  for (const product of products) {
    productStats[product.name.toLowerCase()] = {
      mentions: 0,
      positions: [],
      positive: 0,
      neutral: 0,
      negative: 0
    }
  }
  
  // Process all results
  for (const result of results || []) {
    const mentions = result.brands_mentioned || []
    
    for (const mention of mentions) {
      const nameLower = mention.name?.toLowerCase()
      if (!nameLower || !productStats[nameLower]) continue
      
      productStats[nameLower].mentions++
      if (mention.position) {
        productStats[nameLower].positions.push(mention.position)
      }
      
      if (mention.sentiment === 'positive') {
        productStats[nameLower].positive++
      } else if (mention.sentiment === 'negative') {
        productStats[nameLower].negative++
      } else {
        productStats[nameLower].neutral++
      }
    }
  }
  
  // Calculate visibility scores
  const leaderboard: ProductScore[] = products.map(product => {
    const stats = productStats[product.name.toLowerCase()]
    
    // Mention rate (0-50 points)
    const mentionRate = (stats.mentions / totalPrompts) * 100
    const mentionScore = Math.min(50, mentionRate * 5)
    
    // Position score (0-30 points) - lower position = better
    const avgPos = stats.positions.length > 0
      ? stats.positions.reduce((a, b) => a + b, 0) / stats.positions.length
      : 10
    const positionScore = Math.max(0, 30 - (avgPos - 1) * 5)
    
    // Sentiment score (0-20 points)
    const totalSentiment = stats.positive + stats.neutral + stats.negative
    const sentimentScore = totalSentiment > 0
      ? ((stats.positive * 20 + stats.neutral * 10) / totalSentiment)
      : 0
    
    const visibilityScore = Math.round(mentionScore + positionScore + sentimentScore)
    
    return {
      id: product.id,
      name: product.name,
      domain: product.domain,
      slug: product.slug,
      category: product.category,
      logo_url: getBrandfetchLogo(product.domain),
      mention_count: stats.mentions,
      avg_position: stats.positions.length > 0 ? Math.round(avgPos * 10) / 10 : null,
      positive_mentions: stats.positive,
      visibility_score: visibilityScore
    }
  })
  .sort((a, b) => b.visibility_score - a.visibility_score)
  
  // Add rank
  const ranked = leaderboard.map((p, i) => ({
    ...p,
    rank: i + 1
  }))
  
  return NextResponse.json({
    leaderboard: ranked,
    total_products: products.length,
    total_results: results?.length || 0,
    updated_at: new Date().toISOString()
  }, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
    }
  })
}
