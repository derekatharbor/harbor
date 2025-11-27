// apps/web/app/shopify/page.tsx
'use client'

import ShopifyNav from '@/components/shopify/ShopifyNav'
import ShopifyHero from '@/components/shopify/ShopifyHero'
// import ShopifyShift from '@/components/shopify/ShopifyShift'
// import ShopifyProblem from '@/components/shopify/ShopifyProblem'
// import ShopifyCapabilities from '@/components/shopify/ShopifyCapabilities'
// import ShopifyCTA from '@/components/shopify/ShopifyCTA'
import ShopifyFooter from '@/components/shopify/ShopifyFooter'
import { ShopifyWaitlistProvider } from '@/components/shopify/useShopifyWaitlist'

export default function ShopifyWaitlistPage() {
  return (
    <ShopifyWaitlistProvider>
      <div className="min-h-screen bg-[#101A31]">
        <ShopifyNav />
        
        <main>
          <ShopifyHero />
          {/* <ShopifyShift /> */}
          {/* <ShopifyProblem /> */}
          {/* <ShopifyCapabilities /> */}
          {/* <ShopifyCTA /> */}
        </main>
        
        <ShopifyFooter />
      </div>
    </ShopifyWaitlistProvider>
  )
}