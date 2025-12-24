// app/lib/category-scan.server.ts
// Executes category-level AI scans for Shopify product visibility

import { supabase } from "./supabase.server";

// Model configurations
const MODELS = [
  { id: 'chatgpt', name: 'ChatGPT', provider: 'openai' },
  { id: 'claude', name: 'Claude', provider: 'anthropic' },
  { id: 'perplexity', name: 'Perplexity', provider: 'perplexity' },
  { id: 'gemini', name: 'Gemini', provider: 'google' },
];

// Prompt templates for category scanning
const PROMPT_TEMPLATES = [
  "What are the best {category} to buy in 2024?",
  "I'm looking for {category} recommendations. What should I consider?",
  "Top rated {category} for someone new to this",
];

interface CategoryGroup {
  category: string;
  products: {
    id: string;
    title: string;
    price: string | null;
    vendor: string | null;
  }[];
  heroProduct: {
    id: string;
    title: string;
  };
}

interface ScanResult {
  model: string;
  prompt: string;
  response: string;
  productsFound: string[];
  competitorsFound: string[];
  timestamp: string;
}

/**
 * Get stores that are due for scanning based on their plan frequency
 */
export async function getStoresDueForScan(): Promise<any[]> {
  const { data: stores, error } = await supabase
    .from('shopify_stores')
    .select('*')
    .not('dashboard_id', 'is', null)
    .or('next_scan_at.is.null,next_scan_at.lte.now()');

  if (error) {
    console.error('[CategoryScan] Error fetching stores:', error);
    return [];
  }

  return stores || [];
}

/**
 * Group products by category (product_type) and select hero product
 */
export async function groupProductsByCategory(storeId: string): Promise<CategoryGroup[]> {
  const { data: products, error } = await supabase
    .from('shopify_products')
    .select('id, title, handle, vendor, product_type, price, currency')
    .eq('store_id', storeId)
    .order('price', { ascending: false, nullsFirst: false });

  if (error || !products?.length) {
    console.error('[CategoryScan] Error fetching products:', error);
    return [];
  }

  // Group by product_type
  const groups = new Map<string, CategoryGroup>();

  for (const product of products) {
    const category = product.product_type || 'General';
    
    if (!groups.has(category)) {
      groups.set(category, {
        category,
        products: [],
        heroProduct: { id: product.id, title: product.title }, // First (highest priced) becomes hero
      });
    }

    groups.get(category)!.products.push({
      id: product.id,
      title: product.title,
      price: product.price,
      vendor: product.vendor,
    });
  }

  return Array.from(groups.values());
}

/**
 * Generate prompts for a category
 */
function generatePrompts(category: string): string[] {
  return PROMPT_TEMPLATES.map(template => 
    template.replace('{category}', category.toLowerCase())
  );
}

/**
 * Execute a single prompt against a model
 * Returns mock data for now - wire up to real APIs
 */
async function executePrompt(
  model: typeof MODELS[0],
  prompt: string,
  storeProducts: string[]
): Promise<ScanResult> {
  // TODO: Wire up to actual AI APIs
  // For now, return structure for testing
  
  console.log(`[CategoryScan] Would execute: ${model.name} - "${prompt}"`);
  
  // Mock response structure
  return {
    model: model.id,
    prompt,
    response: `[Mock response for ${model.name}]`,
    productsFound: [], // Will be populated by fuzzy matching
    competitorsFound: [],
    timestamp: new Date().toISOString(),
  };
}

/**
 * Fuzzy match product names in AI response
 */
function matchProducts(
  response: string,
  storeProducts: { id: string; title: string }[]
): { productId: string; title: string; position: number }[] {
  const matches: { productId: string; title: string; position: number }[] = [];
  const responseLower = response.toLowerCase();

  for (const product of storeProducts) {
    const titleLower = product.title.toLowerCase();
    
    // Try exact match first
    let position = responseLower.indexOf(titleLower);
    
    // Try partial match (first 3+ words)
    if (position === -1) {
      const words = titleLower.split(' ').slice(0, 3).join(' ');
      if (words.length > 10) {
        position = responseLower.indexOf(words);
      }
    }

    if (position !== -1) {
      matches.push({
        productId: product.id,
        title: product.title,
        position: position,
      });
    }
  }

  // Sort by position in response (earlier = better ranking)
  return matches.sort((a, b) => a.position - b.position);
}

/**
 * Extract competitor product names from response
 * (products mentioned that aren't in the store's catalog)
 */
function extractCompetitors(
  response: string,
  storeProducts: string[]
): string[] {
  // Simple heuristic: look for patterns like "Brand Name Product"
  // This is a placeholder - would need NER or more sophisticated parsing
  const competitors: string[] = [];
  
  // Common patterns: "the X from Brand", "Brand's X", "X by Brand"
  const patterns = [
    /(?:the|a)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:from|by)/g,
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)'s\s+\w+/g,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(response)) !== null) {
      const potential = match[1];
      // Filter out store's own products
      if (!storeProducts.some(p => p.toLowerCase().includes(potential.toLowerCase()))) {
        competitors.push(potential);
      }
    }
  }

  return [...new Set(competitors)]; // Dedupe
}

/**
 * Run full category scan for a store
 */
