// apps/web/app/index/page.tsx
// Fully server-side rendered index page

import { createClient } from '@supabase/supabase-js'
import IndexPageClient from './IndexClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getBrands() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: brands, error } = await supabase
      .from('public_index')
      .select('*')
      .order('rank_global', { ascending: true })
      .limit(1000)

    if (error) throw error
    return brands || []
  } catch (error) {
    console.error('Error fetching brands:', error)
    return []
  }
}

export default async function IndexPage() {
  const initialBrands = await getBrands()
  
  return <IndexPageClient initialBrands={initialBrands} />
}