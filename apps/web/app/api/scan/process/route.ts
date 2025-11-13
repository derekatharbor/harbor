// app/api/scan/process/route.ts
// Enhanced scan processor with multiple prompts and competitor data

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { runPrompt } from '@/lib/ai-models'
import {
  getShoppingPrompts,
  getBrandPrompts,
  getConversationPrompts,
  buildPromptConfig,
  calculateVisibilityScore,
  calculateBrandVisibilityIndex,
  calculateConversationVolume,
} from '@/lib/prompts'

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
// MODULE PROCESSORS
// ============================================================================

async function processShoppingModule(supabase: any, scanId: string, metadata: any) {
  console.log('[Shopping] Starting module...')

  // Create job record
  const { data: job } = await supabase
    .from('scan_jobs')
    .insert({
      scan_id: scanId,
      module: 'shopping',
      status: 'running',
      started_at: new Date().toISOString(),
    })
    .select()
    .single()

  try {
    const prompts = getShoppingPrompts(metadata)
    const allResults: any[] = []
    let totalTokens = 0

    // Run prompts across all models
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

          totalTokens += config.maxTokens // Rough estimate

          // Parse JSON response
          const cleanedResponse = response
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim()

          const results = JSON.parse(cleanedResponse)

          // Store each result
          for (const result of results) {
            allResults.push({
              scan_id: scanId,
              model: modelName,
              category: promptConfig.category,
              product: result.product || 'Unknown',
              brand: result.brand || 'Unknown',
              rank: result.rank || 99,
              confidence: 80, // Default confidence
            })
          }
        } catch (error) {
          console.error(`[Shopping] Error with ${modelName}:`, error)
        }
      }
    }

    // Bulk insert results
    if (allResults.length > 0) {
      await supabase.from('results_shopping').insert(allResults)
    }

    // Update job status
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
  console.log('[Brand] Starting module...')

  const { data: job } = await supabase
    .from('scan_jobs')
    .insert({
      scan_id: scanId,
      module: 'brand',
      status: 'running',
      started_at: new Date().toISOString(),
    })
    .select()
    .single()

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

          // Store descriptors
          if (result.descriptors) {
            for (const desc of result.descriptors) {
              allDescriptors.push({
                scan_id: scanId,
                descriptor: desc.word,
                sentiment: desc.sentiment,
                weight: 10, // Default weight
                source_model: modelName,
              })
            }
          }

          // Store competitors (we'll add this to a new table or metadata later)
          // For now, just log them
          if (result.competitors) {
            console.log(`[Brand] Competitors from ${modelName}:`, result.competitors)
          }
        } catch (error) {
          console.error(`[Brand] Error with ${modelName}:`, error)
        }
      }
    }

    // Bulk insert descriptors
    if (allDescriptors.length > 0) {
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
  console.log('[Conversations] Starting module...')

  const { data: job } = await supabase
    .from('scan_jobs')
    .insert({
      scan_id: scanId,
      module: 'conversations',
      status: 'running',
      started_at: new Date().toISOString(),
    })
    .select()
    .single()

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

          // Store questions
          for (const q of results) {
            allQuestions.push({
              scan_id: scanId,
              question: q.question,
              intent: q.intent,
              score: q.frequency === 'high' ? 80 : q.frequency === 'medium' ? 50 : 20,
              emerging: false, // Will calculate deltas later
            })
          }
        } catch (error) {
          console.error(`[Conversations] Error with ${modelName}:`, error)
        }
      }
    }

    // Deduplicate questions
    const uniqueQuestions = Array.from(
      new Map(allQuestions.map(q => [q.question.toLowerCase(), q])).values()
    )

    // Bulk insert
    if (uniqueQuestions.length > 0) {
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
  console.log('[Website] Starting module...')

  const { data: job } = await supabase
    .from('scan_jobs')
    .insert({
      scan_id: scanId,
      module: 'website',
      status: 'running',
      started_at: new Date().toISOString(),
    })
    .select()
    .single()

  try {
    // TODO: Implement actual website crawler
    // For now, insert mock data
    const mockIssues = [
      {
        scan_id: scanId,
        url: `${metadata.domain}/`,
        issue_code: 'missing_org_schema',
        severity: 'high',
        schema_found: false,
        details: { message: 'Organization schema not found on homepage' },
      },
      {
        scan_id: scanId,
        url: `${metadata.domain}/products`,
        issue_code: 'missing_product_schema',
        severity: 'high',
        schema_found: false,
        details: { message: 'Product schema missing from product pages' },
      },
    ]

    await supabase.from('results_site').insert(mockIssues)

    await supabase
      .from('scan_jobs')
      .update({
        status: 'done',
        token_used: 0,
        finished_at: new Date().toISOString(),
      })
      .eq('id', job.id)

    console.log('[Website] Complete (mock data)')
    return { success: true, count: mockIssues.length }
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