// apps/web/app/brands/page.tsx
// Harbor AI Visibility Index - The global leaderboard

import { Metadata } from 'next'
import HarborIndexClient from './HarborIndexClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// SEO Metadata
export const metadata: Metadata = {
  title: 'AI Visibility Index - How AI Sees 20,000+ Brands | Harbor',
  description: 'The definitive leaderboard showing how ChatGPT, Claude, Gemini, and Perplexity understand and represent brands. Search, compare, and claim your brand profile.',
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
    title: 'AI Visibility Index - How AI Sees Brands',
    description: 'See how 20,000+ brands rank across ChatGPT, Claude, Gemini, and Perplexity. The definitive AI visibility leaderboard.',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://useharbor.io'}/brands`,
    siteName: 'Harbor',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Visibility Index | Harbor',
    description: 'How do AI models see your brand? Check the leaderboard.',
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://useharbor.io'}/brands`,
  },
}

// Empty - will fetch on client side or at runtime
export default function BrandsPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://useharbor.io'
  
  // Schema.org structured data for the Index
  const schemaOrgData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    'name': 'Harbor AI Visibility Index',
    'description': 'The definitive leaderboard showing how AI models understand and represent brands',
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
      'description': 'Rankings of brands by their AI visibility scores across ChatGPT, Claude, Gemini, and Perplexity',
      'numberOfItems': '20000+'
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
      
      <HarborIndexClient brands={[]} />
    </>
  )
}