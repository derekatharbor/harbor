// apps/web/app/api/brands/[slug]/update/route.ts
// Updates brand feed_data for claimed profiles

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { description, offerings, faqs, companyInfo } = await request.json()

    // Create Supabase client
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Get current brand
    const { data: brand, error: fetchError } = await supabase
      .from('ai_profiles')
      .select('id, claimed, feed_data')
      .eq('slug', params.slug)
      .single()

    if (fetchError || !brand) {
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      )
    }

    // Check if claimed
    if (!brand.claimed) {
      return NextResponse.json(
        { error: 'This profile must be claimed before editing' },
        { status: 403 }
      )
    }

    // Build updated feed_data
    const currentFeedData = brand.feed_data || {}
    const updatedFeedData = {
      ...currentFeedData,
      short_description: description || currentFeedData.short_description,
      offerings: offerings || currentFeedData.offerings || [],
      faqs: faqs || currentFeedData.faqs || [],
      company_info: {
        ...(currentFeedData.company_info || {}),
        ...companyInfo
      },
      last_updated_at: new Date().toISOString()
    }

    // Update the brand
    const { error: updateError } = await supabase
      .from('ai_profiles')
      .update({
        feed_data: updatedFeedData,
        last_updated_at: new Date().toISOString()
      })
      .eq('id', brand.id)

    if (updateError) {
      console.error('Failed to update brand:', updateError)
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    console.log(`✅ Profile updated successfully:`)
    console.log(`   Brand: ${params.slug}`)
    console.log(`   Updated fields: ${Object.keys({ description, offerings, faqs, companyInfo }).filter(k => !!arguments[0][k]).join(', ')}`)

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully'
    })

  } catch (error: any) {
    console.error('Brand update error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}