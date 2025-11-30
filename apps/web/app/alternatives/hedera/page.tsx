// AUTO-GENERATED ALTERNATIVES PAGE
// Generated: 2025-11-30T19:44:53.335Z
// Alternative to: Hedera

import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Best Hedera Alternatives (November 30, 2025) | Harbor',
  description: 'Top alternatives to Hedera for Blockchain. Compare features, pricing, and integrations.',
  openGraph: {
    title: 'Best Hedera Alternatives',
    description: 'Top alternatives to Hedera for Blockchain.',
    type: 'article',
    publishedTime: '2025-11-30T19:44:53.335Z',
    modifiedTime: '2025-11-30T19:44:53.335Z',
  },
}

const schemaOrg = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      "@id": "https://useharbor.io/alternatives/hedera#article",
      "headline": "Best Hedera Alternatives",
      "description": "Top alternatives to Hedera for Blockchain. Compare features, pricing, and integrations.",
      "datePublished": "2025-11-30T19:44:53.335Z",
      "dateModified": "2025-11-30T19:44:53.335Z",
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
      "@id": "https://useharbor.io/alternatives/hedera#list",
      "name": "Hedera Alternatives",
      "numberOfItems": 3,
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "item": {
            "@type": "SoftwareApplication",
            "name": "Dragonchain",
            "url": "https://useharbor.io/brands/dragonchain",
            "description": "A hybrid blockchain platform designed for enterprise and startup applications.",
            "applicationCategory": "Blockchain"
          }
        },
        {
          "@type": "ListItem",
          "position": 2,
          "item": {
            "@type": "SoftwareApplication",
            "name": "Offchain Labs",
            "url": "https://useharbor.io/brands/offchain-labs",
            "description": "A leading provider of Ethereum scaling solutions and development tools.",
            "applicationCategory": "Blockchain"
          }
        },
        {
          "@type": "ListItem",
          "position": 3,
          "item": {
            "@type": "SoftwareApplication",
            "name": "Manta Ray Labs",
            "url": "https://useharbor.io/brands/manta-ray-labs",
            "description": "A modular blockchain platform designed for zero-knowledge applications.",
            "applicationCategory": "Blockchain"
          }
        }
      ]
    }
  ]
}

const alternatives = [
  {
    "slug": "dragonchain",
    "brand_name": "Dragonchain",
    "domain": "dragonchain.com",
    "summary": "A hybrid blockchain platform designed for enterprise and startup applications.",
    "pricing": {
      "price_model": "unknown",
      "price_notes": null,
      "has_free_tier": false,
      "starting_price": null
    },
    "features": [
      "Quantum Safety",
      "Proof of every transaction secured to Bitcoin, Ethereum, and other blockchain networks",
      "Instant processing of all transactions",
      "Smart Contracts in any language",
      "Flexible, hybrid blockchain platform"
    ],
    "integrations": []
  },
  {
    "slug": "offchain-labs",
    "brand_name": "Offchain Labs",
    "domain": "offchainlabs.com",
    "summary": "A leading provider of Ethereum scaling solutions and development tools.",
    "pricing": {
      "price_model": "unknown",
      "price_notes": null,
      "has_free_tier": false,
      "starting_price": null
    },
    "features": [
      "Arbitrum One",
      "Arbitrum Nova",
      "Arbitrum Orbit",
      "Prysm",
      "Stylus"
    ],
    "integrations": [
      "Ethereum"
    ]
  },
  {
    "slug": "manta-ray-labs",
    "brand_name": "Manta Ray Labs",
    "domain": "manta.network",
    "summary": "A modular blockchain platform designed for zero-knowledge applications.",
    "pricing": {
      "price_model": "unknown",
      "price_notes": null,
      "has_free_tier": false,
      "starting_price": null
    },
    "features": [
      "Modular blockchain",
      "Lower gas fees",
      "Fast finality",
      "Community governance",
      "Ecosystem grants"
    ],
    "integrations": [
      "MetaMask",
      "Pyth"
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
              Last verified: <time dateTime="2025-11-30T19:44:53.335Z">November 30, 2025</time> &bull; {alternatives.length} alternatives
            </p>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Best Hedera Alternatives
            </h1>
            <p className="text-lg text-gray-300">
              Looking for an alternative to Hedera? Here are the top Blockchain solutions that compete with Hedera, 
              ranked by visibility and feature coverage.
            </p>
            <p className="mt-4 text-sm text-gray-400">
              Compare with: <Link href="/brands/hedera" className="text-[#FF6B4A] hover:underline">Hedera profile &rarr;</Link>
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
                      href={`/compare/hedera-vs-${alt.slug}`}
                      className="text-[#2979FF] hover:underline text-sm"
                    >
                      Compare with Hedera &rarr;
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
              Last verified: <time dateTime="2025-11-30T19:44:53.335Z">2025-11-30</time>
            </p>
          </footer>
        </div>
      </main>
    </>
  )
}
