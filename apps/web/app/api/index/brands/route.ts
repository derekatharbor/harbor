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

    const { data: brands, error, count } = await supabase
  .from('public_index')
  .select('*', { count: 'exact' })
  .gt('visibility_score', 0)
  .order('rank_global', { ascending: true })
  .range(0, 9999)  // Get up to 10,000 rows (you have 1,326)

if (error) {
  throw error
}

console.log(`📊 Total count: ${count}, Fetched: ${brands?.length || 0} brands from public_index`)

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