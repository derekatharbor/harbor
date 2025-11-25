// app/api/scan/process/route.ts
// FIXED: Use service role client and proper query syntax

export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes max

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { runPrompt } from '@/lib/ai-models'
import {
  getShoppingPrompts,
  getBrandPrompts,
  getConversationPrompts,
  buildPromptConfig,
} from '@/lib/prompts'
import { crawlWebsite } from '@/lib/crawler/website-crawler'

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  return createClient(supabaseUrl, supabaseKey)
}

export async function POST(request: Request) {
  const startTime = Date.now()
  console.log('========================================')
  console.log('[Process] ⚡ ENDPOINT INVOKED at', new Date().toISOString())
  console.log('========================================')
  
  try {
    const { scanId } = await request.json()

    if (!scanId) {
      console.log('[Process] ❌ No scan ID provided')
      return NextResponse.json({ error: 'Scan ID required' }, { status: 400 })
    }

    console.log('[Process] 🎯 Starting scan:', scanId)
    const supabase = getSupabaseClient()

    // Get scan info
    const { data: scan, error: scanError } = await supabase
      .from('scans')
      .select('*')
      .eq('id', scanId)
      .single()

    if (scanError || !scan) {
      console.error('[Process] ❌ Scan not found:', scanError)
      return NextResponse.json({ error: 'Scan not found' }, { status: 404 })
    }

    console.log('[Process] ✅ Found scan for dashboard:', scan.dashboard_id, '| Current status:', scan.status)

    // Check if scan is already running or done
    if (scan.status === 'running') {
      console.log('[Process] ⚠️ Scan already running - exiting to avoid duplicate processing')
      return NextResponse.json({ error: 'Scan already in progress' }, { status: 409 })
    }
    
    if (scan.status === 'done' || scan.status === 'failed') {
      console.log('[Process] ⚠️ Scan already completed - exiting')
      return NextResponse.json({ error: 'Scan already completed' }, { status: 409 })
    }

    // Get dashboard separately
    const { data: dashboard, error: dashError } = await supabase
      .from('dashboards')
      .select('*')
      .eq('id', scan.dashboard_id)
      .single()

    if (dashError || !dashboard) {
      console.error('[Process] ❌ Dashboard not found:', dashError)
      return NextResponse.json({ error: 'Dashboard not found' }, { status: 404 })
    }

    console.log('[Process] ✅ Found dashboard:', dashboard.brand_name)

    const metadata = {
      brandName: dashboard.brand_name,
      domain: dashboard.domain,
      category: dashboard.metadata?.category || 'software',
      products: dashboard.metadata?.products || [],
      competitors: dashboard.metadata?.competitors || [],
    }

    console.log('[Process] 📋 Metadata:', JSON.stringify(metadata))

    // Update scan status to running
    console.log('[Process] 🔄 Updating scan status to RUNNING...')
    const { error: updateError } = await supabase
      .from('scans')
      .update({ status: 'running', started_at: new Date().toISOString() })
      .eq('id', scanId)

    if (updateError) {
      console.error('[Process] ❌ Failed to update scan status:', updateError)
    } else {
      console.log('[Process] ✅ Scan marked as RUNNING')
      
      // Verify the update worked
      const { data: verifyData } = await supabase
        .from('scans')
        .select('status')
        .eq('id', scanId)
        .single()
      
      console.log('[Process] 🔍 Verified scan status:', verifyData?.status)
    }

    console.log('[Process] 🚀 Processing 4 modules in parallel...')

    // Process all modules in parallel
    const results = await Promise.allSettled([
      processShoppingModule(supabase, scanId, metadata),
      processBrandModule(supabase, scanId, metadata),
      processConversationsModule(supabase, scanId, metadata),
      processWebsiteModule(supabase, scanId, metadata),
    ])

    // Check if any succeeded
    const succeeded = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length

    console.log('[Process] Results:', { succeeded, failed })

    const finalStatus = failed === 0 ? 'done' : succeeded > 0 ? 'partial' : 'failed'

    // Update scan with final status
    await supabase
      .from('scans')
      .update({
        status: finalStatus,
        finished_at: new Date().toISOString(),
      })
      .eq('id', scanId)

    console.log('[Process] Scan complete:', finalStatus)

    return NextResponse.json({
      success: true,
      scanId,
      status: finalStatus,
      modules: {
        succeeded,
        failed,
      },
    })
  } catch (error: any) {
    console.error('[Process] Fatal error:', error)
    return NextResponse.json(
      { error: error.message || 'Scan processing failed' },
      { status: 500 }
    )
  }
}

// ============================================================================
// MODULE PROCESSORS
// ============================================================================

