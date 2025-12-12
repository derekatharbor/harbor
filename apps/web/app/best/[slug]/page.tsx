// ISR Dynamic Route for /best/[slug]
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

// Listicle configuration type
interface ListicleConfig {
  slug: string
  title: string
  description: string
  category?: string
  integration?: string
  modifier?: string
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

// Parse slug into config
function parseSlug(slug: string): ListicleConfig | null {
  // Handle integration patterns: "crm-salesforce-integration"
  const integrationMatch = slug.match(/^(.+)-([^-]+)-integration$/)
  if (integrationMatch) {
    const category = integrationMatch[1].replace(/-/g, ' ')
    const integration = integrationMatch[2]
    return {
      slug,
      title: `Best ${capitalize(category)} with ${capitalize(integration)} Integration`,
      description: `Compare the top ${category} solutions that integrate with ${capitalize(integration)}.`,
      category: capitalize(category),
      integration: capitalize(integration),
    }
  }

  // Handle modifier patterns: "crm-free", "crm-enterprise"
  const modifiers = ['free', 'enterprise', 'small-business', 'startups']
  for (const mod of modifiers) {
    if (slug.endsWith(`-${mod}`)) {
      const category = slug.replace(`-${mod}`, '').replace(/-/g, ' ')
      return {
        slug,
        title: `Best ${capitalize(category)} for ${capitalize(mod.replace('-', ' '))}`,
        description: `Compare the top ${category} solutions for ${mod.replace('-', ' ')}.`,
        category: capitalize(category),
        modifier: mod,
      }
    }
  }

  // Simple category: "crm", "project-management"
  const category = slug.replace(/-/g, ' ')
  return {
    slug,
    title: `Best ${capitalize(category)} Software`,
    description: `Compare the top ${category} solutions for businesses. Features, pricing, and integrations compared.`,
    category: capitalize(category),
  }
}

function capitalize(str: string): string {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Fetch profiles for this listicle
async function fetchProfiles(config: ListicleConfig): Promise<Profile[]> {
  let query = getSupabase()
    .from('ai_profiles')
    .select('slug, brand_name, domain, category, visibility_score, feed_data')
    .not('feed_data', 'is', null)
    .not('enriched_at', 'is', null)
    .order('visibility_score', { ascending: false })
    .limit(20)

  // Filter by category (case-insensitive partial match)
  if (config.category) {
    query = query.ilike('category', `%${config.category}%`)
  }

  const { data, error } = await query

  if (error || !data) {
    console.error('Failed to fetch profiles:', error?.message)
    return []
  }

  let profiles = data as Profile[]

  // Filter by integration if specified
  if (config.integration) {
    profiles = profiles.filter(p => 
      p.feed_data?.integrations?.some(i => 
        i.toLowerCase().includes(config.integration!.toLowerCase())
      )
    )
  }

  // Filter by modifier
  if (config.modifier === 'free') {
    profiles = profiles.filter(p => p.feed_data?.pricing?.has_free_tier)
  }

  return profiles
}

// Generate metadata
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  const { slug } = await params
  const config = parseSlug(slug)
  
  if (!config) {
    return { title: 'Not Found' }
  }

  const now = new Date()
  const canonicalUrl = `https://useharbor.io/best/${slug}`

  return {
    title: `${config.title} | Harbor`,
    description: config.description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: config.title,
      description: config.description,
      type: 'article',
      url: canonicalUrl,
      modifiedTime: now.toISOString(),
    },
  }
}

