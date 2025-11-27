// apps/web/app/shopify/page.tsx
'use client'

import ShopifyHero from '@/components/shopify/ShopifyHero'
import ShopifyHowItWorks from '@/components/shopify/ShopifyHowItWorks'
import { ShopifyWaitlistProvider } from '@/components/shopify/useShopifyWaitlist'

export default function ShopifyWaitlistPage() {
  return (
    <ShopifyWaitlistProvider>
      <div className="min-h-screen bg-[#101A31]">
        <main>
          <ShopifyHero />
          <ShopifyHowItWorks />
        </main>
      </div>
    </ShopifyWaitlistProvider>
  )
}