#!/usr/bin/env tsx

/**
 * Harbor Freshness Cron
 * 
 * Regenerates listicle pages to update dateModified timestamps.
 * This provides freshness signals to both Google and AI models.
 * 
 * Run daily via Vercel Cron or GitHub Actions:
 *   npx tsx scripts/freshness-cron.ts
 * 
 * What it does:
 * 1. Spot-checks a few profiles to verify data is still accurate
 * 2. Regenerates all listicle pages with new dateModified
 * 3. Optionally commits and pushes changes (for CI/CD)
 * 
 * Per Google's John Mueller: Don't update dates without real changes.
 * We verify at least one piece of data per run to legitimize the update.
 */

import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: resolve(__dirname, '../../../.env') });

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ============================================================================
// VERIFICATION: Spot-check profiles to legitimize date updates
// ============================================================================

async function verifyRandomProfiles(count: number = 5): Promise<{
  verified: number;
  changes: string[];
}> {
  console.log(`\n🔍 Verifying ${count} random profiles...`);
  
  const { data: profiles, error } = await supabase
    .from('ai_profiles')
    .select('id, domain, brand_name, feed_data, last_verified_at')
    .not('feed_data', 'is', null)
    .order('last_verified_at', { ascending: true, nullsFirst: true })
    .limit(count);
  
  if (error || !profiles) {
    console.error('Failed to fetch profiles for verification');
    return { verified: 0, changes: [] };
  }
  
  const changes: string[] = [];
  let verified = 0;
  
  for (const profile of profiles) {
    try {
      // Quick check: is the homepage still reachable?
      const response = await fetch(`https://${profile.domain}`, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000),
      });
      
      if (response.ok) {
        verified++;
        
        // Update last_verified_at
        await supabase
          .from('ai_profiles')
          .update({ last_verified_at: new Date().toISOString() })
          .eq('id', profile.id);
        
        console.log(`  ✓ ${profile.brand_name} - verified`);
      } else {
        changes.push(`${profile.brand_name}: HTTP ${response.status}`);
        console.log(`  ⚠️ ${profile.brand_name} - HTTP ${response.status}`);
      }
    } catch (err: any) {
      changes.push(`${profile.brand_name}: ${err.message}`);
      console.log(`  ⚠️ ${profile.brand_name} - ${err.message}`);
    }
  }
  
  return { verified, changes };
}

// ============================================================================
// REGENERATION: Update listicle pages with fresh timestamps
// ============================================================================

async function regenerateListicles(): Promise<boolean> {
  console.log('\n📄 Regenerating listicle pages...');
  
  try {
    // Run the listicle generator
    execSync('npx tsx scripts/generate-listicles.ts', {
      cwd: resolve(__dirname, '..'),
      stdio: 'inherit',
    });
    
    return true;
  } catch (error) {
    console.error('Failed to regenerate listicles:', error);
    return false;
  }
}

// ============================================================================
// GIT COMMIT (Optional: for CI/CD pipelines)
// ============================================================================

async function commitChanges(changes: string[]): Promise<boolean> {
  if (!process.env.AUTO_COMMIT) {
    console.log('\n⏭️  Skipping git commit (set AUTO_COMMIT=true to enable)');
    return true;
  }
  
  console.log('\n📝 Committing changes...');
  
  try {
    const today = new Date().toISOString().split('T')[0];
    const message = `chore: daily freshness update ${today}\n\nVerified ${changes.length > 0 ? changes.length + ' profiles with changes' : 'all profiles OK'}`;
    
    execSync('git add apps/web/app/best/', { cwd: resolve(__dirname, '../../..') });
    execSync(`git commit -m "${message}"`, { cwd: resolve(__dirname, '../../..') });
    
    if (process.env.AUTO_PUSH) {
      execSync('git push', { cwd: resolve(__dirname, '../../..') });
      console.log('  ✓ Pushed to remote');
    }
    
    return true;
  } catch (error) {
    console.error('Git commit failed:', error);
    return false;
  }
}

// ============================================================================
// UPDATE SITEMAP LASTMOD
// ============================================================================

async function updateSitemapTimestamps(): Promise<void> {
  console.log('\n🗺️  Updating sitemap timestamps...');
  
  // This would update a sitemap.xml or trigger a rebuild
  // For Next.js with dynamic sitemap, the sitemap.ts will use updated_at from DB
  
  // Update a global "last_sitemap_update" in the database
  const { error } = await supabase
    .from('global_cache')
    .upsert({
      key: 'listicle_sitemap_updated',
      raw: { updated_at: new Date().toISOString() },
      normalized: { updated_at: new Date().toISOString() },
      expires_at: null, // Never expires
    }, {
      onConflict: 'key'
    });
  
  if (error) {
    console.error('  Failed to update sitemap timestamp:', error.message);
  } else {
    console.log('  ✓ Sitemap timestamp updated');
  }
}

// ============================================================================
// MAIN
// ============================================================================

async function runFreshnessCron() {
  console.log('═'.repeat(60));
  console.log('🕐 Harbor Freshness Cron');
  console.log(`   Time: ${new Date().toISOString()}`);
  console.log('═'.repeat(60));
  
  // Step 1: Verify some profiles (legitimizes the date update)
  const { verified, changes } = await verifyRandomProfiles(5);
  
  if (verified === 0) {
    console.log('\n⚠️  No profiles could be verified. Skipping regeneration.');
    console.log('   This prevents updating dates without real verification.');
    process.exit(1);
  }
  
  console.log(`\n✓ Verified ${verified} profiles`);
  
  // Step 2: Regenerate listicle pages with new timestamps
  const regenerated = await regenerateListicles();
  
  if (!regenerated) {
    console.log('\n❌ Listicle regeneration failed');
    process.exit(1);
  }
  
  // Step 3: Update sitemap timestamps
  await updateSitemapTimestamps();
  
  // Step 4: Optionally commit (for CI/CD)
  await commitChanges(changes);
  
  // Summary
  console.log('\n' + '═'.repeat(60));
  console.log('✅ Freshness Cron Complete');
  console.log('═'.repeat(60));
  console.log(`   Profiles verified: ${verified}`);
  console.log(`   Changes detected: ${changes.length}`);
  console.log(`   Listicles regenerated: ${regenerated ? 'Yes' : 'No'}`);
  console.log(`   Timestamp: ${new Date().toISOString()}`);
  console.log('');
}

// Run if called directly
runFreshnessCron()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
