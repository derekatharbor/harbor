// AUTO-GENERATED ALTERNATIVES PAGE
// Generated: 2025-11-30T20:05:19.875Z
// Alternative to: Jobcase, Inc.

import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Best Jobcase, Inc. Alternatives (November 30, 2025) | Harbor',
  description: 'Top alternatives to Jobcase, Inc. for Career Services. Compare features, pricing, and integrations.',
  openGraph: {
    title: 'Best Jobcase, Inc. Alternatives',
    description: 'Top alternatives to Jobcase, Inc. for Career Services.',
    type: 'article',
    publishedTime: '2025-11-30T20:05:19.875Z',
    modifiedTime: '2025-11-30T20:05:19.875Z',
  },
}

const schemaOrg = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      "@id": "https://useharbor.io/alternatives/jobcase-inc#article",
      "headline": "Best Jobcase, Inc. Alternatives",
      "description": "Top alternatives to Jobcase, Inc. for Career Services. Compare features, pricing, and integrations.",
      "datePublished": "2025-11-30T20:05:19.875Z",
      "dateModified": "2025-11-30T20:05:19.875Z",
      "author": {
        "@type": "Organization",
        "name": "Harbor",
        "url": "https://useharbor.io"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Harbor",
        "url": "https://useharbor.io"
      }
    },
    {
      "@type": "ItemList",
      "@id": "https://useharbor.io/alternatives/jobcase-inc#list",
      "name": "Jobcase, Inc. Alternatives",
      "numberOfItems": 3,
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "item": {
            "@type": "SoftwareApplication",
            "name": "InHerSight",
            "url": "https://useharbor.io/brands/inhersight",
            "description": "A platform connecting women to trusted companies and career opportunities.",
            "applicationCategory": "Career Services"
          }
        },
        {
          "@type": "ListItem",
          "position": 2,
          "item": {
            "@type": "SoftwareApplication",
            "name": "Teal",
            "url": "https://useharbor.io/brands/teal",
            "description": "AI Powered Tools to Grow Your Career.",
            "applicationCategory": "Career Services"
          }
        },
        {
          "@type": "ListItem",
          "position": 3,
          "item": {
            "@type": "SoftwareApplication",
            "name": "Free Agency",
            "url": "https://useharbor.io/brands/free-agency",
            "description": "A careers company focused on helping tech talent navigate their career paths in the age of AI.",
            "applicationCategory": "Career Services"
          }
        }
      ]
    }
  ]
}

const alternatives = [
  {
    "slug": "inhersight",
    "brand_name": "InHerSight",
    "domain": "inhersight.com",
    "summary": "A platform connecting women to trusted companies and career opportunities.",
    "pricing": {
      "price_model": "unknown",
      "price_notes": null,
      "has_free_tier": true,
      "starting_price": null
    },
    "features": [
      "Company reviews designed for women",
      "Job matching based on values",
      "Career advice and inspiration",
      "Polls and articles related to workplace issues",
      "Community for professional women"
    ],
    "integrations": []
  },
  {
    "slug": "teal",
    "brand_name": "Teal",
    "domain": "tealhq.com",
    "summary": "AI Powered Tools to Grow Your Career.",
    "pricing": {
      "price_model": "unknown",
      "price_notes": null,
      "has_free_tier": false,
      "starting_price": null
    },
    "features": [],
    "integrations": []
  },
  {
    "slug": "free-agency",
    "brand_name": "Free Agency",
    "domain": "freeagency.com",
    "summary": "A careers company focused on helping tech talent navigate their career paths in the age of AI.",
    "pricing": {
      "price_model": "custom",
      "price_notes": "Pricing for specific opportunities is mentioned, but no general pricing model is provided.",
      "has_free_tier": false,
      "starting_price": "$2k"
    },
    "features": [
      "Talent Agent services",
      "Career guidance",
      "Job opportunities in tech",
      "Newsletter for careerists",
      "Networking with top companies"
    ],
    "integrations": [
      "Salesforce",
      "Slack",
      "Shopify",
      "Asana",
      "GitHub",
      "Adobe",
      "Amazon",
      "Apple"
    ]
  }
]

export default function AlternativesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
      />
      
      <main className="min-h-screen bg-[#101A31] text-white">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <header className="mb-12">
            <p className="text-sm text-gray-400 mb-2">
              Last verified: <time dateTime="2025-11-30T20:05:19.875Z">November 30, 2025</time> &bull; {alternatives.length} alternatives
            </p>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Best Jobcase, Inc. Alternatives
            </h1>
            <p className="text-lg text-gray-300">
              Looking for an alternative to Jobcase, Inc.? Here are the top Career Services solutions that compete with Jobcase, Inc., 
              ranked by visibility and feature coverage.
            </p>
            <p className="mt-4 text-sm text-gray-400">
              Compare with: <Link href="/brands/jobcase-inc" className="text-[#FF6B4A] hover:underline">Jobcase, Inc. profile &rarr;</Link>
            </p>
          </header>

          <section>
            <div className="space-y-6">
              {alternatives.map((alt, index) => (
                <article 
                  key={alt.slug}
                  className="p-6 bg-[#141E38] rounded-lg border border-white/10 hover:border-white/20 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="text-[#FF6B4A] text-sm font-medium">#{index + 1}</span>
                      <h3 className="text-xl font-semibold mt-1">{alt.brand_name}</h3>
                      <p className="text-gray-400 text-sm">{alt.domain}</p>
                    </div>
                    {alt.pricing?.has_free_tier && (
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                        Free tier
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-300 mb-4">{alt.summary}</p>
                  
                  {alt.features.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-400 mb-2">Key features:</p>
                      <div className="flex flex-wrap gap-2">
                        {alt.features.map((feature: string) => (
                          <span key={feature} className="px-2 py-1 bg-white/5 text-sm rounded">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                    <Link
                      href={`/brands/${alt.slug}`}
                      className="text-[#FF6B4A] hover:underline text-sm"
                    >
                      View full profile &rarr;
                    </Link>
                    <Link
                      href={`/compare/jobcase-inc-vs-${alt.slug}`}
                      className="text-[#2979FF] hover:underline text-sm"
                    >
                      Compare with Jobcase, Inc. &rarr;
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <footer className="mt-12 pt-8 border-t border-white/10 text-center text-gray-400 text-sm">
            <p>
              This list is generated from structured data collected by Harbor.
              <br />
              Last verified: <time dateTime="2025-11-30T20:05:19.875Z">2025-11-30</time>
            </p>
          </footer>
        </div>
      </main>
    </>
  )
}
