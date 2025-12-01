#!/usr/bin/env tsx

import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get the directory of this script
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from project root (3 levels up from apps/web/scripts)
config({ path: resolve(__dirname, '../../../.env') });

// Debug: Check if env vars loaded
console.log('🔑 Checking environment variables...');
console.log('   OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✓ Loaded' : '✗ Missing');
console.log('   SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ Loaded' : '✗ Missing');
console.log('   SERVICE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✓ Loaded' : '✗ Missing');
console.log('');

if (!process.env.OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY not found in environment');
  console.error('   Make sure .env file exists at project root');
  process.exit(1);
}

/**
 * Harbor AI Profile Generator - v3 (with enrichment)
 * 
 * Now includes enrichment data in a single pass:
 * - pricing (has_free_tier, starting_price, price_model)
 * - integrations (array of integration names)
 * - features (array of key features)
 * - icp (ideal customer profile)
 * - category (normalized category)
 * 
 * Usage:
 *   npm run generate:profiles              # Generate all ungenerated profiles
 *   npm run generate:profiles -- --limit 100
 *   npm run generate:profiles -- --dry-run
 */

import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

// ============================================================================
// SETUP
// ============================================================================

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Cost per profile (GPT-4o-mini): ~$0.0005 with combined prompt
const ESTIMATED_COST = 0.0005;

// Candidate paths for multi-page crawling
const ABOUT_PATHS = ["/about", "/about-us", "/our-story", "/company"];
const PRODUCTS_PATHS = ["/products", "/product", "/services", "/solutions", "/what-we-do"];
const COMPANY_PATHS = ["/company", "/about", "/team", "/who-we-are"];
const PRICING_PATHS = ['/pricing', '/plans', '/price', '/packages', '/buy', '/subscribe'];
const INTEGRATION_PATHS = ['/integrations', '/apps', '/marketplace', '/partners', '/connect', '/plugins'];
const FEATURES_PATHS = ['/features', '/product', '/solutions', '/capabilities'];

const MAX_CHARS_PER_PAGE = 4000;
const REQUEST_TIMEOUT_MS = 8000;

// ============================================================================
// TYPES
// ============================================================================

interface VisibilityScoring {
  brand_clarity_0_25: number;
  offerings_clarity_0_25: number;
  trust_and_basics_0_20: number;
  structure_for_ai_0_20: number;
  breadth_of_coverage_0_10: number;
  total_visibility_score_0_100: number;
  score_rationale: string;
}

interface PricingInfo {
  has_free_tier: boolean;
  starting_price: string | null;
  price_model: 'per_user' | 'flat' | 'usage' | 'tiered' | 'custom' | 'unknown';
  price_notes: string | null;
}

interface AIProfileResponse {
  brand_name: string;
  one_line_summary: string;
  short_description: string;
  offerings: Array<{
    name: string;
    type: 'product_line' | 'service' | 'platform' | 'other';
    description: string;
  }>;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
  company_info: {
    hq_location: string | null;
    founded_year: number | null;
    employee_band: '1-10' | '11-50' | '51-200' | '201-1000' | '1000+' | 'unknown';
    industry_tags: string[];
  };
  visibility_scoring: VisibilityScoring;
  // Enrichment fields (now included in main generation)
  pricing: PricingInfo;
  integrations: string[];
  features: string[];
  icp: string;
  category: string;
}

// ============================================================================
// WEBSITE CRAWLER - Multi-page with 404-safe fallbacks
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
        'User-Agent': 'HarborBot/1.0 (AI Profile Generator; +https://useharbor.io/bot)',
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

async function fetchFirstOkPath(baseUrl: string, paths: string[]): Promise<string | null> {
  for (const path of paths) {
    const url = new URL(path, baseUrl).toString();
    const content = await fetchPage(url);
    if (content && content.length > 200) {
      return content.slice(0, MAX_CHARS_PER_PAGE);
    }
  }
  return null;
}

function clip(text: string | null): string {
  return text ? text.slice(0, MAX_CHARS_PER_PAGE) : '';
}

