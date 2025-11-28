// components/shopify/ShopifyFooter.tsx
'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function ShopifyFooter() {
  return (
    <footer className="relative py-12 px-4 sm:px-6 rounded-t-[2rem] md:rounded-t-[3rem] bg-[#0a0f1a] border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <Image src="/logo-icon.png" alt="Harbor" width={32} height={32} className="w-8 h-8" />
              <span className="text-xl font-bold text-white font-heading">Harbor</span>
            </div>
            <p className="text-[#A4B1C3] text-sm leading-relaxed">
              The AI visibility standard. See how ChatGPT, Claude, Gemini, and Perplexity talk about your brand.
            </p>
          </div>

          <div>
            <h3 className="text-white font-heading font-semibold mb-4">Product</h3>
            <ul className="space-y-3">
              <li><Link href="/brands" className="text-[#A4B1C3] hover:text-white transition-colors text-sm">Brand Index</Link></li>
              <li><Link href="/pricing" className="text-[#A4B1C3] hover:text-white transition-colors text-sm">Pricing</Link></li>
              <li><Link href="/#how-it-works" className="text-[#A4B1C3] hover:text-white transition-colors text-sm">How It Works</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-heading font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-[#A4B1C3] hover:text-white transition-colors text-sm">About</Link></li>
              <li><Link href="/contact" className="text-[#A4B1C3] hover:text-white transition-colors text-sm">Contact</Link></li>
              <li><Link href="/privacy" className="text-[#A4B1C3] hover:text-white transition-colors text-sm">Privacy</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 text-center md:text-left">
          <div className="text-sm text-[#A4B1C3]">
            © {new Date().getFullYear()} Harbor. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}
