// API Route: GET /api/index/brands/search
// Server-side search for brands - no 10k limit issue

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Brandfetch logo URL helper
function getBrandfetchLogo(domain: string): string {
  return `https://cdn.brandfetch.io/${domain}/w/400/h/400?c=1id1Fyz-h7an5-5KR_y`
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')?.trim().toLowerCase()

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Search by brand_name or domain using ilike
    const { data: brands, error } = await supabase
      .from('ai_profiles')
      .select('id, brand_name, slug, domain, industry')
      .or(`brand_name.ilike.%${query}%,domain.ilike.%${query}%`)
      .limit(10)

    if (error) {
      console.error('Search error:', error)
      return NextResponse.json({ results: [] })
    }

    const results = (brands || []).map(b => ({
      ...b,
      logo_url: getBrandfetchLogo(b.domain)
    }))

    return NextResponse.json({ results })
  } catch (error: any) {
    console.error('Error in search API:', error)
    return NextResponse.json({ results: [] })
  }
}