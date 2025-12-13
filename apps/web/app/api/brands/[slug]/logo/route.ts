// apps/web/app/api/brands/[slug]/logo/route.ts
// POST /api/brands/[slug]/logo - Upload logo for claimed brand profile

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'Missing file' },
        { status: 400 }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get brand to verify it exists
    const { data: brand, error: brandError } = await supabase
      .from('brand_profiles')
      .select('id')
      .eq('slug', slug)
      .single()

    if (brandError || !brand) {
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      )
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${slug}-${Date.now()}.${fileExt}`
    const filePath = `brands/${slug}/${fileName}`

    // Convert File to ArrayBuffer for Supabase upload
    const arrayBuffer = await file.arrayBuffer()
    const fileBuffer = new Uint8Array(arrayBuffer)

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('logos')
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) {
      console.error('Supabase upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload file', message: uploadError.message },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('logos')
      .getPublicUrl(filePath)

    const publicUrl = urlData.publicUrl

    // Update brand_profiles with new logo URL
    const { error: updateError } = await supabase
      .from('brand_profiles')
      .update({ logo_url: publicUrl })
      .eq('slug', slug)

    if (updateError) {
      console.error('Failed to update brand:', updateError)
      return NextResponse.json(
        { error: 'Failed to update brand logo' },
        { status: 500 }
      )
    }

    // Cleanup old logos
    const { data: existingFiles } = await supabase.storage
      .from('logos')
      .list(`brands/${slug}`)

    if (existingFiles && existingFiles.length > 1) {
      const filesToDelete = existingFiles
        .filter(f => f.name !== fileName)
        .map(f => `brands/${slug}/${f.name}`)

      if (filesToDelete.length > 0) {
        await supabase.storage.from('logos').remove(filesToDelete)
      }
    }

    return NextResponse.json({ 
      success: true, 
      logoUrl: publicUrl
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}