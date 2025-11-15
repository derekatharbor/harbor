// app/api/scan/process/route.ts
// CRITICAL FIX: Properly update scan_jobs status from 'queued' -> 'running' -> 'done'

export const runtime = 'nodejs'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { runPrompt } from '@/lib/ai-models'
import {
  getShoppingPrompts,
  getBrandPrompts,
  getConversationPrompts,
  buildPromptConfig,
} from '@/lib/prompts'
import { crawlWebsite } from '@/lib/crawler/website-crawler'

export async function POST(request: Request) {
  try {
    const { scanId } = await request.json()

    if (!scanId) {
      return NextResponse.json({ error: 'Scan ID required' }, { status: 400 })
    }

    const supabase = createRouteHandlerClient({ cookies })

    // Get scan and dashboard info
    const { data: scan } = await supabase
      .from('scans')
      .select(`
        id,
        dashboard_id,
        dashboards (
          brand_name,
          domain,
          metadata
        )
      `)
      .eq('id', scanId)
      .single()

    if (!scan) {
      return NextResponse.json({ error: 'Scan not found' }, { status: 404 })
    }

    const dashboard = scan.dashboards as any
    const metadata = {
      brandName: dashboard.brand_name,
      domain: dashboard.domain,
      category: dashboard.metadata?.category || 'software',
      products: dashboard.metadata?.products || [],
      competitors: dashboard.metadata?.competitors || [],
    }

    // Update scan status to running
    await supabase
      .from('scans')
      .update({ status: 'running', started_at: new Date().toISOString() })
      .eq('id', scanId)

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

    const finalStatus = failed === 0 ? 'done' : succeeded > 0 ? 'partial' : 'failed'

    // Update scan with final status
    await supabase
      .from('scans')
      .update({
        status: finalStatus,
        finished_at: new Date().toISOString(),
      })
      .eq('id', scanId)

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
    console.error('Scan processing error:', error)
    return NextResponse.json(
      { error: error.message || 'Scan processing failed' },
      { status: 500 }
    )
  }
}

// ============================================================================
// MODULE PROCESSORS - WITH PROPER STATUS UPDATES
// ============================================================================

async function processShoppingModule(supabase: any, scanId: string, metadata: any) {
  console.log('[Shopping] Starting module...')

  // Find existing job or create new one
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

  // CRITICAL: Update to 'running' status
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

    const models: Array<'gpt' | 'claude' | 'gemini'> = ['gpt', 'claude', 'gemini']

    for (const promptConfig of prompts) {
      for (const modelName of models) {
        try {
          const config = buildPromptConfig(promptConfig.prompt, 'shopping')

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

// Replace the Shopping insert section (around line 188-201) with this:

    if (allResults.length > 0) {
      // Deduplicate by primary key (scan_id, model, category, product)
      const uniqueResults = Array.from(
        new Map(
          allResults.map(r => [
            `${r.scan_id}-${r.model}-${r.category}-${r.product}`,
            r
          ])
        ).values()
      )

      console.log('[Shopping] Deduped:', allResults.length, '→', uniqueResults.length, 'unique results')
      console.log('[Shopping] Sample result:', uniqueResults[0])
      
      const { error: insertError } = await supabase.from('results_shopping').insert(uniqueResults)
      
      if (insertError) {
        console.error('[Shopping] ❌ INSERT FAILED:', insertError)
        console.error('[Shopping] Error code:', insertError.code)
        console.error('[Shopping] Sample data that failed:', JSON.stringify(uniqueResults[0], null, 2))
      } else {
        console.log('[Shopping] ✅ Successfully inserted', uniqueResults.length, 'results')
      }
    } else {
      console.log('[Shopping] ⚠️ No results to insert')
    }

    // CRITICAL: Update to 'done' status
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

    // CRITICAL: Update to 'failed' status
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
  console.log('[Brand] Starting module...')

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

  // CRITICAL: Update to 'running' status
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

    const models: Array<'gpt' | 'claude' | 'gemini'> = ['gpt', 'claude', 'gemini']

    for (const promptConfig of prompts) {
      for (const modelName of models) {
        try {
          const config = buildPromptConfig(promptConfig.prompt, 'brand')

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
      await supabase.from('results_brand').insert(allDescriptors)
    }

    // CRITICAL: Update to 'done' status
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

    // CRITICAL: Update to 'failed' status
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
  console.log('[Conversations] Starting module...')

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

  // CRITICAL: Update to 'running' status
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

    const models: Array<'gpt' | 'claude' | 'gemini'> = ['gpt', 'claude', 'gemini']

    for (const promptConfig of prompts) {
      for (const modelName of models) {
        try {
          const config = buildPromptConfig(promptConfig.prompt, 'conversations')

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
      await supabase.from('results_conversations').insert(uniqueQuestions)
    }

    // CRITICAL: Update to 'done' status
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

    // CRITICAL: Update to 'failed' status
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
  console.log('[Website] Starting module...')

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

  // Update to 'running' status
  await supabase
    .from('scan_jobs')
    .update({
      status: 'running',
      started_at: new Date().toISOString(),
    })
    .eq('id', job.id)

  try {
    // Get dashboard to determine plan
    const { data: scan } = await supabase
      .from('scans')
      .select(`
        dashboard_id,
        dashboards (
          plan
        )
      `)
      .eq('id', scanId)
      .single()

    const plan = (scan?.dashboards as any)?.plan || 'solo'

    // Run the actual crawler
    console.log(`[Website] Crawling ${metadata.domain} with plan: ${plan}`)
    const crawlResult = await crawlWebsite(metadata.domain, plan)

    console.log(`[Website] Crawl complete:`, {
      pages: crawlResult.pages_analyzed,
      readability: crawlResult.readability_score,
      coverage: crawlResult.schema_coverage,
      issues: crawlResult.issues.length,
    })

    // Insert issues into database
    if (crawlResult.issues.length > 0) {
      const issueRecords = crawlResult.issues.map((issue) => ({
        scan_id: scanId,
        url: issue.url,
        issue_code: issue.issue_code,
        severity: issue.severity,
        schema_found: issue.schema_found,
        details: { message: issue.message },
      }))

      const { error: insertError } = await supabase
        .from('results_site')
        .insert(issueRecords)

      if (insertError) {
        console.error('[Website] Error inserting issues:', insertError)
      } else {
        console.log(`[Website] Inserted ${issueRecords.length} issues`)
      }
    }

    // Store schemas found in metadata (for future use)
    if (crawlResult.schemas_found.length > 0) {
      console.log(`[Website] Found ${crawlResult.schemas_found.length} schemas:`)
      crawlResult.schemas_found.forEach((schema) => {
        console.log(`  - ${schema.type} on ${schema.url} (${schema.complete ? 'complete' : 'incomplete'})`)
      })
    }

    // Update job to 'done' status
    await supabase
      .from('scan_jobs')
      .update({
        status: 'done',
        token_used: 0, // No LLM tokens used
        finished_at: new Date().toISOString(),
      })
      .eq('id', job.id)

    console.log(
      `[Website] Complete! Analyzed ${crawlResult.pages_analyzed} pages, found ${crawlResult.issues.length} issues`
    )
    
    return { 
      success: true, 
      count: crawlResult.issues.length,
      pages: crawlResult.pages_analyzed,
      readability: crawlResult.readability_score,
      coverage: crawlResult.schema_coverage,
    }
  } catch (error: any) {
    console.error('[Website] Module error:', error)

    // Update to 'failed' status
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