async function crawlAllPages(domain: string): Promise<{
  combined: string;
  sections: {
    homepage: string | null;
    about: string | null;
    products: string | null;
    company: string | null;
    pricing: string | null;
    integrations: string | null;
    features: string | null;
  };
}> {
  const baseUrl = `https://${domain}`;
  
  console.log(`  → Crawling pages for ${domain}...`);
  
  // Fetch all pages in parallel
  const [
    homepageText,
    aboutText,
    productsText,
    companyText,
    pricingText,
    integrationsText,
    featuresText
  ] = await Promise.all([
    fetchPage(baseUrl),
    fetchFirstOkPath(baseUrl, ABOUT_PATHS),
    fetchFirstOkPath(baseUrl, PRODUCTS_PATHS),
    fetchFirstOkPath(baseUrl, COMPANY_PATHS),
    fetchFirstOkPath(baseUrl, PRICING_PATHS),
    fetchFirstOkPath(baseUrl, INTEGRATION_PATHS),
    fetchFirstOkPath(baseUrl, FEATURES_PATHS),
  ]);
  
  const sections = {
    homepage: clip(homepageText),
    about: clip(aboutText),
    products: clip(productsText),
    company: clip(companyText),
    pricing: clip(pricingText),
    integrations: clip(integrationsText),
    features: clip(featuresText),
  };
  
  // Build combined text with section markers
  const parts: string[] = [];
  if (sections.homepage) parts.push(`=== HOMEPAGE ===\n${sections.homepage}`);
  if (sections.about) parts.push(`=== ABOUT ===\n${sections.about}`);
  if (sections.products) parts.push(`=== PRODUCTS/SERVICES ===\n${sections.products}`);
  if (sections.company) parts.push(`=== COMPANY ===\n${sections.company}`);
  if (sections.pricing) parts.push(`=== PRICING ===\n${sections.pricing}`);
  if (sections.integrations) parts.push(`=== INTEGRATIONS ===\n${sections.integrations}`);
  if (sections.features) parts.push(`=== FEATURES ===\n${sections.features}`);
  
  const combined = parts.join('\n\n');
  
  const foundPages = Object.entries(sections)
    .filter(([_, v]) => v)
    .map(([k]) => k);
  
  console.log(`  → Found pages: ${foundPages.join(', ') || 'none'} (${combined.length} chars)`);
  
  return { combined, sections };
}

// ============================================================================
// AI PROFILE GENERATOR - OpenAI with structured scoring + enrichment
// ============================================================================

