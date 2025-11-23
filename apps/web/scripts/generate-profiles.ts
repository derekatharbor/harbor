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
 * Harbor AI Profile Generator - Updated v2
 * 
 * Changes:
 * - Multi-page crawling (/, /about, /products, /company)
 * - Switched from Claude to OpenAI (cheaper for batch generation)
 * - Structured visibility scoring with subscores
 * - Correct feed URL: https://useharbor.io/brands/{slug}/harbor.json
 * 
 * Usage:
 *   npm run generate:profiles              # Generate 10 profiles (test)
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

// Cost per profile (GPT-4o-mini): ~$0.02
const ESTIMATED_COST = 0.02;

// Candidate paths for multi-page crawling
const ABOUT_PATHS = ["/about", "/about-us", "/our-story", "/company"];
const PRODUCTS_PATHS = ["/products", "/product", "/services", "/solutions", "/what-we-do"];
const COMPANY_PATHS = ["/company", "/about", "/team", "/who-we-are"];

const MAX_CHARS_PER_PAGE = 4000;

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
}

// ============================================================================
// WEBSITE CRAWLER - Multi-page with 404-safe fallbacks
// ============================================================================

function sanitizeHtmlToText(html: string): string {
  // Remove scripts, styles, and tags
  const clean = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  return clean;
}

async function fetchFirstOkPath(baseUrl: string, paths: string[]): Promise<string | null> {
  for (const path of paths) {
    const url = new URL(path, baseUrl).toString();
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      
      const res = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        headers: {
          'User-Agent': 'HarborBot/1.0 (AI Profile Generator; +https://useharbor.io/bot)'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeout);
      
      if (res.ok) {
        const html = await res.text();
        const text = sanitizeHtmlToText(html);
        return text || null;
      }
    } catch (err) {
      // Swallow and try next path
      continue;
    }
  }
  return null;
}

function clip(text: string | null): string {
  return text ? text.slice(0, MAX_CHARS_PER_PAGE) : '';
}

async function crawlMultiplePages(domain: string): Promise<string> {
  const baseUrl = `https://${domain}`;
  
  console.log(`  → Crawling multiple pages for ${domain}...`);
  
  // Fetch all pages in parallel
  const [homepageText, aboutText, productsText, companyText] = await Promise.all([
    fetchFirstOkPath(baseUrl, ['/']),
    fetchFirstOkPath(baseUrl, ABOUT_PATHS),
    fetchFirstOkPath(baseUrl, PRODUCTS_PATHS),
    fetchFirstOkPath(baseUrl, COMPANY_PATHS),
  ]);
  
  const combinedText = [
    clip(homepageText),
    clip(aboutText),
    clip(productsText),
    clip(companyText),
  ]
    .filter(Boolean)
    .join('\n\n-----\n\n');
  
  if (!combinedText) {
    throw new Error('No content found - all pages returned 404 or empty');
  }
  
  console.log(`  → Extracted ${combinedText.length} chars from ${domain}`);
  
  return combinedText;
}

// ============================================================================
// AI PROFILE GENERATOR - OpenAI with structured scoring
// ============================================================================

