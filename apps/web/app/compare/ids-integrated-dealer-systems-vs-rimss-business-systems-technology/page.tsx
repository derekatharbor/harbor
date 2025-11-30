// AUTO-GENERATED COMPARISON PAGE
// Generated: 2025-11-30T19:36:57.538Z
// Comparing: IDS - Integrated Dealer Systems vs RIMSS Business Systems Technology

import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'IDS - Integrated Dealer Systems vs RIMSS Business Systems Technology (November 30, 2025) | Harbor',
  description: 'Detailed comparison of IDS - Integrated Dealer Systems and RIMSS Business Systems Technology. Features, pricing, and integrations compared side-by-side.',
  openGraph: {
    title: 'IDS - Integrated Dealer Systems vs RIMSS Business Systems Technology',
    description: 'Detailed comparison of IDS - Integrated Dealer Systems and RIMSS Business Systems Technology.',
    type: 'article',
    publishedTime: '2025-11-30T19:36:57.538Z',
    modifiedTime: '2025-11-30T19:36:57.538Z',
  },
}

const schemaOrg = {
  "@context": "https://schema.org",
  "@type": "Article",
  "@id": "https://useharbor.io/compare/ids-integrated-dealer-systems-vs-rimss-business-systems-technology#article",
  "headline": "IDS - Integrated Dealer Systems vs RIMSS Business Systems Technology: Comparison",
  "description": "Detailed comparison of IDS - Integrated Dealer Systems and RIMSS Business Systems Technology. Features, pricing, and integrations compared side-by-side.",
  "datePublished": "2025-11-30T19:36:57.538Z",
  "dateModified": "2025-11-30T19:36:57.538Z",
  "author": {
    "@type": "Organization",
    "name": "Harbor",
    "url": "https://useharbor.io"
  },
  "about": [
    {
      "@type": "SoftwareApplication",
      "name": "IDS - Integrated Dealer Systems",
      "url": "https://useharbor.io/brands/ids-integrated-dealer-systems"
    },
    {
      "@type": "SoftwareApplication",
      "name": "RIMSS Business Systems Technology",
      "url": "https://useharbor.io/brands/rimss-business-systems-technology"
    }
  ]
}

const brand1 = {
  "slug": "ids-integrated-dealer-systems",
  "brand_name": "IDS - Integrated Dealer Systems",
  "domain": "ids-astra.com",
  "category": "Dealership Management Software",
  "summary": "A leading provider of dealership management software for RV, marine, and trailer dealers.",
  "pricing": {
    "price_model": "custom",
    "price_notes": null,
    "has_free_tier": false,
    "starting_price": null
  },
  "features": [
    "Accounting",
    "Service Management",
    "Parts Management",
    "Sales Management",
    "CRM",
    "Payments",
    "Analytics",
    "Reporting"
  ],
  "integrations": [
    "Forest River Open Recalls"
  ]
}

const brand2 = {
  "slug": "rimss-business-systems-technology",
  "brand_name": "RIMSS Business Systems Technology",
  "domain": "rimss.com",
  "category": "Dealership Management Software",
  "summary": "Integrated dealership management software for various industries.",
  "pricing": {
    "price_model": "unknown",
    "price_notes": "Pricing details not specified on the website.",
    "has_free_tier": false,
    "starting_price": null
  },
  "features": [
    "Comprehensive onsite training",
    "Unlimited support during business hours",
    "Regular training webinars",
    "Mobile app access",
    "Data ownership and export capabilities"
  ],
  "integrations": [
    "Microsoft Technology"
  ]
}

