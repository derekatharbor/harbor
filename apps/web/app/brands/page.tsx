// apps/web/app/brands/page.tsx
// Public brand leaderboard

import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import Image from 'next/image'
import { TrendingUp, ArrowRight } from 'lucide-react'
import BrandsClient from './BrandsClient'

export const dynamic = 'force-dynamic'

async function getBrands() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
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

  return <BrandsClient brands={brands} />
}