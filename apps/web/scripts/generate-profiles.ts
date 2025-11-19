#!/usr/bin/env tsx
/**
 * Harbor AI Profile Generator
 * 
 * Usage:
 *   npm run generate:profiles              # Generate 10 profiles (test)
 *   npm run generate:profiles -- --limit 100
 *   npm run generate:profiles -- --dry-run
 */

import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

// ============================================================================
// SETUP
// ============================================================================

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Cost per profile (Claude Sonnet 4): ~$0.10
const ESTIMATED_COST = 0.10;

// ============================================================================
// WEBSITE CRAWLER
// ============================================================================

async function crawlWebsite(domain: string): Promise<string> {
  const url = domain.startsWith('http') ? domain : `https://${domain}`;
  
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'HarborBot/1.0 (AI Profile Generator; +https://harbor.io/bot)'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeout);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const html = await response.text();
    
    // Simple text extraction (remove scripts, styles, etc)
    const cleanText = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 10000); // Limit to 10K chars
    
    return cleanText;
    
  } catch (error: any) {
    console.error(`Failed to crawl ${domain}:`, error);
    throw new Error(`Crawl failed: ${error.message}`);
  }
}

// ============================================================================
// AI PROFILE GENERATOR
// ============================================================================

async function generateProfile(
  brandName: string,
  domain: string,
  websiteContent: string
): Promise<any> {
  
  const prompt = `You are generating a structured AI Profile for the brand "${brandName}" (${domain}).

This profile will be consumed by AI systems (ChatGPT, Claude, Perplexity, Gemini) to provide accurate information about the brand.

WEBSITE CONTENT:
${websiteContent}

TASK:
Generate a complete AI Profile in JSON format with this exact structure:

{
  "version": "1.0",
  "generated_at": "${new Date().toISOString()}",
  "name": "${brandName}",
  "description": "Clear 2-3 sentence description of what the brand does",
  "website": "https://${domain}",
  "industry": "Industry category",
  "contact": {
    "email": "if found on website",
    "phone": "if found"
  },
  "social_links": [
    {"platform": "twitter", "url": "https://twitter.com/..."},
    {"platform": "linkedin", "url": "https://linkedin.com/company/..."}
  ],
  "products": [
    {
      "name": "Product name",
      "description": "What it does (1-2 sentences)",
      "category": "Product type",
      "url": "Product page URL"
    }
  ],
  "faqs": [
    {
      "question": "Common question",
      "answer": "Clear answer"
    }
  ],
  "key_facts": [
    "Founded in YEAR (if found)",
    "Headquarters location (if found)",
    "Known for X"
  ]
}

CRITICAL RULES:
1. Output ONLY valid JSON, nothing else
2. Be factual - only include verifiable info from the website
3. Keep descriptions clear and concise
4. Include 3-5 products if this is a product company
5. Include 3-5 FAQs answering common questions about this type of business
6. If you can't find certain data, omit that field entirely
7. No marketing fluff - just facts

Generate the profile now:`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });
    
    const firstContent = message.content[0];
    if (firstContent.type !== 'text') {
      throw new Error('Expected text response from Claude');
    }
    const content = firstContent.text;
    
    // Extract JSON (handle markdown code blocks)
    let jsonText = content;
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1];
    }
    
    const profile = JSON.parse(jsonText.trim());
    
    // Add verified: false flag
    profile.verified = false;
    profile.schema_url = `https://${domain}/.well-known/harbor-feed.json`;
    
    return profile;
    
  } catch (error: any) {
    console.error('Failed to generate profile:', error);
    throw error;
  }
}

// ============================================================================
// VISIBILITY SCORE CALCULATOR
// ============================================================================

function calculateVisibilityScore(profile: any): number {
  let score = 0;
  
  // Product count (0-40 points)
  const productCount = profile.products?.length || 0;
  score += Math.min(productCount * 8, 40);
  
  // Schema URL present (30 points)
  if (profile.schema_url) score += 30;
  
  // Content richness (30 points)
  if (profile.description?.length > 100) score += 10;
  if (profile.faqs?.length >= 3) score += 10;
  if (profile.social_links?.length >= 2) score += 10;
  
  return Math.min(Math.max(score, 0), 100);
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
  
  console.log(`\n📝 Generating profile for ${brandName} (${domain})...`);
  
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
    
    // Step 2: Crawl website
    console.log(`  → Crawling ${domain}...`);
    const websiteContent = await crawlWebsite(domain);
    
    // Step 3: Generate profile with Claude
    console.log(`  → Generating with Claude...`);
    const feedData = await generateProfile(brandName, domain, websiteContent);
    
    // Step 4: Calculate visibility score
    const visibilityScore = calculateVisibilityScore(feedData);
    console.log(`  → Visibility score: ${visibilityScore}%`);
    
    // Step 5: Extract logo (using Clearbit or similar)
    const logoUrl = `https://logo.clearbit.com/${domain}`;
    
    // Step 6: Save to database
    const { data: profile, error: dbError } = await supabase
      .from('ai_profiles')
      .insert({
        brand_name: brandName,
        slug: slug,
        domain: domain,
        logo_url: logoUrl,
        feed_data: feedData,
        visibility_score: visibilityScore,
        industry: feedData.industry || industry,
        generation_method: 'batch',
        generation_cost_usd: ESTIMATED_COST,
        feed_url: `https://${slug}.harbor.io/ai-profile.json`
      })
      .select('id')
      .single();
    
    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`);
    }
    
    // Step 7: Update brand_list
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
  
  console.log('\n🚀 Starting batch generation');
  console.log(`   Limit: ${limit}`);
  console.log(`   Concurrency: ${concurrency}`);
  console.log(`   Dry run: ${dryRun}`);
  console.log('');
  
  // Fetch brands to generate
  const { data: brands, error } = await supabase
    .from('brand_list')
    .select('brand_name, domain, slug, industry')
    .eq('profile_generated', false)
    .order('priority', { ascending: false })
    .limit(limit);
  
  if (error || !brands) {
    throw new Error(`Failed to fetch brands: ${error?.message}`);
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

// Parse CLI arguments
const args = process.argv.slice(2);

if (args.includes('--help')) {
  console.log(`
Harbor AI Profile Generator

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
  `);
  process.exit(0);
}

const limit = parseInt(args.find(a => a.startsWith('--limit'))?.split('=')[1] || 
                      args[args.indexOf('--limit') + 1] || '10');
const concurrency = parseInt(args.find(a => a.startsWith('--concurrency'))?.split('=')[1] || 
                            args[args.indexOf('--concurrency') + 1] || '3');
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