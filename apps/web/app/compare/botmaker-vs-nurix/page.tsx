// AUTO-GENERATED COMPARISON PAGE
// Generated: 2025-11-30T20:05:20.367Z
// Comparing: Botmaker vs Nurix

import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Botmaker vs Nurix (November 30, 2025) | Harbor',
  description: 'Detailed comparison of Botmaker and Nurix. Features, pricing, and integrations compared side-by-side.',
  openGraph: {
    title: 'Botmaker vs Nurix',
    description: 'Detailed comparison of Botmaker and Nurix.',
    type: 'article',
    publishedTime: '2025-11-30T20:05:20.367Z',
    modifiedTime: '2025-11-30T20:05:20.367Z',
  },
}

const schemaOrg = {
  "@context": "https://schema.org",
  "@type": "Article",
  "@id": "https://useharbor.io/compare/botmaker-vs-nurix#article",
  "headline": "Botmaker vs Nurix: Comparison",
  "description": "Detailed comparison of Botmaker and Nurix. Features, pricing, and integrations compared side-by-side.",
  "datePublished": "2025-11-30T20:05:20.367Z",
  "dateModified": "2025-11-30T20:05:20.367Z",
  "author": {
    "@type": "Organization",
    "name": "Harbor",
    "url": "https://useharbor.io"
  },
  "about": [
    {
      "@type": "SoftwareApplication",
      "name": "Botmaker",
      "url": "https://useharbor.io/brands/botmaker"
    },
    {
      "@type": "SoftwareApplication",
      "name": "Nurix",
      "url": "https://useharbor.io/brands/nurix"
    }
  ]
}

const brand1 = {
  "slug": "botmaker",
  "brand_name": "Botmaker",
  "domain": "botmaker.com",
  "category": "Conversational AI",
  "summary": "A leading conversational platform utilizing generative AI to enhance customer interactions.",
  "pricing": {
    "price_model": "unknown",
    "price_notes": null,
    "has_free_tier": true,
    "starting_price": null
  },
  "features": [
    "Create and develop AI agents",
    "Automate replies to comments on social media",
    "Integrate bots with email and SMS",
    "Automate voice conversations",
    "Manage multiple agents simultaneously",
    "Provide scheduled notifications",
    "Integrate with payment systems",
    "Support for various messaging channels",
    "Generate reports and analytics",
    "Train generative AI for conversational capabilities"
  ],
  "integrations": [
    "Facebook",
    "WhatsApp",
    "Instagram",
    "Messenger",
    "Microsoft Teams",
    "Workplace",
    "Webchat",
    "LinkedIn",
    "Apple Messages for Business",
    "Telegram",
    "Mercado Libre",
    "Google Business Messages",
    "Google Chat",
    "Amazon Alexa",
    "Email",
    "SMS",
    "Google Play",
    "Google Assistant",
    "Slack",
    "YouTube",
    "Google Ads",
    "Meta Ads",
    "HubSpot",
    "Salesforce",
    "Salesforce Marketing Cloud",
    "Tokko",
    "Zendesk",
    "Soho CRM",
    "VTEX",
    "Shopify",
    "Mercado Pago",
    "PayPal",
    "Google Sheets",
    "Google Analytics 4"
  ]
}

const brand2 = {
  "slug": "nurix",
  "brand_name": "Nurix",
  "domain": "nurix.ai",
  "category": "Conversational AI",
  "summary": "Conversational AI solutions for sales and support.",
  "pricing": {
    "price_model": "custom",
    "price_notes": null,
    "has_free_tier": false,
    "starting_price": null
  },
  "features": [
    "Conversational AI for sales and support",
    "24/7 customer support",
    "On-demand sales assistance",
    "Real-time data processing",
    "Integration with over 300+ enterprise systems",
    "Advanced conversation analytics",
    "Omnichannel engagement",
    "Automated workflows",
    "High accuracy in query resolution"
  ],
  "integrations": [
    "Genesys Cloud",
    "Talkdesk",
    "Aircall",
    "Cloudtalk.io",
    "Zoom Phone",
    "Salesforce",
    "HubSpot",
    "Zoho CRM",
    "Microsoft Dynamics 365 Sales",
    "Pipedrive",
    "Netsuite",
    "Freshsales",
    "Shopify",
    "WooCommerce",
    "BigCommerce",
    "Magento",
    "Squarespace",
    "PrestaShop",
    "Salsify",
    "Slack",
    "Microsoft Teams",
    "Twilio",
    "Discord",
    "Google Calendar",
    "Microsoft Outlook",
    "Calendly",
    "Cal.com"
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
              Last verified: <time dateTime="2025-11-30T20:05:20.367Z">November 30, 2025</time>
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
              Last verified: <time dateTime="2025-11-30T20:05:20.367Z">2025-11-30</time>
            </p>
          </footer>
        </div>
      </main>
    </>
  )
}
