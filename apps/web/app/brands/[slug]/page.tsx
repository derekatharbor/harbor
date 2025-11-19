// apps/web/app/brands/[slug]/page.tsx
// Fully dynamic brand profile page

import { notFound } from 'next/navigation'
import BrandProfileClient from './BrandProfileClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Don't pregenerate any pages
export async function generateStaticParams() {
  return []
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