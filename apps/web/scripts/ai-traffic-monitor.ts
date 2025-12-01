#!/usr/bin/env tsx

/**
 * Harbor AI Traffic Monitor
 * 
 * Tracks AI bot visits and referrer traffic from AI platforms.
 * This is how we detect when AI systems are crawling or citing Harbor.
 * 
 * What we track:
 * 1. AI Crawler visits (GPTBot, ClaudeBot, PerplexityBot, etc.)
 * 2. AI Search bot visits (OAI-SearchBot, etc.)
 * 3. AI User agent visits (ChatGPT-User - real-time citations!)
 * 4. Referrer traffic from AI platforms (chatgpt.com, perplexity.ai, etc.)
 * 
 * Data sources:
 * - Vercel Analytics API (if available)
 * - Middleware logging (recommended)
 * - Manual log imports
 * 
 * Usage:
 *   npx tsx scripts/ai-traffic-monitor.ts --summary
 *   npx tsx scripts/ai-traffic-monitor.ts --import logs.json
 */

import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: resolve(__dirname, '../../../.env') });

// ============================================================================
// AI BOT DEFINITIONS - Keep this updated!
// ============================================================================

export const AI_BOTS = {
  // OpenAI
  'GPTBot': {
    company: 'OpenAI',
    purpose: 'training',
    description: 'Collects data for training GPT models',
    pattern: /GPTBot/i,
  },
  'OAI-SearchBot': {
    company: 'OpenAI',
    purpose: 'search_index',
    description: 'Indexes pages for ChatGPT Search/SearchGPT',
    pattern: /OAI-SearchBot/i,
  },
  'ChatGPT-User': {
    company: 'OpenAI',
    purpose: 'realtime_citation',
    description: 'Real-time fetching when users ask questions - THIS IS A CITATION!',
    pattern: /ChatGPT-User/i,
  },

  // Anthropic
  'ClaudeBot': {
    company: 'Anthropic',
    purpose: 'realtime_citation',
    description: 'Retrieves URLs for citations during Claude sessions',
    pattern: /ClaudeBot/i,
  },
  'anthropic-ai': {
    company: 'Anthropic',
    purpose: 'training',
    description: 'Collects data for training Claude models',
    pattern: /anthropic-ai/i,
  },
  'Claude-Web': {
    company: 'Anthropic',
    purpose: 'realtime_citation',
    description: 'Claude web browsing',
    pattern: /Claude-Web/i,
  },

  // Google
  'Google-Extended': {
    company: 'Google',
    purpose: 'training',
    description: 'Collects data for Gemini/Bard training',
    pattern: /Google-Extended/i,
  },
  'Googlebot': {
    company: 'Google',
    purpose: 'search_index',
    description: 'Standard Google search indexing',
    pattern: /Googlebot/i,
  },

  // Perplexity
  'PerplexityBot': {
    company: 'Perplexity',
    purpose: 'search_index',
    description: 'Indexes pages for Perplexity search',
    pattern: /PerplexityBot/i,
  },

  // Microsoft/Bing
  'Bingbot': {
    company: 'Microsoft',
    purpose: 'search_index',
    description: 'Bing search indexing (also powers Copilot)',
    pattern: /bingbot/i,
  },

  // Meta
  'meta-externalagent': {
    company: 'Meta',
    purpose: 'search_index',
    description: 'Meta AI search and training',
    pattern: /meta-externalagent/i,
  },
  'FacebookExternalHit': {
    company: 'Meta',
    purpose: 'preview',
    description: 'Facebook link previews (also used by Meta AI)',
    pattern: /facebookexternalhit/i,
  },

  // Apple
  'Applebot': {
    company: 'Apple',
    purpose: 'search_index',
    description: 'Apple search and Siri',
    pattern: /Applebot/i,
  },
  'Applebot-Extended': {
    company: 'Apple',
    purpose: 'training',
    description: 'Apple AI training data collection',
    pattern: /Applebot-Extended/i,
  },

  // Amazon
  'Amazonbot': {
    company: 'Amazon',
    purpose: 'search_index',
    description: 'Amazon search and Alexa',
    pattern: /Amazonbot/i,
  },

  // Cohere
  'cohere-ai': {
    company: 'Cohere',
    purpose: 'training',
    description: 'Cohere AI training',
    pattern: /cohere-ai/i,
  },

  // You.com
  'YouBot': {
    company: 'You.com',
    purpose: 'search_index',
    description: 'You.com AI search',
    pattern: /YouBot/i,
  },

  // Common Crawl (used by many AI companies)
  'CCBot': {
    company: 'Common Crawl',
    purpose: 'training',
    description: 'Common Crawl - data used by many AI companies',
    pattern: /CCBot/i,
  },

  // ByteDance
  'Bytespider': {
    company: 'ByteDance',
    purpose: 'training',
    description: 'ByteDance AI training (TikTok parent)',
    pattern: /Bytespider/i,
  },
};

