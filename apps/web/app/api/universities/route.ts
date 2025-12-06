// app/api/universities/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '50')
  const conference = searchParams.get('conference')
  const type = searchParams.get('type')
  const search = searchParams.get('search')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  let query = supabase
    .from('university_profiles')
    .select('*')
    .eq('is_active', true)
    .order('visibility_score', { ascending: false })
    .limit(limit)

  if (conference && conference !== 'All Conferences') {
    query = query.eq('athletic_conference', conference)
  }

  if (type && type !== 'all') {
    query = query.eq('institution_type', type)
  }

  if (search) {
    // Search by name or short_name
    query = query.or(`name.ilike.%${search}%,short_name.ilike.%${search}%`)
  }

  const { data, error } = await query

  if (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data || [])
}
