// components/landing-new/Nav.tsx
// Professional nav with Product dropdown

'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, ChevronDown, BarChart3, Users, Globe, ShoppingBag, Code, Sparkles } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const productLinks = [
  {
    label: 'Platform Overview',
    description: 'See how Harbor works',
    href: '/product',
    icon: Sparkles,
  },
  {
    label: 'Competitor Intelligence',
    description: 'Track how AI recommends your competitors',
    href: '/product/competitors',
    icon: Users,
  },
  {
    label: 'Citation Sources',
    description: 'See which sources AI trusts',
    href: '/product/sources',
    icon: Globe,
  },
  {
    label: 'Website Analytics',
    description: 'AI crawler traffic insights',
    href: '/product/website',
    icon: BarChart3,
  },
  {
    label: 'Shopify Plugin',
    description: 'AI visibility for your store',
    href: '/shopify',
    icon: ShoppingBag,
    badge: 'Waitlist',
  },
  {
    label: 'API Access',
    description: 'Integrate Harbor data',
    href: '/contact',
    icon: Code,
    badge: 'Coming Soon',
  },
]

export default function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [productOpen, setProductOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setIsLoggedIn(!!session)
    }
    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProductOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
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
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProductOpen(!productOpen)}
                onMouseEnter={() => setProductOpen(true)}
                className={`flex items-center gap-1 px-4 py-2 text-sm font-medium transition-colors ${
                  productOpen ? 'text-white' : 'text-white/70 hover:text-white'
                }`}
              >
                Product
                <ChevronDown className={`w-4 h-4 transition-transform ${productOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Panel */}
              {productOpen && (
                <div 
                  className="absolute top-full left-0 mt-2 w-80 bg-[#111111] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                  onMouseLeave={() => setProductOpen(false)}
                >
                  <div className="p-2">
                    {productLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setProductOpen(false)}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors group"
                      >
                        <div className="p-2 bg-white/5 rounded-lg group-hover:bg-white/10 transition-colors">
                          <link.icon className="w-4 h-4 text-white/70" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-white">{link.label}</span>
                            {link.badge && (
                              <span className="px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide bg-white/10 text-white/60 rounded">
                                {link.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-white/50 mt-0.5">{link.description}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Brand Index */}
            <Link href="/brands" className="px-4 py-2 text-white/70 hover:text-white text-sm font-medium transition-colors">
              Brand Index
            </Link>

            {/* Pricing */}
            <Link href="/pricing" className="px-4 py-2 text-white/70 hover:text-white text-sm font-medium transition-colors">
              Pricing
            </Link>

            {/* Contact */}
            <Link href="/contact" className="px-4 py-2 text-white/70 hover:text-white text-sm font-medium transition-colors">
              Contact
            </Link>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <Link 
                href="/dashboard/overview" 
                className="px-5 py-2 bg-white text-black font-semibold text-sm rounded-full hover:bg-white/90 transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/auth/login" className="px-4 py-2 text-white/70 hover:text-white text-sm font-medium transition-colors">
                  Log in
                </Link>
                <Link 
                  href="/brands" 
                  className="px-5 py-2 bg-white text-black font-semibold text-sm rounded-full hover:bg-white/90 transition-colors"
                >
                  Claim Your Brand
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-white/70 hover:text-white transition-colors"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0a0a0a] border-t border-white/10">
          <div className="px-6 py-4 space-y-1">
            {/* Product Section */}
            <div className="py-2">
              <span className="text-xs font-medium text-white/40 uppercase tracking-wide">Product</span>
              <div className="mt-2 space-y-1">
                {productLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between py-2 text-white/70 hover:text-white"
                  >
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className="px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide bg-white/10 text-white/50 rounded">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>

            <div className="h-px bg-white/10 my-2" />

            <Link href="/brands" onClick={() => setMobileOpen(false)} className="block py-2 text-white/70 hover:text-white">
              Brand Index
            </Link>
            <Link href="/pricing" onClick={() => setMobileOpen(false)} className="block py-2 text-white/70 hover:text-white">
              Pricing
            </Link>
            <Link href="/contact" onClick={() => setMobileOpen(false)} className="block py-2 text-white/70 hover:text-white">
              Contact
            </Link>
            
            <div className="pt-4 border-t border-white/10 space-y-3 mt-4">
              {isLoggedIn ? (
                <Link 
                  href="/dashboard/overview" 
                  onClick={() => setMobileOpen(false)}
                  className="block py-3 bg-white text-black text-center font-semibold rounded-lg"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link 
                    href="/auth/login" 
                    onClick={() => setMobileOpen(false)}
                    className="block py-2 text-white/70 hover:text-white"
                  >
                    Log in
                  </Link>
                  <Link 
                    href="/brands" 
                    onClick={() => setMobileOpen(false)}
                    className="block py-3 bg-white text-black text-center font-semibold rounded-lg"
                  >
                    Claim Your Brand
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}