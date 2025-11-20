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
    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return new NextResponse('Server configuration error', { status: 500 })
    }

    // Get theme from query params
    const { searchParams } = new URL(request.url)
    const theme = searchParams.get('theme') || 'light'

    // Fetch brand data
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { data: brand, error } = await supabase
      .from('ai_profiles')
      .select('*')
      .eq('slug', params.slug)
      .single()

    if (error || !brand) {
      return new NextResponse('Brand not found', { status: 404 })
    }

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
    
    // Create canvas with same dimensions as template
    const canvas = createCanvas(1200, 627)
    const ctx = canvas.getContext('2d')

    // Draw template background
    ctx.drawImage(template, 0, 0, 1200, 627)

    // Text rendering settings
    ctx.textBaseline = 'top'
    ctx.textAlign = 'left'

    // Brand Logo (if exists)
    if (brand.logo_url) {
      try {
        const logo = await loadImage(brand.logo_url)
        
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

    // Brand Name
    ctx.font = '600 48px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    ctx.fillStyle = '#FFFFFF'
    ctx.fillText(brand.brand_name, 420, 185)

    // Percentile Line
    ctx.font = '400 26px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    ctx.fillStyle = '#D0D0D0'
    ctx.fillText(getPercentileMessage(brand.rank_global), 420, 245)

    // Rank Value
    ctx.font = '600 54px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    ctx.fillStyle = '#FFFFFF'
    ctx.fillText(`#${brand.rank_global}`, 350, 360)

    // Score Value
    ctx.font = '600 54px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    ctx.fillStyle = '#FFFFFF'
    ctx.fillText(`${brand.visibility_score.toFixed(1)}%`, 620, 360)

    // Convert canvas to buffer
    const buffer = canvas.toBuffer('image/png')

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