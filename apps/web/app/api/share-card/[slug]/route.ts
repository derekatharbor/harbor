// apps/web/app/api/share-card/[slug]/route.ts
// Generates LinkedIn share cards using custom templates with canvas overlay

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createCanvas, loadImage } from '@napi-rs/canvas'

export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return new NextResponse('Server configuration error', { status: 500 })
    }

    // Get theme from query params (default to light for LinkedIn)
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

    // Load template image (1200x627px)
    const templatePath = theme === 'dark' 
      ? './public/share_card_dark.png' 
      : './public/share_card_light.png'
    
    const template = await loadImage(templatePath)
    
    // Create canvas with same dimensions as template
    const canvas = createCanvas(1200, 627)
    const ctx = canvas.getContext('2d')

    // Draw template background
    ctx.drawImage(template, 0, 0, 1200, 627)

    // Text rendering settings
    ctx.textBaseline = 'top'
    ctx.textAlign = 'left'

    // 1. Brand Logo (if exists)
    if (brand.logo_url) {
      try {
        const logo = await loadImage(brand.logo_url)
        
        // Draw logo at 120x120px
        const logoSize = 120
        const logoX = 270
        const logoY = 160
        
        // Calculate scaling to fit within logoSize while maintaining aspect ratio
        const scale = Math.min(logoSize / logo.width, logoSize / logo.height)
        const scaledWidth = logo.width * scale
        const scaledHeight = logo.height * scale
        
        // Center the logo within the logoSize box
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
      }
    }

    // 2. Brand Name (to the right of logo)
    ctx.font = '600 48px system-ui, -apple-system, sans-serif'
    ctx.fillStyle = '#FFFFFF'
    ctx.fillText(brand.brand_name, 420, 185)

    // 3. Percentile Line
    ctx.font = '400 26px system-ui, -apple-system, sans-serif'
    ctx.fillStyle = '#D0D0D0'
    ctx.fillText(getPercentileMessage(brand.rank_global), 420, 245)

    // 4. Rank Value
    ctx.font = '600 54px system-ui, -apple-system, sans-serif'
    ctx.fillStyle = '#FFFFFF'
    ctx.fillText(`#${brand.rank_global}`, 350, 360)

    // 5. Score Value
    ctx.font = '600 54px system-ui, -apple-system, sans-serif'
    ctx.fillStyle = '#FFFFFF'
    ctx.fillText(`${brand.visibility_score.toFixed(1)}%`, 620, 360)

    // Convert canvas to buffer
    const buffer = canvas.toBuffer('image/png')

    // Return image with caching headers
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
      },
    })
  } catch (error) {
    console.error('Share card generation error:', error)
    return new NextResponse('Failed to generate image', { status: 500 })
  }
}