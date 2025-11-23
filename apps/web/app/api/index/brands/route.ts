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

    // Fetch all brands in batches (Supabase has 1000 row limit per query)
    let allBrands: any[] = []
    let from = 0
    const batchSize = 1000
    let hasMore = true

    while (hasMore) {
      const { data: batch, error } = await supabase
        .from('public_index')
        .select('*')
        .gt('visibility_score', 0)
        .order('rank_global', { ascending: true })
        .range(from, from + batchSize - 1)

      if (error) {
        throw error
      }

      if (batch && batch.length > 0) {
        allBrands = [...allBrands, ...batch]
        from += batchSize
        
        // If we got less than a full batch, we're done
        if (batch.length < batchSize) {
          hasMore = false
        }
      } else {
        hasMore = false
      }
    }

    console.log(`📊 Fetched ${allBrands.length} brands from public_index (in ${Math.ceil(allBrands.length / batchSize)} batches)`)

    return NextResponse.json(allBrands, {
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