// Referrer domains that indicate AI traffic
export const AI_REFERRERS = {
  'chat.openai.com': { company: 'OpenAI', product: 'ChatGPT' },
  'chatgpt.com': { company: 'OpenAI', product: 'ChatGPT' },
  'perplexity.ai': { company: 'Perplexity', product: 'Perplexity' },
  'www.perplexity.ai': { company: 'Perplexity', product: 'Perplexity' },
  'claude.ai': { company: 'Anthropic', product: 'Claude' },
  'www.claude.ai': { company: 'Anthropic', product: 'Claude' },
  'gemini.google.com': { company: 'Google', product: 'Gemini' },
  'bard.google.com': { company: 'Google', product: 'Bard' },
  'copilot.microsoft.com': { company: 'Microsoft', product: 'Copilot' },
  'www.bing.com': { company: 'Microsoft', product: 'Bing (possible Copilot)' },
  'you.com': { company: 'You.com', product: 'You.com' },
  'www.you.com': { company: 'You.com', product: 'You.com' },
  'poe.com': { company: 'Quora', product: 'Poe' },
  'www.poe.com': { company: 'Quora', product: 'Poe' },
  'labs.google.com': { company: 'Google', product: 'Google Labs AI' },
  'aistudio.google.com': { company: 'Google', product: 'AI Studio' },
};

// ============================================================================
// TYPES
// ============================================================================

interface BotVisit {
  timestamp: string;
  user_agent: string;
  bot_name: string;
  company: string;
  purpose: string;
  url_visited: string;
  ip_address?: string;
  metadata?: Record<string, any>;
}

interface ReferrerVisit {
  timestamp: string;
  referrer: string;
  referrer_domain: string;
  company: string;
  product: string;
  landing_page: string;
  metadata?: Record<string, any>;
}

// ============================================================================
// DETECTION FUNCTIONS
// ============================================================================

export function detectBot(userAgent: string): { 
  isBot: boolean; 
  botName?: string; 
  company?: string; 
  purpose?: string;
  description?: string;
} {
  for (const [botName, botInfo] of Object.entries(AI_BOTS)) {
    if (botInfo.pattern.test(userAgent)) {
      return {
        isBot: true,
        botName,
        company: botInfo.company,
        purpose: botInfo.purpose,
        description: botInfo.description,
      };
    }
  }
  return { isBot: false };
}

export function detectAIReferrer(referrer: string): {
  isAI: boolean;
  company?: string;
  product?: string;
} {
  if (!referrer) return { isAI: false };
  
  try {
    const url = new URL(referrer);
    const domain = url.hostname.toLowerCase();
    
    const match = AI_REFERRERS[domain as keyof typeof AI_REFERRERS];
    if (match) {
      return {
        isAI: true,
        company: match.company,
        product: match.product,
      };
    }
  } catch {
    // Invalid URL
  }
  
  return { isAI: false };
}

