// components/landing-new/Nav.tsx
'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, Menu, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const dropdownItems = {
    product: [
      { label: 'Brand Visibility', desc: 'Track AI mentions', href: '/product/visibility' },
      { label: 'Competitors', desc: 'Benchmark against rivals', href: '/product/competitors' },
      { label: 'Sources', desc: 'Citation analytics', href: '/product/sources' },
      { label: 'Website Analysis', desc: 'AI readability audit', href: '/product/website' },
    ],
    resources: [
      { label: 'Documentation', desc: 'How Harbor works', href: '/docs' },
      { label: 'Blog', desc: 'GEO insights & updates', href: '/blog' },
      { label: 'API', desc: 'Build integrations', href: '/api' },
    ],
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-black/60 backdrop-blur-xl border-b border-white/10' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/images/harbor-logo-white.svg"
              alt="Harbor"
              width={120}
              height={32}
              className="h-7 w-auto"
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {/* Product Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setActiveDropdown('product')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className="px-4 py-2 text-white/70 hover:text-white text-sm font-medium flex items-center gap-1 transition-colors">
                Product
                <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === 'product' ? 'rotate-180' : ''}`} />
              </button>
              
              {activeDropdown === 'product' && (
                <div className="absolute top-full left-0 pt-2">
                  <div className="bg-[#1a1a1a]/95 backdrop-blur-xl rounded-xl border border-white/10 p-2 min-w-[280px] shadow-2xl">
                    {dropdownItems.product.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex flex-col px-4 py-3 rounded-lg hover:bg-white/5 transition-colors"
                      >
                        <span className="text-white font-medium text-sm">{item.label}</span>
                        <span className="text-white/50 text-xs mt-0.5">{item.desc}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Resources Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setActiveDropdown('resources')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className="px-4 py-2 text-white/70 hover:text-white text-sm font-medium flex items-center gap-1 transition-colors">
                Resources
                <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === 'resources' ? 'rotate-180' : ''}`} />
              </button>
              
              {activeDropdown === 'resources' && (
                <div className="absolute top-full left-0 pt-2">
                  <div className="bg-[#1a1a1a]/95 backdrop-blur-xl rounded-xl border border-white/10 p-2 min-w-[240px] shadow-2xl">
                    {dropdownItems.resources.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex flex-col px-4 py-3 rounded-lg hover:bg-white/5 transition-colors"
                      >
                        <span className="text-white font-medium text-sm">{item.label}</span>
                        <span className="text-white/50 text-xs mt-0.5">{item.desc}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link href="/pricing" className="px-4 py-2 text-white/70 hover:text-white text-sm font-medium transition-colors">
              Pricing
            </Link>
            <Link href="/brands" className="px-4 py-2 text-white/70 hover:text-white text-sm font-medium transition-colors">
              Directory
            </Link>
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="px-4 py-2 text-white/70 hover:text-white text-sm font-medium transition-colors">
              Log in
            </Link>
            <Link 
              href="/signup" 
              className="px-4 py-2 bg-white text-black text-sm font-semibold rounded-lg hover:bg-white/90 transition-colors"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-white/70 hover:text-white"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0a0a0a]/98 backdrop-blur-xl border-t border-white/10">
          <div className="px-6 py-4 space-y-3">
            <Link href="/product" className="block py-2 text-white/70 hover:text-white">Product</Link>
            <Link href="/pricing" className="block py-2 text-white/70 hover:text-white">Pricing</Link>
            <Link href="/brands" className="block py-2 text-white/70 hover:text-white">Directory</Link>
            <Link href="/docs" className="block py-2 text-white/70 hover:text-white">Docs</Link>
            <div className="pt-4 border-t border-white/10 space-y-3">
              <Link href="/login" className="block py-2 text-white/70 hover:text-white">Log in</Link>
              <Link href="/signup" className="block py-3 bg-white text-black text-center font-semibold rounded-lg">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}