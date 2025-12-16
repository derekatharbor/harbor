// app/api/prompts/track/route.ts
// Add a seed_prompt to user's dashboard_prompts (tracking it)

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
export const dynamic = 'force-dynamic'

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

    // Check if already tracked
    const { data: existing } = await supabase
      .from('dashboard_prompts')
      .select('id')
      .eq('dashboard_id', dashboard_id)
      .eq('prompt_id', prompt_id)
      .single()

    if (existing) {
      return NextResponse.json({ success: true, message: 'Already tracked' })
    }

    // Add to dashboard_prompts
    const { error } = await supabase
      .from('dashboard_prompts')
      .insert({
        dashboard_id,
        prompt_id
      })

    if (error) {
      console.error('Failed to track prompt:', error)
      throw error
    }

    // Also remove from dismissed if it was there
    await supabase
      .from('dashboard_dismissed_prompts')
      .delete()
      .eq('dashboard_id', dashboard_id)
      .eq('prompt_id', prompt_id)

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Track prompt error:', error)
    return NextResponse.json(
      { error: 'Failed to track prompt' },
      { status: 500 }
    )
  }
}
