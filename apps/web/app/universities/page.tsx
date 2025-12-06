// app/universities/page.tsx
import { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import UniversityIndexClient from './UniversityIndexClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'University AI Rankings - The AI Admissions Office | Harbor',
  description: 'See how AI models rank America\'s top universities. Compare schools, track visibility scores, and understand how ChatGPT and Claude talk about higher education.',
  openGraph: {
    title: 'University AI Rankings - Harbor',
    description: 'See how AI models rank America\'s top universities. Compare schools head-to-head.',
  },
}

export default async function UniversitiesPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Fetch top 100 universities for initial render
  // Sort by visibility_score first, then us_news_rank as fallback
  const { data: topUniversities, error } = await supabase
    .from('university_profiles')
    .select('*')
    .eq('is_active', true)
    .order('visibility_score', { ascending: false, nullsFirst: false })
    .order('us_news_rank', { ascending: true, nullsFirst: true })
    .limit(100)

  // Also fetch rivalry schools to ensure they're always included
  const rivalrySlugs = [
    'harvard', 'yale', 'stanford', 'uc-berkeley', 'michigan', 'ohio-state',
    'duke', 'unc', 'usc', 'ucla', 'texas', 'texas-am', 'penn-state'
  ]
  
  const { data: rivalrySchools } = await supabase
    .from('university_profiles')
    .select('*')
    .eq('is_active', true)
    .in('slug', rivalrySlugs)

  // Merge and deduplicate
  const allSchools = [...(topUniversities || [])]
  for (const school of (rivalrySchools || [])) {
    if (!allSchools.find(s => s.id === school.id)) {
      allSchools.push(school)
    }
  }

  if (error) {
    console.error('Error fetching universities:', error)
  }

  // Get total count
  const { count } = await supabase
    .from('university_profiles')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  return <UniversityIndexClient universities={allSchools || []} totalCount={count || 0} />
}