// ============================================================================
// DATABASE STORAGE
// ============================================================================

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function logBotVisit(visit: BotVisit): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('ai_bot_visits')
      .insert({
        timestamp: visit.timestamp,
        user_agent: visit.user_agent,
        bot_name: visit.bot_name,
        company: visit.company,
        purpose: visit.purpose,
        url_visited: visit.url_visited,
        ip_address: visit.ip_address,
        metadata: visit.metadata,
      });

    if (error) {
      console.error('Failed to log bot visit:', error.message);
      return false;
    }

    // If this is a realtime citation bot, also log as a citation!
    if (visit.purpose === 'realtime_citation') {
      await supabase.from('citations').insert({
        source: visit.company.toLowerCase() === 'openai' ? 'chatgpt' : 
                visit.company.toLowerCase() === 'anthropic' ? 'claude' : 'other',
        cited_url: visit.url_visited,
        cited_slug: extractSlugFromUrl(visit.url_visited),
        cited_page_type: detectPageType(visit.url_visited),
        citation_type: 'direct_link',
        detected_by: 'bot_visit',
        metadata: { bot_name: visit.bot_name, user_agent: visit.user_agent },
      });
    }

    return true;
  } catch (error: any) {
    console.error('Database error:', error.message);
    return false;
  }
}

async function logReferrerVisit(visit: ReferrerVisit): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('ai_referrer_visits')
      .insert({
        timestamp: visit.timestamp,
        referrer: visit.referrer,
        referrer_domain: visit.referrer_domain,
        company: visit.company,
        product: visit.product,
        landing_page: visit.landing_page,
        metadata: visit.metadata,
      });

    if (error) {
      console.error('Failed to log referrer visit:', error.message);
      return false;
    }

    // Also log as a citation - someone clicked through from an AI platform!
    await supabase.from('citations').insert({
      source: visit.company.toLowerCase().includes('openai') ? 'chatgpt' :
              visit.company.toLowerCase().includes('perplexity') ? 'perplexity' :
              visit.company.toLowerCase().includes('anthropic') ? 'claude' :
              visit.company.toLowerCase().includes('google') ? 'gemini' :
              visit.company.toLowerCase().includes('microsoft') ? 'copilot' : 'other',
      cited_url: visit.landing_page,
      cited_slug: extractSlugFromUrl(visit.landing_page),
      cited_page_type: detectPageType(visit.landing_page),
      citation_type: 'direct_link',
      detected_by: 'referrer_traffic',
      metadata: { referrer: visit.referrer, product: visit.product },
    });

    return true;
  } catch (error: any) {
    console.error('Database error:', error.message);
    return false;
  }
}

// ============================================================================
// HELPERS
// ============================================================================

function extractSlugFromUrl(url: string): string | null {
  const match = url.match(/\/brands\/([^\/\?]+)/);
  return match ? match[1] : null;
}

function detectPageType(url: string): string {
  if (url.includes('/brands/') && extractSlugFromUrl(url)) {
    return 'brand_profile';
  } else if (url.includes('/best-') || url.includes('/top-')) {
    return 'listicle';
  } else if (url.match(/useharbor\.io\/?$/)) {
    return 'homepage';
  } else if (url.includes('/api/harbor-feed')) {
    return 'api_feed';
  }
  return 'other';
}

// ============================================================================
// SUMMARY REPORT
// ============================================================================

