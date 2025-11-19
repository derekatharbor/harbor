// apps/web/app/index/page.tsx
// Fixed version with proper imports

import { createClient } from '@supabase/supabase-js'
import dynamic from 'next/dynamic'

// Use dynamic import to avoid build-time issues
const IndexClient = dynamic(() => import('./IndexClient'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#0A0F1A] flex items-center justify-center">
      <div className="inline-block w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  )
})

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
  
  return <IndexClient initialBrands={initialBrands} />
}