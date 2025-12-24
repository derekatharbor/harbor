// DESTINATION: ~/Claude Harbor/apps/web/app/api/shopify/scan/route.ts
// New file - cron endpoint for category scans

import { NextRequest, NextResponse } from 'next/server'
import { getStoresDueForScan, runCategoryScan } from '@/lib/category-scan.server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Verify cron secret
  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')
  
  if (key !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  console.log('[Shopify Cron] Starting category scan job...')

  try {
    const stores = await getStoresDueForScan()
    console.log(`[Shopify Cron] Found ${stores.length} stores due for scan`)

    const results = []

    for (const store of stores) {
      console.log(`[Shopify Cron] Scanning store: ${store.shop_domain}`)
      
      const result = await runCategoryScan(store.id)
      results.push({
        store: store.shop_domain,
        ...result,
      })

      // Small delay between stores to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    console.log('[Shopify Cron] Scan job complete')

    return NextResponse.json({
      success: true,
      storesScanned: results.length,
      results,
    })

  } catch (error) {
    console.error('[Shopify Cron] Error:', error)
    return NextResponse.json({ 
      success: false, 
      error: String(error) 
    }, { status: 500 })
  }
}
