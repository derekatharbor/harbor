#!/usr/bin/env tsx

import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: resolve(__dirname, '../../../.env') });

/**
 * Harbor Citation Detector
 * 
 * Monitors AI platforms for citations of Harbor pages.
 * 
 * Methods:
 * 1. Perplexity API - Direct queries to check for useharbor.io citations
 * 2. Search API - Check if AI platforms are citing our pages
 * 3. Manual logging - API for users to report citations
 * 
 * Usage:
 *   npx tsx scripts/detect-citations.ts                    # Run all checks
 *   npx tsx scripts/detect-citations.ts --query "best crm" # Check specific query
 *   npx tsx scripts/detect-citations.ts --perplexity       # Only Perplexity checks
 *   npx tsx scripts/detect-citations.ts --dry-run          # Preview without saving
 */

import { createClient } from '@supabase/supabase-js';

// ============================================================================
// SETUP
// ============================================================================

console.log('🔑 Checking environment variables...');
console.log('   PERPLEXITY_API_KEY:', process.env.PERPLEXITY_API_KEY ? '✓ Loaded' : '✗ Missing (optional)');
console.log('   SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ Loaded' : '✗ Missing');
console.log('   SERVICE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✓ Loaded' : '✗ Missing');
console.log('');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const HARBOR_DOMAIN = 'useharbor.io';

// ============================================================================
// TYPES
// ============================================================================

interface Citation {
  source: 'perplexity' | 'chatgpt' | 'gemini' | 'copilot' | 'bing' | 'google' | 'other';
  source_url?: string;
  source_query?: string;
  cited_url: string;
  cited_slug?: string;
  cited_page_type?: 'brand_profile' | 'category_page' | 'listicle' | 'homepage' | 'other';
  citation_type?: 'direct_link' | 'quote' | 'paraphrase' | 'reference' | 'unknown';
  snippet?: string;
  detected_by: string;
  metadata?: Record<string, any>;
}

interface PerplexityResponse {
  id: string;
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
  }>;
  citations?: string[];
}

// ============================================================================
// PERPLEXITY API CHECK
// ============================================================================

async function checkPerplexityQuery(query: string): Promise<Citation[]> {
  if (!process.env.PERPLEXITY_API_KEY) {
    console.log('  ⚠️  Skipping Perplexity check (no API key)');
    return [];
  }

  console.log(`  → Querying Perplexity: "${query}"`);

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'user',
            content: query,
          }
        ],
        return_citations: true,
      }),
    });

    if (!response.ok) {
      console.error(`  ✗ Perplexity API error: ${response.status}`);
      return [];
    }

    const data = await response.json() as PerplexityResponse;
    const citations: Citation[] = [];

    // Check if any citations include useharbor.io
    const allCitations = data.citations || [];
    const responseText = data.choices?.[0]?.message?.content || '';

    for (const citationUrl of allCitations) {
      if (citationUrl.includes(HARBOR_DOMAIN)) {
        console.log(`  🎯 FOUND CITATION: ${citationUrl}`);
        
        // Extract slug from URL
        const slugMatch = citationUrl.match(/\/brands\/([^\/\?]+)/);
        const slug = slugMatch ? slugMatch[1] : undefined;

        // Determine page type
        let pageType: Citation['cited_page_type'] = 'other';
        if (citationUrl.includes('/brands/') && slug) {
          pageType = 'brand_profile';
        } else if (citationUrl.includes('/best-') || citationUrl.includes('/top-')) {
          pageType = 'listicle';
        } else if (citationUrl === `https://${HARBOR_DOMAIN}` || citationUrl === `https://${HARBOR_DOMAIN}/`) {
          pageType = 'homepage';
        }

        citations.push({
          source: 'perplexity',
          source_query: query,
          cited_url: citationUrl,
          cited_slug: slug,
          cited_page_type: pageType,
          citation_type: 'direct_link',
          snippet: responseText.slice(0, 500),
          detected_by: 'perplexity_api',
          metadata: {
            perplexity_id: data.id,
            all_citations: allCitations,
          },
        });
      }
    }

    // Also check response text for mentions without direct citations
    if (responseText.toLowerCase().includes(HARBOR_DOMAIN) || responseText.toLowerCase().includes('harbor')) {
      const existingUrls = citations.map(c => c.cited_url);
      
      // Look for URLs in the text
      const urlRegex = new RegExp(`https?://${HARBOR_DOMAIN}[^\\s"'<>]*`, 'gi');
      const foundUrls = responseText.match(urlRegex) || [];
      
      for (const url of foundUrls) {
        if (!existingUrls.includes(url)) {
          console.log(`  🎯 FOUND URL IN TEXT: ${url}`);
          
          const slugMatch = url.match(/\/brands\/([^\/\?]+)/);
          citations.push({
            source: 'perplexity',
            source_query: query,
            cited_url: url,
            cited_slug: slugMatch ? slugMatch[1] : undefined,
            cited_page_type: 'other',
            citation_type: 'reference',
            snippet: responseText.slice(0, 500),
            detected_by: 'perplexity_api',
          });
        }
      }
    }

    if (citations.length === 0) {
      console.log(`  → No Harbor citations found`);
    }

    return citations;

  } catch (error: any) {
    console.error(`  ✗ Perplexity error: ${error.message}`);
    return [];
  }
}

