#!/usr/bin/env tsx

import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { writeFileSync, mkdirSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: resolve(__dirname, '../../../.env') });

/**
 * Harbor Listicle Generator v2
 * 
 * Generates static pages for long-tail SEO and AI citation:
 * 
 * 1. Category pages:     /best/crm, /best/time-tracking
 * 2. Free tier pages:    /best/crm-free, /best/time-tracking-free
 * 3. Integration pages:  /best/crm-salesforce-integration
 * 4. Alternatives pages: /alternatives/salesforce, /alternatives/hubspot
 * 5. Comparison pages:   /compare/salesforce-vs-hubspot
 * 
 * Usage:
 *   npx tsx scripts/generate-listicles.ts --dry-run           # Preview all
 *   npx tsx scripts/generate-listicles.ts --all               # Generate everything
 *   npx tsx scripts/generate-listicles.ts --category "CRM"    # Just CRM variants
 *   npx tsx scripts/generate-listicles.ts --alternatives      # Just alternatives
 *   npx tsx scripts/generate-listicles.ts --comparisons       # Just comparisons
 */

import { createClient } from '@supabase/supabase-js';

// ============================================================================
// SETUP
// ============================================================================

console.log('🔑 Checking environment...');
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Output directories for generated pages
const OUTPUT_DIR_BEST = resolve(__dirname, '../app/best');
const OUTPUT_DIR_ALTERNATIVES = resolve(__dirname, '../app/alternatives');
const OUTPUT_DIR_COMPARE = resolve(__dirname, '../app/compare');

// ============================================================================
// TYPES
// ============================================================================

interface ProfileForListicle {
  id: string;
  slug: string;
  brand_name: string;
  domain: string;
  category: string;
  visibility_score: number;
  feed_data: {
    one_line_summary?: string;
    short_description?: string;
    pricing?: {
      has_free_tier: boolean;
      starting_price: string | null;
      price_model: string;
    };
    integrations?: string[];
    features?: string[];
    icp?: string;
  };
}

interface ListicleConfig {
  slug: string;           // URL slug: "time-tracking-quickbooks-integration"
  title: string;          // Page title: "Best Time Tracking Software with QuickBooks Integration"
  description: string;    // Meta description
  query: {
    category?: string;
    integration?: string;
    has_free_tier?: boolean;
    max_results?: number;
  };
}

interface AlternativeConfig {
  slug: string;           // URL slug: "salesforce"
  brandName: string;      // "Salesforce"
  brandSlug: string;      // Link to /brands/salesforce
  category: string;       // "CRM"
}

interface ComparisonConfig {
  slug: string;           // URL slug: "salesforce-vs-hubspot"
  brand1: ProfileForListicle;
  brand2: ProfileForListicle;
}

// ============================================================================
// PREDEFINED LISTICLE TEMPLATES
// ============================================================================

// Common integrations to generate listicles for
const POPULAR_INTEGRATIONS = [
  'QuickBooks', 'Xero', 'Salesforce', 'HubSpot', 'Slack', 'Zapier',
  'Shopify', 'WooCommerce', 'Stripe', 'Google Workspace', 'Microsoft 365',
  'Jira', 'Asana', 'Trello', 'Notion', 'Zoom', 'Teams', 'GitHub',
  'AWS', 'Twilio', 'Mailchimp', 'Intercom', 'Zendesk'
];

// Common categories
const POPULAR_CATEGORIES = [
  'CRM', 'Project Management', 'Time Tracking', 'Accounting', 'HR',
  'Marketing Automation', 'Email Marketing', 'Customer Support',
  'E-commerce', 'Inventory Management', 'Field Service', 'Scheduling',
  'Invoicing', 'Payroll', 'Recruiting', 'Learning Management',
  'Document Management', 'Collaboration', 'Analytics', 'Security'
];

// ============================================================================
// QUERY FUNCTIONS
// ============================================================================

