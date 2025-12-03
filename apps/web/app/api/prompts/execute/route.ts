// Location: app/api/prompts/execute/route.ts
// Execute a prompt against all AI models and store results

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { executePromptAllModels, storeExecutionResults } from '@/lib/prompts/execution-engine'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await request.json()
    const { prompt_id, prompt_text, models } = body

    if (!prompt_id || !prompt_text) {
      return NextResponse.json(
        { error: 'prompt_id and prompt_text are required' },
        { status: 400 }
      )
    }

    // Execute against all models (or specified subset)
    const results = await executePromptAllModels(
      prompt_id,
      prompt_text,
      models || ['chatgpt', 'claude', 'gemini', 'perplexity']
    )

    // Store results in database
    await storeExecutionResults(supabase, results)

    // Calculate totals
    const totalTokens = results.reduce((sum, r) => sum + r.tokens_used, 0)
    const successful = results.filter(r => !r.error).length
    const failed = results.filter(r => r.error).length

    return NextResponse.json({
      success: true,
      results: {
        executed: results.length,
        successful,
        failed,
        total_tokens: totalTokens,
        estimated_cost_usd: (totalTokens / 1000000) * 10
      },
      executions: results.map(r => ({
        model: r.model,
        brands_found: r.brands_mentioned.length,
        citations_found: r.citations.length,
        tokens: r.tokens_used,
        error: r.error
      }))
    })

  } catch (error) {
    console.error('Prompt execution error:', error)
    return NextResponse.json(
      { error: 'Failed to execute prompt', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}