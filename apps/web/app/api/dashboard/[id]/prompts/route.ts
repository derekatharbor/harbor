// apps/web/app/api/dashboard/[id]/prompts/topics/route.ts
// API for managing prompt topics

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  return createClient(supabaseUrl, supabaseKey)
}

// POST - Create a new topic
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: dashboardId } = await params

  try {
    const supabase = getSupabaseClient()
    const body = await request.json()
    const { name, color = '#6B7280' } = body

    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Topic name is required' },
        { status: 400 }
      )
    }

    // Check if topic already exists
    const { data: existing } = await supabase
      .from('prompt_topics')
      .select('id')
      .eq('dashboard_id', dashboardId)
      .ilike('name', name.trim())
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'A topic with this name already exists' },
        { status: 400 }
      )
    }

    // Create topic
    const { data: topic, error } = await supabase
      .from('prompt_topics')
      .insert({
        dashboard_id: dashboardId,
        name: name.trim(),
        color
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      topic: {
        ...topic,
        prompt_count: 0,
        avg_visibility: 0
      }
    })
  } catch (error: any) {
    console.error('Error creating topic:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create topic' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a topic
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: dashboardId } = await params

  try {
    const supabase = getSupabaseClient()
    const { searchParams } = new URL(request.url)
    const topicId = searchParams.get('topicId')

    if (!topicId) {
      return NextResponse.json(
        { error: 'Topic ID is required' },
        { status: 400 }
      )
    }

    // Delete topic (prompts will have topic_id set to null due to ON DELETE SET NULL)
    const { error } = await supabase
      .from('prompt_topics')
      .delete()
      .eq('id', topicId)
      .eq('dashboard_id', dashboardId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting topic:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete topic' },
      { status: 500 }
    )
  }
}

// PATCH - Update a topic
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: dashboardId } = await params

  try {
    const supabase = getSupabaseClient()
    const body = await request.json()
    const { topicId, name, color } = body

    if (!topicId) {
      return NextResponse.json(
        { error: 'Topic ID is required' },
        { status: 400 }
      )
    }

    const updates: any = { updated_at: new Date().toISOString() }
    if (name) updates.name = name.trim()
    if (color) updates.color = color

    const { error } = await supabase
      .from('prompt_topics')
      .update(updates)
      .eq('id', topicId)
      .eq('dashboard_id', dashboardId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error updating topic:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update topic' },
      { status: 500 }
    )
  }
}