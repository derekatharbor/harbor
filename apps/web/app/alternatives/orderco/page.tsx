// AUTO-GENERATED ALTERNATIVES PAGE
// Generated: 2025-11-30T20:05:20.084Z
// Alternative to: Order.co

import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Best Order.co Alternatives (November 30, 2025) | Harbor',
  description: 'Top alternatives to Order.co for Procurement. Compare features, pricing, and integrations.',
  openGraph: {
    title: 'Best Order.co Alternatives',
    description: 'Top alternatives to Order.co for Procurement.',
    type: 'article',
    publishedTime: '2025-11-30T20:05:20.084Z',
    modifiedTime: '2025-11-30T20:05:20.084Z',
  },
}

const schemaOrg = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      "@id": "https://useharbor.io/alternatives/orderco#article",
      "headline": "Best Order.co Alternatives",
      "description": "Top alternatives to Order.co for Procurement. Compare features, pricing, and integrations.",
      "datePublished": "2025-11-30T20:05:20.084Z",
      "dateModified": "2025-11-30T20:05:20.084Z",
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
      "@id": "https://useharbor.io/alternatives/orderco#list",
      "name": "Order.co Alternatives",
      "numberOfItems": 3,
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "item": {
            "@type": "SoftwareApplication",
            "name": "Fairmarkit",
            "url": "https://useharbor.io/brands/fairmarkit",
            "description": "Fairmarkit provides an AI-driven platform for autonomous sourcing.",
            "applicationCategory": "Procurement"
          }
        },
        {
          "@type": "ListItem",
          "position": 2,
          "item": {
            "@type": "SoftwareApplication",
            "name": "Scoutbee",
            "url": "https://useharbor.io/brands/scoutbee",
            "description": "Scoutbee is an AI-powered procurement platform that connects buyers and suppliers.",
            "applicationCategory": "Procurement"
          }
        },
        {
          "@type": "ListItem",
          "position": 3,
          "item": {
            "@type": "SoftwareApplication",
            "name": "ORO Labs",
            "url": "https://useharbor.io/brands/oro-labs",
            "description": "Intelligent procurement orchestration platform.",
            "applicationCategory": "Procurement"
          }
        }
      ]
    }
  ]
}

const alternatives = [
  {
    "slug": "fairmarkit",
    "brand_name": "Fairmarkit",
    "domain": "fairmarkit.com",
    "summary": "Fairmarkit provides an AI-driven platform for autonomous sourcing.",
    "pricing": {
      "price_model": "unknown",
      "price_notes": null,
      "has_free_tier": false,
      "starting_price": null
    },
    "features": [
      "Automate every step of the sourcing lifecycle",
      "Scale across all sourcing types and levels of spend",
      "Handle strategic, tactical and tail spend",
      "Intuitive and mobile-friendly workflows",
      "Apply sourcing strategy and compliance automatically"
    ],
    "integrations": []
  },
  {
    "slug": "scoutbee",
    "brand_name": "Scoutbee",
    "domain": "scoutbee.com",
    "summary": "Scoutbee is an AI-powered procurement platform that connects buyers and suppliers.",
    "pricing": {
      "price_model": "unknown",
      "price_notes": "Free profile available for suppliers to connect with buyers",
      "has_free_tier": true,
      "starting_price": null
    },
    "features": [
      "Connect buyers and suppliers",
      "Streamline compliance",
      "Manage sourcing in one place",
      "Find trusted suppliers quickly",
      "Simplify the RFI process"
    ],
    "integrations": []
  },
  {
    "slug": "oro-labs",
    "brand_name": "ORO Labs",
    "domain": "orolabs.ai",
    "summary": "Intelligent procurement orchestration platform.",
    "pricing": {
      "price_model": "unknown",
      "price_notes": null,
      "has_free_tier": false,
      "starting_price": null
    },
    "features": [
      "Intelligent procurement orchestration",
      "No-code workflow and AI agent builder",
      "Supplier onboarding and lifecycle management",
      "Risk and compliance automation",
      "Real-time visibility across procurement processes"
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
              Last verified: <time dateTime="2025-11-30T20:05:20.084Z">November 30, 2025</time> &bull; {alternatives.length} alternatives
            </p>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Best Order.co Alternatives
            </h1>
            <p className="text-lg text-gray-300">
              Looking for an alternative to Order.co? Here are the top Procurement solutions that compete with Order.co, 
              ranked by visibility and feature coverage.
            </p>
            <p className="mt-4 text-sm text-gray-400">
              Compare with: <Link href="/brands/orderco" className="text-[#FF6B4A] hover:underline">Order.co profile &rarr;</Link>
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
                      href={`/compare/orderco-vs-${alt.slug}`}
                      className="text-[#2979FF] hover:underline text-sm"
                    >
                      Compare with Order.co &rarr;
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
              Last verified: <time dateTime="2025-11-30T20:05:20.084Z">2025-11-30</time>
            </p>
          </footer>
        </div>
      </main>
    </>
  )
}
