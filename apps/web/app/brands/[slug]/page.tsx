// apps/web/app/brands/[slug]/page.tsx
// Canonical human-readable brand profile page

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import BrandProfileClient from './BrandProfileClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Generate metadata with canonical JSON feed link
export async function generateMetadata({ 
  params 
}: { 
  params: { slug: string } 
}): Promise<Metadata> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return {}
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { data: brand } = await supabase
      .from('ai_profiles')
      .select('brand_name, visibility_score, rank_global, industry, domain')
      .eq('slug', params.slug)
      .single()

    if (!brand) {
      return {}
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://useharbor.io'
    const canonicalUrl = `${siteUrl}/brands/${params.slug}`
    const jsonFeedUrl = `${siteUrl}/brands/${params.slug}/harbor.json`
    const shareImageUrl = `${siteUrl}/api/share-card/${params.slug}?theme=light`
    
    const title = `${brand.brand_name} - AI Visibility Profile | Harbor`
    const description = `${brand.brand_name} ranks #${brand.rank_global} with a ${brand.visibility_score.toFixed(1)}% AI visibility score. See how ChatGPT, Claude, Gemini, and Perplexity understand this brand.`

    return {
      title,
      description,
      alternates: {
        canonical: canonicalUrl,
        types: {
          // THIS IS KEY: Links to the machine-readable feed
          'application/json': jsonFeedUrl,
        }
      },
      openGraph: {
        title,
        description,
        url: canonicalUrl,
        siteName: 'Harbor',
        images: [
          {
            url: shareImageUrl,
            width: 1200,
            height: 627,
            alt: `${brand.brand_name} AI Visibility Report Card`,
          }
        ],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [shareImageUrl],
      },
      other: {
        // Additional canonical feed meta
        'json-feed-url': jsonFeedUrl,
      }
    }
  } catch (error) {
    console.error('Metadata generation error:', error)
    return {}
  }
}

export default async function BrandProfilePage({ 
  params 
}: { 
  params: { slug: string } 
}) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: brand, error } = await supabase
    .from('ai_profiles')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (error || !brand) {
    notFound()
  }

  return (
    <>
      {/* Explicit JSON feed link in head (Next.js will render this) */}
      <link 
        rel="alternate" 
        type="application/json" 
        href={`/brands/${params.slug}/harbor.json`}
        title="AI-Ready Profile Feed"
      />
      
      <BrandProfileClient brand={brand} />
    </>
  )
}