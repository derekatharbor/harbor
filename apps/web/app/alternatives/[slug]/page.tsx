// ISR Dynamic Route for /alternatives/[slug]
// Revalidates every 24 hours
import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

// Revalidate every 24 hours
export const revalidate = 86400

// Get Supabase client (created at runtime, not build time)
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Profile type
interface Profile {
  slug: string
  brand_name: string
  domain: string
  category: string
  visibility_score: number
  feed_data: {
    one_line_summary?: string
    short_description?: string
    pricing?: {
      price_model: string
      price_notes: string | null
      has_free_tier: boolean
      starting_price: string | null
    }
    features?: string[]
    integrations?: string[]
  } | null
}

// Fetch the brand and its alternatives
async function fetchBrandAndAlternatives(slug: string): Promise<{
  brand: Profile | null
  alternatives: Profile[]
}> {
  // First, get the brand
  const { data: brand, error: brandError } = await getSupabase()
    .from('ai_profiles')
    .select('slug, brand_name, domain, category, visibility_score, feed_data')
    .eq('slug', slug)
    .single()

  if (brandError || !brand) {
    return { brand: null, alternatives: [] }
  }

  // Then get alternatives (same category, excluding this brand)
  // Try exact category match first, then broader if needed
  let alternatives: Profile[] = []
  
  if (brand.category) {
    const { data, error } = await getSupabase()
      .from('ai_profiles')
      .select('slug, brand_name, domain, category, visibility_score, feed_data')
      .ilike('category', `%${brand.category.split(' ')[0]}%`) // Match first word of category
      .neq('slug', slug)
      .not('feed_data', 'is', null)
      .not('enriched_at', 'is', null)
      .order('visibility_score', { ascending: false })
      .limit(15)

    if (!error && data) {
      alternatives = data as Profile[]
    }
  }

  // If no category alternatives found, get top enriched profiles as fallback
  if (alternatives.length === 0) {
    const { data, error } = await getSupabase()
      .from('ai_profiles')
      .select('slug, brand_name, domain, category, visibility_score, feed_data')
      .neq('slug', slug)
      .not('feed_data', 'is', null)
      .not('enriched_at', 'is', null)
      .order('visibility_score', { ascending: false })
      .limit(10)

    if (!error && data) {
      alternatives = data as Profile[]
    }
  }

  return { 
    brand: brand as Profile, 
    alternatives 
  }
}

// Generate metadata
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  const { slug } = await params
  const { brand } = await fetchBrandAndAlternatives(slug)
  
  if (!brand) {
    return { title: 'Not Found' }
  }

  const now = new Date()
  const canonicalUrl = `https://useharbor.io/alternatives/${slug}`

  return {
    title: `Best ${brand.brand_name} Alternatives | Harbor`,
    description: `Top alternatives to ${brand.brand_name} for ${brand.category}. Compare features, pricing, and integrations.`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `Best ${brand.brand_name} Alternatives`,
      description: `Top alternatives to ${brand.brand_name} for ${brand.category}.`,
      type: 'article',
      url: canonicalUrl,
      modifiedTime: now.toISOString(),
    },
  }
}

