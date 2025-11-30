// AUTO-GENERATED ALTERNATIVES PAGE
// Generated: 2025-11-30T20:05:20.064Z
// Alternative to: Equinox

import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Best Equinox Alternatives (November 30, 2025) | Harbor',
  description: 'Top alternatives to Equinox for Fitness. Compare features, pricing, and integrations.',
  openGraph: {
    title: 'Best Equinox Alternatives',
    description: 'Top alternatives to Equinox for Fitness.',
    type: 'article',
    publishedTime: '2025-11-30T20:05:20.064Z',
    modifiedTime: '2025-11-30T20:05:20.064Z',
  },
}

const schemaOrg = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      "@id": "https://useharbor.io/alternatives/equinox#article",
      "headline": "Best Equinox Alternatives",
      "description": "Top alternatives to Equinox for Fitness. Compare features, pricing, and integrations.",
      "datePublished": "2025-11-30T20:05:20.064Z",
      "dateModified": "2025-11-30T20:05:20.064Z",
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
      "@id": "https://useharbor.io/alternatives/equinox#list",
      "name": "Equinox Alternatives",
      "numberOfItems": 3,
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "item": {
            "@type": "SoftwareApplication",
            "name": "VASA FITNESS",
            "url": "https://useharbor.io/brands/vasa-fitness",
            "description": "A community-focused fitness brand offering inclusive and accessible gym experiences.",
            "applicationCategory": "Fitness"
          }
        },
        {
          "@type": "ListItem",
          "position": 2,
          "item": {
            "@type": "SoftwareApplication",
            "name": "Dynamic Fitness Management",
            "url": "https://useharbor.io/brands/dynamic-fitness-management",
            "description": "Your ultimate destination for personalized fitness training.",
            "applicationCategory": "Fitness"
          }
        },
        {
          "@type": "ListItem",
          "position": 3,
          "item": {
            "@type": "SoftwareApplication",
            "name": "Zwift",
            "url": "https://useharbor.io/brands/zwift",
            "description": "The Indoor Cycling App for Smart Trainers & Bikes.",
            "applicationCategory": "Fitness"
          }
        }
      ]
    }
  ]
}

const alternatives = [
  {
    "slug": "vasa-fitness",
    "brand_name": "VASA FITNESS",
    "domain": "vasafitness.com",
    "summary": "A community-focused fitness brand offering inclusive and accessible gym experiences.",
    "pricing": {
      "price_model": "flat",
      "price_notes": "No annual commitment plans available",
      "has_free_tier": true,
      "starting_price": "$9.99/mo"
    },
    "features": [
      "Unlimited access to all clubs",
      "Premium boutique-style classes",
      "Access to all clubs and premium amenities",
      "Strength training classes",
      "Group fitness classes"
    ],
    "integrations": []
  },
  {
    "slug": "dynamic-fitness-management",
    "brand_name": "Dynamic Fitness Management",
    "domain": "dfmfit.com",
    "summary": "Your ultimate destination for personalized fitness training.",
    "pricing": {
      "price_model": "unknown",
      "price_notes": "Introductory package available",
      "has_free_tier": true,
      "starting_price": "$30 for 30 days"
    },
    "features": [
      "Customized 1-on-1 personal training",
      "Fit30 group fitness classes",
      "Digital fitness program (FreeMotion OnDemand)",
      "Community support and training",
      "Tailored workout plans for all fitness levels"
    ],
    "integrations": []
  },
  {
    "slug": "zwift",
    "brand_name": "Zwift",
    "domain": "zwift.com",
    "summary": "The Indoor Cycling App for Smart Trainers & Bikes.",
    "pricing": {
      "price_model": "per_user",
      "price_notes": "14-day free trial available for new subscribers",
      "has_free_tier": true,
      "starting_price": "$14.99/month"
    },
    "features": [
      "Thousands of workouts",
      "Personalized training plans",
      "Group rides available 24/7",
      "Community racing events",
      "In-game rewards and levels"
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
              Last verified: <time dateTime="2025-11-30T20:05:20.064Z">November 30, 2025</time> &bull; {alternatives.length} alternatives
            </p>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Best Equinox Alternatives
            </h1>
            <p className="text-lg text-gray-300">
              Looking for an alternative to Equinox? Here are the top Fitness solutions that compete with Equinox, 
              ranked by visibility and feature coverage.
            </p>
            <p className="mt-4 text-sm text-gray-400">
              Compare with: <Link href="/brands/equinox" className="text-[#FF6B4A] hover:underline">Equinox profile &rarr;</Link>
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
                      href={`/compare/equinox-vs-${alt.slug}`}
                      className="text-[#2979FF] hover:underline text-sm"
                    >
                      Compare with Equinox &rarr;
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
              Last verified: <time dateTime="2025-11-30T20:05:20.064Z">2025-11-30</time>
            </p>
          </footer>
        </div>
      </main>
    </>
  )
}