export async function runCategoryScan(storeId: string): Promise<{
  success: boolean;
  categoriesScanned: number;
  error?: string;
}> {
  console.log(`[CategoryScan] Starting scan for store: ${storeId}`);

  try {
    // 1. Group products by category
    const categories = await groupProductsByCategory(storeId);
    
    if (categories.length === 0) {
      return { success: true, categoriesScanned: 0 };
    }

    console.log(`[CategoryScan] Found ${categories.length} categories`);

    // 2. For each category, run scans
    for (const category of categories) {
      const prompts = generatePrompts(category.category);
      const allResults: ScanResult[] = [];
      const allProductMatches: Map<string, { mentions: number; bestPosition: number; models: string[] }> = new Map();

      // Run each prompt against each model
      for (const prompt of prompts.slice(0, 1)) { // Just 1 prompt per category for cost efficiency
        for (const model of MODELS) {
          const result = await executePrompt(
            model,
            prompt,
            category.products.map(p => p.title)
          );
          allResults.push(result);

          // Match store products in response
          const matches = matchProducts(
            result.response,
            category.products.map(p => ({ id: p.id, title: p.title }))
          );

          // Track matches per product
          for (let i = 0; i < matches.length; i++) {
            const match = matches[i];
            const existing = allProductMatches.get(match.productId) || {
              mentions: 0,
              bestPosition: 999,
              models: [],
            };
            existing.mentions++;
            existing.bestPosition = Math.min(existing.bestPosition, i + 1);
            existing.models.push(model.id);
            allProductMatches.set(match.productId, existing);
          }

          // Extract competitors
          result.competitorsFound = extractCompetitors(
            result.response,
            category.products.map(p => p.title)
          );
        }
      }

      // 3. Calculate category-level metrics
      const modelsWithMentions = new Set(
        allResults.filter(r => r.productsFound.length > 0).map(r => r.model)
      );
      const visibilityScore = Math.round((modelsWithMentions.size / MODELS.length) * 100);

      // Collect all competitors found
      const allCompetitors = [...new Set(allResults.flatMap(r => r.competitorsFound))];

      // 4. Save category scan
      const { data: scanRecord, error: scanError } = await supabase
        .from('shopify_category_scans')
        .insert({
          store_id: storeId,
          category: category.category,
          hero_product_id: category.heroProduct.id,
          hero_product_title: category.heroProduct.title,
          product_count: category.products.length,
          models_scanned: MODELS.map(m => m.id),
          visibility_score: visibilityScore,
          scan_results: allResults,
          competitors_found: allCompetitors,
        })
        .select('id')
        .single();

      if (scanError) {
        console.error('[CategoryScan] Error saving scan:', scanError);
        continue;
      }

      // 5. Save product-level visibility
      const productVisibilityRecords = category.products.map(product => {
        const matchData = allProductMatches.get(product.id);
        return {
          product_id: product.id,
          scan_id: scanRecord.id,
          mentioned: !!matchData,
          mention_count: matchData?.mentions || 0,
          best_position: matchData?.bestPosition || null,
          mentioned_by: matchData?.models || [],
          issues: [], // TODO: Add accuracy checking
          issue_count: 0,
        };
      });

      await supabase
        .from('shopify_product_visibility')
        .insert(productVisibilityRecords);

      console.log(`[CategoryScan] Completed category: ${category.category}`);
    }

    // 6. Update store scan timestamps
    await supabase
      .from('shopify_stores')
      .update({
        last_scan_at: new Date().toISOString(),
        next_scan_at: calculateNextScan(storeId),
      })
      .eq('id', storeId);

    return { success: true, categoriesScanned: categories.length };

  } catch (error) {
    console.error('[CategoryScan] Error:', error);
    return { success: false, categoriesScanned: 0, error: String(error) };
  }
}

/**
 * Calculate next scan date based on store's plan
 */
async function calculateNextScan(storeId: string): Promise<string> {
  const { data: store } = await supabase
    .from('shopify_stores')
    .select('scan_frequency')
    .eq('id', storeId)
    .single();

  const frequency = store?.scan_frequency || 'monthly';
  const now = new Date();

  switch (frequency) {
    case 'daily':
      now.setDate(now.getDate() + 1);
      break;
    case 'weekly':
      now.setDate(now.getDate() + 7);
      break;
    case 'monthly':
    default:
      now.setDate(now.getDate() + 30);
      break;
  }

  return now.toISOString();
}

/**
 * Get visibility summary for a store's dashboard
 */
export async function getStoreVisibilitySummary(storeId: string): Promise<{
  overallScore: number | null;
  totalMentions: number;
  categoriesTracked: number;
  topIssues: any[];
  lastScanAt: string | null;
}> {
  // Get latest scan per category
  const { data: latestScans } = await supabase
    .from('shopify_category_scans')
    .select('*')
    .eq('store_id', storeId)
    .order('scanned_at', { ascending: false })
    .limit(50);

  if (!latestScans?.length) {
    return {
      overallScore: null,
      totalMentions: 0,
      categoriesTracked: 0,
      topIssues: [],
      lastScanAt: null,
    };
  }

  // Dedupe to get latest per category
  const latestPerCategory = new Map<string, typeof latestScans[0]>();
  for (const scan of latestScans) {
    if (!latestPerCategory.has(scan.category)) {
      latestPerCategory.set(scan.category, scan);
    }
  }

  const scans = Array.from(latestPerCategory.values());

  // Calculate overall visibility score (average across categories)
  const validScores = scans.filter(s => s.visibility_score !== null);
  const overallScore = validScores.length > 0
    ? Math.round(validScores.reduce((sum, s) => sum + s.visibility_score, 0) / validScores.length)
    : null;

  // Get total mentions from product visibility
  const scanIds = scans.map(s => s.id);
  const { count: mentionCount } = await supabase
    .from('shopify_product_visibility')
    .select('*', { count: 'exact', head: true })
    .in('scan_id', scanIds)
    .eq('mentioned', true);

  // Get top issues (placeholder - would come from accuracy checking)
  const topIssues: any[] = [];

  return {
    overallScore,
    totalMentions: mentionCount || 0,
    categoriesTracked: scans.length,
    topIssues,
    lastScanAt: scans[0]?.scanned_at || null,
  };
}
