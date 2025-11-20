// apps/web/app/brands/[slug]/page.tsx
// Brand profile page with Open Graph metadata for LinkedIn sharing

import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import BrandProfileClient from './BrandProfileClient'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Don't pregenerate any pages
export async function generateStaticParams() {
  return []
}

// Generate metadata for Open Graph (LinkedIn sharing)
export async function generateMetadata({ 
  params 
}: { 
  params: { slug: string } 
}): Promise<Metadata> {
  try {
    // Fetch brand data for metadata
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return {}
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { data: brand } = await supabase
      .from('ai_profiles')
      .select('brand_name, visibility_score, rank_global, industry')
      .eq('slug', params.slug)
      .single()

    if (!brand) {
      return {}
    }

    const title = `${brand.brand_name} - AI Visibility Profile`
    const description = `${brand.brand_name} ranks #${brand.rank_global} in ${brand.industry} with a ${brand.visibility_score.toFixed(1)}% AI visibility score across ChatGPT, Claude, Gemini, and Perplexity.`
    const shareImageUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://useharbor.io'}/api/share-card/${params.slug}`

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: [
          {
            url: shareImageUrl,
            width: 1200,
            height: 627,
            alt: `${brand.brand_name} AI Visibility Report Card`
          }
        ],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [shareImageUrl],
      }
    }
  } catch (error) {
    console.error('Metadata generation error:', error)
    return {}
  }
}

// Simplified - will fetch data via API at runtime
export default async function BrandProfilePage({ params }: { params: { slug: string } }) {
  // For now, pass minimal data - you'll fetch full data via API
  const mockBrand = {
    id: 'temp',
    brand_name: 'Loading...',
    slug: params.slug,
    domain: 'loading.com',
    logo_url: '',
    visibility_score: 0,
    industry: '',
    rank_global: 0,
    claimed: false,
    accesses_last_30_days: 0
  }

  return <BrandProfileClient brand={mockBrand} />
}