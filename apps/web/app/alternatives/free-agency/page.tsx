// AUTO-GENERATED ALTERNATIVES PAGE
// Generated: 2025-11-30T20:05:20.094Z
// Alternative to: Free Agency

import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Best Free Agency Alternatives (November 30, 2025) | Harbor',
  description: 'Top alternatives to Free Agency for Career Services. Compare features, pricing, and integrations.',
  openGraph: {
    title: 'Best Free Agency Alternatives',
    description: 'Top alternatives to Free Agency for Career Services.',
    type: 'article',
    publishedTime: '2025-11-30T20:05:20.094Z',
    modifiedTime: '2025-11-30T20:05:20.094Z',
  },
}

const schemaOrg = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      "@id": "https://useharbor.io/alternatives/free-agency#article",
      "headline": "Best Free Agency Alternatives",
      "description": "Top alternatives to Free Agency for Career Services. Compare features, pricing, and integrations.",
      "datePublished": "2025-11-30T20:05:20.094Z",
      "dateModified": "2025-11-30T20:05:20.094Z",
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
      "@id": "https://useharbor.io/alternatives/free-agency#list",
      "name": "Free Agency Alternatives",
      "numberOfItems": 3,
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "item": {
            "@type": "SoftwareApplication",
            "name": "Jobcase, Inc.",
            "url": "https://useharbor.io/brands/jobcase-inc",
            "description": "An online community dedicated to empowering workers.",
            "applicationCategory": "Career Services"
          }
        },
        {
          "@type": "ListItem",
          "position": 2,
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
          "position": 3,
          "item": {
            "@type": "SoftwareApplication",
            "name": "Teal",
            "url": "https://useharbor.io/brands/teal",
            "description": "AI Powered Tools to Grow Your Career.",
            "applicationCategory": "Career Services"
          }
        }
      ]
    }
  ]
}

const alternatives = [
  {
    "slug": "jobcase-inc",
    "brand_name": "Jobcase, Inc.",
    "domain": "jobcase.com",
    "summary": "An online community dedicated to empowering workers.",
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
              Last verified: <time dateTime="2025-11-30T20:05:20.094Z">November 30, 2025</time> &bull; {alternatives.length} alternatives
            </p>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Best Free Agency Alternatives
            </h1>
            <p className="text-lg text-gray-300">
              Looking for an alternative to Free Agency? Here are the top Career Services solutions that compete with Free Agency, 
              ranked by visibility and feature coverage.
            </p>
            <p className="mt-4 text-sm text-gray-400">
              Compare with: <Link href="/brands/free-agency" className="text-[#FF6B4A] hover:underline">Free Agency profile &rarr;</Link>
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
                      href={`/compare/free-agency-vs-${alt.slug}`}
                      className="text-[#2979FF] hover:underline text-sm"
                    >
                      Compare with Free Agency &rarr;
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
              Last verified: <time dateTime="2025-11-30T20:05:20.094Z">2025-11-30</time>
            </p>
          </footer>
        </div>
      </main>
    </>
  )
}
