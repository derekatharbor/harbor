// API Route: GET /api/index/brands
// Returns list of all brands for the public index

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const { data: brands, error } = await supabase
      .from('public_index')
      .select('*')
      .order('rank_global', { ascending: true })
      .limit(1000) // Return top 1000 for performance

    if (error) {
      throw error
    }

    return NextResponse.json(brands)
  } catch (error: any) {
    console.error('Error fetching brands:', error)
    return NextResponse.json(
      { error: 'Failed to fetch brands' },
      { status: 500 }
    )
  }
}
