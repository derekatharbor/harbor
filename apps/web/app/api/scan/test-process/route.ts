// app/api/scan/test-process/route.ts
// Test endpoint that simulates scan without calling AI

export const runtime = 'nodejs'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { scanId } = await request.json()

    if (!scanId) {
      return NextResponse.json({ error: 'Scan ID required' }, { status: 400 })
    }

    const supabase = createRouteHandlerClient({ cookies })

    console.log('[Test Scan] Starting test scan:', scanId)

    // Update scan to running
    await supabase
      .from('scans')
      .update({ status: 'running', started_at: new Date().toISOString() })
      .eq('id', scanId)

    // Get all jobs
    const { data: jobs } = await supabase
      .from('scan_jobs')
      .select('*')
      .eq('scan_id', scanId)

    console.log('[Test Scan] Found jobs:', jobs?.length)

    // Simulate processing each module
    for (const job of jobs || []) {
      console.log(`[Test Scan] Processing ${job.module}...`)
      
      // Update to running
      await supabase
        .from('scan_jobs')
        .update({ 
          status: 'running',
          started_at: new Date().toISOString()
        })
        .eq('id', job.id)

      // Wait 2 seconds
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Insert dummy data based on module
      if (job.module === 'shopping') {
        await supabase.from('results_shopping').insert({
          scan_id: scanId,
          model: 'gpt',
          category: 'test',
          product: 'Test Product',
          brand: 'Test Brand',
          rank: 1,
          confidence: 90
        })
      } else if (job.module === 'brand') {
        await supabase.from('results_brand').insert({
          scan_id: scanId,
          descriptor: 'innovative',
          sentiment: 'pos',
          weight: 10,
          source_model: 'gpt'
        })
      } else if (job.module === 'conversations') {
        await supabase.from('results_conversations').insert({
          scan_id: scanId,
          question: 'What is this brand known for?',
          intent: 'features',
          score: 80,
          emerging: false
        })
      } else if (job.module === 'website') {
        await supabase.from('results_site').insert({
          scan_id: scanId,
          url: 'https://example.com',
          issue_code: 'missing_schema',
          severity: 'med',
          schema_found: false,
          details: { message: 'No schema found' }
        })
      }

      // Update to done
      await supabase
        .from('scan_jobs')
        .update({ 
          status: 'done',
          finished_at: new Date().toISOString(),
          token_used: 100
        })
        .eq('id', job.id)

      console.log(`[Test Scan] Completed ${job.module}`)
    }

    // Mark scan as done
    await supabase
      .from('scans')
      .update({
        status: 'done',
        finished_at: new Date().toISOString(),
      })
      .eq('id', scanId)

    console.log('[Test Scan] All modules complete!')

    return NextResponse.json({
      success: true,
      scanId,
      message: 'Test scan completed'
    })
  } catch (error: any) {
    console.error('[Test Scan] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Test scan failed' },
      { status: 500 }
    )
  }
}
