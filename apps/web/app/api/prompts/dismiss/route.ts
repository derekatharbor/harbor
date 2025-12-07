// app/api/prompts/dismiss/route.ts
// Dismiss a suggested prompt (hide from suggestions)

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
    const { dashboard_id, prompt_id } = await request.json()

    if (!dashboard_id || !prompt_id) {
      return NextResponse.json(
        { error: 'dashboard_id and prompt_id are required' },
        { status: 400 }
      )
    }

    // Add to dismissed table
    const { error } = await supabase
      .from('dashboard_dismissed_prompts')
      .upsert({
        dashboard_id,
        prompt_id,
        dismissed_at: new Date().toISOString()
      }, {
        onConflict: 'dashboard_id,prompt_id'
      })

    if (error) {
      console.error('Failed to dismiss prompt:', error)
      throw error
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Dismiss prompt error:', error)
    return NextResponse.json(
      { error: 'Failed to dismiss prompt' },
      { status: 500 }
    )
  }
}