async function fetchProfilesForListicle(config: ListicleConfig): Promise<ProfileForListicle[]> {
  let query = supabase
    .from('ai_profiles')
    .select('id, slug, brand_name, domain, category, visibility_score, feed_data')
    .not('feed_data', 'is', null)
    .order('visibility_score', { ascending: false })
    .limit(config.query.max_results || 15);

  // Filter by category
  if (config.query.category) {
    query = query.ilike('category', `%${config.query.category}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error(`  Query error: ${error.message}`);
    return [];
  }

  let profiles = data as ProfileForListicle[];

  // Filter by integration (client-side since it's in JSONB)
  if (config.query.integration) {
    profiles = profiles.filter(p => 
      p.feed_data?.integrations?.some(
        i => i.toLowerCase().includes(config.query.integration!.toLowerCase())
      )
    );
  }

  // Filter by free tier
  if (config.query.has_free_tier) {
    profiles = profiles.filter(p => p.feed_data?.pricing?.has_free_tier === true);
  }

  return profiles;
}

// ============================================================================
// PAGE GENERATION
// ============================================================================

function generateListiclePage(config: ListicleConfig, profiles: ProfileForListicle[]): string {
  const now = new Date();
  const isoDate = now.toISOString();
  const displayDate = now.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const shortDate = now.toISOString().split('T')[0];
  
  // Generate schema.org JSON-LD - Article wrapper for better AI parsing
  const schemaOrg = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': `https://useharbor.io/best/${config.slug}#article`,
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
        'mainEntityOfPage': {
          '@type': 'WebPage',
          '@id': `https://useharbor.io/best/${config.slug}`
        }
      },
      {
        '@type': 'ItemList',
        '@id': `https://useharbor.io/best/${config.slug}#list`,
        'name': config.title,
        'description': config.description,
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
            }),
            ...(p.feed_data?.pricing?.starting_price && !p.feed_data?.pricing?.has_free_tier && {
              'offers': {
                '@type': 'Offer',
                'price': p.feed_data.pricing.starting_price.replace(/[^0-9.]/g, '') || '0',
                'priceCurrency': 'USD'
              }
            })
          }
        }))
      },
      {
        '@type': 'BreadcrumbList',
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'Home',
            'item': 'https://useharbor.io'
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': 'Best Software',
            'item': 'https://useharbor.io/best'
          },
          {
            '@type': 'ListItem',
            'position': 3,
            'name': config.title
          }
        ]
      }
    ]
  };

  // Generate the page component
  return `// AUTO-GENERATED LISTICLE PAGE
// Generated: ${isoDate}
// Query: ${JSON.stringify(config.query)}
// Re-run generate-listicles.ts to update dateModified

import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '${config.title} (${displayDate}) | Harbor',
  description: '${config.description}',
  openGraph: {
    title: '${config.title}',
    description: '${config.description}',
    type: 'article',
    publishedTime: '${isoDate}',
    modifiedTime: '${isoDate}',
    authors: ['Harbor'],
  },
  other: {
    'article:modified_time': '${isoDate}',
  }
}

// Schema.org structured data
const schemaOrg = ${JSON.stringify(schemaOrg, null, 2)}

const profiles = ${JSON.stringify(profiles.map(p => ({
  slug: p.slug,
  brand_name: p.brand_name,
  domain: p.domain,
  summary: p.feed_data?.one_line_summary || p.feed_data?.short_description || '',
  pricing: p.feed_data?.pricing,
  features: p.feed_data?.features?.slice(0, 5) || [],
  integrations: p.feed_data?.integrations?.slice(0, 8) || [],
  visibility_score: p.visibility_score,
})), null, 2)}

// Export for freshness verification
// Generated at: ${isoDate}

export default function ListiclePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
      />
      
      <main className="min-h-screen bg-[#101A31] text-white">
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Header with semantic time element for crawlers */}
          <header className="mb-12">
            <p className="text-sm text-gray-400 mb-2">
              Last verified: <time dateTime="${isoDate}">${displayDate}</time> &bull; {profiles.length} solutions reviewed
            </p>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              ${config.title}
            </h1>
            <p className="text-lg text-gray-300">
              ${config.description}
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
                    <strong>{p.brand_name}</strong> &mdash; {p.summary.slice(0, 100)}...
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
                          href={\`/brands/\${profile.slug}\`}
                          className="hover:text-[#FF6B4A] transition-colors"
                        >
                          {profile.brand_name}
                        </Link>
                      </h3>
                    </div>
                    {profile.pricing && (
                      <div className="text-right">
                        {profile.pricing.has_free_tier && (
                          <span className="inline-block px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded mb-1">
                            Free tier
                          </span>
                        )}
                        {profile.pricing.starting_price && (
                          <p className="text-sm text-gray-400">
                            From {profile.pricing.starting_price}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <p className="text-gray-300 mb-4">{profile.summary}</p>
                  
                  {profile.features.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-400 mb-2">Key features:</p>
                      <div className="flex flex-wrap gap-2">
                        {profile.features.map(feature => (
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
                  
                  {profile.integrations.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Integrates with:</p>
                      <div className="flex flex-wrap gap-2">
                        {profile.integrations.map(integration => (
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
                      href={\`/brands/\${profile.slug}\`}
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
              Last verified: <time dateTime="${isoDate}">${shortDate}</time>
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
`;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Escape strings for use in template literals (single quotes)
function escapeForTemplate(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r');
}

