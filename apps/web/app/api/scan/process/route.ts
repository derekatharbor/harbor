// app/api/scan/process/route.ts

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get the scan ID from the request
    const { scanId } = await request.json()
    
    if (!scanId) {
      return NextResponse.json({ error: 'Scan ID required' }, { status: 400 })
    }

    // Get all queued jobs for this scan
    const { data: jobs, error: jobsError } = await supabase
      .from('scan_jobs')
      .select('*')
      .eq('scan_id', scanId)
      .eq('status', 'queued')

    if (jobsError) {
      console.error('Jobs fetch error:', jobsError)
      return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
    }

    if (!jobs || jobs.length === 0) {
      return NextResponse.json({ message: 'No jobs to process' })
    }

    // Get dashboard info for context
    const { data: scan } = await supabase
      .from('scans')
      .select('dashboard_id')
      .eq('id', scanId)
      .single()

    if (!scan) {
      return NextResponse.json({ error: 'Scan not found' }, { status: 404 })
    }

    const { data: dashboard } = await supabase
      .from('dashboards')
      .select('brand_name, domain, metadata')
      .eq('id', scan.dashboard_id)
      .single()

    if (!dashboard) {
      return NextResponse.json({ error: 'Dashboard not found' }, { status: 404 })
    }

    // Process each job
    const results = []
    for (const job of jobs) {
      try {
        // Mark job as running
        await supabase
          .from('scan_jobs')
          .update({ status: 'running', started_at: new Date().toISOString() })
          .eq('id', job.id)

        // Process the job based on module type
        let jobResult
        switch (job.module) {
          case 'shopping':
            jobResult = await processShoppingModule(dashboard, supabase, scanId)
            break
          case 'brand':
            jobResult = await processBrandModule(dashboard, supabase, scanId)
            break
          case 'conversations':
            jobResult = await processConversationsModule(dashboard, supabase, scanId)
            break
          case 'website':
            jobResult = await processWebsiteModule(dashboard, supabase, scanId)
            break
          default:
            throw new Error(`Unknown module: ${job.module}`)
        }

        // Mark job as done
        await supabase
          .from('scan_jobs')
          .update({ 
            status: 'done', 
            finished_at: new Date().toISOString(),
            token_used: jobResult.tokensUsed || 0
          })
          .eq('id', job.id)

        results.push({ module: job.module, success: true })
      } catch (error: any) {
        console.error(`Job ${job.id} failed:`, error)
        
        // Mark job as failed
        await supabase
          .from('scan_jobs')
          .update({ 
            status: 'failed', 
            error: error.message,
            finished_at: new Date().toISOString()
          })
          .eq('id', job.id)

        results.push({ module: job.module, success: false, error: error.message })
      }
    }

    // Update scan status
    const allSuccess = results.every(r => r.success)
    const anySuccess = results.some(r => r.success)
    
    await supabase
      .from('scans')
      .update({ 
        status: allSuccess ? 'done' : anySuccess ? 'partial' : 'failed',
        finished_at: new Date().toISOString()
      })
      .eq('id', scanId)

    return NextResponse.json({ 
      success: true, 
      results 
    })

  } catch (error) {
    console.error('Scan process error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Shopping Module Processor
async function processShoppingModule(
  dashboard: any, 
  supabase: any, 
  scanId: string
) {
  console.log(`Processing shopping module for ${dashboard.brand_name}`)
  
  const products = dashboard.metadata?.products || []
  const category = dashboard.metadata?.category || 'Business'
  
  // TODO: Call AI models with shopping prompts
  // For now, insert mock data
  const mockData = [
    { model: 'ChatGPT', category: category, product: products[0] || 'Product A', brand: dashboard.brand_name, rank: 2, confidence: 85 },
    { model: 'Claude', category: category, product: products[0] || 'Product A', brand: dashboard.brand_name, rank: 1, confidence: 92 },
    { model: 'Gemini', category: category, product: products[0] || 'Product A', brand: dashboard.brand_name, rank: 3, confidence: 78 },
  ]

  await supabase
    .from('results_shopping')
    .insert(mockData.map(d => ({ ...d, scan_id: scanId })))

  return { tokensUsed: 500 }
}

// Brand Module Processor
async function processBrandModule(
  dashboard: any, 
  supabase: any, 
  scanId: string
) {
  console.log(`Processing brand module for ${dashboard.brand_name}`)
  
  // TODO: Call AI models with brand prompts
  // For now, insert mock data
  const mockData = [
    { descriptor: 'Innovative', sentiment: 'pos', weight: 85, source_model: 'ChatGPT' },
    { descriptor: 'Reliable', sentiment: 'pos', weight: 78, source_model: 'Claude' },
    { descriptor: 'Professional', sentiment: 'pos', weight: 82, source_model: 'Gemini' },
    { descriptor: 'Enterprise', sentiment: 'neu', weight: 65, source_model: 'ChatGPT' },
  ]

  await supabase
    .from('results_brand')
    .insert(mockData.map(d => ({ ...d, scan_id: scanId })))

  return { tokensUsed: 450 }
}

// Conversations Module Processor
async function processConversationsModule(
  dashboard: any, 
  supabase: any, 
  scanId: string
) {
  console.log(`Processing conversations module for ${dashboard.brand_name}`)
  
  const category = dashboard.metadata?.category || 'Business'
  
  // TODO: Call AI models with conversation prompts
  // For now, insert mock data
  const mockData = [
    { question: `What are the best ${category.toLowerCase()} solutions?`, intent: 'comparison', score: 85, emerging: false },
    { question: `How to choose a ${category.toLowerCase()} provider?`, intent: 'how_to', score: 72, emerging: true },
    { question: `${dashboard.brand_name} vs competitors`, intent: 'vs', score: 68, emerging: false },
  ]

  await supabase
    .from('results_conversations')
    .insert(mockData.map(d => ({ ...d, scan_id: scanId })))

  return { tokensUsed: 400 }
}

// Website Module Processor
async function processWebsiteModule(
  dashboard: any, 
  supabase: any, 
  scanId: string
) {
  console.log(`Processing website module for ${dashboard.brand_name}`)
  
  // TODO: Crawl website and check schema
  // For now, insert mock data
  const mockData = [
    { url: `https://${dashboard.domain}`, issue_code: 'missing_org_schema', severity: 'high', schema_found: false, details: { message: 'Organization schema not found' } },
    { url: `https://${dashboard.domain}/products`, issue_code: null, severity: 'low', schema_found: true, details: { schemas: ['Product', 'BreadcrumbList'] } },
  ]

  await supabase
    .from('results_site')
    .insert(mockData.map(d => ({ ...d, scan_id: scanId })))

  return { tokensUsed: 300 }
}