// ============================================================================
// SAVE CITATIONS TO DATABASE
// ============================================================================

async function saveCitation(citation: Citation): Promise<boolean> {
  try {
    // Check for duplicates (same source + URL within 24 hours)
    const { data: existing } = await supabase
      .from('citations')
      .select('id')
      .eq('source', citation.source)
      .eq('cited_url', citation.cited_url)
      .gte('detected_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .single();

    if (existing) {
      console.log(`  → Duplicate citation (already logged within 24h)`);
      return false;
    }

    const { error } = await supabase
      .from('citations')
      .insert({
        source: citation.source,
        source_url: citation.source_url,
        source_query: citation.source_query,
        cited_url: citation.cited_url,
        cited_slug: citation.cited_slug,
        cited_page_type: citation.cited_page_type,
        citation_type: citation.citation_type,
        snippet: citation.snippet,
        detected_by: citation.detected_by,
        metadata: citation.metadata,
      });

    if (error) {
      console.error(`  ✗ Failed to save citation: ${error.message}`);
      return false;
    }

    console.log(`  ✓ Citation saved to database`);
    return true;

  } catch (error: any) {
    console.error(`  ✗ Database error: ${error.message}`);
    return false;
  }
}

// ============================================================================
// LOG CITATION CHECK
// ============================================================================

async function logCheck(checkType: string, query: string, foundCitation: boolean, citationId?: string) {
  await supabase.from('citation_checks').insert({
    check_type: checkType,
    query,
    found_citation: foundCitation,
    citation_id: citationId,
  });
}

// ============================================================================
// RUN MONITORING QUERIES
// ============================================================================

async function runMonitoringQueries(limit: number = 10): Promise<{ total: number; found: number }> {
  console.log('\n📋 Fetching monitoring queries...');

  const { data: queries, error } = await supabase
    .from('citation_monitor_queries')
    .select('id, query, category')
    .eq('enabled', true)
    .order('priority', { ascending: false })
    .order('last_checked_at', { ascending: true, nullsFirst: true })
    .limit(limit);

  if (error || !queries?.length) {
    console.log('  No monitoring queries found');
    return { total: 0, found: 0 };
  }

  console.log(`  Found ${queries.length} queries to check\n`);

  let totalCitations = 0;

  for (const q of queries) {
    console.log(`\n━━━ Query: "${q.query}" (${q.category || 'uncategorized'}) ━━━`);

    const citations = await checkPerplexityQuery(q.query);
    
    // Save citations
    for (const citation of citations) {
      const saved = await saveCitation(citation);
      if (saved) totalCitations++;
    }

    // Log the check
    await logCheck('perplexity_query', q.query, citations.length > 0);

    // Update last checked
    await supabase
      .from('citation_monitor_queries')
      .update({
        last_checked_at: new Date().toISOString(),
        total_checks: (q as any).total_checks + 1,
        citations_found: (q as any).citations_found + citations.length,
      })
      .eq('id', q.id);

    // Rate limit - wait 2 seconds between queries
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  return { total: queries.length, found: totalCitations };
}

// ============================================================================
// SUMMARY REPORT
// ============================================================================

async function printSummary() {
  console.log('\n' + '═'.repeat(60));
  console.log('📊 CITATION SUMMARY');
  console.log('═'.repeat(60));

  // Total citations by source
  const { data: bySource } = await supabase
    .from('citations')
    .select('source')
    .then(({ data }) => {
      const counts: Record<string, number> = {};
      data?.forEach(row => {
        counts[row.source] = (counts[row.source] || 0) + 1;
      });
      return { data: counts };
    });

  console.log('\nCitations by source:');
  for (const [source, count] of Object.entries(bySource || {})) {
    console.log(`  ${source}: ${count}`);
  }

  // Recent citations
  const { data: recent } = await supabase
    .from('citations')
    .select('source, cited_url, detected_at')
    .order('detected_at', { ascending: false })
    .limit(5);

  if (recent?.length) {
    console.log('\nRecent citations:');
    for (const c of recent) {
      const date = new Date(c.detected_at).toLocaleDateString();
      console.log(`  [${date}] ${c.source}: ${c.cited_url}`);
    }
  }

  // Top cited slugs
  const { data: topSlugs } = await supabase
    .from('citations')
    .select('cited_slug')
    .not('cited_slug', 'is', null)
    .then(({ data }) => {
      const counts: Record<string, number> = {};
      data?.forEach(row => {
        if (row.cited_slug) {
          counts[row.cited_slug] = (counts[row.cited_slug] || 0) + 1;
        }
      });
      return { 
        data: Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5) 
      };
    });

  if (topSlugs?.length) {
    console.log('\nTop cited brands:');
    for (const [slug, count] of topSlugs) {
      console.log(`  ${slug}: ${count} citations`);
    }
  }

  console.log('');
}

// ============================================================================
// CLI
// ============================================================================

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help')) {
    console.log(`
Harbor Citation Detector

Monitors AI platforms for citations of Harbor pages.

Usage:
  npx tsx scripts/detect-citations.ts                    # Run monitoring queries
  npx tsx scripts/detect-citations.ts --query "best crm" # Check specific query
  npx tsx scripts/detect-citations.ts --limit 20         # Check 20 queries
  npx tsx scripts/detect-citations.ts --summary          # Show citation summary
  npx tsx scripts/detect-citations.ts --dry-run          # Preview without saving

Options:
  --query "..."    Check a specific query
  --limit N        Number of monitoring queries to check (default: 10)
  --summary        Show citation summary and exit
  --dry-run        Don't save to database
  --help           Show this help

Environment:
  PERPLEXITY_API_KEY    Required for Perplexity checks
  SUPABASE_URL          Required
  SUPABASE_SERVICE_KEY  Required
`);
    process.exit(0);
  }

  // Summary only mode
  if (args.includes('--summary')) {
    await printSummary();
    process.exit(0);
  }

  const dryRun = args.includes('--dry-run');
  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No data will be saved\n');
  }

  // Single query mode
  const queryIndex = args.indexOf('--query');
  if (queryIndex !== -1 && args[queryIndex + 1]) {
    const query = args[queryIndex + 1];
    console.log(`\n🔍 Checking single query: "${query}"\n`);
    
    const citations = await checkPerplexityQuery(query);
    
    if (!dryRun) {
      for (const citation of citations) {
        await saveCitation(citation);
      }
      await logCheck('perplexity_query', query, citations.length > 0);
    }
    
    console.log(`\n✅ Found ${citations.length} citations`);
    process.exit(0);
  }

  // Batch monitoring mode
  const limitIndex = args.indexOf('--limit');
  const limit = limitIndex !== -1 ? parseInt(args[limitIndex + 1]) : 10;

  console.log('🚀 Starting Citation Detection');
  console.log(`   Checking up to ${limit} monitoring queries`);
  console.log('');

  const results = await runMonitoringQueries(limit);

  console.log('\n' + '═'.repeat(60));
  console.log('✅ DETECTION COMPLETE');
  console.log('═'.repeat(60));
  console.log(`Queries checked: ${results.total}`);
  console.log(`Citations found: ${results.found}`);

  await printSummary();
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
