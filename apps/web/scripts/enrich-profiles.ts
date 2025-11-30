#!/usr/bin/env tsx

import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: resolve(__dirname, '../../../.env') });

/**
 * Harbor Profile Enrichment Script
 * 
 * Adds missing fields to existing ai_profiles:
 * - pricing (has_free_tier, starting_price, price_model)
 * - integrations (array of integration names)
 * - features (array of key features)
 * - icp (ideal customer profile / target audience)
 * - category (normalized category for listicles)
 * 
 * Usage:
 *   npx tsx scripts/enrich-profiles.ts                    # Enrich 10 profiles (test)
 *   npx tsx scripts/enrich-profiles.ts --limit 100        # Enrich 100 profiles
 *   npx tsx scripts/enrich-profiles.ts --all              # Enrich all unenriched
 *   npx tsx scripts/enrich-profiles.ts --dry-run          # Preview without changes
 */

import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

// ============================================================================
// SETUP
// ============================================================================

console.log('🔑 Checking environment variables...');
console.log('   OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✓ Loaded' : '✗ Missing');
console.log('   SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ Loaded' : '✗ Missing');
console.log('   SERVICE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✓ Loaded' : '✗ Missing');
console.log('');

if (!process.env.OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY not found');
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Cost estimate per profile (GPT-4o-mini)
const ESTIMATED_COST_PER_PROFILE = 0.0005; // ~$0.0005 per enrichment

// Pages to crawl for enrichment data
const PRICING_PATHS = ['/pricing', '/plans', '/price', '/packages', '/buy', '/subscribe'];
const INTEGRATION_PATHS = ['/integrations', '/apps', '/marketplace', '/partners', '/connect', '/plugins'];
const FEATURES_PATHS = ['/features', '/product', '/solutions', '/capabilities'];

const MAX_CHARS_PER_PAGE = 6000;
const REQUEST_TIMEOUT_MS = 10000;

// ============================================================================
// TYPES
// ============================================================================

interface EnrichmentData {
  pricing: {
    has_free_tier: boolean;
    starting_price: string | null;
    price_model: 'per_user' | 'flat' | 'usage' | 'tiered' | 'custom' | 'unknown';
    price_notes: string | null;
  };
  integrations: string[];
  features: string[];
  icp: string;
  category: string;
}

interface AIProfile {
  id: string;
  slug: string;
  domain: string;
  brand_name: string;
  feed_data: any;
  enriched_at: string | null;
}

// ============================================================================
// CRAWLER HELPERS
// ============================================================================

function sanitizeHtmlToText(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchPage(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent': 'HarborBot/1.0 (AI Profile Enrichment; +https://useharbor.io/bot)',
        'Accept': 'text/html,application/xhtml+xml',
      },
      signal: controller.signal
    });
    
    clearTimeout(timeout);
    
    if (res.ok) {
      const html = await res.text();
      return sanitizeHtmlToText(html);
    }
  } catch (err) {
    // Silently fail - page doesn't exist or timeout
  }
  return null;
}

async function fetchFirstValidPath(baseUrl: string, paths: string[]): Promise<string | null> {
  for (const path of paths) {
    const url = new URL(path, baseUrl).toString();
    const content = await fetchPage(url);
    if (content && content.length > 200) {
      return content.slice(0, MAX_CHARS_PER_PAGE);
    }
  }
  return null;
}

async function crawlEnrichmentPages(domain: string): Promise<{
  pricing: string | null;
  integrations: string | null;
  features: string | null;
  homepage: string | null;
}> {
  const baseUrl = `https://${domain}`;
  
  console.log(`  → Crawling enrichment pages for ${domain}...`);
  
  const [pricingContent, integrationsContent, featuresContent, homepageContent] = await Promise.all([
    fetchFirstValidPath(baseUrl, PRICING_PATHS),
    fetchFirstValidPath(baseUrl, INTEGRATION_PATHS),
    fetchFirstValidPath(baseUrl, FEATURES_PATHS),
    fetchPage(baseUrl),
  ]);
  
  const foundPages = [
    pricingContent ? 'pricing' : null,
    integrationsContent ? 'integrations' : null,
    featuresContent ? 'features' : null,
    homepageContent ? 'homepage' : null,
  ].filter(Boolean);
  
  console.log(`  → Found pages: ${foundPages.join(', ') || 'none'}`);
  
  return {
    pricing: pricingContent,
    integrations: integrationsContent,
    features: featuresContent,
    homepage: homepageContent?.slice(0, MAX_CHARS_PER_PAGE) || null,
  };
}

// ============================================================================
// AI ENRICHMENT
// ============================================================================

