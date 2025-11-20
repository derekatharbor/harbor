// apps/web/app/api/brands/[slug]/update/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Check for env vars - critical for build time
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const { brand_id, description, products, faqs, company_info } = await request.json()

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Fetch the brand to get its ID
    const { data: brand, error: brandError } = await supabase
      .from('ai_profiles')
      .select('id')
      .eq('slug', params.slug)
      .single()

    if (brandError || !brand) {
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      )
    }

    // Check if canonical profile already exists
    const { data: existing } = await supabase
      .from('canonical_profiles')
      .select('id')
      .eq('brand_id', brand.id)
      .single()

    const profileData = {
      brand_id: brand.id,
      description,
      products,
      faqs,
      company_info,
      updated_at: new Date().toISOString()
    }

    if (existing) {
      // Update existing
      const { error: updateError } = await supabase
        .from('canonical_profiles')
        .update(profileData)
        .eq('brand_id', brand.id)

      if (updateError) {
        console.error('Update error:', updateError)
        return NextResponse.json(
          { error: 'Failed to update profile' },
          { status: 500 }
        )
      }
    } else {
      // Insert new
      const { error: insertError } = await supabase
        .from('canonical_profiles')
        .insert(profileData)

      if (insertError) {
        console.error('Insert error:', insertError)
        return NextResponse.json(
          { error: 'Failed to create profile' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ 
      success: true,
      message: 'Profile updated successfully' 
    })

  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}