// ============================================================================
// LISTICLE CONFIG GENERATORS
// ============================================================================

function generateIntegrationListicles(categories: string[]): ListicleConfig[] {
  const configs: ListicleConfig[] = [];
  
  for (const category of categories) {
    for (const integration of POPULAR_INTEGRATIONS) {
      const slug = `${slugify(category)}-${slugify(integration)}-integration`;
      configs.push({
        slug,
        title: `Best ${category} Software with ${integration} Integration`,
        description: `Compare the top ${category.toLowerCase()} solutions that integrate with ${integration}. Updated ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.`,
        query: {
          category,
          integration,
          max_results: 15,
        }
      });
    }
  }
  
  return configs;
}

function generateFreeTierListicles(categories: string[]): ListicleConfig[] {
  return categories.map(category => ({
    slug: `${slugify(category)}-free`,
    title: `Best Free ${category} Software`,
    description: `Discover the top free ${category.toLowerCase()} tools with generous free tiers. Perfect for startups and small teams.`,
    query: {
      category,
      has_free_tier: true,
      max_results: 15,
    }
  }));
}

function generateCategoryListicles(categories: string[]): ListicleConfig[] {
  return categories.map(category => ({
    slug: slugify(category),
    title: `Best ${category} Software`,
    description: `Compare the top ${category.toLowerCase()} solutions for businesses. Features, pricing, and integrations compared.`,
    query: {
      category,
      max_results: 20,
    }
  }));
}

// ============================================================================
// ALTERNATIVES PAGE GENERATOR
// ============================================================================

function generateAlternativesPage(
  config: AlternativeConfig, 
  alternatives: ProfileForListicle[]
): string {
  const now = new Date();
  const isoDate = now.toISOString();
  const displayDate = now.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const shortDate = now.toISOString().split('T')[0];
  
  // Escape brand name for template strings
  const brandNameEsc = escapeForTemplate(config.brandName);
  const categoryEsc = escapeForTemplate(config.category);

  const schemaOrg = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': `https://useharbor.io/alternatives/${config.slug}#article`,
        'headline': `Best ${config.brandName} Alternatives`,
        'description': `Top alternatives to ${config.brandName} for ${config.category}. Compare features, pricing, and integrations.`,
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
          'url': 'https://useharbor.io'
        }
      },
      {
        '@type': 'ItemList',
        '@id': `https://useharbor.io/alternatives/${config.slug}#list`,
        'name': `${config.brandName} Alternatives`,
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
  };

  return `// AUTO-GENERATED ALTERNATIVES PAGE
// Generated: ${isoDate}
// Alternative to: ${brandNameEsc}

import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Best ${brandNameEsc} Alternatives (${displayDate}) | Harbor',
  description: 'Top alternatives to ${brandNameEsc} for ${categoryEsc}. Compare features, pricing, and integrations.',
  openGraph: {
    title: 'Best ${brandNameEsc} Alternatives',
    description: 'Top alternatives to ${brandNameEsc} for ${categoryEsc}.',
    type: 'article',
    publishedTime: '${isoDate}',
    modifiedTime: '${isoDate}',
  },
}

const schemaOrg = ${JSON.stringify(schemaOrg, null, 2)}

const alternatives = ${JSON.stringify(alternatives.map(p => ({
  slug: p.slug,
  brand_name: p.brand_name,
  domain: p.domain,
  summary: p.feed_data?.one_line_summary || p.feed_data?.short_description || '',
  pricing: p.feed_data?.pricing,
  features: p.feed_data?.features?.slice(0, 5) || [],
  integrations: p.feed_data?.integrations?.slice(0, 8) || [],
})), null, 2)}

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
              Last verified: <time dateTime="${isoDate}">${displayDate}</time> &bull; {alternatives.length} alternatives
            </p>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Best ${brandNameEsc} Alternatives
            </h1>
            <p className="text-lg text-gray-300">
              Looking for an alternative to ${brandNameEsc}? Here are the top ${categoryEsc} solutions that compete with ${brandNameEsc}, 
              ranked by visibility and feature coverage.
            </p>
            <p className="mt-4 text-sm text-gray-400">
              Compare with: <Link href="/brands/${config.brandSlug}" className="text-[#FF6B4A] hover:underline">${brandNameEsc} profile &rarr;</Link>
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
                      href={\`/brands/\${alt.slug}\`}
                      className="text-[#FF6B4A] hover:underline text-sm"
                    >
                      View full profile &rarr;
                    </Link>
                    <Link
                      href={\`/compare/${config.slug}-vs-\${alt.slug}\`}
                      className="text-[#2979FF] hover:underline text-sm"
                    >
                      Compare with ${config.brandName} &rarr;
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
              Last verified: <time dateTime="${isoDate}">${shortDate}</time>
            </p>
          </footer>
        </div>
      </main>
    </>
  )
}
`;
}

