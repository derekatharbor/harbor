#!/usr/bin/env node

/**
 * Apollo CSV → brand_list Transformer
 * 
 * Takes Apollo export CSV and transforms it for Supabase brand_list import
 * Checks existing database to avoid duplicates
 * 
 * Usage:
 *   node transform-apollo-csv.js apollo-export.csv output.csv
 * 
 * Environment variables needed:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 * 
 * Expected Apollo columns (adjust based on your actual export):
 * - Name (company name)
 * - Website (domain)
 * - Industry
 * - SubIndustry (optional)
 */

const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

// ============================================================================
// DATABASE CHECK - Fetch existing domains to avoid duplicates
// ============================================================================

async function getExistingDomains() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('⚠️  Supabase credentials not found - skipping duplicate check');
    console.log('   Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to check for dupes');
    return new Set();
  }
  
  console.log('🔍 Checking existing domains in database...');
  
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/brand_list?select=domain`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const existingBrands = await response.json();
    const domains = new Set(existingBrands.map(b => b.domain));
    
    console.log(`   Found ${domains.size} existing domains in database`);
    return domains;
    
  } catch (error) {
    console.log(`   ⚠️  Could not check database: ${error.message}`);
    console.log('   Continuing without duplicate check...');
    return new Set();
  }
}

// ============================================================================
// HELPERS
// ============================================================================

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start
    .replace(/-+$/, '');            // Trim - from end
}

function cleanDomain(url) {
  if (!url) return null;
  
  // Remove protocol and www
  let domain = url
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0]
    .trim()
    .toLowerCase();
  
  return domain || null;
}

function escapeCSV(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// ============================================================================
// CSV PARSER - Handles quoted fields with commas properly
// ============================================================================

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  // Push last field
  result.push(current.trim());
  
  return result;
}

function parseCSV(text) {
  const lines = text.split('\n').filter(line => line.trim());
  if (lines.length === 0) return { headers: [], rows: [] };
  
  const headers = parseCSVLine(lines[0]);
  
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    
    const row = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx] || '';
    });
    
    rows.push(row);
  }
  
  return { headers, rows };
}

// ============================================================================
// TRANSFORMER
// ============================================================================

function transformRow(apolloRow, index) {
  // Extract fields - Apollo export column names
  const companyName = apolloRow['Company Name'] || apolloRow['Company Name for Emails'];
  const websiteUrl = apolloRow['Website'];
  const industry = apolloRow['Industry'];
  const subIndustry = apolloRow['SIC Codes'] || apolloRow['NAICS Codes']; // Using SIC/NAICS as sub-industry
  
  // Validate required fields
  if (!companyName || !websiteUrl) {
    return null; // Skip rows without name or domain
  }
  
  const domain = cleanDomain(websiteUrl);
  if (!domain) {
    return null; // Skip invalid domains
  }
  
  // Create slug from company name or domain
  const slug = slugify(companyName);
  
  // Calculate priority (you can adjust this logic)
  // For now, just use reverse index so earlier rows have higher priority
  const priority = 10000 - index;
  
  return {
    brand_name: companyName.trim(),
    domain: domain,
    slug: slug,
    industry: industry || null,
    sub_industry: subIndustry || null,
    tags: null, // Will be NULL in DB
    priority: priority,
    estimated_visibility_score: null,
    profile_generated: false,
    profile_id: null,
    generation_attempted_at: null,
    generation_error: null,
    source: 'apollo_export',
    source_metadata: JSON.stringify({
      imported_at: new Date().toISOString(),
      original_index: index
    })
  };
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length !== 2 || args.includes('--help')) {
    console.log(`
Apollo CSV → brand_list Transformer

Usage:
  node transform-apollo-csv.js <input.csv> <output.csv>

Example:
  node transform-apollo-csv.js apollo-export.csv brand-list-import.csv