export default function ComparisonPage() {
  // Find shared and unique features
  const brand1Features = new Set(brand1.features.map((f: string) => f.toLowerCase()));
  const brand2Features = new Set(brand2.features.map((f: string) => f.toLowerCase()));
  
  const brand1Integrations = new Set(brand1.integrations.map((i: string) => i.toLowerCase()));
  const brand2Integrations = new Set(brand2.integrations.map((i: string) => i.toLowerCase()));
  
  const sharedIntegrations = brand1.integrations.filter((i: string) => 
    brand2Integrations.has(i.toLowerCase())
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
      />
      
      <main className="min-h-screen bg-[#101A31] text-white">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <header className="mb-12 text-center">
            <p className="text-sm text-gray-400 mb-2">
              Last verified: <time dateTime="2025-11-30T19:36:57.538Z">November 30, 2025</time>
            </p>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {brand1.brand_name} vs {brand2.brand_name}
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              A detailed comparison to help you choose between {brand1.brand_name} and {brand2.brand_name} 
              for your {brand1.category || brand2.category || 'software'} needs.
            </p>
          </header>

          {/* Side by side comparison */}
          <section className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Brand 1 */}
            <div className="p-6 bg-[#141E38] rounded-lg border border-white/10">
              <div className="text-center mb-6 pb-6 border-b border-white/10">
                <h2 className="text-2xl font-bold">{brand1.brand_name}</h2>
                <p className="text-gray-400 text-sm">{brand1.domain}</p>
                {brand1.pricing?.has_free_tier && (
                  <span className="inline-block mt-2 px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                    Free tier available
                  </span>
                )}
              </div>
              
              <p className="text-gray-300 mb-6">{brand1.summary}</p>
              
              {brand1.pricing?.starting_price && (
                <div className="mb-4">
                  <p className="text-sm text-gray-400">Starting price</p>
                  <p className="text-xl font-semibold text-[#FF6B4A]">{brand1.pricing.starting_price}</p>
                </div>
              )}
              
              <div className="mb-4">
                <p className="text-sm text-gray-400 mb-2">Key features ({brand1.features.length})</p>
                <ul className="space-y-1">
                  {brand1.features.slice(0, 8).map((feature: string) => (
                    <li key={feature} className="text-sm flex items-center gap-2">
                      <span className="text-green-400">✓</span> {feature}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-400 mb-2">Integrations ({brand1.integrations.length})</p>
                <div className="flex flex-wrap gap-1">
                  {brand1.integrations.slice(0, 10).map((integration: string) => (
                    <span key={integration} className="px-2 py-1 bg-[#2979FF]/20 text-[#2979FF] text-xs rounded">
                      {integration}
                    </span>
                  ))}
                </div>
              </div>
              
              <Link
                href={`/brands/${brand1.slug}`}
                className="block text-center mt-6 py-2 px-4 bg-[#FF6B4A] text-white rounded hover:bg-[#FF6B4A]/90 transition-colors"
              >
                View {brand1.brand_name} Profile
              </Link>
            </div>

            {/* Brand 2 */}
            <div className="p-6 bg-[#141E38] rounded-lg border border-white/10">
              <div className="text-center mb-6 pb-6 border-b border-white/10">
                <h2 className="text-2xl font-bold">{brand2.brand_name}</h2>
                <p className="text-gray-400 text-sm">{brand2.domain}</p>
                {brand2.pricing?.has_free_tier && (
                  <span className="inline-block mt-2 px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                    Free tier available
                  </span>
                )}
              </div>
              
              <p className="text-gray-300 mb-6">{brand2.summary}</p>
              
              {brand2.pricing?.starting_price && (
                <div className="mb-4">
                  <p className="text-sm text-gray-400">Starting price</p>
                  <p className="text-xl font-semibold text-[#FF6B4A]">{brand2.pricing.starting_price}</p>
                </div>
              )}
              
              <div className="mb-4">
                <p className="text-sm text-gray-400 mb-2">Key features ({brand2.features.length})</p>
                <ul className="space-y-1">
                  {brand2.features.slice(0, 8).map((feature: string) => (
                    <li key={feature} className="text-sm flex items-center gap-2">
                      <span className="text-green-400">✓</span> {feature}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-400 mb-2">Integrations ({brand2.integrations.length})</p>
                <div className="flex flex-wrap gap-1">
                  {brand2.integrations.slice(0, 10).map((integration: string) => (
                    <span key={integration} className="px-2 py-1 bg-[#2979FF]/20 text-[#2979FF] text-xs rounded">
                      {integration}
                    </span>
                  ))}
                </div>
              </div>
              
              <Link
                href={`/brands/${brand2.slug}`}
                className="block text-center mt-6 py-2 px-4 bg-[#FF6B4A] text-white rounded hover:bg-[#FF6B4A]/90 transition-colors"
              >
                View {brand2.brand_name} Profile
              </Link>
            </div>
          </section>

          {/* Shared integrations */}
          {sharedIntegrations.length > 0 && (
            <section className="mb-12 p-6 bg-[#141E38] rounded-lg border border-white/10">
              <h2 className="text-xl font-semibold mb-4">Shared Integrations</h2>
              <p className="text-gray-400 text-sm mb-4">
                Both {brand1.brand_name} and {brand2.brand_name} integrate with these platforms:
              </p>
              <div className="flex flex-wrap gap-2">
                {sharedIntegrations.map((integration: string) => (
                  <span key={integration} className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded">
                    {integration}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Related links */}
          <section className="grid md:grid-cols-2 gap-4">
            <Link
              href={`/alternatives/${brand1.slug}`}
              className="p-4 bg-[#141E38] rounded-lg border border-white/10 hover:border-white/20 transition-colors"
            >
              <p className="font-medium">{brand1.brand_name} Alternatives &rarr;</p>
              <p className="text-sm text-gray-400">See more options like {brand1.brand_name}</p>
            </Link>
            <Link
              href={`/alternatives/${brand2.slug}`}
              className="p-4 bg-[#141E38] rounded-lg border border-white/10 hover:border-white/20 transition-colors"
            >
              <p className="font-medium">{brand2.brand_name} Alternatives &rarr;</p>
              <p className="text-sm text-gray-400">See more options like {brand2.brand_name}</p>
            </Link>
          </section>

          <footer className="mt-12 pt-8 border-t border-white/10 text-center text-gray-400 text-sm">
            <p>
              This comparison is generated from structured data collected by Harbor.
              <br />
              Last verified: <time dateTime="2025-11-30T19:36:57.538Z">2025-11-30</time>
            </p>
          </footer>
        </div>
      </main>
    </>
  )
}