// ============================================================================
// COMPARISON PAGE GENERATOR
// ============================================================================

function generateComparisonPage(config: ComparisonConfig): string {
  const now = new Date();
  const isoDate = now.toISOString();
  const displayDate = now.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const shortDate = now.toISOString().split('T')[0];

  const { brand1, brand2 } = config;
  
  // Escape brand names for use in template strings
  const b1Name = escapeForTemplate(brand1.brand_name);
  const b2Name = escapeForTemplate(brand2.brand_name);

  const schemaOrg = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `https://useharbor.io/compare/${config.slug}#article`,
    'headline': `${brand1.brand_name} vs ${brand2.brand_name}: Comparison`,
    'description': `Detailed comparison of ${brand1.brand_name} and ${brand2.brand_name}. Features, pricing, and integrations compared side-by-side.`,
    'datePublished': isoDate,
    'dateModified': isoDate,
    'author': {
      '@type': 'Organization',
      'name': 'Harbor',
      'url': 'https://useharbor.io'
    },
    'about': [
      {
        '@type': 'SoftwareApplication',
        'name': brand1.brand_name,
        'url': `https://useharbor.io/brands/${brand1.slug}`
      },
      {
        '@type': 'SoftwareApplication',
        'name': brand2.brand_name,
        'url': `https://useharbor.io/brands/${brand2.slug}`
      }
    ]
  };

  return `// AUTO-GENERATED COMPARISON PAGE
// Generated: ${isoDate}
// Comparing: ${b1Name} vs ${b2Name}

import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '${b1Name} vs ${b2Name} (${displayDate}) | Harbor',
  description: 'Detailed comparison of ${b1Name} and ${b2Name}. Features, pricing, and integrations compared side-by-side.',
  openGraph: {
    title: '${b1Name} vs ${b2Name}',
    description: 'Detailed comparison of ${b1Name} and ${b2Name}.',
    type: 'article',
    publishedTime: '${isoDate}',
    modifiedTime: '${isoDate}',
  },
}

const schemaOrg = ${JSON.stringify(schemaOrg, null, 2)}

const brand1 = ${JSON.stringify({
  slug: brand1.slug,
  brand_name: brand1.brand_name,
  domain: brand1.domain,
  category: brand1.category,
  summary: brand1.feed_data?.one_line_summary || brand1.feed_data?.short_description || '',
  pricing: brand1.feed_data?.pricing,
  features: brand1.feed_data?.features || [],
  integrations: brand1.feed_data?.integrations || [],
}, null, 2)}

const brand2 = ${JSON.stringify({
  slug: brand2.slug,
  brand_name: brand2.brand_name,
  domain: brand2.domain,
  category: brand2.category,
  summary: brand2.feed_data?.one_line_summary || brand2.feed_data?.short_description || '',
  pricing: brand2.feed_data?.pricing,
  features: brand2.feed_data?.features || [],
  integrations: brand2.feed_data?.integrations || [],
}, null, 2)}

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
              Last verified: <time dateTime="${isoDate}">${displayDate}</time>
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
                href={\`/brands/\${brand1.slug}\`}
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
                href={\`/brands/\${brand2.slug}\`}
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
              href={\`/alternatives/\${brand1.slug}\`}
              className="p-4 bg-[#141E38] rounded-lg border border-white/10 hover:border-white/20 transition-colors"
            >
              <p className="font-medium">{brand1.brand_name} Alternatives &rarr;</p>
              <p className="text-sm text-gray-400">See more options like {brand1.brand_name}</p>
            </Link>
            <Link
              href={\`/alternatives/\${brand2.slug}\`}
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
              Last verified: <time dateTime="${isoDate}">${shortDate}</time>
            </p>
          </footer>
        </div>
      </main>
    </>
  )
}
`;
}