async function generateProfileWithOpenAI(
  brandName: string,
  domain: string,
  websiteContent: string
): Promise<AIProfileResponse> {
  
  console.log(`  → Generating profile with OpenAI...`);
  
  const systemPrompt = `You are analyzing the public website of a brand to create an AI-ready profile with visibility scoring and enrichment data.

You will receive cleaned text from the brand's website (homepage, about, products, pricing, integrations, features pages).

Your goals:
1. Extract a concise but accurate description of the brand
2. Identify their main offerings as product lines or services (not individual SKUs)
3. Infer 3-6 realistic FAQs and answers if possible
4. Infer basic company info where reasonably clear
5. Assign visibility subscores based ONLY on the website content provided
6. Extract pricing information (free tier, starting price, pricing model)
7. Extract integrations (other tools/platforms this product connects with)
8. Extract 5-10 key features
9. Identify ICP (ideal customer profile)
10. Assign a primary software category

If information is not present, use null or "unknown" instead of guessing.

CRITICAL: For company_info.founded_year and company_info.hq_location, ONLY include if explicitly stated. If not found, use null.
For integrations, extract actual product/platform names (e.g., "Salesforce", "Slack", "QuickBooks", "Zapier").
For features, extract key capabilities, not marketing fluff.`;

  const userPrompt = `Here is cleaned text from the brand's website:

${websiteContent}

Using ONLY this text, create a complete profile with enrichment data.

For visibility scoring, use this rubric:
1. brand_clarity_0_25: Is it clear what the company does and who it's for? (0-25 points)
2. offerings_clarity_0_25: Are the main products/services understandable and reusable in AI answers? (0-25 points)
3. trust_and_basics_0_20: Can you identify basic trust elements (what they do, who they serve, location/contact)? (0-20 points)
4. structure_for_ai_0_20: Is the content structured in a way that makes it easy for AI to extract? (0-20 points)
5. breadth_of_coverage_0_10: Does the site cover typical questions (what, who, how, pricing, support)? (0-10 points)

For pricing:
- has_free_tier: true if "Free", "Free trial", "Free plan" mentioned
- starting_price: Extract lowest price (e.g., "$9/month", "$49/user/month") or null if not found
- price_model: per_user | flat | usage | tiered | custom | unknown

Return ONLY a JSON object with this exact structure:
{
  "brand_name": "${brandName}",
  "one_line_summary": "string",
  "short_description": "string (2-3 sentences)",
  "offerings": [
    {
      "name": "string",
      "type": "product_line|service|platform|other",
      "description": "string"
    }
  ],
  "faqs": [
    {
      "question": "string",
      "answer": "string"
    }
  ],
  "company_info": {
    "hq_location": "string or null",
    "founded_year": "number or null",
    "employee_band": "1-10|11-50|51-200|201-1000|1000+|unknown",
    "industry_tags": ["tag1", "tag2"]
  },
  "visibility_scoring": {
    "brand_clarity_0_25": number,
    "offerings_clarity_0_25": number,
    "trust_and_basics_0_20": number,
    "structure_for_ai_0_20": number,
    "breadth_of_coverage_0_10": number,
    "total_visibility_score_0_100": number,
    "score_rationale": "Brief explanation"
  },
  "pricing": {
    "has_free_tier": boolean,
    "starting_price": "string or null",
    "price_model": "per_user|flat|usage|tiered|custom|unknown",
    "price_notes": "string or null"
  },
  "integrations": ["Integration1", "Integration2", ...],
  "features": ["Feature1", "Feature2", ...],
  "icp": "Brief description of ideal customer (1 sentence)",
  "category": "Primary software category (e.g., CRM, Project Management, Cybersecurity)"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    const parsed = JSON.parse(content) as AIProfileResponse;
    
    // Validate and provide defaults for enrichment fields
    if (!parsed.pricing) {
      parsed.pricing = {
        has_free_tier: false,
        starting_price: null,
        price_model: 'unknown',
        price_notes: null
      };
    }
    if (!parsed.integrations) parsed.integrations = [];
    if (!parsed.features) parsed.features = [];
    if (!parsed.icp) parsed.icp = parsed.company_info?.industry_tags?.[0] || 'Business professionals';
    if (!parsed.category) parsed.category = parsed.company_info?.industry_tags?.[0] || 'Software';
    
    return parsed;

  } catch (error: any) {
    console.error(`  → OpenAI error: ${error.message}`);
    throw error;
  }
}

// ============================================================================
// SLUG GENERATOR
// ============================================================================

function generateSlug(brandName: string): string {
  return brandName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// ============================================================================
// MAIN PROFILE GENERATOR
// ============================================================================

async function generateAIProfile(
  brandName: string,
  domain: string,
  existingSlug?: string,
  industry?: string
): Promise<{ success: boolean; profile_id?: string; error?: string }> {
  
  console.log(`\n📦 Processing: ${brandName} (${domain})`);
  
  try {
    // Step 1: Generate slug
    const slug = existingSlug || generateSlug(brandName);
    
    // Step 2: Crawl all pages (including enrichment pages)
    const { combined: websiteContent, sections } = await crawlAllPages(domain);
    
    if (!websiteContent || websiteContent.length < 100) {
      throw new Error('Insufficient website content found');
    }
    
    // Step 3: Generate profile with OpenAI (includes enrichment)
    const profileData = await generateProfileWithOpenAI(brandName, domain, websiteContent);
    
    // Step 4: Calculate visibility score
    const visibilityScore = profileData.visibility_scoring.total_visibility_score_0_100;
    
    console.log(`  → Visibility Score: ${visibilityScore}/100`);
    console.log(`     Brand: ${profileData.visibility_scoring.brand_clarity_0_25}/25`);
    console.log(`     Offerings: ${profileData.visibility_scoring.offerings_clarity_0_25}/25`);
    console.log(`     Trust: ${profileData.visibility_scoring.trust_and_basics_0_20}/20`);
    console.log(`     Structure: ${profileData.visibility_scoring.structure_for_ai_0_20}/20`);
    console.log(`     Breadth: ${profileData.visibility_scoring.breadth_of_coverage_0_10}/10`);
    console.log(`  → Category: ${profileData.category}`);
    console.log(`  → Pricing: ${profileData.pricing.has_free_tier ? 'Free tier' : 'Paid'}, ${profileData.pricing.starting_price || 'price unknown'}`);
    console.log(`  → Integrations: ${profileData.integrations.length} found`);
    console.log(`  → Features: ${profileData.features.length} found`);
    
    // Step 5: Logo URL (Brandfetch)
    const logoUrl = process.env.BRANDFETCH_API_KEY 
      ? `https://img.logo.dev/${domain}?token=${process.env.BRANDFETCH_API_KEY}`
      : `https://img.logo.dev/${domain}`;
    
    // Step 6: Correct feed URL
    const feedUrl = `https://useharbor.io/brands/${slug}/harbor.json`;
    
    // Step 7: Prepare feed_data with all structured info (including enrichment)
    const feedData = {
      version: '1.0',
      generated_at: new Date().toISOString(),
      brand_name: profileData.brand_name,
      one_line_summary: profileData.one_line_summary,
      short_description: profileData.short_description,
      offerings: profileData.offerings,
      faqs: profileData.faqs,
      company_info: profileData.company_info,
      visibility_scoring: profileData.visibility_scoring,
      // Enrichment fields
      pricing: profileData.pricing,
      integrations: profileData.integrations,
      features: profileData.features,
      icp: profileData.icp,
      category: profileData.category,
      // Metadata
      schema_url: feedUrl,
      verified: false,
      enriched_at: new Date().toISOString(),
      enrichment_version: '1.0',
    };
    
    // Step 8: Save to database (upsert to allow re-crawls)
    const { data: profile, error: dbError } = await supabase
      .from('ai_profiles')
      .upsert({
        brand_name: brandName,
        slug: slug,
        domain: domain,
        logo_url: logoUrl,
        feed_data: feedData,
        visibility_score: visibilityScore,
        industry: profileData.category || industry || 'Unknown',
        category: profileData.category || 'Software',
        generation_method: 'batch_v3',
        generation_cost_usd: ESTIMATED_COST,
        feed_url: feedUrl,
        enriched_at: new Date().toISOString(),
      }, {
        onConflict: 'slug'
      })
      .select('id')
      .single();
    
    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`);
    }
    
    // Step 9: Update brand_list
    await supabase
      .from('brand_list')
      .update({
        profile_generated: true,
        profile_id: profile.id,
        generation_attempted_at: new Date().toISOString()
      })
      .eq('domain', domain);
    
    console.log(`✓ Generated successfully (${profile.id})`);
    
    return {
      success: true,
      profile_id: profile.id
    };
    
  } catch (error: any) {
    console.error(`✗ Failed: ${error.message}`);
    
    // Log error in brand_list
    await supabase
      .from('brand_list')
      .update({
        generation_attempted_at: new Date().toISOString(),
        generation_error: error.message
      })
      .eq('domain', domain);
    
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================================================
// BATCH RUNNER: GENERATE MULTIPLE PROFILES
// ============================================================================

export async function runBatchGeneration(options: {
  limit?: number;
  concurrency?: number;
  dryRun?: boolean;
} = {}) {
  
  const { limit = 10000, concurrency = 5, dryRun = false } = options;
  
  console.log('\n🚀 Starting batch generation (v3 with enrichment)');
  console.log(`   Processing: ALL ungenerated brands (up to ${limit})`);
  console.log(`   Concurrency: ${concurrency}`);
  console.log(`   Dry run: ${dryRun}`);
  console.log('');
  
  // Fetch brands to generate (override Supabase default 1000 row limit)
  console.log('🔍 Querying brand_list table...');
  const { data: brands, error } = await supabase
    .from('brand_list')
    .select('brand_name, domain, slug, industry')
    .eq('profile_generated', false)
    .order('priority', { ascending: false })
    .limit(limit);
  
  console.log('   Query error:', error);
  console.log('   Brands returned:', brands?.length || 0);
  if (brands && brands.length > 0) {
    console.log('   First brand:', brands[0]);
  }
  
  if (error) {
    throw new Error(`Failed to fetch brands: ${error.message}`);
  }
  
  if (!brands || brands.length === 0) {
    console.log('\n⚠️  No brands found to generate');
    console.log('   Check that brand_list has rows with profile_generated = false');
    return { total: 0, successful: 0, failed: 0, cost: 0 };
  }
  
  console.log(`📋 Found ${brands.length} brands to generate`);
  console.log(`💰 Estimated cost: $${(brands.length * ESTIMATED_COST).toFixed(4)}\n`);
  
  if (dryRun) {
    console.log('DRY RUN - Would generate:');
    brands.slice(0, 20).forEach(b => console.log(`  - ${b.brand_name} (${b.domain})`));
    if (brands.length > 20) {
      console.log(`  ... and ${brands.length - 20} more`);
    }
    console.log(`\nEstimated cost: $${(brands.length * ESTIMATED_COST).toFixed(4)}`);
    return;
  }
  
  // Process in batches
  let successful = 0;
  let failed = 0;
  const errors: string[] = [];
  
  for (let i = 0; i < brands.length; i += concurrency) {
    const batch = brands.slice(i, i + concurrency);
    const batchNum = Math.floor(i / concurrency) + 1;
    const totalBatches = Math.ceil(brands.length / concurrency);
    
    console.log(`\n━━━ Batch ${batchNum}/${totalBatches} ━━━`);
    
    const results = await Promise.all(
      batch.map(brand => 
        generateAIProfile(brand.brand_name, brand.domain, brand.slug, brand.industry)
      )
    );
    
    results.forEach((result, idx) => {
      if (result.success) {
        successful++;
      } else {
        failed++;
        errors.push(`${batch[idx].brand_name}: ${result.error}`);
      }
    });
    
    const progress = Math.round(((i + batch.length) / brands.length) * 100);
    console.log(`\n📊 Progress: ${i + batch.length}/${brands.length} (${progress}%) | ✓ ${successful} | ✗ ${failed}`);
    
    // Rate limiting - pause between batches
    if (i + concurrency < brands.length) {
      console.log(`   ⏳ Waiting 1s before next batch...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // Final summary
  console.log('\n' + '═'.repeat(60));
  console.log('✅ BATCH GENERATION COMPLETE');
  console.log('═'.repeat(60));
  console.log(`Total brands: ${brands.length}`);
  console.log(`Successful: ${successful}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total cost: $${(successful * ESTIMATED_COST).toFixed(4)}`);
  
  if (errors.length > 0) {
    console.log('\n❌ Errors:');
    errors.slice(0, 10).forEach(err => console.log(`   - ${err}`));
    if (errors.length > 10) {
      console.log(`   ... and ${errors.length - 10} more`);
    }
  }
  
  console.log('');
  
  return {
    total: brands.length,
    successful,
    failed,
    cost: successful * ESTIMATED_COST
  };
}