// Main page component
export default async function BestListiclePage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params
  const config = parseSlug(slug)
  
  if (!config) {
    notFound()
  }

  const profiles = await fetchProfiles(config)
  
  if (profiles.length === 0) {
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
        '@id': `https://useharbor.io/best/${slug}#article`,
        'headline': config.title,
        'description': config.description,
        'datePublished': isoDate,
        'dateModified': isoDate,
        'author': {
          '@type': 'Organization',
          'name': 'Harbor',
          'url': 'https://useharbor.io'
        },
        'publisher': {
          '@type': 'Organization',
          'name': 'Harbor',
          'url': 'https://useharbor.io',
          'logo': {
            '@type': 'ImageObject',
            'url': 'https://useharbor.io/logo.png'
          }
        },
      },
      {
        '@type': 'ItemList',
        '@id': `https://useharbor.io/best/${slug}#list`,
        'name': config.title,
        'numberOfItems': profiles.length,
        'itemListElement': profiles.map((p, i) => ({
          '@type': 'ListItem',
          'position': i + 1,
          'item': {
            '@type': 'SoftwareApplication',
            'name': p.brand_name,
            'url': `https://useharbor.io/brands/${p.slug}`,
            'description': p.feed_data?.one_line_summary || p.feed_data?.short_description,
            'applicationCategory': p.category,
            'operatingSystem': 'Web-based',
            ...(p.feed_data?.pricing?.has_free_tier && {
              'offers': {
                '@type': 'Offer',
                'price': '0',
                'priceCurrency': 'USD',
                'description': 'Free tier available'
              }
            })
          }
        }))
      },
      {
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://useharbor.io' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Best Software', 'item': 'https://useharbor.io/best' },
          { '@type': 'ListItem', 'position': 3, 'name': config.title }
        ]
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
              Last verified: <time dateTime={isoDate}>{displayDate}</time> &bull; {profiles.length} solutions reviewed
            </p>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {config.title}
            </h1>
            <p className="text-lg text-gray-300">
              {config.description}
            </p>
          </header>

          {/* Quick Summary */}
          <section className="mb-12 p-6 bg-[#141E38] rounded-lg border border-white/10">
            <h2 className="text-xl font-semibold mb-4">Quick Summary</h2>
            <ul className="space-y-2 text-gray-300">
              {profiles.slice(0, 3).map((p, i) => (
                <li key={p.slug} className="flex items-start gap-2">
                  <span className="text-[#FF6B4A] font-bold">{i + 1}.</span>
                  <span>
                    <strong>{p.brand_name}</strong> &mdash; {(p.feed_data?.one_line_summary || p.feed_data?.short_description || '').slice(0, 100)}...
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* Full List */}
          <section>
            <h2 className="text-2xl font-semibold mb-6">Full Comparison</h2>
            <div className="space-y-8">
              {profiles.map((profile, index) => (
                <article 
                  key={profile.slug}
                  className="p-6 bg-[#141E38] rounded-lg border border-white/10 hover:border-white/20 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="text-[#FF6B4A] text-sm font-medium">
                        #{index + 1}
                      </span>
                      <h3 className="text-xl font-semibold mt-1">
                        <Link 
                          href={`/brands/${profile.slug}`}
                          className="hover:text-[#FF6B4A] transition-colors"
                        >
                          {profile.brand_name}
                        </Link>
                      </h3>
                    </div>
                    {profile.feed_data?.pricing && (
                      <div className="text-right">
                        {profile.feed_data.pricing.has_free_tier && (
                          <span className="inline-block px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded mb-1">
                            Free tier
                          </span>
                        )}
                        {profile.feed_data.pricing.starting_price && (
                          <p className="text-sm text-gray-400">
                            From {profile.feed_data.pricing.starting_price}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <p className="text-gray-300 mb-4">
                    {profile.feed_data?.one_line_summary || profile.feed_data?.short_description}
                  </p>
                  
                  {profile.feed_data?.features && profile.feed_data.features.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-400 mb-2">Key features:</p>
                      <div className="flex flex-wrap gap-2">
                        {profile.feed_data.features.slice(0, 5).map(feature => (
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
                  
                  {profile.feed_data?.integrations && profile.feed_data.integrations.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Integrates with:</p>
                      <div className="flex flex-wrap gap-2">
                        {profile.feed_data.integrations.slice(0, 8).map(integration => (
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
                  
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <Link
                      href={`/brands/${profile.slug}`}
                      className="text-[#FF6B4A] hover:underline text-sm"
                    >
                      View full profile &rarr;
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