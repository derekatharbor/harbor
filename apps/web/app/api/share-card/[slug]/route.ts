// Alternative approach: Render text separately then composite onto template
// This sometimes works when direct drawing fails

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
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return new NextResponse('Server configuration error', { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const theme = searchParams.get('theme') || 'light'

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

    const getPercentileMessage = (rank: number): string => {
      if (rank <= 10) return 'Top 1% of brands'
      if (rank <= 50) return 'Top 5% of brands'
      if (rank <= 100) return 'Top 10% of brands'
      return 'Top 25% of brands'
    }

    // Load template
    const templateFileName = theme === 'dark' ? 'share_card_dark.png' : 'share_card_light.png'
    const templatePath = path.join(process.cwd(), 'public', templateFileName)
    
    if (!fs.existsSync(templatePath)) {
      return new NextResponse(`Template not found: ${templateFileName}`, { status: 500 })
    }
    
    const template = await loadImage(templatePath)
    
    // Create two canvases - one for template, one for text
    const finalCanvas = createCanvas(1200, 627)
    const finalCtx = finalCanvas.getContext('2d')
    
    const textCanvas = createCanvas(1200, 627)
    const textCtx = textCanvas.getContext('2d')

    // Draw template on final canvas
    finalCtx.drawImage(template, 0, 0, 1200, 627)

    // Draw text on separate canvas with transparent background
    textCtx.textBaseline = 'top'
    
    // Brand Name
    textCtx.font = '900 48px Arial, sans-serif' // Ultra bold, common font
    textCtx.fillStyle = '#FFFFFF'
    textCtx.shadowColor = 'rgba(0, 0, 0, 0.8)'
    textCtx.shadowBlur = 4
    textCtx.textAlign = 'left'
    textCtx.fillText(brand.brand_name, 350, 175)

    // Percentile
    textCtx.font = '400 24px Arial, sans-serif'
    textCtx.fillStyle = '#CCCCCC'
    textCtx.shadowBlur = 2
    textCtx.fillText(getPercentileMessage(brand.rank_global), 350, 230)

    // Rank (large, centered)
    textCtx.font = '900 64px Arial, sans-serif'
    textCtx.fillStyle = '#FFFFFF'
    textCtx.shadowBlur = 6
    textCtx.textAlign = 'center'
    textCtx.fillText(`#${brand.rank_global}`, 363, 365)

    // Score (large, centered)
    textCtx.fillText(`${brand.visibility_score.toFixed(1)}%`, 613, 365)

    // Composite text layer onto final canvas
    finalCtx.drawImage(textCanvas, 0, 0)

    // Convert to buffer
    const buffer = finalCanvas.toBuffer('image/png')

    return new NextResponse(buffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=60, s-maxage=60', // Short cache for testing
      },
    })
  } catch (error) {
    console.error('Share card generation error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new NextResponse(`Failed to generate image: ${errorMessage}`, { status: 500 })
  }
}