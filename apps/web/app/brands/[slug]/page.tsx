// apps/web/app/brands/page.tsx

import { createClient } from '@supabase/supabase-js'
import HarborIndexClient from './HarborIndexClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getBrands() {
  // Return empty array during build
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return []
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { data: brands } = await supabase
    .from('public_index')
    .select('*')
    .order('rank_global', { ascending: true })
    .limit(1000)

  return brands || []
}

export default async function BrandsPage() {
  const brands = await getBrands()

  return <HarborIndexClient brands={brands} />
}