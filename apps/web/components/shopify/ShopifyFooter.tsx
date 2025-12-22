// components/shopify/ShopifyFooter.tsx
'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function ShopifyFooter() {
  return (
    <footer className="relative py-12 px-6 bg-[#0a0a0a] border-t border-white/[0.05]">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Image
                src="/images/harbor-logo-white.svg"
                alt="Harbor"
                width={100}
                height={28}
                className="h-6 w-auto"
              />
            </Link>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs">
              AI visibility intelligence. See how ChatGPT, Claude, Gemini, and Perplexity talk about your brand.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-white/60 font-medium text-sm mb-4">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/product" className="text-white/40 hover:text-white text-sm transition-colors">
                  Platform
                </Link>
              </li>
              <li>
                <Link href="/brands" className="text-white/40 hover:text-white text-sm transition-colors">
                  Brand Index
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-white/40 hover:text-white text-sm transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/shopify" className="text-white/40 hover:text-white text-sm transition-colors flex items-center gap-2">
                  Shopify Plugin
                  <span className="px-1.5 py-0.5 text-[9px] font-medium uppercase bg-[#95BF47]/20 text-[#95BF47] rounded">
                    Soon
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white/60 font-medium text-sm mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-white/40 hover:text-white text-sm transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-white/40 hover:text-white text-sm transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-white/40 hover:text-white text-sm transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-white/40 hover:text-white text-sm transition-colors">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-sm">
            © {new Date().getFullYear()} Harbor. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a 
              href="https://twitter.com/useharbor" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white/30 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a 
              href="https://linkedin.com/company/useharbor" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white/30 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