async function generateProfileWithOpenAI(
  brandName: string,
  domain: string,
  websiteContent: string
): Promise<AIProfileResponse> {
  
  console.log(`  → Generating profile with OpenAI...`);
  
  const systemPrompt = `You are analyzing the public website of a brand to create an AI-ready profile and visibility score.

You will receive cleaned text from the brand's website.

Your goals:
1. Extract a concise but accurate description of the brand
2. Identify their main offerings as product lines or services (not individual SKUs)
3. Infer 3-6 realistic FAQs and answers if possible
4. Infer basic company info where reasonably clear
5. Assign visibility subscores based ONLY on the website content provided
6. Return a single JSON object matching the exact schema

If information is not present, use null or "unknown" instead of guessing.

CRITICAL: For company_info.founded_year and company_info.hq_location, ONLY include if explicitly stated on the website. If not found, use null. DO NOT infer or guess based on context.`;

  const userPrompt = `Here is cleaned text from the brand's website:

${websiteContent}

Using ONLY this text, create a profile and score the brand's AI visibility.

For visibility scoring, use this rubric:

1. brand_clarity_0_25: Is it clear what the company does and who it's for? (0-25 points)
2. offerings_clarity_0_25: Are the main products/services understandable and reusable in AI answers? (0-25 points)
3. trust_and_basics_0_20: Can you identify basic trust elements (what they do, who they serve, location/contact)? (0-20 points)
4. structure_for_ai_0_20: Is the content structured in a way that makes it easy for AI to extract (headings, sections, Q&A)? (0-20 points)
5. breadth_of_coverage_0_10: Does the site cover typical questions (what, who, how, pricing, support)? (0-10 points)

Score each subdimension strictly within its range. Sum them into total_visibility_score_0_100.

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
    "hq_location": "string or null if not found",
    "founded_year": "number or null if not found - DO NOT GUESS",
    "employee_band": "1-10|11-50|51-200|201-1000|1000+|unknown",
    "industry_tags": ["string", "string"]
  },
  "visibility_scoring": {
    "brand_clarity_0_25": 0,
    "offerings_clarity_0_25": 0,
    "trust_and_basics_0_20": 0,
    "structure_for_ai_0_20": 0,
    "breadth_of_coverage_0_10": 0,
    "total_visibility_score_0_100": 0,
    "score_rationale": "string (2-3 sentences explaining the score)"
  }
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    });
    
    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }
    
    const profile: AIProfileResponse = JSON.parse(content);
    
    // Validate and clamp scores
    const vs = profile.visibility_scoring;
    vs.brand_clarity_0_25 = Math.max(0, Math.min(25, vs.brand_clarity_0_25));
    vs.offerings_clarity_0_25 = Math.max(0, Math.min(25, vs.offerings_clarity_0_25));
    vs.trust_and_basics_0_20 = Math.max(0, Math.min(20, vs.trust_and_basics_0_20));
    vs.structure_for_ai_0_20 = Math.max(0, Math.min(20, vs.structure_for_ai_0_20));
    vs.breadth_of_coverage_0_10 = Math.max(0, Math.min(10, vs.breadth_of_coverage_0_10));
    
    // Recompute total in code (don't trust model's addition)
    const computedTotal =
      vs.brand_clarity_0_25 +
      vs.offerings_clarity_0_25 +
      vs.trust_and_basics_0_20 +
      vs.structure_for_ai_0_20 +
      vs.breadth_of_coverage_0_10;
    
    vs.total_visibility_score_0_100 = Math.max(0, Math.min(100, computedTotal));
    
    return profile;
    
  } catch (error: any) {
    console.error('Failed to generate profile with OpenAI:', error);
    throw error;
  }
}

// ============================================================================
// MAIN FUNCTION: GENERATE SINGLE PROFILE
// ============================================================================

export async function generateAIProfile(
  brandName: string,
  domain: string,
  slug: string,
  industry?: string
): Promise<{ success: boolean; profile_id?: string; error?: string }> {
  
  console.log(`\n🔍 Generating profile for ${brandName} (${domain})...`);
  
  try {
    // Step 1: Check if already exists
    const { data: existing } = await supabase
      .from('ai_profiles')
      .select('id')
      .eq('domain', domain)
      .single();
    
    if (existing) {
      console.log(`✓ Profile already exists (${existing.id})`);
      return { success: true, profile_id: existing.id };
    }
    
    // Step 2: Crawl multiple pages
    const websiteContent = await crawlMultiplePages(domain);
    
    // Step 3: Generate profile with OpenAI
    const profileData = await generateProfileWithOpenAI(brandName, domain, websiteContent);
    
    // DEBUG: Log what we got from OpenAI
    console.log(`  → Profile keys:`, Object.keys(profileData));
    console.log(`  → Has offerings:`, !!profileData.offerings);
    console.log(`  → Has FAQs:`, !!profileData.faqs);
    console.log(`  → Has company_info:`, !!profileData.company_info);
    console.log(`  → Has visibility_scoring:`, !!profileData.visibility_scoring);
    
    // Step 4: Extract visibility score
    const visibilityScore = profileData.visibility_scoring.total_visibility_score_0_100;
    console.log(`  → Visibility score: ${visibilityScore}/100`);
    console.log(`     Brand clarity: ${profileData.visibility_scoring.brand_clarity_0_25}/25`);
    console.log(`     Offerings: ${profileData.visibility_scoring.offerings_clarity_0_25}/25`);
    console.log(`     Trust: ${profileData.visibility_scoring.trust_and_basics_0_20}/20`);
    console.log(`     Structure: ${profileData.visibility_scoring.structure_for_ai_0_20}/20`);
    console.log(`     Breadth: ${profileData.visibility_scoring.breadth_of_coverage_0_10}/10`);
    
    // Step 5: Logo URL (Brandfetch)
    const logoUrl = process.env.BRANDFETCH_API_KEY 
      ? `https://img.logo.dev/${domain}?token=${process.env.BRANDFETCH_API_KEY}`
      : `https://img.logo.dev/${domain}`; // Fallback without token (lower rate limit)
    
    // Step 6: Correct feed URL
    const feedUrl = `https://useharbor.io/brands/${slug}/harbor.json`;
    
    // Step 7: Prepare feed_data with all structured info
    const feedData = {
      version: '1.0',
      generated_at: new Date().toISOString(),
      ...profileData,
      schema_url: feedUrl,
      verified: false
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
        industry: profileData.company_info.industry_tags[0] || industry || 'Unknown',
        generation_method: 'batch_v2',
        generation_cost_usd: ESTIMATED_COST,
        feed_url: feedUrl
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
  
  const { limit = 10, concurrency = 3, dryRun = false } = options;
  
  console.log('\n🚀 Starting batch generation (OpenAI v2)');
  console.log(`   Limit: ${limit}`);
  console.log(`   Concurrency: ${concurrency}`);
  console.log(`   Dry run: ${dryRun}`);
  console.log('');
  
  // Fetch brands to generate
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
  
  console.log(`📋 Found ${brands.length} brands to generate\n`);
  
  if (dryRun) {
    console.log('DRY RUN - Would generate:');
    brands.forEach(b => console.log(`  - ${b.brand_name} (${b.domain})`));
    console.log(`\nEstimated cost: $${(brands.length * ESTIMATED_COST).toFixed(2)}`);
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
    
    console.log(`\n📦 Batch ${batchNum}/${totalBatches}`);
    
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
    console.log(`\n📊 Progress: ${i + batch.length}/${brands.length} (${progress}%)`);
    console.log(`   ✓ Success: ${successful}`);
    console.log(`   ✗ Failed: ${failed}`);
    
    // Rate limiting - pause between batches
    if (i + concurrency < brands.length) {
      console.log(`   ⏳ Waiting 2s before next batch...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  // Final summary
  console.log('\n' + '='.repeat(60));
  console.log('✅ BATCH GENERATION COMPLETE');
  console.log('='.repeat(60));
  console.log(`Total brands: ${brands.length}`);
  console.log(`Successful: ${successful}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total cost: $${(successful * ESTIMATED_COST).toFixed(2)}`);
  
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
Harbor AI Profile Generator v2 (OpenAI)

Usage:
  npm run generate:profiles                    # Generate 10 profiles (default)
  npm run generate:profiles -- --limit 100     # Generate 100 profiles
  npm run generate:profiles -- --dry-run       # Test without generating
  npm run generate:profiles -- --concurrency 5 # Run 5 at a time

Options:
  --limit N         Number of profiles to generate (default: 10)
  --concurrency N   Number to process in parallel (default: 3)
  --dry-run         Show what would be generated without doing it
  --help            Show this help

Changes in v2:
  - Multi-page crawling (/, /about, /products, /company)
  - Switched to OpenAI GPT-4o-mini (~$0.02/profile vs $0.10)
  - Structured visibility scoring with subscores
  - Correct feed URL: https://useharbor.io/brands/{slug}/harbor.json
  `);
  process.exit(0);
}

const limitIndex = args.indexOf('--limit');
const limit = limitIndex !== -1 ? parseInt(args[limitIndex + 1]) : 10;

const concurrencyIndex = args.indexOf('--concurrency');
const concurrency = concurrencyIndex !== -1 ? parseInt(args[concurrencyIndex + 1]) : 3;

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