async function printSummary() {
  console.log('\n' + '═'.repeat(60));
  console.log('📊 AI TRAFFIC SUMMARY');
  console.log('═'.repeat(60));

  // Bot visits by company
  const { data: botVisits } = await supabase
    .from('ai_bot_visits')
    .select('company, purpose, bot_name')
    .order('timestamp', { ascending: false });

  if (botVisits?.length) {
    console.log('\n🤖 Bot Visits by Company:');
    const byCompany: Record<string, number> = {};
    const byPurpose: Record<string, number> = {};
    
    botVisits.forEach(v => {
      byCompany[v.company] = (byCompany[v.company] || 0) + 1;
      byPurpose[v.purpose] = (byPurpose[v.purpose] || 0) + 1;
    });
    
    for (const [company, count] of Object.entries(byCompany).sort((a, b) => b[1] - a[1])) {
      console.log(`   ${company}: ${count} visits`);
    }
    
    console.log('\n📋 By Purpose:');
    for (const [purpose, count] of Object.entries(byPurpose).sort((a, b) => b[1] - a[1])) {
      const emoji = purpose === 'realtime_citation' ? '🎯' : 
                    purpose === 'search_index' ? '🔍' : '📚';
      console.log(`   ${emoji} ${purpose}: ${count}`);
    }
  } else {
    console.log('\n   No bot visits recorded yet');
  }

  // Referrer traffic
  const { data: referrerVisits } = await supabase
    .from('ai_referrer_visits')
    .select('company, product')
    .order('timestamp', { ascending: false });

  if (referrerVisits?.length) {
    console.log('\n🔗 Referrer Traffic (clicks from AI platforms):');
    const byProduct: Record<string, number> = {};
    
    referrerVisits.forEach(v => {
      byProduct[v.product] = (byProduct[v.product] || 0) + 1;
    });
    
    for (const [product, count] of Object.entries(byProduct).sort((a, b) => b[1] - a[1])) {
      console.log(`   ${product}: ${count} clicks`);
    }
  } else {
    console.log('\n   No AI referrer traffic recorded yet');
  }

  // Citation summary
  const { data: citations } = await supabase
    .from('citations')
    .select('source, detected_by')
    .order('detected_at', { ascending: false });

  if (citations?.length) {
    console.log('\n🎯 Total Citations Detected:');
    const bySource: Record<string, number> = {};
    
    citations.forEach(c => {
      bySource[c.source] = (bySource[c.source] || 0) + 1;
    });
    
    for (const [source, count] of Object.entries(bySource).sort((a, b) => b[1] - a[1])) {
      console.log(`   ${source}: ${count}`);
    }
  }

  console.log('\n' + '═'.repeat(60));
}

// ============================================================================
// EXPORT FOR MIDDLEWARE USE
// ============================================================================

export { logBotVisit, logReferrerVisit };

// ============================================================================
// CLI
// ============================================================================

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help')) {
    console.log(`
Harbor AI Traffic Monitor

Tracks AI bot visits and referrer traffic from AI platforms.

Usage:
  npx tsx scripts/ai-traffic-monitor.ts --summary     # Show traffic summary
  npx tsx scripts/ai-traffic-monitor.ts --list-bots   # List all known AI bots

The actual tracking happens via middleware - this script is for reporting.

Bot Types Tracked:
  - Training crawlers (GPTBot, anthropic-ai, etc.)
  - Search indexers (OAI-SearchBot, PerplexityBot, etc.)
  - Real-time citation bots (ChatGPT-User, ClaudeBot) ← These are citations!

Referrer Traffic:
  - chatgpt.com, perplexity.ai, claude.ai, gemini.google.com, etc.
  - Click-throughs from AI platforms = confirmed citations
`);
    process.exit(0);
  }

  if (args.includes('--list-bots')) {
    console.log('\n🤖 Known AI Bots:\n');
    for (const [name, info] of Object.entries(AI_BOTS)) {
      const emoji = info.purpose === 'realtime_citation' ? '🎯' :
                    info.purpose === 'search_index' ? '🔍' : '📚';
      console.log(`${emoji} ${name} (${info.company})`);
      console.log(`   Purpose: ${info.purpose}`);
      console.log(`   ${info.description}\n`);
    }
    process.exit(0);
  }

  if (args.includes('--summary')) {
    await printSummary();
    process.exit(0);
  }

  // Default: show summary
  await printSummary();
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