async function extractEnrichmentData(
  brandName: string,
  domain: string,
  existingData: any,
  crawledContent: {
    pricing: string | null;
    integrations: string | null;
    features: string | null;
    homepage: string | null;
  }
): Promise<EnrichmentData> {
  
  // Build context from crawled pages
  const contextParts: string[] = [];
  
  if (crawledContent.pricing) {
    contextParts.push(`=== PRICING PAGE ===\n${crawledContent.pricing}`);
  }
  if (crawledContent.integrations) {
    contextParts.push(`=== INTEGRATIONS PAGE ===\n${crawledContent.integrations}`);
  }
  if (crawledContent.features) {
    contextParts.push(`=== FEATURES PAGE ===\n${crawledContent.features}`);
  }
  if (crawledContent.homepage) {
    contextParts.push(`=== HOMEPAGE ===\n${crawledContent.homepage}`);
  }
  
  // If no content found, return defaults
  if (contextParts.length === 0) {
    console.log(`  → No crawlable content found, using defaults`);
    return {
      pricing: {
        has_free_tier: false,
        starting_price: null,
        price_model: 'unknown',
        price_notes: null,
      },
      integrations: [],
      features: [],
      icp: existingData?.company_info?.industry_tags?.[0] || 'Business professionals',
      category: existingData?.company_info?.industry_tags?.[0] || 'Software',
    };
  }
  
  const websiteContent = contextParts.join('\n\n');
  
  const systemPrompt = `You are extracting structured data from a software company's website for a product directory.

Your job is to extract:
1. Pricing information (free tier, starting price, pricing model)
2. Integrations (other tools/platforms this product connects with)
3. Key features (main capabilities)
4. ICP (ideal customer profile - who is this product for?)
5. Category (primary software category)

Be conservative - only include information that is clearly stated.
For integrations, extract actual product/platform names (e.g., "Salesforce", "Slack", "QuickBooks").
For features, extract 5-10 key capabilities.
For pricing, look for specific dollar amounts or "Free" indicators.`;

  const userPrompt = `Extract enrichment data for ${brandName} (${domain}).

Existing profile data:
${JSON.stringify(existingData?.company_info || {}, null, 2)}

Website content:
${websiteContent}

Return ONLY a JSON object with this exact structure:
{
  "pricing": {
    "has_free_tier": boolean,
    "starting_price": "$X/mo" or "$X/year" or null if not found,
    "price_model": "per_user" | "flat" | "usage" | "tiered" | "custom" | "unknown",
    "price_notes": "brief note about pricing if relevant" or null
  },
  "integrations": ["Integration1", "Integration2", ...],
  "features": ["Feature1", "Feature2", ...],
  "icp": "Brief description of ideal customer (1 sentence)",
  "category": "Primary software category (e.g., CRM, Project Management, Time Tracking)"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    const parsed = JSON.parse(content) as EnrichmentData;
    
    console.log(`  → Extracted: ${parsed.integrations.length} integrations, ${parsed.features.length} features`);
    console.log(`  → Pricing: ${parsed.pricing.has_free_tier ? 'Free tier' : 'No free tier'}, ${parsed.pricing.starting_price || 'price unknown'}`);
    console.log(`  → Category: ${parsed.category}`);
    
    return parsed;

  } catch (error: any) {
    console.error(`  → OpenAI error: ${error.message}`);
    // Return safe defaults on error
    return {
      pricing: {
        has_free_tier: false,
        starting_price: null,
        price_model: 'unknown',
        price_notes: null,
      },
      integrations: [],
      features: [],
      icp: 'Business professionals',
      category: 'Software',
    };
  }
}

// ============================================================================
// MAIN ENRICHMENT FUNCTION
// ============================================================================

async function enrichProfile(profile: AIProfile): Promise<{ success: boolean; error?: string }> {
  console.log(`\n📦 Enriching: ${profile.brand_name} (${profile.domain})`);
  
  try {
    // Step 1: Crawl enrichment pages
    const crawledContent = await crawlEnrichmentPages(profile.domain);
    
    // Step 2: Extract enrichment data
    const enrichmentData = await extractEnrichmentData(
      profile.brand_name,
      profile.domain,
      profile.feed_data,
      crawledContent
    );
    
    // Step 3: Merge with existing feed_data
    const updatedFeedData = {
      ...profile.feed_data,
      pricing: enrichmentData.pricing,
      integrations: enrichmentData.integrations,
      features: enrichmentData.features,
      icp: enrichmentData.icp,
      category: enrichmentData.category,
      enriched_at: new Date().toISOString(),
      enrichment_version: '1.0',
    };
    
    // Step 4: Update database
    const { error: updateError } = await supabase
      .from('ai_profiles')
      .update({
        feed_data: updatedFeedData,
        enriched_at: new Date().toISOString(),
        // Also store top-level fields for easier querying
        category: enrichmentData.category,
      })
      .eq('id', profile.id);
    
    if (updateError) {
      throw new Error(`Database update failed: ${updateError.message}`);
    }
    
    console.log(`  ✓ Enriched successfully`);
    return { success: true };
    
  } catch (error: any) {
    console.error(`  ✗ Failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// ============================================================================
// BATCH RUNNER
// ============================================================================

async function runEnrichment(options: {
  limit?: number;
  concurrency?: number;
  dryRun?: boolean;
  all?: boolean;
} = {}) {
  const { limit = 10, concurrency = 5, dryRun = false, all = false } = options;
  
  console.log('\n🚀 Harbor Profile Enrichment');
  console.log(`   Mode: ${all ? 'ALL unenriched' : `Limit ${limit}`}`);
  console.log(`   Concurrency: ${concurrency}`);
  console.log(`   Dry run: ${dryRun}`);
  console.log('');
  
  // Fetch profiles that need enrichment
  let query = supabase
    .from('ai_profiles')
    .select('id, slug, domain, brand_name, feed_data, enriched_at')
    .is('enriched_at', null)
    .not('feed_data', 'is', null);
  
  if (!all) {
    query = query.limit(limit);
  } else {
    query = query.limit(50000); // Safety limit
  }
  
  const { data: profiles, error } = await query;
  
  if (error) {
    console.error(`❌ Failed to fetch profiles: ${error.message}`);
    process.exit(1);
  }
  
  if (!profiles || profiles.length === 0) {
    console.log('✅ No profiles need enrichment');
    return { total: 0, successful: 0, failed: 0, cost: 0 };
  }
  
  console.log(`📋 Found ${profiles.length} profiles to enrich`);
  console.log(`💰 Estimated cost: $${(profiles.length * ESTIMATED_COST_PER_PROFILE).toFixed(4)}`);
  console.log('');
  
  if (dryRun) {
    console.log('DRY RUN - Would enrich:');
    profiles.slice(0, 20).forEach(p => console.log(`  - ${p.brand_name} (${p.domain})`));
    if (profiles.length > 20) {
      console.log(`  ... and ${profiles.length - 20} more`);
    }
    return;
  }
  
  // Process in batches
  let successful = 0;
  let failed = 0;
  
  for (let i = 0; i < profiles.length; i += concurrency) {
    const batch = profiles.slice(i, i + concurrency);
    const batchNum = Math.floor(i / concurrency) + 1;
    const totalBatches = Math.ceil(profiles.length / concurrency);
    
    console.log(`\n━━━ Batch ${batchNum}/${totalBatches} ━━━`);
    
    const results = await Promise.all(
      batch.map(profile => enrichProfile(profile as AIProfile))
    );
    
    results.forEach(result => {
      if (result.success) successful++;
      else failed++;
    });
    
    const progress = Math.round(((i + batch.length) / profiles.length) * 100);
    console.log(`\n📊 Progress: ${i + batch.length}/${profiles.length} (${progress}%) | ✓ ${successful} | ✗ ${failed}`);
    
    // Small delay between batches to be nice to websites
    if (i + concurrency < profiles.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // Summary
  console.log('\n' + '═'.repeat(60));
  console.log('✅ ENRICHMENT COMPLETE');
  console.log('═'.repeat(60));
  console.log(`Total: ${profiles.length}`);
  console.log(`Successful: ${successful}`);
  console.log(`Failed: ${failed}`);
  console.log(`Cost: $${(successful * ESTIMATED_COST_PER_PROFILE).toFixed(4)}`);
  console.log('');
  
  return { total: profiles.length, successful, failed, cost: successful * ESTIMATED_COST_PER_PROFILE };
}

// ============================================================================
// CLI
// ============================================================================

const args = process.argv.slice(2);

if (args.includes('--help')) {
  console.log(`
Harbor Profile Enrichment Script

Adds pricing, integrations, features, ICP, and category to existing profiles.

Usage:
  npx tsx scripts/enrich-profiles.ts                    # Enrich 10 profiles
  npx tsx scripts/enrich-profiles.ts --limit 100        # Enrich 100 profiles
  npx tsx scripts/enrich-profiles.ts --all              # Enrich all unenriched
  npx tsx scripts/enrich-profiles.ts --dry-run          # Preview only
  npx tsx scripts/enrich-profiles.ts --concurrency 10   # 10 parallel

Options:
  --limit N         Number to enrich (default: 10)
  --all             Enrich all unenriched profiles
  --concurrency N   Parallel requests (default: 5)
  --dry-run         Preview without making changes
  --help            Show this help
`);
  process.exit(0);
}

const limitIndex = args.indexOf('--limit');
const limit = limitIndex !== -1 ? parseInt(args[limitIndex + 1]) : 10;

const concurrencyIndex = args.indexOf('--concurrency');
const concurrency = concurrencyIndex !== -1 ? parseInt(args[concurrencyIndex + 1]) : 5;

const dryRun = args.includes('--dry-run');
const all = args.includes('--all');

runEnrichment({ limit, concurrency, dryRun, all })
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
