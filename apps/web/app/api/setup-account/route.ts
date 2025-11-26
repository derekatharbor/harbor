// apps/web/app/api/auth/setup-account/route.ts
import { createClient } from '@supabase/supabase-js'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    // Get the authenticated user from the session
    const cookieStore = cookies()
    const supabaseAuth = createRouteHandlerClient({ cookies: () => cookieStore })
    
    const { data: { session }, error: sessionError } = await supabaseAuth.auth.getSession()
    
    if (sessionError || !session?.user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const user = session.user

    // Use service role client to bypass RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

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
