// API Route: /api/producthunt/setup
// Sets up Product Hunt products in SEPARATE tables (not polluting main ai_profiles)
// 
// Tables needed (run migration first):
//   - ph_products: id, name, domain, slug, category, created_at
//   - ph_prompts: id, prompt_text, intent, enabled, created_at
//   - ph_results: id, product_id, prompt_id, model, response_text, position, sentiment, executed_at
//
// GET - Check status
// POST - Run setup
// POST {"crawl": true} - Setup + crawl (may timeout, use /api/producthunt/crawl instead)

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const maxDuration = 60

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Top Product Hunt launches
const PRODUCT_HUNT_PRODUCTS = [
  // Design & Productivity
  { name: 'Notion', domain: 'notion.so', category: 'Productivity' },
  { name: 'Figma', domain: 'figma.com', category: 'Design' },
  { name: 'Linear', domain: 'linear.app', category: 'Project Management' },
  { name: 'Loom', domain: 'loom.com', category: 'Video' },
  { name: 'Miro', domain: 'miro.com', category: 'Collaboration' },
  { name: 'Airtable', domain: 'airtable.com', category: 'Database' },
  { name: 'Coda', domain: 'coda.io', category: 'Productivity' },
  { name: 'Pitch', domain: 'pitch.com', category: 'Presentations' },
  { name: 'Canva', domain: 'canva.com', category: 'Design' },
  { name: 'Framer', domain: 'framer.com', category: 'Design' },
  
  // Developer Tools
  { name: 'Vercel', domain: 'vercel.com', category: 'Developer Tools' },
  { name: 'Supabase', domain: 'supabase.com', category: 'Developer Tools' },
  { name: 'Railway', domain: 'railway.app', category: 'Developer Tools' },
  { name: 'Planetscale', domain: 'planetscale.com', category: 'Developer Tools' },
  { name: 'Prisma', domain: 'prisma.io', category: 'Developer Tools' },
  { name: 'Raycast', domain: 'raycast.com', category: 'Developer Tools' },
  { name: 'GitBook', domain: 'gitbook.com', category: 'Documentation' },
  { name: 'Readme', domain: 'readme.com', category: 'Documentation' },
  { name: 'Render', domain: 'render.com', category: 'Developer Tools' },
  { name: 'Fly.io', domain: 'fly.io', category: 'Developer Tools' },
  
  // AI Tools
  { name: 'Jasper', domain: 'jasper.ai', category: 'AI Writing' },
  { name: 'Copy.ai', domain: 'copy.ai', category: 'AI Writing' },
  { name: 'Descript', domain: 'descript.com', category: 'AI Video' },
  { name: 'Runway', domain: 'runwayml.com', category: 'AI Video' },
  { name: 'Midjourney', domain: 'midjourney.com', category: 'AI Image' },
  { name: 'Perplexity', domain: 'perplexity.ai', category: 'AI Search' },
  { name: 'Gamma', domain: 'gamma.app', category: 'AI Presentations' },
  { name: 'Tome', domain: 'tome.app', category: 'AI Presentations' },
  { name: 'ElevenLabs', domain: 'elevenlabs.io', category: 'AI Audio' },
  { name: 'Cursor', domain: 'cursor.com', category: 'AI Coding' },
  
  // Communication & Collaboration
  { name: 'Slack', domain: 'slack.com', category: 'Communication' },
  { name: 'Discord', domain: 'discord.com', category: 'Communication' },
  { name: 'Calendly', domain: 'calendly.com', category: 'Scheduling' },
  { name: 'Cal.com', domain: 'cal.com', category: 'Scheduling' },
  { name: 'Whereby', domain: 'whereby.com', category: 'Video Conferencing' },
  { name: 'Grain', domain: 'grain.com', category: 'Meeting Notes' },
  
  // Marketing & Sales
  { name: 'Webflow', domain: 'webflow.com', category: 'Website Builder' },
  { name: 'Carrd', domain: 'carrd.co', category: 'Website Builder' },
  { name: 'ConvertKit', domain: 'convertkit.com', category: 'Email Marketing' },
  { name: 'Beehiiv', domain: 'beehiiv.com', category: 'Newsletter' },
  { name: 'Substack', domain: 'substack.com', category: 'Newsletter' },
  { name: 'Gumroad', domain: 'gumroad.com', category: 'E-commerce' },
  { name: 'Lemlist', domain: 'lemlist.com', category: 'Sales' },
  { name: 'Apollo', domain: 'apollo.io', category: 'Sales' },
  { name: 'Intercom', domain: 'intercom.com', category: 'Customer Support' },
  { name: 'Crisp', domain: 'crisp.chat', category: 'Customer Support' },
  
  // Analytics & Data
  { name: 'Amplitude', domain: 'amplitude.com', category: 'Analytics' },
  { name: 'Mixpanel', domain: 'mixpanel.com', category: 'Analytics' },
  { name: 'PostHog', domain: 'posthog.com', category: 'Analytics' },
  { name: 'Hotjar', domain: 'hotjar.com', category: 'Analytics' },
  { name: 'Plausible', domain: 'plausible.io', category: 'Analytics' },
  { name: 'June', domain: 'june.so', category: 'Analytics' },
  
  // Finance & Payments
  { name: 'Stripe', domain: 'stripe.com', category: 'Payments' },
  { name: 'Paddle', domain: 'paddle.com', category: 'Payments' },
  { name: 'Mercury', domain: 'mercury.com', category: 'Banking' },
  { name: 'Brex', domain: 'brex.com', category: 'Banking' },
  { name: 'Ramp', domain: 'ramp.com', category: 'Banking' },
  
  // More recent PH favorites
  { name: 'Arc', domain: 'arc.net', category: 'Browser' },
  { name: 'Superhuman', domain: 'superhuman.com', category: 'Email' },
  { name: 'Height', domain: 'height.app', category: 'Project Management' },
  { name: 'Craft', domain: 'craft.do', category: 'Notes' },
  { name: 'Obsidian', domain: 'obsidian.md', category: 'Notes' },
  { name: 'Tally', domain: 'tally.so', category: 'Forms' },
  { name: 'Typeform', domain: 'typeform.com', category: 'Forms' },
  { name: 'Luma', domain: 'lu.ma', category: 'Events' },
  { name: 'Resend', domain: 'resend.com', category: 'Email API' },
  { name: 'Loops', domain: 'loops.so', category: 'Email Marketing' },
]

const PH_PROMPTS = [
  // Discovery
  { text: 'What are the most successful products that launched on Product Hunt?', intent: 'discovery' },
  { text: 'Best productivity tools from Product Hunt', intent: 'discovery' },
  { text: 'Top AI tools that launched on Product Hunt', intent: 'discovery' },
  { text: 'What are the best Product Hunt launches of all time?', intent: 'discovery' },
  { text: 'What tools do YC startups use?', intent: 'discovery' },
  { text: 'Best tech stack for a new startup', intent: 'discovery' },
  
  // Category comparisons
  { text: 'What project management tools are popular among startups?', intent: 'comparison' },
  { text: 'Best design tools for startups', intent: 'comparison' },
  { text: 'What are the best developer tools for building SaaS?', intent: 'comparison' },
  { text: 'What note-taking apps do founders use?', intent: 'comparison' },
  { text: 'Best email marketing tools for small businesses', intent: 'comparison' },
  { text: 'What analytics tools should startups use?', intent: 'comparison' },
  { text: 'Best website builders for startups', intent: 'comparison' },
  { text: 'What payment processing tools do startups use?', intent: 'comparison' },
  
  // Head-to-head
  { text: 'Figma vs Canva for design', intent: 'comparison' },
  { text: 'Is Supabase better than Firebase?', intent: 'comparison' },
  { text: 'Notion vs Coda vs Airtable comparison', intent: 'comparison' },
  { text: 'Linear vs Jira for project management', intent: 'comparison' },
  { text: 'Best alternatives to Slack', intent: 'alternatives' },
  
  // Pricing
  { text: 'How much does Notion cost?', intent: 'pricing' },
  { text: 'What is Linear pricing?', intent: 'pricing' },
  { text: 'Figma pricing plans', intent: 'pricing' },
  { text: 'Is Vercel free?', intent: 'pricing' },
]

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// GET - Check status
export async function GET() {
  const supabase = getSupabase()
  
  // Check if tables exist and get counts
  const { count: productCount, error: productError } = await supabase
    .from('ph_products')
    .select('*', { count: 'exact', head: true })
  
  const { count: promptCount, error: promptError } = await supabase
    .from('ph_prompts')
    .select('*', { count: 'exact', head: true })
  
  const { count: resultCount, error: resultError } = await supabase
    .from('ph_results')
    .select('*', { count: 'exact', head: true })
  
  const tablesExist = !productError && !promptError && !resultError
  
  // Get last result
  const { data: lastResult } = tablesExist ? await supabase
    .from('ph_results')
    .select('executed_at')
    .order('executed_at', { ascending: false })
    .limit(1)
    .single() : { data: null }
  
  return NextResponse.json({
    status: tablesExist ? 'ok' : 'tables_missing',
    tables_exist: tablesExist,
    migration_needed: !tablesExist,
    products_to_add: PRODUCT_HUNT_PRODUCTS.length,
    prompts_to_add: PH_PROMPTS.length,
    products_in_db: productCount || 0,
    prompts_in_db: promptCount || 0,
    results_in_db: resultCount || 0,
    last_crawl: lastResult?.executed_at || 'never',
    hint: tablesExist 
      ? 'POST to populate tables, then use /api/producthunt/crawl to run AI queries'
      : 'Run migration first - see migration SQL below',
    migration_sql: `
-- Run this in Supabase SQL Editor:

CREATE TABLE IF NOT EXISTS ph_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ph_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_text TEXT NOT NULL UNIQUE,
  intent TEXT,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ph_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id UUID REFERENCES ph_prompts(id),
  model TEXT NOT NULL,
  response_text TEXT,
  brands_mentioned JSONB DEFAULT '[]',
  executed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ph_results_prompt ON ph_results(prompt_id);
CREATE INDEX idx_ph_results_executed ON ph_results(executed_at DESC);
    `
  })
}

// POST - Populate tables
export async function POST(request: NextRequest) {
  const supabase = getSupabase()
  
  const results = {
    products_added: 0,
    products_existing: 0,
    prompts_added: 0,
    prompts_existing: 0,
    errors: [] as string[]
  }
  
  console.log('🚀 Setting up Product Hunt tables...')
  
  // 1. Add products
  for (const product of PRODUCT_HUNT_PRODUCTS) {
    const slug = slugify(product.name)
    
    const { data: existing } = await supabase
      .from('ph_products')
      .select('id')
      .eq('slug', slug)
      .single()
    
    if (existing) {
      results.products_existing++
      continue
    }
    
    const { error } = await supabase
      .from('ph_products')
      .insert({
        name: product.name,
        domain: product.domain,
        slug,
        category: product.category
      })
    
    if (error) {
      results.errors.push(`product/${product.name}: ${error.message}`)
    } else {
      results.products_added++
    }
  }
  
  // 2. Add prompts
  for (const prompt of PH_PROMPTS) {
    const { data: existing } = await supabase
      .from('ph_prompts')
      .select('id')
      .eq('prompt_text', prompt.text)
      .single()
    
    if (existing) {
      results.prompts_existing++
      continue
    }
    
    const { error } = await supabase
      .from('ph_prompts')
      .insert({
        prompt_text: prompt.text,
        intent: prompt.intent,
        enabled: true
      })
    
    if (error) {
      results.errors.push(`prompt: ${error.message}`)
    } else {
      results.prompts_added++
    }
  }
  
  console.log('✅ Setup complete:', results)
  
  return NextResponse.json({
    success: results.errors.length === 0,
    results,
    next_step: 'Run POST /api/producthunt/crawl to execute AI queries'
  })
}