// ============================================================================
// MAIN RUNNER
// ============================================================================

async function fetchAllEnrichedProfiles(): Promise<ProfileForListicle[]> {
  const { data, error } = await supabase
    .from('ai_profiles')
    .select('id, slug, brand_name, domain, category, visibility_score, feed_data')
    .not('feed_data', 'is', null)
    .not('enriched_at', 'is', null)
    .order('visibility_score', { ascending: false });

  if (error) {
    console.error('Failed to fetch profiles:', error.message);
    return [];
  }

  return data as ProfileForListicle[];
}

async function generateAllPages(options: {
  category?: string;
  all?: boolean;
  alternatives?: boolean;
  comparisons?: boolean;
  dryRun?: boolean;
} = {}) {
  console.log('\n🚀 Harbor Listicle Generator v2');
  console.log('═'.repeat(60));
  console.log(`   Mode: ${options.all ? 'EVERYTHING' : options.alternatives ? 'Alternatives' : options.comparisons ? 'Comparisons' : options.category || 'Best listicles'}`);
  console.log(`   Dry run: ${options.dryRun}`);
  console.log('');

  // Fetch all enriched profiles upfront for alternatives/comparisons
  const allProfiles = await fetchAllEnrichedProfiles();
  console.log(`📊 Found ${allProfiles.length} enriched profiles\n`);

  if (allProfiles.length === 0) {
    console.log('❌ No enriched profiles found. Run enrich-profiles.ts first.');
    return;
  }

  // Track totals
  let totalGenerated = 0;
  let totalSkipped = 0;

  // ============================================================
  // BEST/LISTICLE PAGES
  // ============================================================
  if (!options.alternatives && !options.comparisons) {
    console.log('\n📁 GENERATING /best LISTICLE PAGES');
    console.log('─'.repeat(40));

    let configs: ListicleConfig[] = [];
    
    if (options.category) {
      configs = [
        ...generateCategoryListicles([options.category]),
        ...generateFreeTierListicles([options.category]),
        ...generateIntegrationListicles([options.category]),
      ];
    } else if (options.all) {
      configs = [
        ...generateCategoryListicles(POPULAR_CATEGORIES),
        ...generateFreeTierListicles(POPULAR_CATEGORIES),
        ...generateIntegrationListicles(POPULAR_CATEGORIES.slice(0, 10)),
      ];
    } else {
      configs = generateCategoryListicles(POPULAR_CATEGORIES);
    }

    console.log(`   ${configs.length} listicle configs to process`);

    if (!options.dryRun) {
      if (!existsSync(OUTPUT_DIR_BEST)) {
        mkdirSync(OUTPUT_DIR_BEST, { recursive: true });
      }

      for (const config of configs) {
        const profiles = await fetchProfilesForListicle(config);
        
        if (profiles.length < 3) {
          totalSkipped++;
          continue;
        }
        
        const pageContent = generateListiclePage(config, profiles);
        const pageDir = resolve(OUTPUT_DIR_BEST, config.slug);
        if (!existsSync(pageDir)) {
          mkdirSync(pageDir, { recursive: true });
        }
        writeFileSync(resolve(pageDir, 'page.tsx'), pageContent, 'utf-8');
        totalGenerated++;
        
        if (totalGenerated % 50 === 0) {
          console.log(`   ... generated ${totalGenerated} /best pages`);
        }
      }
      console.log(`   ✓ Generated ${totalGenerated} /best pages`);
    } else {
      console.log('   DRY RUN - sample pages:');
      configs.slice(0, 10).forEach(c => console.log(`     /best/${c.slug}`));
      if (configs.length > 10) console.log(`     ... and ${configs.length - 10} more`);
    }
  }

  // ============================================================
  // ALTERNATIVES PAGES
  // ============================================================
  if (options.alternatives || options.all) {
    console.log('\n📁 GENERATING /alternatives PAGES');
    console.log('─'.repeat(40));
    
    // Group profiles by category for finding alternatives
    const profilesByCategory: Record<string, ProfileForListicle[]> = {};
    for (const profile of allProfiles) {
      const cat = profile.category || 'Other';
      if (!profilesByCategory[cat]) {
        profilesByCategory[cat] = [];
      }
      profilesByCategory[cat].push(profile);
    }

    const alternativeConfigs: AlternativeConfig[] = allProfiles
      .filter(p => p.category && profilesByCategory[p.category]?.length >= 3)
      .map(p => ({
        slug: p.slug,
        brandName: p.brand_name,
        brandSlug: p.slug,
        category: p.category,
      }));

    console.log(`   ${alternativeConfigs.length} alternatives pages to generate`);

    if (!options.dryRun) {
      if (!existsSync(OUTPUT_DIR_ALTERNATIVES)) {
        mkdirSync(OUTPUT_DIR_ALTERNATIVES, { recursive: true });
      }

      let altGenerated = 0;
      for (const config of alternativeConfigs) {
        // Get alternatives (same category, excluding self)
        const alternatives = profilesByCategory[config.category]
          ?.filter(p => p.slug !== config.slug)
          .slice(0, 15) || [];

        if (alternatives.length < 3) {
          totalSkipped++;
          continue;
        }

        const pageContent = generateAlternativesPage(config, alternatives);
        const pageDir = resolve(OUTPUT_DIR_ALTERNATIVES, config.slug);
        if (!existsSync(pageDir)) {
          mkdirSync(pageDir, { recursive: true });
        }
        writeFileSync(resolve(pageDir, 'page.tsx'), pageContent, 'utf-8');
        totalGenerated++;
        altGenerated++;
        
        if (altGenerated % 100 === 0) {
          console.log(`   ... generated ${altGenerated} /alternatives pages`);
        }
      }
      console.log(`   ✓ Generated ${altGenerated} /alternatives pages`);
    } else {
      console.log('   DRY RUN - sample pages:');
      alternativeConfigs.slice(0, 10).forEach(c => console.log(`     /alternatives/${c.slug}`));
      if (alternativeConfigs.length > 10) console.log(`     ... and ${alternativeConfigs.length - 10} more`);
    }
  }

  // ============================================================
  // COMPARISON PAGES
  // ============================================================
  if (options.comparisons || options.all) {
    console.log('\n📁 GENERATING /compare PAGES');
    console.log('─'.repeat(40));
    
    // Generate comparisons for top profiles in each category
    const comparisonConfigs: ComparisonConfig[] = [];
    
    // Group by category
    const profilesByCategory: Record<string, ProfileForListicle[]> = {};
    for (const profile of allProfiles) {
      const cat = profile.category || 'Other';
      if (!profilesByCategory[cat]) {
        profilesByCategory[cat] = [];
      }
      profilesByCategory[cat].push(profile);
    }

    // For each category, create comparisons between top products
    for (const [category, profiles] of Object.entries(profilesByCategory)) {
      // Take top 10 in category, create comparisons between them
      const topProfiles = profiles.slice(0, 10);
      
      for (let i = 0; i < topProfiles.length; i++) {
        for (let j = i + 1; j < Math.min(i + 5, topProfiles.length); j++) {
          const brand1 = topProfiles[i];
          const brand2 = topProfiles[j];
          
          // Alphabetical order for consistent slugs
          const [first, second] = [brand1, brand2].sort((a, b) => 
            a.brand_name.localeCompare(b.brand_name)
          );
          
          comparisonConfigs.push({
            slug: `${first.slug}-vs-${second.slug}`,
            brand1: first,
            brand2: second,
          });
        }
      }
    }

    console.log(`   ${comparisonConfigs.length} comparison pages to generate`);

    if (!options.dryRun) {
      if (!existsSync(OUTPUT_DIR_COMPARE)) {
        mkdirSync(OUTPUT_DIR_COMPARE, { recursive: true });
      }

      let compGenerated = 0;
      for (const config of comparisonConfigs) {
        const pageContent = generateComparisonPage(config);
        const pageDir = resolve(OUTPUT_DIR_COMPARE, config.slug);
        if (!existsSync(pageDir)) {
          mkdirSync(pageDir, { recursive: true });
        }
        writeFileSync(resolve(pageDir, 'page.tsx'), pageContent, 'utf-8');
        totalGenerated++;
        compGenerated++;
        
        if (compGenerated % 100 === 0) {
          console.log(`   ... generated ${compGenerated} /compare pages`);
        }
      }
      console.log(`   ✓ Generated ${compGenerated} /compare pages`);
    } else {
      console.log('   DRY RUN - sample pages:');
      comparisonConfigs.slice(0, 10).forEach(c => console.log(`     /compare/${c.slug}`));
      if (comparisonConfigs.length > 10) console.log(`     ... and ${comparisonConfigs.length - 10} more`);
    }
  }

  // ============================================================
  // SUMMARY
  // ============================================================
  console.log('\n' + '═'.repeat(60));
  console.log('✅ GENERATION COMPLETE');
  console.log('═'.repeat(60));
  console.log(`   Total generated: ${totalGenerated}`);
  console.log(`   Total skipped (insufficient data): ${totalSkipped}`);
  console.log('');
  console.log('   Output directories:');
  console.log(`     /best          &rarr; ${OUTPUT_DIR_BEST}`);
  console.log(`     /alternatives  &rarr; ${OUTPUT_DIR_ALTERNATIVES}`);
  console.log(`     /compare       &rarr; ${OUTPUT_DIR_COMPARE}`);
  console.log('');
}

