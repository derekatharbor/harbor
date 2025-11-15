// app/api/gen/product-schema/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { dashboardId, brandName, taskId } = await request.json()

    if (!dashboardId || !brandName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Fetch dashboard info
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

    // Generate Product JSON-LD schema
    const schema = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": `${brandName} [Product Name]`,
      "description": "A clear, factual description of what this product is and who it's for. Focus on capabilities, use cases, and key features. 120-150 words.",
      "brand": {
        "@type": "Brand",
        "name": brandName
      },
      "offers": {
        "@type": "Offer",
        "url": `${dashboard.domain}/product-url`,
        "priceCurrency": "USD",
        "price": "99.00",
        "availability": "https://schema.org/InStock",
        "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.5",
        "reviewCount": "100"
      }
    }

    const code = `<script type="application/ld+json">
${JSON.stringify(schema, null, 2)}
</script>

<!-- Instructions:
1. Replace [Product Name] with your actual product name
2. Update the description with your product details
3. Set the correct price and currency
4. Update the product URL
5. Add real rating data if you have reviews
6. Paste this into the <head> section of your product page template
-->`

    // Log generation in DB
    await supabase.from('generated_snippets').insert({
      dashboard_id: dashboardId,
      action: 'product-schema',
      inputs: { brandName, taskId },
      output: code
    })

    return NextResponse.json({
      success: true,
      code,
      schema
    })

  } catch (error) {
    console.error('Product schema generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate schema' },
      { status: 500 }
    )
  }
}
