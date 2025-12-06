// app/universities/compare/page.tsx
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import CompareClient from './CompareClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata({ 
  searchParams 
}: { 
  searchParams: { a?: string; b?: string } 
}): Promise<Metadata> {
  if (!searchParams.a || !searchParams.b) {
    return { title: 'Compare Universities - Harbor' }
  }

  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return { title: 'Compare Universities - Harbor' }
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { data: universities } = await supabase
      .from('university_profiles')
      .select('short_name, name, slug')
      .in('slug', [searchParams.a, searchParams.b])

    if (!universities || universities.length !== 2) {
      return { title: 'Compare Universities - Harbor' }
    }

    const uniA = universities.find(u => u.slug === searchParams.a)
    const uniB = universities.find(u => u.slug === searchParams.b)
    
    if (!uniA || !uniB) {
      return { title: 'Compare Universities - Harbor' }
    }

    const nameA = uniA.short_name || uniA.name
    const nameB = uniB.short_name || uniB.name
    
    return {
      title: `${nameA} vs ${nameB} - AI Visibility Comparison | Harbor`,
      description: `Compare how AI models talk about ${nameA} and ${nameB}. Head-to-head visibility scores, mentions, and sentiment analysis.`,
      openGraph: {
        title: `${nameA} vs ${nameB} - AI Visibility Matchup`,
        description: `Which university wins in AI visibility? Compare ${nameA} and ${nameB} head-to-head.`,
      },
      twitter: {
        card: 'summary',
        title: `${nameA} vs ${nameB} - AI Visibility Matchup`,
        description: `Which university wins in AI visibility? Compare ${nameA} and ${nameB} head-to-head.`,
      },
    }
  } catch (error) {
    console.error('Metadata generation error:', error)
    return { title: 'Compare Universities - Harbor' }
  }
}

export default async function ComparePage({ 
  searchParams 
}: { 
  searchParams: { a?: string; b?: string } 
}) {
  if (!searchParams.a || !searchParams.b) {
    redirect('/universities')
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: universities } = await supabase
    .from('university_profiles')
    .select('*')
    .in('slug', [searchParams.a, searchParams.b])
    .eq('is_active', true)

  if (!universities || universities.length !== 2) {
    redirect('/universities')
  }

  const uniA = universities.find(u => u.slug === searchParams.a)
  const uniB = universities.find(u => u.slug === searchParams.b)

  if (!uniA || !uniB) {
    redirect('/universities')
  }

  return <CompareClient universityA={uniA} universityB={uniB} />
}