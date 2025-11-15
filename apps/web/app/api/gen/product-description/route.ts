// app/api/gen/product-description/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    // Initialize Supabase client INSIDE the function (runtime only)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { dashboardId, brandName, productName, currentDescription } = await request.json()

    if (!dashboardId || !brandName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // For now, generate a template description
    // In production, you'd use Claude API here to generate this
    const description = `${brandName}${productName ? ` ${productName}` : ''} is a comprehensive solution designed for businesses seeking to streamline their operations and improve efficiency. Built with modern technology and user experience in mind, it offers powerful features that integrate seamlessly into existing workflows.

Key capabilities include automated workflows, real-time analytics, and enterprise-grade security. The platform is designed for teams of all sizes, from startups to large enterprises, with flexible pricing and deployment options.

Common use cases include workflow automation, data analysis, team collaboration, and process optimization. Users can customize the platform to their specific needs through an intuitive interface that requires no technical expertise.

The solution integrates with popular business tools and provides comprehensive API access for custom integrations. With dedicated support and extensive documentation, teams can get started quickly and scale as their needs grow.`

    // Log generation
    await supabase.from('generated_snippets').insert({
      dashboard_id: dashboardId,
      action: 'product-description',
      inputs: { brandName, productName, currentDescription },
      output: description
    })

    return NextResponse.json({
      success: true,
      content: description,
      note: 'Edit this description to match your actual product features and benefits. Keep it factual and clear—AI models prefer plain language over marketing jargon.'
    })

  } catch (error) {
    console.error('Description generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate description' },
      { status: 500 }
    )
  }
}