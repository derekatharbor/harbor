// AUTO-GENERATED ALTERNATIVES PAGE
// Generated: 2025-11-30T19:36:57.383Z
// Alternative to: Prove

import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Best Prove Alternatives (November 30, 2025) | Harbor',
  description: 'Top alternatives to Prove for Identity Verification. Compare features, pricing, and integrations.',
  openGraph: {
    title: 'Best Prove Alternatives',
    description: 'Top alternatives to Prove for Identity Verification.',
    type: 'article',
    publishedTime: '2025-11-30T19:36:57.383Z',
    modifiedTime: '2025-11-30T19:36:57.383Z',
  },
}

const schemaOrg = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      "@id": "https://useharbor.io/alternatives/prove#article",
      "headline": "Best Prove Alternatives",
      "description": "Top alternatives to Prove for Identity Verification. Compare features, pricing, and integrations.",
      "datePublished": "2025-11-30T19:36:57.383Z",
      "dateModified": "2025-11-30T19:36:57.383Z",
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
      "@id": "https://useharbor.io/alternatives/prove#list",
      "name": "Prove Alternatives",
      "numberOfItems": 3,
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "item": {
            "@type": "SoftwareApplication",
            "name": "Persona",
            "url": "https://useharbor.io/brands/persona",
            "description": "Persona is an identity verification platform focused on humanizing online identity.",
            "applicationCategory": "Identity Verification"
          }
        },
        {
          "@type": "ListItem",
          "position": 2,
          "item": {
            "@type": "SoftwareApplication",
            "name": "HYPR | The Identity Assurance Company",
            "url": "https://useharbor.io/brands/hypr-the-identity-assurance-company",
            "description": "HYPR provides passwordless authentication and identity verification solutions to enhance security and user experience.",
            "applicationCategory": "Identity Verification"
          }
        },
        {
          "@type": "ListItem",
          "position": 3,
          "item": {
            "@type": "SoftwareApplication",
            "name": "Jumio Corporation",
            "url": "https://useharbor.io/brands/jumio-corporation",
            "description": "Leading AI-powered identity verification platform.",
            "applicationCategory": "Identity Verification"
          }
        }
      ]
    }
  ]
}

const alternatives = [
  {
    "slug": "persona",
    "brand_name": "Persona",
    "domain": "withpersona.com",
    "summary": "Persona is an identity verification platform focused on humanizing online identity.",
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
    "slug": "hypr-the-identity-assurance-company",
    "brand_name": "HYPR | The Identity Assurance Company",
    "domain": "hypr.com",
    "summary": "HYPR provides passwordless authentication and identity verification solutions to enhance security and user experience.",
    "pricing": {
      "price_model": "per_user",
      "price_notes": null,
      "has_free_tier": true,
      "starting_price": "$3/user/month"
    },
    "features": [
      "Passwordless Authentication",
      "Phishing-resistant MFA",
      "Continuous risk monitoring",
      "Adaptive verification",
      "Identity verification with facial scan"
    ],
    "integrations": [
      "Microsoft Entra ID",
      "CrowdStrike"
    ]
  },
  {
    "slug": "jumio-corporation",
    "brand_name": "Jumio Corporation",
    "domain": "jumio.com",
    "summary": "Leading AI-powered identity verification platform.",
    "pricing": {
      "price_model": "unknown",
      "price_notes": null,
      "has_free_tier": false,
      "starting_price": null
    },
    "features": [
      "Liveness Detection",
      "Geographic Coverage",
      "KYC, AML and BSA Compliance",
      "Human Review",
      "Audited Data"
    ],
    "integrations": [
      "Amazon Web Services (AWS)",
      "Azurian",
      "Microsoft Azure Active Directory",
      "Oracle",
      "Sift Connect"
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
              Last verified: <time dateTime="2025-11-30T19:36:57.383Z">November 30, 2025</time> &bull; {alternatives.length} alternatives
            </p>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Best Prove Alternatives
            </h1>
            <p className="text-lg text-gray-300">
              Looking for an alternative to Prove? Here are the top Identity Verification solutions that compete with Prove, 
              ranked by visibility and feature coverage.
            </p>
            <p className="mt-4 text-sm text-gray-400">
              Compare with: <Link href="/brands/prove" className="text-[#FF6B4A] hover:underline">Prove profile &rarr;</Link>
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
                      href={`/compare/prove-vs-${alt.slug}`}
                      className="text-[#2979FF] hover:underline text-sm"
                    >
                      Compare with Prove &rarr;
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
              Last verified: <time dateTime="2025-11-30T19:36:57.383Z">2025-11-30</time>
            </p>
          </footer>
        </div>
      </main>
    </>
  )
}
