// apps/web/app/api/gen/faq-schema/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { dashboardId, brandName } = await request.json()

    if (!dashboardId || !brandName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data: dashboard } = await supabase
      .from('dashboards')
      .select('domain, metadata')
      .eq('id', dashboardId)
      .single()

    if (!dashboard) {
      return NextResponse.json(
        { error: 'Dashboard not found' },
        { status: 404 }
      )
    }

    // Get category from metadata if available
    const category = dashboard.metadata?.category || 'your industry'

    // Common FAQ questions based on brand visibility
    const faqs = [
      {
        question: `What is ${brandName}?`,
        answer: `${brandName} is a company in ${category}. Update this with your actual value proposition and what makes your brand unique.`
      },
      {
        question: `How does ${brandName} work?`,
        answer: `${brandName} provides [describe your core offering]. Replace this with a clear, 2-3 sentence explanation of how your product or service works.`
      },
      {
        question: `Who is ${brandName} for?`,
        answer: `${brandName} is designed for [describe your target customer]. Replace this with your ideal customer profile and use cases.`
      },
      {
        question: `How much does ${brandName} cost?`,
        answer: `${brandName} offers [pricing model]. Visit ${dashboard.domain}/pricing for detailed pricing information. Update this with your actual pricing approach.`
      },
      {
        question: `How do I get started with ${brandName}?`,
        answer: `You can get started with ${brandName} by [onboarding steps]. Replace this with your actual signup or onboarding process.`
      }
    ]

    const schema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    }

    const code = `<script type="application/ld+json">
${JSON.stringify(schema, null, 2)}
</script>

<!-- Instructions:
1. Replace the placeholder answers with your actual information
2. Add more questions if needed (common ones customers ask)
3. Make sure you also display these Q&As visibly on the page
4. Paste this in the <head> section of your FAQ or About page
5. The visible content should match the schema exactly

Good FAQ questions to consider:
- What problem does ${brandName} solve?
- How is ${brandName} different from competitors?
- What kind of results can I expect?
- Do you offer support/training?
- What integrations do you have?
-->`

    // Store in generated_snippets
    await supabase.from('generated_snippets').insert({
      dashboard_id: dashboardId,
      action: 'faq-schema',
      inputs: { brandName, category },
      output: code
    })

    return NextResponse.json({
      success: true,
      code,
      schema
    })

  } catch (error) {
    console.error('FAQ schema generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate FAQ schema' },
      { status: 500 }
    )
  }
}
