// apps/web/app/api/auth/setup-account/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    // Get access token from Authorization header
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing authorization token' },
        { status: 401 }
      )
    }

    const accessToken = authHeader.replace('Bearer ', '')

    // Use service role client to bypass RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    // Verify the token and get user
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(accessToken)

    if (userError || !user) {
      console.error('Invalid token:', userError)
      return NextResponse.json(
        { error: 'Invalid authorization token' },
        { status: 401 }
      )
    }

    // Check if user already has an org
    const { data: existingRole } = await supabaseAdmin
      .from('user_roles')
      .select('org_id')
      .eq('user_id', user.id)
      .single()

    if (existingRole?.org_id) {
      // Already set up, return success
      return NextResponse.json({ success: true, org_id: existingRole.org_id })
    }

    // Create organization
    const orgName = user.email?.split('@')[0] || 'My Organization'
    const { data: org, error: orgError } = await supabaseAdmin
      .from('orgs')
      .insert({ name: orgName })
      .select()
      .single()

    if (orgError) {
      console.error('Error creating org:', orgError)
      return NextResponse.json(
        { error: 'Failed to create organization' },
        { status: 500 }
      )
    }

    // Create user role
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: user.id,
        org_id: org.id,
        role: 'owner',
      })

    if (roleError) {
      console.error('Error creating user role:', roleError)
      return NextResponse.json(
        { error: 'Failed to create user role' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, org_id: org.id })

  } catch (error) {
    console.error('Setup account error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}