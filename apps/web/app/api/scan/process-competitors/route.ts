// apps/web/app/api/scan/process-competitors/route.ts
// Processes competitor data after a scan completes

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  return createClient(supabaseUrl, supabaseKey)
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export async function POST(req: NextRequest) {
  try {
    const { scanId, dashboardId } = await req.json()

    if (!scanId || !dashboardId) {
      return NextResponse.json(
        { error: 'scanId and dashboardId are required' },
        { status: 400 }
      )
    }

    console.log('[Process Competitors] Starting for scan:', scanId)

    const supabase = getSupabaseClient()

    // Get dashboard info
    const { data: dashboard } = await supabase
      .from('dashboards')
      .select('brand_name, metadata')
      .eq('id', dashboardId)
      .single()

    if (!dashboard) {
      return NextResponse.json({ error: 'Dashboard not found' }, { status: 404 })
    }

    const userBrand = dashboard.brand_name
    const userCategory = dashboard.metadata?.category || 'Unknown'

    console.log('[Process Competitors] User brand:', userBrand, 'Category:', userCategory)

    // 1. Get all competitor brands from results_shopping
    const { data: shoppingResults } = await supabase
      .from('results_shopping')
      .select('brand, model, category, rank')
      .eq('scan_id', scanId)
      .not('brand', 'is', null)

    if (!shoppingResults || shoppingResults.length === 0) {
      console.log('[Process Competitors] No shopping results found')
      return NextResponse.json({ 
        processed: 0,
        message: 'No shopping results to process'
      })
    }

    // 2. Aggregate competitor mentions
    const brandMentions = new Map<string, { 
      count: number, 
      models: Set<string>, 
      categories: Set<string>,
      avgRank: number,
      ranks: number[]
    }>()

    shoppingResults.forEach(result => {
      const brand = result.brand.trim()
      
      // Skip if it's the user's brand
      if (brand.toLowerCase() === userBrand.toLowerCase()) {
        return
      }

      if (!brandMentions.has(brand)) {
        brandMentions.set(brand, {
          count: 0,
          models: new Set(),
          categories: new Set(),
          avgRank: 0,
          ranks: []
        })
      }

      const data = brandMentions.get(brand)!
      data.count++
      if (result.model) data.models.add(result.model)
      if (result.category) data.categories.add(result.category)
      if (result.rank) data.ranks.push(result.rank)
    })

    console.log('[Process Competitors] Found', brandMentions.size, 'unique competitors')

    // Calculate average ranks
    brandMentions.forEach((data, brand) => {
      if (data.ranks.length > 0) {
        data.avgRank = Math.round(data.ranks.reduce((a, b) => a + b, 0) / data.ranks.length)
      }
    })

    // 3. Populate scan_competitors table
    const scanCompetitorsInserts = Array.from(brandMentions.entries()).map(([brand, data]) => ({
      scan_id: scanId,
      competitor_name: brand,
      mention_count: data.count,
      modules: ['shopping'], // Add more if we detect them in brand/conversations
      created_at: new Date().toISOString()
    }))

    const { error: scanCompError } = await supabase
      .from('scan_competitors')
      .upsert(scanCompetitorsInserts, {
        onConflict: 'scan_id,competitor_name',
        ignoreDuplicates: false
      })

    if (scanCompError) {
      console.error('[Process Competitors] Error inserting scan_competitors:', scanCompError)
    } else {
      console.log('[Process Competitors] Inserted', scanCompetitorsInserts.length, 'scan_competitors')
    }

    // 4. Create/update ai_profiles for each competitor
    const totalMentions = shoppingResults.length
    const aiProfilesUpserts = []

    for (const [brand, data] of brandMentions.entries()) {
      // Calculate visibility score (percentage of total mentions)
      const visibilityScore = Math.round((data.count / totalMentions) * 100)

      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('ai_profiles')
        .select('id, visibility_score')
        .eq('brand_name', brand)
        .single()

      const profileData: any = {
        brand_name: brand,
        slug: slugify(brand),
        domain: `${slugify(brand)}.com`, // Placeholder
        industry: userCategory,
        visibility_score: visibilityScore,
        last_scan_at: new Date().toISOString(),
        feed_data: {
          last_updated: new Date().toISOString(),
          mention_count: data.count,
          models: Array.from(data.models),
          categories: Array.from(data.categories),
          avg_rank: data.avgRank
        }
      }

      if (existingProfile) {
        // Update existing
        profileData.id = existingProfile.id
        profileData.previous_visibility_score = existingProfile.visibility_score
        profileData.score_change = visibilityScore - (existingProfile.visibility_score || 0)
        // Note: scan_count will be incremented separately
      } else {
        // New profile
        profileData.generated_at = new Date().toISOString()
        profileData.generation_method = 'scan_detection'
        profileData.scan_count = 1
      }

      aiProfilesUpserts.push(profileData)
    }

    // Batch upsert ai_profiles
    if (aiProfilesUpserts.length > 0) {
      const { error: profileError } = await supabase
        .from('ai_profiles')
        .upsert(aiProfilesUpserts, {
          onConflict: 'brand_name',
          ignoreDuplicates: false
        })

      if (profileError) {
        console.error('[Process Competitors] Error upserting ai_profiles:', profileError)
      } else {
        console.log('[Process Competitors] Upserted', aiProfilesUpserts.length, 'ai_profiles')
      }
    }

    // 5. Update visibility_scores with competitor_overlap
    const { error: visScoreError } = await supabase
      .from('visibility_scores')
      .update({ 
        competitor_overlap: brandMentions.size
      })
      .eq('scan_id', scanId)

    if (visScoreError) {
      console.error('[Process Competitors] Error updating visibility_scores:', visScoreError)
    }

    // 6. Calculate industry rankings
    if (userCategory !== 'Unknown') {
      const { data: allIndustryProfiles } = await supabase
        .from('ai_profiles')
        .select('id, visibility_score')
        .ilike('industry', `%${userCategory}%`)
        .not('visibility_score', 'is', null)
        .order('visibility_score', { ascending: false })

      if (allIndustryProfiles && allIndustryProfiles.length > 0) {
        // Update rank_in_industry for each
        const rankUpdates = allIndustryProfiles.map((profile, index) => ({
          id: profile.id,
          rank_in_industry: index + 1
        }))

        for (const update of rankUpdates) {
          await supabase
            .from('ai_profiles')
            .update({ rank_in_industry: update.rank_in_industry })
            .eq('id', update.id)
        }

        console.log('[Process Competitors] Updated industry rankings for', rankUpdates.length, 'profiles')
      }
    }

    return NextResponse.json({
      success: true,
      processed: brandMentions.size,
      scan_competitors_created: scanCompetitorsInserts.length,
      ai_profiles_updated: aiProfilesUpserts.length
    })

  } catch (error) {
    console.error('[Process Competitors] Critical error:', error)
    return NextResponse.json(
      { error: 'Failed to process competitors', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}