// ============================================================================
// CLI
// ============================================================================

const args = process.argv.slice(2);

if (args.includes('--help')) {
  console.log(`
Harbor Listicle Generator v2

Generates static pages for long-tail SEO and AI citation:
  &bull; /best/*          - Category and integration listicles
  &bull; /alternatives/*  - "[Product] Alternatives" pages
  &bull; /compare/*       - "[A] vs [B]" comparison pages

Usage:
  npx tsx scripts/generate-listicles.ts                      # Category pages only
  npx tsx scripts/generate-listicles.ts --all                # Generate EVERYTHING
  npx tsx scripts/generate-listicles.ts --alternatives       # Just alternatives pages
  npx tsx scripts/generate-listicles.ts --comparisons        # Just comparison pages
  npx tsx scripts/generate-listicles.ts --category "CRM"     # All CRM variants
  npx tsx scripts/generate-listicles.ts --dry-run            # Preview only

Options:
  --all             Generate all page types (best, alternatives, comparisons)
  --alternatives    Generate only /alternatives pages
  --comparisons     Generate only /compare pages  
  --category "X"    Generate all variants for a specific category
  --dry-run         Preview what would be generated
  --help            Show this help

Output:
  apps/web/app/best/[slug]/page.tsx
  apps/web/app/alternatives/[slug]/page.tsx
  apps/web/app/compare/[slug]/page.tsx
`);
  process.exit(0);
}

const categoryIndex = args.indexOf('--category');
const category = categoryIndex !== -1 ? args[categoryIndex + 1] : undefined;

const all = args.includes('--all');
const alternatives = args.includes('--alternatives');
const comparisons = args.includes('--comparisons');
const dryRun = args.includes('--dry-run');

generateAllPages({ category, all, alternatives, comparisons, dryRun })
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });