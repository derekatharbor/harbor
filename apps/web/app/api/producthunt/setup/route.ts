// API Route: /api/producthunt/setup
// Sets up Product Hunt products for crawling
// GET - Check status
// POST - Run setup and optionally trigger crawl

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

// Top Product Hunt launches - recognizable names
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
  
  // AI Tools
  { name: 'Jasper', domain: 'jasper.ai', category: 'AI Writing' },
  { name: 'Copy.ai', domain: 'copy.ai', category: 'AI Writing' },
  { name: 'Descript', domain: 'descript.com', category: 'AI Video' },
  { name: 'Runway', domain: 'runwayml.com', category: 'AI Video' },
  { name: 'Midjourney', domain: 'midjourney.com', category: 'AI Image' },
  { name: 'Perplexity', domain: 'perplexity.ai', category: 'AI Search' },
  { name: 'Gamma', domain: 'gamma.app', category: 'AI Presentations' },
  { name: 'Tome', domain: 'tome.app', category: 'AI Presentations' },
  
  // Communication & Collaboration
  { name: 'Slack', domain: 'slack.com', category: 'Communication' },
  { name: 'Discord', domain: 'discord.com', category: 'Communication' },
  { name: 'Calendly', domain: 'calendly.com', category: 'Scheduling' },
  { name: 'Cal.com', domain: 'cal.com', category: 'Scheduling' },
  { name: 'Whereby', domain: 'whereby.com', category: 'Video Conferencing' },
  
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
  
  // Finance & Payments
  { name: 'Stripe', domain: 'stripe.com', category: 'Payments' },
  { name: 'Paddle', domain: 'paddle.com', category: 'Payments' },
  { name: 'Mercury', domain: 'mercury.com', category: 'Banking' },
  { name: 'Brex', domain: 'brex.com', category: 'Banking' },
  
  // More recent PH favorites
  { name: 'Arc Browser', domain: 'arc.net', category: 'Browser' },
  { name: 'Superhuman', domain: 'superhuman.com', category: 'Email' },
  { name: 'Height', domain: 'height.app', category: 'Project Management' },
  { name: 'Craft', domain: 'craft.do', category: 'Notes' },
  { name: 'Obsidian', domain: 'obsidian.md', category: 'Notes' },
  { name: 'Tally', domain: 'tally.so', category: 'Forms' },
  { name: 'Typeform', domain: 'typeform.com', category: 'Forms' },
  { name: 'Luma', domain: 'lu.ma', category: 'Events' },
]

const PH_PROMPTS = [
  { text: 'What are the most successful products that launched on Product Hunt?', intent: 'discovery' },
  { text: 'Best productivity tools from Product Hunt', intent: 'discovery' },
  { text: 'Top AI tools that launched on Product Hunt', intent: 'discovery' },
  { text: 'What are the best Product Hunt launches of all time?', intent: 'discovery' },
  { text: 'What project management tools are popular among startups?', intent: 'comparison' },
  { text: 'Best design tools for startups in 2024', intent: 'comparison' },
  { text: 'What are the best developer tools for building SaaS?', intent: 'comparison' },
  { text: 'What note-taking apps do founders use?', intent: 'comparison' },
  { text: 'Best email marketing tools for small businesses', intent: 'comparison' },
  { text: 'What analytics tools should startups use?', intent: 'comparison' },
  { text: 'How much does Notion cost?', intent: 'pricing' },
  { text: 'What is Linear pricing?', intent: 'pricing' },
  { text: 'Figma vs Canva for design', intent: 'comparison' },
  { text: 'Is Supabase better than Firebase?', intent: 'comparison' },
  { text: 'What is Vercel used for?', intent: 'informational' },
  { text: 'Best alternatives to Slack', intent: 'alternatives' },
  { text: 'Notion vs Coda vs Airtable comparison', intent: 'comparison' },
  { text: 'What tools do YC startups use?', intent: 'discovery' },
  { text: 'Best tech stack for a new startup', intent: 'discovery' },
  { text: 'What software should a new startup use?', intent: 'discovery' },
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
  
  // Count PH products in ai_profiles
  const { count: profileCount } = await supabase
    .from('ai_profiles')
    .select('*', { count: 'exact', head: true })
    .in('domain', PRODUCT_HUNT_PRODUCTS.map(p => p.domain))
  
  // Count PH featured brands
  const { count: featuredCount } = await supabase
    .from('featured_brands')
    .select('*', { count: 'exact', head: true })
    .eq('industry', 'producthunt')
  
  // Count PH prompts
  const { count: promptCount } = await supabase
    .from('index_prompts')
    .select('*', { count: 'exact', head: true })
    .eq('industry', 'producthunt')
  
  // Last execution
  const { data: lastExec } = await supabase
    .from('prompt_executions')
    .select('executed_at, prompt:index_prompts(industry)')
    .order('executed_at', { ascending: false })
    .limit(1)
    .single()
  
  return NextResponse.json({
    status: 'ok',
    products_to_add: PRODUCT_HUNT_PRODUCTS.length,
    profiles_in_db: profileCount || 0,
    featured_brands: featuredCount || 0,
    prompts: promptCount || 0,
    prompts_to_add: PH_PROMPTS.length,
    last_execution: lastExec?.executed_at || 'never',
    hint: 'POST to run setup, POST with {"crawl": true} to also trigger crawl'
  })
}

// POST - Run setup
export async function POST(request: NextRequest) {
  const supabase = getSupabase()
  const body = await request.json().catch(() => ({}))
  const shouldCrawl = body.crawl === true
  
  const results = {
    profiles_created: 0,
    profiles_existing: 0,
    featured_added: 0,
    prompts_added: 0,
    crawl_triggered: false,
    errors: [] as string[]
  }
  
  console.log('🚀 Setting up Product Hunt products...')
  
  // 1. Add products to ai_profiles
  for (const product of PRODUCT_HUNT_PRODUCTS) {
    const slug = slugify(product.name)
    
    const { data: existing } = await supabase
      .from('ai_profiles')
      .select('id')
      .eq('slug', slug)
      .single()
    
    if (existing) {
      results.profiles_existing++
      continue
    }
    
    const { error } = await supabase
      .from('ai_profiles')
      .insert({
        brand_name: product.name,
        slug,
        domain: product.domain,
        industry: 'Technology',
        category: product.category,
        visibility_score: 0,
        rank_global: 99999,
        claimed: false
      })
    
    if (error) {
      results.errors.push(`profile/${product.name}: ${error.message}`)
    } else {
      results.profiles_created++
    }
  }
  
  // 2. Add to featured_brands
  for (const product of PRODUCT_HUNT_PRODUCTS) {
    const slug = slugify(product.name)
    
    const { data: profile } = await supabase
      .from('ai_profiles')
      .select('id')
      .eq('slug', slug)
      .single()
    
    if (!profile) continue
    
    const { data: existingFeatured } = await supabase
      .from('featured_brands')
      .select('id')
      .eq('profile_id', profile.id)
      .eq('industry', 'producthunt')
      .single()
    
    if (existingFeatured) continue
    
    const { error } = await supabase
      .from('featured_brands')
      .insert({
        profile_id: profile.id,
        industry: 'producthunt',
        priority: 50,
        enabled: true
      })
    
    if (error) {
      results.errors.push(`featured/${product.name}: ${error.message}`)
    } else {
      results.featured_added++
    }
  }
  
  // 3. Add prompts
  for (const prompt of PH_PROMPTS) {
    const { data: existing } = await supabase
      .from('index_prompts')
      .select('id')
      .eq('prompt_text', prompt.text)
      .single()
    
    if (existing) continue
    
    const { error } = await supabase
      .from('index_prompts')
      .insert({
        prompt_text: prompt.text,
        industry: 'producthunt',
        intent: prompt.intent,
        enabled: true
      })
    
    if (error) {
      results.errors.push(`prompt: ${error.message}`)
    } else {
      results.prompts_added++
    }
  }
  
  // 4. Optionally trigger crawl
  if (shouldCrawl) {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const crawlResponse = await fetch(`${baseUrl}/api/cron/weekly-index?manual=true`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ industry: 'producthunt', limit: 50 })
      })
      
      if (crawlResponse.ok) {
        results.crawl_triggered = true
      } else {
        results.errors.push(`crawl: ${crawlResponse.status}`)
      }
    } catch (err: any) {
      results.errors.push(`crawl: ${err.message}`)
    }
  }
  
  console.log('✅ Setup complete:', results)
  
  return NextResponse.json({
    success: true,
    results
  })
}
