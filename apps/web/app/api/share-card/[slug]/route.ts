// apps/web/app/api/share-card/[slug]/route.ts
// Canvas-based share card with proper Vercel paths

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createCanvas, loadImage } from '@napi-rs/canvas'
import path from 'path'
import fs from 'fs'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    console.log('=== ENV CHECK ===')
    console.log('SUPABASE_URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('SERVICE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)
    console.log('SUPABASE_URL value:', process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...')
    
    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing env vars!')
      return new NextResponse('Server configuration error', { status: 500 })
    }

    // Get theme from query params
    const { searchParams } = new URL(request.url)
    const theme = searchParams.get('theme') || 'light'

    console.log('=== SHARE CARD DEBUG START ===')
    console.log('Slug:', params.slug)
    console.log('Theme:', theme)

    // Fetch brand data
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    console.log('Fetching from Supabase...')
    const { data: brand, error } = await supabase
      .from('ai_profiles')
      .select('*')
      .eq('slug', params.slug)
      .single()

    if (error || !brand) {
      console.error('Brand fetch error:', error)
      return new NextResponse('Brand not found', { status: 404 })
    }

    console.log('Brand fetched:', {
      name: brand.brand_name,
      rank: brand.rank_global,
      score: brand.visibility_score,
      logo: brand.logo_url
    })

    // Calculate percentile message
    const getPercentileMessage = (rank: number): string => {
      if (rank <= 10) return 'Top 1% of brands'
      if (rank <= 50) return 'Top 5% of brands'
      if (rank <= 100) return 'Top 10% of brands'
      return 'Top 25% of brands'
    }

    // Resolve template path - works in both dev and production
    const templateFileName = theme === 'dark' ? 'share_card_dark.png' : 'share_card_light.png'
    const templatePath = path.join(process.cwd(), 'public', templateFileName)
    
    // Check if template exists
    if (!fs.existsSync(templatePath)) {
      console.error(`Template not found: ${templatePath}`)
      return new NextResponse(`Template not found: ${templateFileName}`, { status: 500 })
    }
    
    // Load template image
    const template = await loadImage(templatePath)
    
    // Get template dimensions
    const width = template.width
    const height = template.height
    
    console.log('Template dimensions:', width, 'x', height)
    
    // Create canvas with same dimensions as template
    const canvas = createCanvas(width, height)
    const ctx = canvas.getContext('2d')

    // Draw template background
    ctx.drawImage(template, 0, 0, width, height)

    // Text rendering settings
    ctx.textBaseline = 'top'
    ctx.textAlign = 'left'

    // Brand Logo - TEMPORARILY DISABLED (307 redirect issue)
    // TODO: Fix after text is working
    if (false && brand.logo_url) {
      try {
        // Convert relative URLs to absolute
        let logoUrl = brand.logo_url
        if (!logoUrl.startsWith('http')) {
          const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://useharbor.io'
          logoUrl = `${siteUrl}${logoUrl.startsWith('/') ? '' : '/'}${logoUrl}`
        }
        
        console.log('Loading logo from:', logoUrl)
        const logo = await loadImage(logoUrl)
        
        // Draw logo at 120x120px
        const logoSize = 120
        const logoX = 270
        const logoY = 160
        
        // Calculate scaling to maintain aspect ratio
        const scale = Math.min(logoSize / logo.width, logoSize / logo.height)
        const scaledWidth = logo.width * scale
        const scaledHeight = logo.height * scale
        
        // Center the logo
        const offsetX = (logoSize - scaledWidth) / 2
        const offsetY = (logoSize - scaledHeight) / 2
        
        ctx.drawImage(
          logo, 
          logoX + offsetX, 
          logoY + offsetY, 
          scaledWidth, 
          scaledHeight
        )
      } catch (logoError) {
        console.error('Failed to load brand logo:', logoError)
        // Continue without logo if it fails
      }
    }

    // TEST: Draw text in SUPER OBVIOUS places
    console.log('Drawing brand name:', brand.brand_name)
    
    // Draw in top-left corner - impossible to miss
    ctx.font = '700 100px system-ui'
    ctx.fillStyle = '#FF0000' // RED so it's obvious
    ctx.textAlign = 'left'
    ctx.fillText('TEST', 50, 100)
    
    // Draw brand name in center
    ctx.fillStyle = '#00FF00' // GREEN
    ctx.textAlign = 'center'
    ctx.fillText(brand.brand_name, width / 2, height / 2)
    
    // Draw rank and score big in center
    ctx.fillStyle = '#FFFF00' // YELLOW
    ctx.fillText(`#${brand.rank_global} - ${brand.visibility_score}%`, width / 2, height / 2 + 150)

    // Convert canvas to buffer
    console.log('Converting canvas to buffer...')
    
    // Resize to LinkedIn's required dimensions (1200x627)
    const resizedCanvas = createCanvas(1200, 627)
    const resizedCtx = resizedCanvas.getContext('2d')
    resizedCtx.drawImage(canvas, 0, 0, width, height, 0, 0, 1200, 627)
    
    const buffer = resizedCanvas.toBuffer('image/png')
    console.log('Buffer size:', buffer.length, 'bytes')
    console.log('=== SHARE CARD DEBUG END ===')

    // Return image with caching headers (convert buffer to proper type)
    return new NextResponse(buffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
      },
    })
  } catch (error) {
    console.error('Share card generation error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new NextResponse(`Failed to generate image: ${errorMessage}`, { status: 500 })
  }
}