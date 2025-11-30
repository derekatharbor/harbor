// AUTO-GENERATED ALTERNATIVES PAGE
// Generated: 2025-11-30T20:05:19.849Z
// Alternative to: Kong

import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Best Kong Alternatives (November 30, 2025) | Harbor',
  description: 'Top alternatives to Kong for API Management. Compare features, pricing, and integrations.',
  openGraph: {
    title: 'Best Kong Alternatives',
    description: 'Top alternatives to Kong for API Management.',
    type: 'article',
    publishedTime: '2025-11-30T20:05:19.849Z',
    modifiedTime: '2025-11-30T20:05:19.849Z',
  },
}

const schemaOrg = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      "@id": "https://useharbor.io/alternatives/kong#article",
      "headline": "Best Kong Alternatives",
      "description": "Top alternatives to Kong for API Management. Compare features, pricing, and integrations.",
      "datePublished": "2025-11-30T20:05:19.849Z",
      "dateModified": "2025-11-30T20:05:19.849Z",
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
      "@id": "https://useharbor.io/alternatives/kong#list",
      "name": "Kong Alternatives",
      "numberOfItems": 3,
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "item": {
            "@type": "SoftwareApplication",
            "name": "WSO2",
            "url": "https://useharbor.io/brands/wso2",
            "description": "WSO2 is a leader in digital transformation technology, providing solutions for API management, integration, and identity access management.",
            "applicationCategory": "API Management"
          }
        },
        {
          "@type": "ListItem",
          "position": 2,
          "item": {
            "@type": "SoftwareApplication",
            "name": "Apollo GraphQL",
            "url": "https://useharbor.io/brands/apollo-graphql",
            "description": "A cloud-native API orchestration platform for AI agents and applications.",
            "applicationCategory": "API Management"
          }
        },
        {
          "@type": "ListItem",
          "position": 3,
          "item": {
            "@type": "SoftwareApplication",
            "name": "RapidAPI",
            "url": "https://useharbor.io/brands/rapidapi",
            "description": "Nokia is a technology company focused on innovation.",
            "applicationCategory": "API Management"
          }
        }
      ]
    }
  ]
}

const alternatives = [
  {
    "slug": "wso2",
    "brand_name": "WSO2",
    "domain": "wso2.com",
    "summary": "WSO2 is a leader in digital transformation technology, providing solutions for API management, integration, and identity access management.",
    "pricing": {
      "price_model": "custom",
      "price_notes": null,
      "has_free_tier": false,
      "starting_price": null
    },
    "features": [
      "API Management",
      "Integration",
      "Identity and Access Management",
      "Internal Developer Platform",
      "AI-native application support"
    ],
    "integrations": [
      "Microsoft"
    ]
  },
  {
    "slug": "apollo-graphql",
    "brand_name": "Apollo GraphQL",
    "domain": "apollographql.com",
    "summary": "A cloud-native API orchestration platform for AI agents and applications.",
    "pricing": {
      "price_model": "usage",
      "price_notes": "Free tier available with $50 in credit for new signups, and pricing starts at $5 per million requests.",
      "has_free_tier": true,
      "starting_price": "$5/mo"
    },
    "features": [
      "GraphQL API management",
      "Self-hosted GraphOS Router",
      "GraphQL Federation support",
      "Response Caching",
      "Schema Proposals"
    ],
    "integrations": []
  },
  {
    "slug": "rapidapi",
    "brand_name": "RapidAPI",
    "domain": "rapidapi.com",
    "summary": "Nokia is a technology company focused on innovation.",
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
              Last verified: <time dateTime="2025-11-30T20:05:19.849Z">November 30, 2025</time> &bull; {alternatives.length} alternatives
            </p>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Best Kong Alternatives
            </h1>
            <p className="text-lg text-gray-300">
              Looking for an alternative to Kong? Here are the top API Management solutions that compete with Kong, 
              ranked by visibility and feature coverage.
            </p>
            <p className="mt-4 text-sm text-gray-400">
              Compare with: <Link href="/brands/kong" className="text-[#FF6B4A] hover:underline">Kong profile &rarr;</Link>
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
                      href={`/compare/kong-vs-${alt.slug}`}
                      className="text-[#2979FF] hover:underline text-sm"
                    >
                      Compare with Kong &rarr;
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
              Last verified: <time dateTime="2025-11-30T20:05:19.849Z">2025-11-30</time>
            </p>
          </footer>
        </div>
      </main>
    </>
  )
}
