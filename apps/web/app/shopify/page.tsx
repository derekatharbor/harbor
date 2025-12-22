// apps/web/app/shopify/page.tsx
'use client'

import Nav from '@/components/landing-new/Nav'
import ShopifyHero from '@/components/shopify/ShopifyHero'
import ShopifyHowItWorks from '@/components/shopify/ShopifyHowItWorks'
import ShopifyFeatures from '@/components/shopify/ShopifyFeatures'
import ShopifyCTA from '@/components/shopify/ShopifyCTA'
import ShopifyFooter from '@/components/shopify/ShopifyFooter'
import { ShopifyWaitlistProvider } from '@/components/shopify/useShopifyWaitlist'

export default function ShopifyWaitlistPage() {
  return (
    <ShopifyWaitlistProvider>
      <div className="min-h-screen bg-[#0a0a0a]">
        <Nav />
        <main>
          <ShopifyHero />
          <div id="how-it-works">
            <ShopifyHowItWorks />
          </div>
          <div id="features">
            <ShopifyFeatures />
          </div>
          <ShopifyCTA />
        </main>
        <ShopifyFooter />
      </div>
    </ShopifyWaitlistProvider>
  )
}