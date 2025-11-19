// apps/web/app/brands/[slug]/page.tsx
// Individual brand profile page with claiming functionality

import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import BrandProfileClient from './BrandProfileClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Tell Next.js not to statically generate any brand pages at build time
export async function generateStaticParams() {
  return []
}

async function getBrandBySlug(slug: string) {
  // Check for env vars
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing Supabase credentials')
    return null
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { data: brand } = await supabase
    .from('public_index') // This is the view from the ai_profiles schema
    .select('*')
    .eq('slug', slug)
    .single()

  return brand
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const brand = await getBrandBySlug(params.slug)
  
  if (!brand) {
    return {
      title: 'Brand Not Found - Harbor Index'
    }
  }

  return {
    title: `${brand.brand_name} - AI Visibility Profile | Harbor Index`,
    description: `Track ${brand.brand_name}'s visibility across ChatGPT, Claude, Gemini, and Perplexity. Visibility Score: ${brand.visibility_score}%`,
  }
}

export default async function BrandProfilePage({ params }: { params: { slug: string } }) {
  const brand = await getBrandBySlug(params.slug)

  if (!brand) {
    notFound()
  }

  return <BrandProfileClient brand={brand} />
}