// AUTO-GENERATED ALTERNATIVES PAGE
// Generated: 2025-11-30T20:05:20.061Z
// Alternative to: CHESS Health

import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Best CHESS Health Alternatives (November 30, 2025) | Harbor',
  description: 'Top alternatives to CHESS Health for Digital Health. Compare features, pricing, and integrations.',
  openGraph: {
    title: 'Best CHESS Health Alternatives',
    description: 'Top alternatives to CHESS Health for Digital Health.',
    type: 'article',
    publishedTime: '2025-11-30T20:05:20.061Z',
    modifiedTime: '2025-11-30T20:05:20.061Z',
  },
}

const schemaOrg = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      "@id": "https://useharbor.io/alternatives/chess-health#article",
      "headline": "Best CHESS Health Alternatives",
      "description": "Top alternatives to CHESS Health for Digital Health. Compare features, pricing, and integrations.",
      "datePublished": "2025-11-30T20:05:20.061Z",
      "dateModified": "2025-11-30T20:05:20.061Z",
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
      "@id": "https://useharbor.io/alternatives/chess-health#list",
      "name": "CHESS Health Alternatives",
      "numberOfItems": 3,
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "item": {
            "@type": "SoftwareApplication",
            "name": "Kaia Health",
            "url": "https://useharbor.io/brands/kaia-health",
            "description": "Digital-first care for musculoskeletal pain.",
            "applicationCategory": "Digital Health"
          }
        },
        {
          "@type": "ListItem",
          "position": 2,
          "item": {
            "@type": "SoftwareApplication",
            "name": "DynamiCare Health",
            "url": "https://useharbor.io/brands/dynamicare-health",
            "description": "A digital therapeutics and coaching company focused on helping individuals overcome addiction.",
            "applicationCategory": "Digital Health"
          }
        },
        {
          "@type": "ListItem",
          "position": 3,
          "item": {
            "@type": "SoftwareApplication",
            "name": "Wellthy Therapeutics (acquired by TruDoc)",
            "url": "https://useharbor.io/brands/wellthy-therapeutics-acquired-by-trudoc",
            "description": "A leading digital therapeutics company focused on advancing health equity through digital care.",
            "applicationCategory": "Digital Health"
          }
        }
      ]
    }
  ]
}

const alternatives = [
  {
    "slug": "kaia-health",
    "brand_name": "Kaia Health",
    "domain": "kaiahealth.com",
    "summary": "Digital-first care for musculoskeletal pain.",
    "pricing": {
      "price_model": "custom",
      "price_notes": "Pricing details are not specified; contact sales for more information.",
      "has_free_tier": false,
      "starting_price": null
    },
    "features": [
      "Access to human health coaches",
      "AI real-time feedback during exercise",
      "Library of education and relaxation units",
      "Programs developed by Doctors of Physical Therapy",
      "Multi-modal treatment approach"
    ],
    "integrations": []
  },
  {
    "slug": "dynamicare-health",
    "brand_name": "DynamiCare Health",
    "domain": "dynamicarehealth.com",
    "summary": "A digital therapeutics and coaching company focused on helping individuals overcome addiction.",
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
    "slug": "wellthy-therapeutics-acquired-by-trudoc",
    "brand_name": "Wellthy Therapeutics (acquired by TruDoc)",
    "domain": "wellthytherapeutics.com",
    "summary": "A leading digital therapeutics company focused on advancing health equity through digital care.",
    "pricing": {
      "price_model": "unknown",
      "price_notes": null,
      "has_free_tier": false,
      "starting_price": null
    },
    "features": [],
    "integrations": []
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
              Last verified: <time dateTime="2025-11-30T20:05:20.061Z">November 30, 2025</time> &bull; {alternatives.length} alternatives
            </p>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Best CHESS Health Alternatives
            </h1>
            <p className="text-lg text-gray-300">
              Looking for an alternative to CHESS Health? Here are the top Digital Health solutions that compete with CHESS Health, 
              ranked by visibility and feature coverage.
            </p>
            <p className="mt-4 text-sm text-gray-400">
              Compare with: <Link href="/brands/chess-health" className="text-[#FF6B4A] hover:underline">CHESS Health profile &rarr;</Link>
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
                      href={`/compare/chess-health-vs-${alt.slug}`}
                      className="text-[#2979FF] hover:underline text-sm"
                    >
                      Compare with CHESS Health &rarr;
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
              Last verified: <time dateTime="2025-11-30T20:05:20.061Z">2025-11-30</time>
            </p>
          </footer>
        </div>
      </main>
    </>
  )
}
