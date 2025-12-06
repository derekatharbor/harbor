// app/universities/[slug]/page.tsx
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import UniversityProfileClient from './UniversityProfileClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata({ 
  params 
}: { 
  params: { slug: string } 
}): Promise<Metadata> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return { title: 'University - Harbor' }
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { data: university } = await supabase
      .from('university_profiles')
      .select('name, short_name, visibility_score')
      .eq('slug', params.slug)
      .single()

    if (!university) {
      return { title: 'University Not Found - Harbor' }
    }

    const displayName = university.short_name || university.name
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://useharbor.io'

    return {
      title: `${displayName} AI Visibility - Harbor`,
      description: `See how AI models talk about ${displayName}. AI Visibility Score: ${university.visibility_score?.toFixed(1)}%. Track what ChatGPT, Claude, and Perplexity say about this university.`,
      openGraph: {
        title: `${displayName} AI Visibility - Harbor`,
        description: `What does AI say about ${displayName}? Visibility Score: ${university.visibility_score?.toFixed(1)}%`,
        url: `${siteUrl}/universities/${params.slug}`,
      },
    }
  } catch (error) {
    console.error('Metadata generation error:', error)
    return { title: 'University - Harbor' }
  }
}

export default async function UniversityProfilePage({ 
  params 
}: { 
  params: { slug: string } 
}) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: university, error } = await supabase
    .from('university_profiles')
    .select('*')
    .eq('slug', params.slug)
    .eq('is_active', true)
    .single()

  if (error || !university) {
    notFound()
  }

  // Fetch rivals if they exist
  let rivals: any[] = []
  if (university.rival_ids && university.rival_ids.length > 0) {
    const { data: rivalData } = await supabase
      .from('university_profiles')
      .select('*')
      .in('id', university.rival_ids)
      .eq('is_active', true)

    if (rivalData) {
      rivals = rivalData
    }
  }

  // Fetch real mentions with prompt info
  const { data: mentions } = await supabase
    .from('university_mentions')
    .select(`
      position,
      sentiment,
      context,
      created_at,
      prompt_executions!inner(
        model_id,
        seed_prompts!inner(prompt_text)
      )
    `)
    .eq('university_id', university.id)
    .order('created_at', { ascending: false })
    .limit(50)

  // Transform mentions into usable format
  const promptMentions = mentions?.map(m => ({
    prompt: (m.prompt_executions as any)?.seed_prompts?.prompt_text || 'Unknown prompt',
    position: m.position,
    sentiment: m.sentiment,
    model: (m.prompt_executions as any)?.model_id || 'Unknown',
    context: m.context
  })) || []

  return <UniversityProfileClient university={university} rivals={rivals} mentions={promptMentions} />
}