// Main page component
export default async function AlternativesPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params
  const { brand, alternatives } = await fetchBrandAndAlternatives(slug)
  
  // Only 404 if brand doesn't exist
  if (!brand) {
    notFound()
  }

  const now = new Date()
  const isoDate = now.toISOString()
  const displayDate = now.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  // Schema.org structured data
  const schemaOrg = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': `https://useharbor.io/alternatives/${slug}#article`,
        'headline': `Best ${brand.brand_name} Alternatives`,
        'description': `Top alternatives to ${brand.brand_name} for ${brand.category}. Compare features, pricing, and integrations.`,
        'datePublished': isoDate,
        'dateModified': isoDate,
        'about': {
          '@type': 'SoftwareApplication',
          'name': brand.brand_name,
          'url': `https://useharbor.io/brands/${brand.slug}`,
          'applicationCategory': brand.category,
        },
        'author': {
          '@type': 'Organization',
          'name': 'Harbor',
          'url': 'https://useharbor.io'
        },
        'publisher': {
          '@type': 'Organization',
          'name': 'Harbor',
          'url': 'https://useharbor.io'
        }
      },
      {
        '@type': 'ItemList',
        '@id': `https://useharbor.io/alternatives/${slug}#list`,
        'name': `${brand.brand_name} Alternatives`,
        'numberOfItems': alternatives.length,
        'itemListElement': alternatives.map((p, i) => ({
          '@type': 'ListItem',
          'position': i + 1,
          'item': {
            '@type': 'SoftwareApplication',
            'name': p.brand_name,
            'url': `https://useharbor.io/brands/${p.slug}`,
            'description': p.feed_data?.one_line_summary || p.feed_data?.short_description,
            'applicationCategory': p.category,
          }
        }))
      }
    ]
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
      />
      
      <main className="min-h-screen bg-[#101A31] text-white">
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Header */}
          <header className="mb-12">
            <p className="text-sm text-gray-400 mb-2">
              Last verified: <time dateTime={isoDate}>{displayDate}</time> &bull; {alternatives.length} alternatives
            </p>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Best {brand.brand_name} Alternatives
            </h1>
            <p className="text-lg text-gray-300">
              Looking for an alternative to {brand.brand_name}? Here are the top {brand.category} solutions 
              that compete with {brand.brand_name}, ranked by visibility and feature coverage.
            </p>
            <p className="mt-4 text-sm text-gray-400">
              Compare with: <Link href={`/brands/${brand.slug}`} className="text-[#FF6B4A] hover:underline">{brand.brand_name} profile &rarr;</Link>
            </p>
          </header>

          {/* Alternatives List */}
          <section>
            <div className="space-y-6">
              {alternatives.map((alt, index) => (
                <article 
                  key={alt.slug}
                  className="p-6 bg-[#141E38] rounded-lg border border-white/10 hover:border-white/20 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="text-[#FF6B4A] text-sm font-medium">
                        #{index + 1}
                      </span>
                      <h3 className="text-xl font-semibold mt-1">
                        <Link 
                          href={`/brands/${alt.slug}`}
                          className="hover:text-[#FF6B4A] transition-colors"
                        >
                          {alt.brand_name}
                        </Link>
                      </h3>
                    </div>
                    {alt.feed_data?.pricing && (
                      <div className="text-right">
                        {alt.feed_data.pricing.has_free_tier && (
                          <span className="inline-block px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded mb-1">
                            Free tier
                          </span>
                        )}
                        {alt.feed_data.pricing.starting_price && (
                          <p className="text-sm text-gray-400">
                            From {alt.feed_data.pricing.starting_price}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <p className="text-gray-300 mb-4">
                    {alt.feed_data?.one_line_summary || alt.feed_data?.short_description}
                  </p>
                  
                  {alt.feed_data?.features && alt.feed_data.features.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-400 mb-2">Key features:</p>
                      <div className="flex flex-wrap gap-2">
                        {alt.feed_data.features.slice(0, 5).map(feature => (
                          <span 
                            key={feature}
                            className="px-2 py-1 bg-white/5 text-sm rounded"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {alt.feed_data?.integrations && alt.feed_data.integrations.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Integrates with:</p>
                      <div className="flex flex-wrap gap-2">
                        {alt.feed_data.integrations.slice(0, 8).map(integration => (
                          <span 
                            key={integration}
                            className="px-2 py-1 bg-[#2979FF]/20 text-[#2979FF] text-sm rounded"
                          >
                            {integration}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-4 pt-4 border-t border-white/10 flex gap-4">
                    <Link
                      href={`/brands/${alt.slug}`}
                      className="text-[#FF6B4A] hover:underline text-sm"
                    >
                      View full profile &rarr;
                    </Link>
                    <Link
                      href={`/compare/${brand.slug}-vs-${alt.slug}`}
                      className="text-[#2979FF] hover:underline text-sm"
                    >
                      Compare with {brand.brand_name} &rarr;
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Footer */}
          <footer className="mt-12 pt-8 border-t border-white/10 text-center text-gray-400 text-sm">
            <p>
              This comparison is generated from structured data collected by Harbor.
              <br />
              Last verified: <time dateTime={isoDate}>{displayDate}</time>
            </p>
            <p className="mt-4">
              <Link href="/" className="text-[#FF6B4A] hover:underline">
                Learn more about Harbor &rarr;
              </Link>
            </p>
          </footer>
        </div>
      </main>
    </>
  )
}