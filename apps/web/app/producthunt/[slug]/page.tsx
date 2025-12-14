// Path: apps/web/app/producthunt/[slug]/page.tsx

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import PHBrandProfileClient from './PHBrandProfileClient'

// Revalidate every hour
export const revalidate = 3600

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

interface PHProduct {
  id: string
  name: string
  slug: string
  domain: string
  category: string
}

interface PHResult {
  mention_count: number
  avg_position: number | null
  positive_mentions: number
  visibility_score: number
}

async function fetchPHProduct(slug: string): Promise<{ product: PHProduct | null; stats: PHResult | null }> {
  const supabase = getSupabase()
  
  // Get product - only select columns that exist
  const { data: product, error } = await supabase
    .from('ph_products')
    .select('id, name, slug, domain, category')
    .eq('slug', slug)
    .single()

  if (error || !product) {
    return { product: null, stats: null }
  }

  // Get aggregated stats from ph_results
  const { data: results } = await supabase
    .from('ph_results')
    .select('brands_mentioned')

  let mention_count = 0
  let total_position = 0
  let position_count = 0
  let positive_mentions = 0

  if (results) {
    for (const result of results) {
      const mentions = result.brands_mentioned || []
      for (const mention of mentions) {
        if (mention.name?.toLowerCase() === product.name.toLowerCase()) {
          mention_count++
          if (mention.position) {
            total_position += mention.position
            position_count++
          }
          if (mention.sentiment === 'positive') {
            positive_mentions++
          }
        }
      }
    }
  }

  const avg_position = position_count > 0 ? Math.round(total_position / position_count) : null
  const visibility_score = Math.min(100, mention_count * 10) // Simple scoring

  return {
    product: product as PHProduct,
    stats: {
      mention_count,
      avg_position,
      positive_mentions,
      visibility_score
    }
  }
}

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  const { slug } = await params
  const { product } = await fetchPHProduct(slug)
  
  if (!product) {
    return { title: 'Not Found' }
  }

  return {
    title: `${product.name} - AI Visibility | Product Hunt Index | Harbor`,
    description: `See how AI models like ChatGPT and Perplexity describe ${product.name}. Track AI visibility for this Product Hunt launch.`,
    openGraph: {
      title: `${product.name} - AI Visibility`,
      description: `See how AI models describe ${product.name}`,
    }
  }
}

export default async function PHBrandPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params
  const { product, stats } = await fetchPHProduct(slug)
  
  if (!product) {
    notFound()
  }

  return <PHBrandProfileClient product={product} stats={stats} />
}