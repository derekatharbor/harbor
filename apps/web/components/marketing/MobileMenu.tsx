// components/marketing/MobileMenu.tsx

'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { X, ChevronDown, ChevronRight } from 'lucide-react'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  isDark?: boolean
}

const PRODUCT_ITEMS = [
  { title: 'Competitors', description: 'Benchmark against your competition', href: '/features/competitors' },
  { title: 'Website Analytics', description: 'Understand how AI crawlers access your site', href: '/features/analytics' },
  { title: 'Sources', description: 'See where AI gets info about you', href: '/features/sources' },
  { title: 'Prompts', description: 'Track the queries mentioning your brand', href: '/features/prompts' },
]

const SOLUTIONS_ITEMS = [
  { title: 'For Marketers', description: 'Own your AI narrative', href: '/solutions/marketers' },
  { title: 'For Agencies', description: 'Add GEO to your service offerings', href: '/solutions/agencies' },
  { title: 'For E-Commerce', description: 'Get recommended in shopping queries', href: '/solutions/ecommerce' },
  { title: 'For Enterprise', description: 'Monitor AI mentions at scale', href: '/solutions/enterprise' },
]

export default function MobileMenu({ isOpen, onClose, isDark = false }: MobileMenuProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] lg:hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Menu Panel - Full Screen */}
      <div className={`absolute inset-0 flex flex-col ${isDark ? 'bg-[#111111]' : 'bg-[#FBFAF8]'}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-black/10">
          <Link href="/" onClick={onClose}>
            <Image
              src={isDark ? '/images/Harbor_White_Logo.png' : '/images/harbor-logo-black.svg'}
              alt="Harbor"
              width={isDark ? 32 : 120}
              height={32}
              className="h-8 w-auto"
            />
          </Link>
          <button 
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'
            }`}
          >
            <X className={`w-6 h-6 ${isDark ? 'text-white' : 'text-black'}`} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* Product Section */}
          <div className="mb-4">
            <button
              onClick={() => toggleSection('product')}
              className={`w-full flex items-center justify-between py-3 text-lg font-semibold font-source-sans ${
                isDark ? 'text-white' : 'text-black'
              }`}
            >
              Product
              <ChevronDown className={`w-5 h-5 transition-transform ${
                expandedSection === 'product' ? 'rotate-180' : ''
              } ${isDark ? 'text-white/60' : 'text-black/60'}`} />
            </button>
            {expandedSection === 'product' && (
              <div className="pl-4 pb-4 space-y-3">
                {PRODUCT_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className="block py-2"
                  >
                    <span className={`text-[15px] font-medium ${isDark ? 'text-white/90' : 'text-black/90'}`}>
                      {item.title}
                    </span>
                    <p className={`text-[13px] mt-0.5 ${isDark ? 'text-white/50' : 'text-black/50'}`}>
                      {item.description}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Solutions Section */}
          <div className="mb-4">
            <button
              onClick={() => toggleSection('solutions')}
              className={`w-full flex items-center justify-between py-3 text-lg font-semibold font-source-sans ${
                isDark ? 'text-white' : 'text-black'
              }`}
            >
              Solutions
              <ChevronDown className={`w-5 h-5 transition-transform ${
                expandedSection === 'solutions' ? 'rotate-180' : ''
              } ${isDark ? 'text-white/60' : 'text-black/60'}`} />
            </button>
            {expandedSection === 'solutions' && (
              <div className="pl-4 pb-4 space-y-3">
                {SOLUTIONS_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className="block py-2"
                  >
                    <span className={`text-[15px] font-medium ${isDark ? 'text-white/90' : 'text-black/90'}`}>
                      {item.title}
                    </span>
                    <p className={`text-[13px] mt-0.5 ${isDark ? 'text-white/50' : 'text-black/50'}`}>
                      {item.description}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Pricing Link */}
          <Link
            href="/pricing"
            onClick={onClose}
            className={`block py-3 text-lg font-semibold font-source-sans ${
              isDark ? 'text-white' : 'text-black'
            }`}
          >
            Pricing
          </Link>

          {/* Divider */}
          <div className={`my-6 border-t ${isDark ? 'border-white/10' : 'border-black/10'}`} />

          {/* Resources */}
          <div className="space-y-3">
            <Link
              href="/index"
              onClick={onClose}
              className={`flex items-center justify-between py-2 text-[15px] ${
                isDark ? 'text-white/70 hover:text-white' : 'text-black/70 hover:text-black'
              }`}
            >
              Brand Index
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              href="/blog"
              onClick={onClose}
              className={`flex items-center justify-between py-2 text-[15px] ${
                isDark ? 'text-white/70 hover:text-white' : 'text-black/70 hover:text-black'
              }`}
            >
              Blog
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              href="/docs"
              onClick={onClose}
              className={`flex items-center justify-between py-2 text-[15px] ${
                isDark ? 'text-white/70 hover:text-white' : 'text-black/70 hover:text-black'
              }`}
            >
              Documentation
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Footer CTAs */}
        <div className={`px-6 py-6 border-t ${isDark ? 'border-white/10' : 'border-black/10'}`}>
          <div className="flex flex-col gap-3">
            <Link
              href="/signup"
              onClick={onClose}
              className="w-full h-12 flex items-center justify-center rounded-lg bg-black text-white text-[15px] font-semibold font-source-sans hover:bg-black/90 transition-colors"
            >
              Get started free
            </Link>
            <Link
              href="/login"
              onClick={onClose}
              className={`w-full h-12 flex items-center justify-center rounded-lg border text-[15px] font-semibold font-source-sans transition-colors ${
                isDark 
                  ? 'border-white/20 text-white hover:bg-white/10' 
                  : 'border-black/20 text-black hover:bg-black/5'
              }`}
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
