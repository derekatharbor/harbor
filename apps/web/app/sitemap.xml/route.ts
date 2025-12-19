// apps/web/app/sitemap.xml/route.ts
// Sitemap index that points to all split sitemaps

import { NextResponse } from 'next/server'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

// Must match the count in sitemap.ts generateSitemaps()
const NUM_SITEMAPS = 10

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://useharbor.io'
  const now = new Date().toISOString()

  const sitemapEntries = Array.from({ length: NUM_SITEMAPS }, (_, i) => `
  <sitemap>
    <loc>${baseUrl}/sitemap/${i}.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>`).join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemapEntries}
</sitemapindex>`

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