// ============================================================================
// CLI RUNNER
// ============================================================================

const args = process.argv.slice(2);

if (args.includes('--help')) {
  console.log(`
Harbor AI Profile Generator v3 (with enrichment)

Now generates profiles with pricing, integrations, features, ICP, and category
in a single pass - no need to run enrich-profiles.ts separately.

Usage:
  npm run generate:profiles                    # Generate all ungenerated profiles
  npm run generate:profiles -- --limit 100     # Generate up to 100 profiles
  npm run generate:profiles -- --dry-run       # Test without generating
  npm run generate:profiles -- --concurrency 5 # Run 5 at a time

Options:
  --limit N         Max profiles to generate (default: 10000)
  --concurrency N   Number to process in parallel (default: 5)
  --dry-run         Show what would be generated without doing it
  --help            Show this help

What's included per profile:
  - Brand info (name, summary, description, offerings, FAQs)
  - Company info (location, founded, size, industry)
  - Visibility scoring (5 subscores + total)
  - Pricing (free tier, starting price, model)
  - Integrations (array of connected tools)
  - Features (array of key capabilities)
  - ICP (ideal customer profile)
  - Category (normalized software category)

Estimated cost: ~$0.0005/profile
  `);
  process.exit(0);
}

const limitIndex = args.indexOf('--limit');
const limit = limitIndex !== -1 ? parseInt(args[limitIndex + 1]) : 10000;

const concurrencyIndex = args.indexOf('--concurrency');
const concurrency = concurrencyIndex !== -1 ? parseInt(args[concurrencyIndex + 1]) : 5;

const dryRun = args.includes('--dry-run');

runBatchGeneration({ limit, concurrency, dryRun })
  .then(result => {
    console.log('Done!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });