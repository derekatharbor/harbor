// app/api/onboarding/create-dashboard/route.ts
// Updated to handle new onboarding flow with AI-generated topics and prompts
import { createClient } from '@supabase/supabase-js'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { 
      brandName, 
      domain, 
      accountType,      // 'agency' | 'inhouse' - new
      topics,           // string[] - selected topic names
      prompts,          // { topic: string, text: string }[] - AI-generated prompts
      industry,         // Legacy support
      selectedPromptIds,// Legacy support - existing seed_prompt IDs
      competitorProfileIds 
    } = await request.json()

    if (!brandName || !domain) {
      return NextResponse.json(
        { error: 'Brand name and domain are required' },
        { status: 400 }
      )
    }

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

    // Get user's org
    const { data: userRole, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('org_id')
      .eq('user_id', user.id)
      .single()

    if (roleError || !userRole?.org_id) {
      console.error('No org found for user:', user.id, roleError)
      return NextResponse.json(
        { error: 'No organization found. Please try signing up again.' },
        { status: 400 }
      )
    }

    // Check if user already has a dashboard
    const { data: existingDashboards } = await supabaseAdmin
      .from('dashboards')
      .select('id')
      .eq('org_id', userRole.org_id)
      .limit(1)

    if (existingDashboards && existingDashboards.length > 0) {
      return NextResponse.json({
        success: true,
        dashboardId: existingDashboards[0].id,
        dashboard: existingDashboards[0],
        existing: true
      })
    }

    // Clean domain
    const cleanDomain = domain
      .trim()
      .toLowerCase()
      .replace(/^(https?:\/\/)?(www\.)?/, '')
      .replace(/\/.*$/, '')

    // Check if domain is already claimed
    const { data: existingDomainDashboard } = await supabaseAdmin
      .from('dashboards')
      .select('id, org_id, brand_name')
      .eq('domain', cleanDomain)
      .single()

    if (existingDomainDashboard) {
      if (existingDomainDashboard.org_id === userRole.org_id) {
        return NextResponse.json({
          success: true,
          dashboardId: existingDomainDashboard.id,
          dashboard: existingDomainDashboard,
          existing: true
        })
      }
      return NextResponse.json(
        { 
          error: `This domain is already claimed. If this is your brand, please contact support.`,
          code: 'DOMAIN_CLAIMED'
        },
        { status: 409 }
      )
    }

    // Create dashboard with new metadata structure
    const { data: dashboard, error: dashboardError } = await supabaseAdmin
      .from('dashboards')
      .insert({
        org_id: userRole.org_id,
        brand_name: brandName.trim(),
        domain: cleanDomain,
        plan: 'solo',
        metadata: {
          accountType: accountType || 'inhouse',
          topics: topics || [],
          category: industry || null,
          categorySource: industry ? 'user' : (topics?.length ? 'ai-generated' : null),
          onboardingVersion: 2
        }
      })
      .select()
      .single()

    if (dashboardError) {
      console.error('Error creating dashboard:', dashboardError)
      return NextResponse.json(
        { error: 'Failed to create dashboard' },
        { status: 500 }
      )
    }

    // Handle AI-generated prompts (new flow)
    if (prompts && Array.isArray(prompts) && prompts.length > 0) {
      const promptInserts = prompts.map((p: { topic: string; text: string }) => ({
        dashboard_id: dashboard.id,
        prompt_text: p.text,
        topic: p.topic,
        source: 'ai-generated',
        is_active: true,
        created_at: new Date().toISOString()
      }))

      const { error: userPromptsError } = await supabaseAdmin
        .from('user_prompts')
        .insert(promptInserts)

      if (userPromptsError) {
        console.error('Error saving user prompts:', userPromptsError)
        // Don't fail the whole request
      }
    }

    // Handle legacy seed_prompt IDs
    if (selectedPromptIds && selectedPromptIds.length > 0) {
      const promptInserts = selectedPromptIds.map((promptId: string) => ({
        dashboard_id: dashboard.id,
        prompt_id: promptId
      }))

      const { error: promptsError } = await supabaseAdmin
        .from('dashboard_prompts')
        .insert(promptInserts)

      if (promptsError) {
        console.error('Error saving dashboard prompts:', promptsError)
      }
    }

    // Save selected competitors
    if (competitorProfileIds && competitorProfileIds.length > 0) {
      const competitorInserts = competitorProfileIds.map((profileId: string) => ({
        dashboard_id: dashboard.id,
        profile_id: profileId
      }))

      const { error: competitorsError } = await supabaseAdmin
        .from('dashboard_competitors')
        .insert(competitorInserts)

      if (competitorsError) {
        console.error('Error saving dashboard competitors:', competitorsError)
      }
    }

    return NextResponse.json({
      success: true,
      dashboardId: dashboard.id,
      dashboard,
      existing: false
    })

  } catch (error) {
    console.error('Create dashboard error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}