This will:
1. Read your Apollo export CSV
2. Check existing domains in Supabase (requires .env with Supabase creds)
3. Extract company name, domain, industry
4. Generate slugs
5. Add required fields for brand_list table
6. Filter out duplicates (within CSV and against database)
7. Output a clean CSV ready for Supabase import

Note: Adjust the column name mappings in the script if your Apollo
export has different column names.
    `);
    process.exit(0);
  }
  
  const [inputFile, outputFile] = args;
  
  console.log('🔄 Apollo → brand_list CSV Transformer');
  console.log('');
  console.log(`📥 Input:  ${inputFile}`);
  console.log(`📤 Output: ${outputFile}`);
  console.log('');
  
  // Read input CSV
  if (!fs.existsSync(inputFile)) {
    console.error(`❌ Input file not found: ${inputFile}`);
    process.exit(1);
  }
  
  const inputText = fs.readFileSync(inputFile, 'utf-8');
  const { headers: apolloHeaders, rows: apolloRows } = parseCSV(inputText);
  
  console.log(`📊 Apollo columns found: ${apolloHeaders.join(', ')}`);
  console.log(`📋 Total rows: ${apolloRows.length}`);
  console.log('');
  
  // Get existing domains from database
  const existingDomains = await getExistingDomains();
  console.log('');
  
  // Transform rows
  console.log('⚙️  Transforming...');
  const transformedRows = [];
  let skipped = 0;
  let alreadyExists = 0;
  
  apolloRows.forEach((row, index) => {
    const transformed = transformRow(row, index);
    if (!transformed) {
      skipped++;
      return;
    }
    
    // Check if domain already exists in database
    if (existingDomains.has(transformed.domain)) {
      alreadyExists++;
      return;
    }
    
    transformedRows.push(transformed);
  });
  
  console.log(`✓ Transformed: ${transformedRows.length}`);
  console.log(`⊘ Skipped (missing name/domain): ${skipped}`);
  console.log(`⊘ Already in database: ${alreadyExists}`);
  console.log('');
  
  // Check for duplicate domains within the CSV
  const domains = transformedRows.map(r => r.domain);
  const uniqueDomains = new Set(domains);
  const duplicates = domains.length - uniqueDomains.size;
  
  if (duplicates > 0) {
    console.log(`⚠️  Warning: ${duplicates} duplicate domains within CSV (will be deduplicated)`);
    console.log('');
  }
  
  // Deduplicate by domain (keep first occurrence)
  const seen = new Set();
  const dedupedRows = transformedRows.filter(row => {
    if (seen.has(row.domain)) {
      return false;
    }
    seen.add(row.domain);
    return true;
  });
  
  console.log(`📝 Final unique brands to import: ${dedupedRows.length}`);
  console.log('');
  
  if (dedupedRows.length === 0) {
    console.log('⚠️  No new brands to import - all domains already exist in database');
    console.log('');
    process.exit(0);
  }
  
  // Write output CSV
  const outputHeaders = [
    'brand_name',
    'domain',
    'slug',
    'industry',
    'sub_industry',
    'tags',
    'priority',
    'estimated_visibility_score',
    'profile_generated',
    'profile_id',
    'generation_attempted_at',
    'generation_error',
    'source',
    'source_metadata'
  ];
  
  const outputLines = [outputHeaders.join(',')];
  
  dedupedRows.forEach(row => {
    const line = outputHeaders.map(header => escapeCSV(row[header])).join(',');
    outputLines.push(line);
  });
  
  fs.writeFileSync(outputFile, outputLines.join('\n'), 'utf-8');
  
  console.log(`✅ Output written to: ${outputFile}`);
  console.log('');
  console.log('📥 Ready to import into Supabase:');
  console.log('   1. Go to Supabase Table Editor');
  console.log('   2. Select brand_list table');
  console.log('   3. Click "Insert" → "Import data from CSV"');
  console.log('   4. Upload the output file');
  console.log('');
  console.log('🚀 After import, run:');
  console.log('   npm run generate:profiles -- --limit 100');
  console.log('');
}

// ============================================================================
// RUN
// ============================================================================

main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});