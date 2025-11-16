// app/api/gen/organization-schema/route.ts
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

    const { dashboardId, brandName, taskId } = await request.json()

    if (!dashboardId || !brandName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data: dashboard } = await supabase
      .from('dashboards')
      .select('*')
      .eq('id', dashboardId)
      .single()

    if (!dashboard) {
      return NextResponse.json(
        { error: 'Dashboard not found' },
        { status: 404 }
      )
    }

    const schema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": brandName,
      "url": dashboard.domain,
      "logo": `${dashboard.domain}/logo.png`,
      "description": `${brandName} is a leading company providing innovative solutions. Update this description with your actual brand value proposition.`,
      "sameAs": [
        `https://twitter.com/${brandName.toLowerCase().replace(/\s+/g, '')}`,
        `https://linkedin.com/company/${brandName.toLowerCase().replace(/\s+/g, '-')}`
      ]
    }

    const code = `<script type="application/ld+json">
${JSON.stringify(schema, null, 2)}
</script>

<!-- Instructions:
1. Replace the description with your actual brand value proposition
2. Update logo URL to point to your actual logo
3. Add real social media URLs (remove examples if you don't have them)
4. Consider adding: contactPoint, address, foundingDate
5. Paste this in the <head> section of your homepage
-->`

    await supabase.from('generated_snippets').insert({
      dashboard_id: dashboardId,
      action: 'organization-schema',
      inputs: { brandName, taskId },
      output: code
    })

    return NextResponse.json({
      success: true,
      code,
      schema
    })

  } catch (error) {
    console.error('Organization schema generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate schema' },
      { status: 500 }
    )
  }
}
