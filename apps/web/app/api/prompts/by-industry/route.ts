// app/api/prompts/by-industry/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// Map user-friendly industry names to actual seed_prompts topics
const INDUSTRY_TO_TOPIC_MAP: Record<string, string[]> = {
  'Analytics & Business Intelligence': ['Analytics & BI', 'AI & Automation'],
  'Consulting & Professional Services': ['Communication', 'Project Management'],
  'Customer Support': ['Customer Support', 'Communication'],
  'Cybersecurity': ['Security'],
  'Developer Tools': ['Developer Tools', 'AI & Automation'],
  'E-commerce & Retail': ['E-commerce'],
  'Education & E-learning': ['Communication'], // Not universities!
  'Finance & Accounting': ['Finance & Accounting'],
  'Food & Beverage': ['E-commerce'], // Closest match
  'Healthcare & Medical': ['AI & Automation'],
  'HR & Recruiting': ['HR & Recruiting'],
  'Legal & Compliance': ['Security', 'Communication'],
  'Manufacturing & Logistics': ['Project Management'],
  'Marketing & Advertising': ['Marketing & SEO', 'Design & Creative'],
  'Media & Entertainment': ['Design & Creative', 'Communication'],
  'Nonprofit & Government': ['Communication', 'Project Management'],
  'Project Management': ['Project Management', 'Communication'],
  'Real Estate': ['CRM & Sales', 'Marketing & SEO'],
  'Sales & CRM': ['CRM & Sales', 'Marketing & SEO'],
  'Technology & SaaS': ['Developer Tools', 'AI & Automation', 'Analytics & BI'],
  'Travel & Hospitality': ['E-commerce', 'Customer Support'],
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const industry = searchParams.get('industry')
    
    if (!industry) {
      return NextResponse.json({ error: 'Industry parameter required' }, { status: 400 })
    }

    const supabase = createRouteHandlerClient({ cookies })
    
    // Get topics that match this industry
    const topics = INDUSTRY_TO_TOPIC_MAP[industry] || []
    
    let prompts: any[] = []
    
    // First try to find prompts matching the industry topics
    if (topics.length > 0) {
      const { data, error } = await supabase
        .from('seed_prompts')
        .select('id, prompt_text, topic, intent')
        .in('topic', topics)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(50)
      
      if (!error && data) {
        prompts = data
      }
    }

    // If no prompts found, get general brand prompts (EXCLUDE universities)
    if (prompts.length === 0) {
      const { data: generalPrompts, error: generalError } = await supabase
        .from('seed_prompts')
        .select('id, prompt_text, topic, intent')
        .eq('is_active', true)
        .neq('topic', 'universities') // Exclude university prompts!
        .order('created_at', { ascending: false })
        .limit(30)
      
      if (!generalError && generalPrompts) {
        prompts = generalPrompts
      }
    }

    return NextResponse.json({ 
      prompts,
      industry,
      matchedTopics: topics
    })

  } catch (error: any) {
    console.error('Error in by-industry API:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch prompts' },
      { status: 500 }
    )
  }
}