async function processShoppingModule(supabase: any, scanId: string, metadata: any) {
  console.log('[Shopping] Starting...')

  let { data: job } = await supabase
    .from('scan_jobs')
    .select('*')
    .eq('scan_id', scanId)
    .eq('module', 'shopping')
    .single()

  if (!job) {
    const { data: newJob } = await supabase
      .from('scan_jobs')
      .insert({
        scan_id: scanId,
        module: 'shopping',
        status: 'queued',
      })
      .select()
      .single()
    job = newJob
  }

  await supabase
    .from('scan_jobs')
    .update({
      status: 'running',
      started_at: new Date().toISOString(),
    })
    .eq('id', job.id)

  try {
    const prompts = getShoppingPrompts(metadata)
    const allResults: any[] = []
    let totalTokens = 0

    const models: Array<'gpt'> = ['gpt'] // Only GPT for now

    for (const promptConfig of prompts) {
      for (const modelName of models) {
        try {
          const config = buildPromptConfig(promptConfig.prompt, 'shopping')

          console.log(`[Shopping] Calling ${modelName} for ${promptConfig.category}...`)

          const response = await runPrompt({
            model: modelName,
            system: config.system,
            user: config.user,
            maxTokens: config.maxTokens,
          })

          totalTokens += config.maxTokens

          const cleanedResponse = response
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim()

          const results = JSON.parse(cleanedResponse)

          for (const result of results) {
            allResults.push({
              scan_id: scanId,
              model: modelName,
              category: promptConfig.category,
              product: result.product || 'Unknown',
              brand: result.brand || 'Unknown',
              rank: result.rank || 99,
              confidence: 80,
            })
          }
        } catch (error) {
          console.error(`[Shopping] Error with ${modelName}:`, error)
        }
      }
    }

    if (allResults.length > 0) {
      const uniqueResults = Array.from(
        new Map(
          allResults.map(r => [
            `${r.scan_id}-${r.model}-${r.category}-${r.product}`,
            r
          ])
        ).values()
      )

      console.log('[Shopping] Inserting', uniqueResults.length, 'results')
      
      const { error: insertError } = await supabase.from('results_shopping').insert(uniqueResults)
      
      if (insertError) {
        console.error('[Shopping] Insert failed:', insertError)
      }
    }

    await supabase
      .from('scan_jobs')
      .update({
        status: 'done',
        token_used: totalTokens,
        finished_at: new Date().toISOString(),
      })
      .eq('id', job.id)

    console.log(`[Shopping] Complete! Found ${allResults.length} mentions`)
    return { success: true, count: allResults.length }
  } catch (error: any) {
    console.error('[Shopping] Module error:', error)

    await supabase
      .from('scan_jobs')
      .update({
        status: 'failed',
        error: error.message,
        finished_at: new Date().toISOString(),
      })
      .eq('id', job.id)

    throw error
  }
}

async function processBrandModule(supabase: any, scanId: string, metadata: any) {
  console.log('[Brand] Starting...')

  let { data: job } = await supabase
    .from('scan_jobs')
    .select('*')
    .eq('scan_id', scanId)
    .eq('module', 'brand')
    .single()

  if (!job) {
    const { data: newJob } = await supabase
      .from('scan_jobs')
      .insert({
        scan_id: scanId,
        module: 'brand',
        status: 'queued',
      })
      .select()
      .single()
    job = newJob
  }

  await supabase
    .from('scan_jobs')
    .update({
      status: 'running',
      started_at: new Date().toISOString(),
    })
    .eq('id', job.id)

  try {
    const prompts = getBrandPrompts(metadata)
    const allDescriptors: any[] = []
    let totalTokens = 0

    const models: Array<'gpt'> = ['gpt']

    for (const promptConfig of prompts) {
      for (const modelName of models) {
        try {
          const config = buildPromptConfig(promptConfig.prompt, 'brand')

          console.log(`[Brand] Calling ${modelName}...`)

          const response = await runPrompt({
            model: modelName,
            system: config.system,
            user: config.user,
            maxTokens: config.maxTokens,
          })

          totalTokens += config.maxTokens

          const cleanedResponse = response
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim()

          const result = JSON.parse(cleanedResponse)

          if (result.descriptors) {
            for (const desc of result.descriptors) {
              allDescriptors.push({
                scan_id: scanId,
                descriptor: desc.word,
                sentiment: desc.sentiment,
                weight: 10,
                source_model: modelName,
              })
            }
          }
        } catch (error) {
          console.error(`[Brand] Error with ${modelName}:`, error)
        }
      }
    }

    if (allDescriptors.length > 0) {
      console.log('[Brand] Inserting', allDescriptors.length, 'descriptors')
      await supabase.from('results_brand').insert(allDescriptors)
    }

    await supabase
      .from('scan_jobs')
      .update({
        status: 'done',
        token_used: totalTokens,
        finished_at: new Date().toISOString(),
      })
      .eq('id', job.id)

    console.log(`[Brand] Complete! Found ${allDescriptors.length} descriptors`)
    return { success: true, count: allDescriptors.length }
  } catch (error: any) {
    console.error('[Brand] Module error:', error)

    await supabase
      .from('scan_jobs')
      .update({
        status: 'failed',
        error: error.message,
        finished_at: new Date().toISOString(),
      })
      .eq('id', job.id)

    throw error
  }
}

