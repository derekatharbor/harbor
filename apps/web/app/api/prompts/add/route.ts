// app/api/prompts/add/route.ts
// Add a new user prompt

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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
    
    const { 
      dashboard_id, 
      prompt_text, 
      topic, 
      location = 'us',
      tags = []
    } = body

    // Validation
    if (!prompt_text?.trim()) {
      return NextResponse.json(
        { error: 'Prompt text is required' },
        { status: 400 }
      )
    }

    if (prompt_text.length > 200) {
      return NextResponse.json(
        { error: 'Prompt must be 200 characters or less' },
        { status: 400 }
      )
    }

    // Support multi-line input (each line = separate prompt)
    const promptLines = prompt_text
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0)

    if (promptLines.length === 0) {
      return NextResponse.json(
        { error: 'At least one prompt is required' },
        { status: 400 }
      )
    }

    // Insert prompts
    const promptsToInsert = promptLines.map((text: string) => ({
      dashboard_id: dashboard_id || null,
      prompt_text: text,
      topic: topic || null,
      location,
      tags,
      status: 'active',
      is_active: true
    }))

    const { data, error } = await supabase
      .from('user_prompts')
      .insert(promptsToInsert)
      .select()

    if (error) {
      console.error('Failed to add prompts:', error)
      throw error
    }

    return NextResponse.json({
      success: true,
      added: data?.length || 0,
      prompts: data
    })

  } catch (error) {
    console.error('Add prompt error:', error)
    return NextResponse.json(
      { error: 'Failed to add prompt', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}
