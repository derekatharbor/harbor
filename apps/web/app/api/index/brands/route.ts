// API Route: GET /api/index/brands
// Returns list of all brands for the public index

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: brands, error } = await supabase
      .from('public_index')
      .select('*')
      .gt('visibility_score', 0)
      .order('rank_global', { ascending: true })

    if (error) {
      throw error
    }

    console.log(`📊 Fetched ${brands?.length || 0} brands from public_index`)

    return NextResponse.json(brands || [], {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
    })
  } catch (error: any) {
    console.error('Error fetching brands:', error)
    return NextResponse.json(
      { error: 'Failed to fetch brands' },
      { status: 500 }
    )
  }
}