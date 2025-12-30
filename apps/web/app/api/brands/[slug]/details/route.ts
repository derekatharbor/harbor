// app/api/brands/[slug]/details/route.ts
// Fetches brand details from Brandfetch API

import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const domain = params.slug

  if (!domain) {
    return NextResponse.json({ error: 'Domain required' }, { status: 400 })
  }

  const apiKey = process.env.BRANDFETCH_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: 'Brandfetch API not configured' }, { status: 500 })
  }

  try {
    const response = await fetch(`https://api.brandfetch.io/v2/brands/${domain}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    })

    if (!response.ok) {
      // Return basic fallback data if Brandfetch doesn't have the brand
      if (response.status === 404) {
        return NextResponse.json({
          name: domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1),
          domain: domain,
          description: null,
          logos: [],
          colors: [],
          images: [],
          links: [],
          fallback: true
        })
      }
      throw new Error(`Brandfetch API error: ${response.status}`)
    }

    const data = await response.json()

    // Extract the most useful data
    const brandData = {
      name: data.name || domain,
      domain: data.domain || domain,
      description: data.description || null,
      longDescription: data.longDescription || null,
      
      // Get the best logo (prefer icon, then logo)
      logo: extractBestLogo(data.logos),
      
      // Get primary brand color
      primaryColor: extractPrimaryColor(data.colors),
      colors: data.colors || [],
      
      // Get banner/cover image if available
      bannerImage: extractBannerImage(data.images),
      
      // Social links
      links: data.links || [],
      
      // Industry/category info
      industry: data.industry || null,
      
      // Qualitative info
      isNsfw: data.isNsfw || false,
      
      fallback: false
    }

    return NextResponse.json(brandData)

  } catch (error) {
    console.error('Brandfetch API error:', error)
    
    // Return fallback data on error
    return NextResponse.json({
      name: domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1),
      domain: domain,
      description: null,
      logos: [],
      colors: [],
      images: [],
      links: [],
      fallback: true,
      error: 'Failed to fetch brand details'
    })
  }
}

// Helper to extract the best logo URL
function extractBestLogo(logos: any[]): string | null {
  if (!logos || logos.length === 0) return null

  // Prefer icon type, then logo type
  const icon = logos.find(l => l.type === 'icon')
  const logo = logos.find(l => l.type === 'logo')
  const symbol = logos.find(l => l.type === 'symbol')

  const best = icon || logo || symbol || logos[0]

  if (!best || !best.formats) return null

  // Prefer PNG, then SVG, then any format
  const png = best.formats.find((f: any) => f.format === 'png')
  const svg = best.formats.find((f: any) => f.format === 'svg')

  return png?.src || svg?.src || best.formats[0]?.src || null
}

// Helper to extract primary brand color
function extractPrimaryColor(colors: any[]): string | null {
  if (!colors || colors.length === 0) return null

  // Look for primary or brand color
  const primary = colors.find(c => c.type === 'primary' || c.type === 'brand')
  const accent = colors.find(c => c.type === 'accent')
  const dark = colors.find(c => c.type === 'dark')

  const best = primary || accent || dark || colors[0]

  return best?.hex || null
}

// Helper to extract banner/cover image
function extractBannerImage(images: any[]): string | null {
  if (!images || images.length === 0) return null

  // Look for banner or cover type
  const banner = images.find(i => i.type === 'banner' || i.type === 'cover')

  if (!banner || !banner.formats) return null

  const png = banner.formats.find((f: any) => f.format === 'png')
  const jpg = banner.formats.find((f: any) => f.format === 'jpg' || f.format === 'jpeg')

  return png?.src || jpg?.src || banner.formats[0]?.src || null
}