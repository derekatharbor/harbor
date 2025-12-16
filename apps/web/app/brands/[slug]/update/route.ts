// apps/web/app/api/brands/[slug]/update/route.ts
// Updates brand feed_data for claimed profiles
// Handles all visibility-shaping fields for harbor.json

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const body = await request.json()
    
    const {
      // Top-level profile fields
      brand_name,
      
      // Core info
      description,
      one_line_summary,
      category,
      icp,
      offerings,
      faqs,
      companyInfo,
      
      // Hallucination zones (the moat)
      pricing,
      integrations,
      use_cases,
      corrections,
      competitor_context,
      authoritative_sources,
      
      // Freshness & trust
      recent_updates,
      security_compliance
    } = body

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
      .select('id, claimed, feed_data, brand_name')
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
    const now = new Date().toISOString()
    
    // Use new brand_name if provided, otherwise keep existing
    const updatedBrandName = brand_name?.trim() || brand.brand_name
    
    const updatedFeedData = {
      ...currentFeedData,
      
      // Version & timestamps
      version: '2.0',
      last_updated_at: now,
      
      // Brand name (sync with top-level)
      brand_name: updatedBrandName,
      
      // Core info
      short_description: description ?? currentFeedData.short_description,
      one_line_summary: one_line_summary ?? currentFeedData.one_line_summary,
      category: category ?? currentFeedData.category,
      icp: icp ?? currentFeedData.icp,
      offerings: offerings ?? currentFeedData.offerings ?? [],
      faqs: faqs ?? currentFeedData.faqs ?? [],
      company_info: {
        ...(currentFeedData.company_info || {}),
        ...(companyInfo || {})
      },
      
      // Hallucination zones (the moat - data AI gets wrong)
      pricing: pricing ?? currentFeedData.pricing ?? null,
      integrations: integrations ?? currentFeedData.integrations ?? [],
      use_cases: use_cases ?? currentFeedData.use_cases ?? [],
      corrections: corrections ?? currentFeedData.corrections ?? [],
      competitor_context: competitor_context ?? currentFeedData.competitor_context ?? [],
      authoritative_sources: authoritative_sources ?? currentFeedData.authoritative_sources ?? [],
      
      // Freshness & trust
      recent_updates: recent_updates ?? currentFeedData.recent_updates ?? [],
      security_compliance: security_compliance ?? currentFeedData.security_compliance ?? null,
      
      // Verification metadata
      verified: true,
      verified_at: brand.claimed ? (currentFeedData.verified_at || now) : null,
    }

    // Build the update object - always update feed_data and timestamp
    const updatePayload: Record<string, any> = {
      feed_data: updatedFeedData,
      last_updated_at: now
    }
    
    // Also update top-level brand_name if it changed
    if (brand_name?.trim() && brand_name.trim() !== brand.brand_name) {
      updatePayload.brand_name = brand_name.trim()
    }

    // Update the brand
    const { error: updateError } = await supabase
      .from('ai_profiles')
      .update(updatePayload)
      .eq('id', brand.id)

    if (updateError) {
      console.error('Failed to update brand:', updateError)
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    // Log what was updated
    const updatedFields = Object.entries(body)
      .filter(([_, v]) => v !== undefined && v !== null)
      .map(([k]) => k)
    
    console.log(`✅ Profile updated: ${params.slug}`)
    console.log(`   Fields: ${updatedFields.join(', ')}`)

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      updated_fields: updatedFields
    })

  } catch (error: any) {
    console.error('Brand update error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
