// apps/web/app/page.tsx
// Harbor Homepage - Claim your brand's AI profile

import { Metadata } from 'next'
import HarborIndexClient from './brands/HarborIndexClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Harbor - AI Profiles for Brands',
  description: 'Your brand has an AI profile. Claim it. Create the structured profile AI systems reference when answering questions about your brand. 100,000+ brands indexed.',
  keywords: [
    'AI profile',
    'AI visibility',
    'brand profile',
    'ChatGPT brand',
    'AI search',
    'generative engine optimization',
    'GEO',
    'claim brand',
    'AI brand index',
  ],
  openGraph: {
    title: 'Harbor - AI Profiles for Brands',
    description: 'Your brand has an AI profile. Claim it. Create the structured profile AI systems reference when answering questions about your brand.',
    url: 'https://useharbor.io',
    siteName: 'Harbor',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Harbor - AI Profiles for Brands',
    description: 'Your brand has an AI profile. Claim it.',
  },
  alternates: {
    canonical: 'https://useharbor.io',
  },
}

export default function HomePage() {
  const siteUrl = 'https://useharbor.io'
  
  // Schema.org structured data for the homepage
  const schemaOrgData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'Harbor',
    'description': 'AI profiles for brands. Create the structured profile AI systems reference when answering questions about your brand.',
    'url': siteUrl,
    'publisher': {
      '@type': 'Organization',
      'name': 'Harbor',
      'url': siteUrl,
      'logo': `${siteUrl}/logo-icon.png`
    },
    'potentialAction': {
      '@type': 'SearchAction',
      'target': {
        '@type': 'EntryPoint',
        'urlTemplate': `${siteUrl}/brands/{search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  }

  return (
    <>
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
