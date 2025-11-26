// apps/web/app/api/brands/route.ts
// Fetches brands - supports lookup by domain query parameter

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Check for domain query parameter
    const { searchParams } = new URL(request.url)
    const domain = searchParams.get('domain')

    if (domain) {
      // Look up by domain - try exact match first, then partial
      const cleanDomain = domain.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0]
      
      // Try exact domain match
      let { data: profile, error } = await supabase
        .from('ai_profiles')
        .select('*')
        .eq('domain', cleanDomain)
        .single()

      // If no exact match, try with www prefix
      if (!profile) {
        const result = await supabase
          .from('ai_profiles')
          .select('*')
          .eq('domain', `www.${cleanDomain}`)
          .single()
        profile = result.data
        error = result.error
      }

      // If still no match, try partial match on domain
      if (!profile) {
        const result = await supabase
          .from('ai_profiles')
          .select('*')
          .ilike('domain', `%${cleanDomain}%`)
          .limit(1)
          .single()
        profile = result.data
        error = result.error
      }

      if (profile) {
        return NextResponse.json({ profile })
      }

      // No profile found for this domain
      return NextResponse.json({ profile: null })
    }

    // Default: return all brands (paginated)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = (page - 1) * limit

    const { data: brands, error, count } = await supabase
      .from('ai_profiles')
      .select('*', { count: 'exact' })
      .order('rank_global', { ascending: true })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Brands fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch brands' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      brands: brands || [],
      total: count || 0,
      page,
      limit
    })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}