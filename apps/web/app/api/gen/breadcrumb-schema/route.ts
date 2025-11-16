// apps/web/app/api/gen/breadcrumb-schema/route.ts

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

    const { dashboardId, brandName, pageType } = await request.json()

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

    // Generate breadcrumb examples for common page types
    const breadcrumbExamples = {
      product: {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": `https://${dashboard.domain}`
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Products",
            "item": `https://${dashboard.domain}/products`
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": "[Product Name]",
            "item": `https://${dashboard.domain}/products/product-name`
          }
        ]
      },
      about: {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": `https://${dashboard.domain}`
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "About",
            "item": `https://${dashboard.domain}/about`
          }
        ]
      },
      support: {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": `https://${dashboard.domain}`
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Support",
            "item": `https://${dashboard.domain}/support`
          }
        ]
      }
    }

    // Use the requested page type or default to product
    const schema = breadcrumbExamples[pageType as keyof typeof breadcrumbExamples] || breadcrumbExamples.product

    const code = `<script type="application/ld+json">
${JSON.stringify(schema, null, 2)}
</script>

<!-- Instructions:
1. Replace [Product Name] and URLs with your actual page names and paths
2. Make sure you have visible breadcrumb navigation on the page (e.g., Home > Products > Product Name)
3. The schema should match what users see on the page
4. Paste this in the <head> section of each page
5. Update the position numbers if you add more levels

Example breadcrumb trails:
- Product page: Home > Products > Category > Product Name (4 levels)
- Blog post: Home > Blog > Category > Post Title (4 levels)
- Support article: Home > Support > Topic > Article (4 levels)

Each level needs:
- position: sequential number (1, 2, 3...)
- name: visible text users see
- item: full URL to that page
-->`

    // Store in generated_snippets
    await supabase.from('generated_snippets').insert({
      dashboard_id: dashboardId,
      action: 'breadcrumb-schema',
      inputs: { brandName, pageType: pageType || 'product' },
      output: code
    })

    return NextResponse.json({
      success: true,
      code,
      schema
    })

  } catch (error) {
    console.error('Breadcrumb schema generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate breadcrumb schema' },
      { status: 500 }
    )
  }
}