async function processConversationsModule(supabase: any, scanId: string, metadata: any) {
  console.log('[Conversations] Starting...')

  let { data: job } = await supabase
    .from('scan_jobs')
    .select('*')
    .eq('scan_id', scanId)
    .eq('module', 'conversations')
    .single()

  if (!job) {
    const { data: newJob } = await supabase
      .from('scan_jobs')
      .insert({
        scan_id: scanId,
        module: 'conversations',
        status: 'queued',
      })
      .select()
      .single()
    job = newJob
  }

  await supabase
    .from('scan_jobs')
    .update({
      status: 'running',
      started_at: new Date().toISOString(),
    })
    .eq('id', job.id)

  try {
    const prompts = getConversationPrompts(metadata)
    const allQuestions: any[] = []
    let totalTokens = 0

    const models: Array<'gpt'> = ['gpt']

    for (const promptConfig of prompts) {
      for (const modelName of models) {
        try {
          const config = buildPromptConfig(promptConfig.prompt, 'conversations')

          console.log(`[Conversations] Calling ${modelName}...`)

          const response = await runPrompt({
            model: modelName,
            system: config.system,
            user: config.user,
            maxTokens: config.maxTokens,
          })

          totalTokens += config.maxTokens

          const cleanedResponse = response
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim()

          const results = JSON.parse(cleanedResponse)

          for (const q of results) {
            allQuestions.push({
              scan_id: scanId,
              question: q.question,
              intent: q.intent,
              score: q.frequency === 'high' ? 80 : q.frequency === 'medium' ? 50 : 20,
              emerging: false,
            })
          }
        } catch (error) {
          console.error(`[Conversations] Error with ${modelName}:`, error)
        }
      }
    }

    const uniqueQuestions = Array.from(
      new Map(allQuestions.map(q => [q.question.toLowerCase(), q])).values()
    )

    if (uniqueQuestions.length > 0) {
      console.log('[Conversations] Inserting', uniqueQuestions.length, 'questions')
      await supabase.from('results_conversations').insert(uniqueQuestions)
    }

    await supabase
      .from('scan_jobs')
      .update({
        status: 'done',
        token_used: totalTokens,
        finished_at: new Date().toISOString(),
      })
      .eq('id', job.id)

    console.log(`[Conversations] Complete! Found ${uniqueQuestions.length} questions`)
    return { success: true, count: uniqueQuestions.length }
  } catch (error: any) {
    console.error('[Conversations] Module error:', error)

    await supabase
      .from('scan_jobs')
      .update({
        status: 'failed',
        error: error.message,
        finished_at: new Date().toISOString(),
      })
      .eq('id', job.id)

    throw error
  }
}

async function processWebsiteModule(supabase: any, scanId: string, metadata: any) {
  console.log('[Website] Starting...')

  let { data: job } = await supabase
    .from('scan_jobs')
    .select('*')
    .eq('scan_id', scanId)
    .eq('module', 'website')
    .single()

  if (!job) {
    const { data: newJob } = await supabase
      .from('scan_jobs')
      .insert({
        scan_id: scanId,
        module: 'website',
        status: 'queued',
      })
      .select()
      .single()
    job = newJob
  }

  await supabase
    .from('scan_jobs')
    .update({
      status: 'running',
      started_at: new Date().toISOString(),
    })
    .eq('id', job.id)

  try {
    const { data: scan } = await supabase
      .from('scans')
      .select('dashboard_id')
      .eq('id', scanId)
      .single()

    const { data: dashboard } = await supabase
      .from('dashboards')
      .select('plan')
      .eq('id', scan.dashboard_id)
      .single()

    const plan = dashboard?.plan || 'solo'

    console.log(`[Website] Crawling ${metadata.domain} (plan: ${plan})`)
    const crawlResult = await crawlWebsite(metadata.domain, plan)

    console.log(`[Website] Crawl complete:`, {
      pages: crawlResult.pages_analyzed,
      readability: crawlResult.readability_score,
      issues: crawlResult.issues.length,
    })

    if (crawlResult.issues.length > 0) {
      const issueRecords = crawlResult.issues.map((issue) => ({
        scan_id: scanId,
        url: issue.url,
        issue_code: issue.issue_code,
        severity: issue.severity,
        schema_found: issue.schema_found,
        details: { message: issue.message },
      }))

      console.log('[Website] Inserting', issueRecords.length, 'issues')
      await supabase.from('results_site').insert(issueRecords)
    }

    await supabase
      .from('scan_jobs')
      .update({
        status: 'done',
        token_used: 0,
        finished_at: new Date().toISOString(),
      })
      .eq('id', job.id)

    console.log('[Website] Complete!')
    
    return { 
      success: true, 
      count: crawlResult.issues.length,
      pages: crawlResult.pages_analyzed,
      readability: crawlResult.readability_score,
    }
  } catch (error: any) {
    console.error('[Website] Module error:', error)

    await supabase
      .from('scan_jobs')
      .update({
        status: 'failed',
        error: error.message,
        finished_at: new Date().toISOString(),
      })
      .eq('id', job.id)

    throw error
  }
}