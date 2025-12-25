// DESTINATION: ~/Claude Harbor/apps/web/app/api/agencies/workspace/route.ts
// API to save/manage pitch workspace items

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function getUser(request: NextRequest) {
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
      },
    }
  )
  
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// POST - Add audit to workspace
export async function POST(request: NextRequest) {
  try {
    const user = await getUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const { audit_id, status = 'prospect', notes = null } = await request.json()
    
    if (!audit_id) {
      return NextResponse.json(
        { error: 'Missing audit_id' },
        { status: 400 }
      )
    }
    
    const supabase = getServiceSupabase()
    
    // Check if already in workspace
    const { data: existing } = await supabase
      .from('pitch_workspace')
      .select('id')
      .eq('user_id', user.id)
      .eq('audit_id', audit_id)
      .single()
    
    if (existing) {
      return NextResponse.json(
        { error: 'Already in workspace', id: existing.id },
        { status: 409 }
      )
    }
    
    // Add to workspace
    const { data, error } = await supabase
      .from('pitch_workspace')
      .insert({
        user_id: user.id,
        audit_id,
        status,
        notes
      })
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json({ success: true, id: data.id })
    
  } catch (error) {
    console.error('Workspace save error:', error)
    return NextResponse.json(
      { error: 'Failed to save to workspace' },
      { status: 500 }
    )
  }
}

// GET - Check if audit is in workspace
export async function GET(request: NextRequest) {
  try {
    const user = await getUser(request)
    
    if (!user) {
      return NextResponse.json({ in_workspace: false, authenticated: false })
    }
    
    const { searchParams } = new URL(request.url)
    const auditId = searchParams.get('audit_id')
    
    if (!auditId) {
      return NextResponse.json(
        { error: 'Missing audit_id' },
        { status: 400 }
      )
    }
    
    const supabase = getServiceSupabase()
    
    const { data } = await supabase
      .from('pitch_workspace')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('audit_id', auditId)
      .single()
    
    return NextResponse.json({
      authenticated: true,
      in_workspace: !!data,
      workspace_id: data?.id || null,
      status: data?.status || null
    })
    
  } catch (error) {
    return NextResponse.json({ in_workspace: false, authenticated: true })
  }
}
