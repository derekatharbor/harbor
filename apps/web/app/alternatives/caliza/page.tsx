// AUTO-GENERATED ALTERNATIVES PAGE
// Generated: 2025-11-30T19:36:57.367Z
// Alternative to: Caliza

import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Best Caliza Alternatives (November 30, 2025) | Harbor',
  description: 'Top alternatives to Caliza for Financial Technology. Compare features, pricing, and integrations.',
  openGraph: {
    title: 'Best Caliza Alternatives',
    description: 'Top alternatives to Caliza for Financial Technology.',
    type: 'article',
    publishedTime: '2025-11-30T19:36:57.367Z',
    modifiedTime: '2025-11-30T19:36:57.367Z',
  },
}

const schemaOrg = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      "@id": "https://useharbor.io/alternatives/caliza#article",
      "headline": "Best Caliza Alternatives",
      "description": "Top alternatives to Caliza for Financial Technology. Compare features, pricing, and integrations.",
      "datePublished": "2025-11-30T19:36:57.367Z",
      "dateModified": "2025-11-30T19:36:57.367Z",
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
      "@id": "https://useharbor.io/alternatives/caliza#list",
      "name": "Caliza Alternatives",
      "numberOfItems": 3,
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "item": {
            "@type": "SoftwareApplication",
            "name": "fiVISION",
            "url": "https://useharbor.io/brands/fivision",
            "description": "A leading provider of online account opening software for financial institutions.",
            "applicationCategory": "Financial Technology"
          }
        },
        {
          "@type": "ListItem",
          "position": 2,
          "item": {
            "@type": "SoftwareApplication",
            "name": "AlphaCentrix",
            "url": "https://useharbor.io/brands/alphacentrix",
            "description": "AlphaCentrix provides comprehensive technology solutions for investment management firms.",
            "applicationCategory": "Financial Technology"
          }
        },
        {
          "@type": "ListItem",
          "position": 3,
          "item": {
            "@type": "SoftwareApplication",
            "name": "iuvity",
            "url": "https://useharbor.io/brands/iuvity",
            "description": "Digital solutions for the financial sector.",
            "applicationCategory": "Financial Technology"
          }
        }
      ]
    }
  ]
}

const alternatives = [
  {
    "slug": "fivision",
    "brand_name": "fiVISION",
    "domain": "fivision.com",
    "summary": "A leading provider of online account opening software for financial institutions.",
    "pricing": {
      "price_model": "usage",
      "price_notes": "Only pay for submitted applications.",
      "has_free_tier": false,
      "starting_price": null
    },
    "features": [
      "Real-time Integrations",
      "Integrated Decision Engine",
      "Automation of tasks",
      "Customizable customer experience",
      "SMS & Email communication"
    ],
    "integrations": [
      "core processors",
      "electronic signatures",
      "decision support systems"
    ]
  },
  {
    "slug": "alphacentrix",
    "brand_name": "AlphaCentrix",
    "domain": "alphacentrix.com",
    "summary": "AlphaCentrix provides comprehensive technology solutions for investment management firms.",
    "pricing": {
      "price_model": "custom",
      "price_notes": null,
      "has_free_tier": false,
      "starting_price": null
    },
    "features": [
      "Data management",
      "Workflow automation",
      "Investment reporting portals",
      "Portfolio reconciliation",
      "Cash management"
    ],
    "integrations": [
      "market data vendors",
      "banks",
      "brokers"
    ]
  },
  {
    "slug": "iuvity",
    "brand_name": "iuvity",
    "domain": "iuvity.com",
    "summary": "Digital solutions for the financial sector.",
    "pricing": {
      "price_model": "custom",
      "price_notes": null,
      "has_free_tier": false,
      "starting_price": null
    },
    "features": [
      "Rapid implementation",
      "Optimized digital user experience",
      "Flexible and secure solutions",
      "Real-time fraud monitoring with AI",
      "Open banking capabilities"
    ],
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
              Last verified: <time dateTime="2025-11-30T19:36:57.367Z">November 30, 2025</time> &bull; {alternatives.length} alternatives
            </p>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Best Caliza Alternatives
            </h1>
            <p className="text-lg text-gray-300">
              Looking for an alternative to Caliza? Here are the top Financial Technology solutions that compete with Caliza, 
              ranked by visibility and feature coverage.
            </p>
            <p className="mt-4 text-sm text-gray-400">
              Compare with: <Link href="/brands/caliza" className="text-[#FF6B4A] hover:underline">Caliza profile &rarr;</Link>
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
                      href={`/compare/caliza-vs-${alt.slug}`}
                      className="text-[#2979FF] hover:underline text-sm"
                    >
                      Compare with Caliza &rarr;
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
              Last verified: <time dateTime="2025-11-30T19:36:57.367Z">2025-11-30</time>
            </p>
          </footer>
        </div>
      </main>
    </>
  )
}
