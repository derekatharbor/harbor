// apps/web/app/api/upload/logo/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const dashboardId = formData.get('dashboardId') as string

    if (!file || !dashboardId) {
      return NextResponse.json(
        { error: 'Missing file or dashboard ID' },
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

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${dashboardId}-${Date.now()}.${fileExt}`
    const filePath = `${dashboardId}/${fileName}`

    // Convert File to ArrayBuffer for Supabase upload
    const arrayBuffer = await file.arrayBuffer()
    const fileBuffer = new Uint8Array(arrayBuffer)

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('logos')
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: true, // Replace if exists
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

    // Optional: Delete old logo files for this dashboard (cleanup)
    const { data: existingFiles } = await supabase.storage
      .from('logos')
      .list(dashboardId)

    if (existingFiles && existingFiles.length > 1) {
      // Keep only the latest file, delete others
      const filesToDelete = existingFiles
        .filter(f => f.name !== fileName)
        .map(f => `${dashboardId}/${f.name}`)

      if (filesToDelete.length > 0) {
        await supabase.storage.from('logos').remove(filesToDelete)
      }
    }

    return NextResponse.json({ 
      success: true, 
      publicUrl,
      fileName: filePath
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
