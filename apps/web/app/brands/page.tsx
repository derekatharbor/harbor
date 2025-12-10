// apps/web/app/brands/page.tsx
// Harbor AI Visibility Index - The global leaderboard

import { Metadata } from 'next'
import HarborIndexClient from './HarborIndexClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// SEO Metadata
export const metadata: Metadata = {
  title: 'AI Visibility Index - How AI Sees Every Brand | Harbor',
  description: 'Search any company to see how ChatGPT, Claude, and Perplexity describe them. The definitive AI visibility index for brands.',
  keywords: [
    'AI visibility',
    'brand intelligence',
    'ChatGPT brand rankings',
    'AI search optimization',
    'generative engine optimization',
    'GEO',
    'brand leaderboard',
  ],
  openGraph: {
    title: 'AI Visibility Index - How AI Sees Every Brand',
    description: 'Search any company to see how ChatGPT, Claude, and Perplexity describe them.',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://useharbor.io'}/brands`,
    siteName: 'Harbor',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Visibility Index | Harbor',
    description: 'How do AI models see your brand? Search the index.',
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://useharbor.io'}/brands`,
  },
}

export default function BrandsPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://useharbor.io'
  
  // Schema.org structured data for the Index
  const schemaOrgData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    'name': 'Harbor AI Visibility Index',
    'description': 'Search any company to see how AI models understand and represent them',
    'url': `${siteUrl}/brands`,
    'publisher': {
      '@type': 'Organization',
      'name': 'Harbor',
      'url': siteUrl,
      'logo': `${siteUrl}/logo-icon.png`
    },
    'mainEntity': {
      '@type': 'ItemList',
      'name': 'Brand AI Visibility Rankings',
      'description': 'Rankings of brands by their AI visibility scores across ChatGPT and Perplexity'
    }
  }

  return (
    <>
      {/* Schema.org JSON-LD for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schemaOrgData)
        }}
      />
      
      <HarborIndexClient />
    </>
  )
}