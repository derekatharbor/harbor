// app/api/prompts/by-industry/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// Map user-friendly industry names to seed_prompts topics
const INDUSTRY_TO_TOPIC_MAP: Record<string, string[]> = {
  'Analytics & Business Intelligence': ['Analytics', 'Business Intelligence', 'Data Analytics', 'BI Tools'],
  'Consulting & Professional Services': ['Consulting', 'Professional Services'],
  'Customer Support': ['Customer Support', 'Help Desk', 'Customer Service', 'Support Software'],
  'Cybersecurity': ['Cybersecurity', 'Security', 'Information Security'],
  'Developer Tools': ['Developer Tools', 'Development', 'Programming', 'Software Development', 'DevOps'],
  'E-commerce & Retail': ['E-commerce', 'Retail', 'Online Shopping', 'Shopping'],
  'Education & E-learning': ['Education', 'E-learning', 'Learning', 'EdTech', 'Online Learning'],
  'Finance & Accounting': ['Finance', 'Accounting', 'Financial Services', 'Banking', 'Fintech'],
  'Food & Beverage': ['Food', 'Beverage', 'Restaurant', 'Food Delivery'],
  'Healthcare & Medical': ['Healthcare', 'Medical', 'Health', 'Health Tech'],
  'HR & Recruiting': ['HR', 'Recruiting', 'Human Resources', 'Talent', 'Hiring'],
  'Legal & Compliance': ['Legal', 'Compliance', 'Legal Tech'],
  'Manufacturing & Logistics': ['Manufacturing', 'Logistics', 'Supply Chain'],
  'Marketing & Advertising': ['Marketing', 'Advertising', 'Digital Marketing', 'MarTech', 'Marketing Automation'],
  'Media & Entertainment': ['Media', 'Entertainment', 'Streaming', 'Content'],
  'Nonprofit & Government': ['Nonprofit', 'Government', 'Public Sector'],
  'Project Management': ['Project Management', 'Task Management', 'Productivity', 'Collaboration'],
  'Real Estate': ['Real Estate', 'Property', 'PropTech'],
  'Sales & CRM': ['Sales', 'CRM', 'Customer Relationship', 'Sales Tools'],
  'Technology & SaaS': ['Technology', 'SaaS', 'Software', 'Tech', 'Cloud'],
  'Travel & Hospitality': ['Travel', 'Hospitality', 'Hotels', 'Tourism'],
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
    const topics = INDUSTRY_TO_TOPIC_MAP[industry] || [industry]
    
    // First try to find prompts matching the industry topics
    let { data: prompts, error } = await supabase
      .from('seed_prompts')
      .select('id, prompt_text, topic, intent')
      .in('topic', topics)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(50)
    
    if (error) {
      console.error('Error fetching prompts:', error)
      throw error
    }

    // If no prompts found for specific industry, fetch general/popular prompts
    if (!prompts || prompts.length === 0) {
      const { data: generalPrompts, error: generalError } = await supabase
        .from('seed_prompts')
        .select('id, prompt_text, topic, intent')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(30)
      
      if (generalError) throw generalError
      prompts = generalPrompts || []
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
