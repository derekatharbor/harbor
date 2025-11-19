// apps/web/app/brands/page.tsx
// Public brand leaderboard (using /brands instead of /index to avoid Next.js bug)

import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

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
    .limit(100)

  return brands || []
}

export default async function BrandsPage() {
  const brands = await getBrands()

  return (
    <div className="min-h-screen bg-[#0A0F1A] text-white p-12">
      <h1 className="text-4xl font-bold mb-8">Harbor AI Index</h1>
      <p className="mb-8 text-white/70">
        {brands.length} brands found
      </p>

      <div className="space-y-4">
        {brands.map((brand: any) => (
          <Link
            key={brand.id}
            href={`/brands/${brand.slug}`}
            className="block p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <div className="font-bold">{brand.brand_name}</div>
            <div className="text-sm text-white/50">{brand.domain}</div>
            <div className="text-sm text-white/40 mt-1">
              Score: {brand.visibility_score}% • Rank #{brand.rank_global}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
