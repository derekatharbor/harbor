// components/landing-new/Nav.tsx
// Nav with Linear-style nested dropdown cards

'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, ChevronDown } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const productLinks = {
  core: [
    {
      label: 'Platform Overview',
      description: 'See how Harbor works',
      href: '/product',
    },
    {
      label: 'Competitor Intelligence',
      description: 'Track AI recommendations',
      href: '/product/competitors',
    },
    {
      label: 'Citation Sources',
      description: 'See which sources AI trusts',
      href: '/product/sources',
    },
  ],
  more: [
    {
      label: 'Website Analytics',
      description: 'AI crawler insights',
      href: '/product/website',
    },
    {
      label: 'Shopify Plugin',
      description: 'AI visibility for e-commerce',
      href: '/shopify',
      badge: 'Waitlist',
    },
    {
      label: 'API',
      description: 'Integrate Harbor data',
      href: '/contact',
      badge: 'Coming Soon',
    },
  ],
}

const resourceLinks = {
  company: [
    {
      label: 'About',
      description: 'Meet the team',
      href: '/about',
    },
    {
      label: 'Contact',
      description: 'Get in touch',
      href: '/contact',
    },
  ],
  explore: [
    {
      label: 'Brand Index',
      description: '100,000+ profiles',
      href: '/brands',
    },
    {
      label: 'Privacy',
      description: 'How we handle data',
      href: '/privacy',
    },
    {
      label: 'Terms',
      description: 'Terms of service',
      href: '/terms',
    },
  ],
}

interface NavLinkItemProps {
  href: string
  label: string
  description: string
  badge?: string
  onClick: () => void
}

function NavLinkItem({ href, label, description, badge, onClick }: NavLinkItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block px-4 py-3 hover:bg-white/[0.04] transition-colors rounded-lg"
    >
      <div className="flex items-center gap-2">
        <span className="text-[15px] font-medium text-white">{label}</span>
        {badge && (
          <span className="px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide bg-white/[0.06] text-white/40 rounded">
            {badge}
          </span>
        )}
      </div>
      <p className="text-[13px] text-white/40 mt-0.5">{description}</p>
    </Link>
  )
}

export default function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [productOpen, setProductOpen] = useState(false)
  const [resourcesOpen, setResourcesOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const productRef = useRef<HTMLDivElement>(null)
  const resourcesRef = useRef<HTMLDivElement>(null)
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (productRef.current && !productRef.current.contains(event.target as Node)) {
        setProductOpen(false)
      }
      if (resourcesRef.current && !resourcesRef.current.contains(event.target as Node)) {
        setResourcesOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const closeAll = () => {
    setProductOpen(false)
    setResourcesOpen(false)
  }

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
          <div className="hidden md:flex items-center gap-0">
            {/* Product Dropdown */}
            <div className="relative" ref={productRef}>
              <button
                onClick={() => {
                  setProductOpen(!productOpen)
                  setResourcesOpen(false)
                }}
                onMouseEnter={() => {
                  setProductOpen(true)
                  setResourcesOpen(false)
                }}
                className={`flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  productOpen ? 'text-white bg-white/[0.06]' : 'text-white/60 hover:text-white'
                }`}
              >
                Product
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${productOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Product Dropdown - Linear style */}
              {productOpen && (
                <div 
                  className="absolute top-full left-0 mt-3 p-[6px] bg-black border border-white/[0.08] rounded-2xl shadow-2xl"
                  onMouseLeave={() => setProductOpen(false)}
                >
                  {/* Inner grey card */}
                  <div className="bg-[#171717] rounded-xl overflow-hidden">
                    <div className="flex">
                      {/* Core Features */}
                      <div className="py-3 px-2 border-r border-white/[0.06]">
                        <p className="px-4 py-2 text-[13px] font-medium text-white/30">
                          Core Features
                        </p>
                        <div className="min-w-[200px]">
                          {productLinks.core.map((link) => (
                            <NavLinkItem key={link.href} {...link} onClick={closeAll} />
                          ))}
                        </div>
                      </div>
                      {/* More */}
                      <div className="py-3 px-2">
                        <p className="px-4 py-2 text-[13px] font-medium text-white/30">
                          More
                        </p>
                        <div className="min-w-[200px]">
                          {productLinks.more.map((link) => (
                            <NavLinkItem key={link.href} {...link} onClick={closeAll} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Resources Dropdown */}
            <div className="relative" ref={resourcesRef}>
              <button
                onClick={() => {
                  setResourcesOpen(!resourcesOpen)
                  setProductOpen(false)
                }}
                onMouseEnter={() => {
                  setResourcesOpen(true)
                  setProductOpen(false)
                }}
                className={`flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  resourcesOpen ? 'text-white bg-white/[0.06]' : 'text-white/60 hover:text-white'
                }`}
              >
                Resources
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${resourcesOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Resources Dropdown - Linear style */}
              {resourcesOpen && (
                <div 
                  className="absolute top-full left-0 mt-3 p-[6px] bg-black border border-white/[0.08] rounded-2xl shadow-2xl"
                  onMouseLeave={() => setResourcesOpen(false)}
                >
                  {/* Inner grey card */}
                  <div className="bg-[#171717] rounded-xl overflow-hidden">
                    <div className="flex">
                      {/* Company */}
                      <div className="py-3 px-2 border-r border-white/[0.06]">
                        <p className="px-4 py-2 text-[13px] font-medium text-white/30">
                          Company
                        </p>
                        <div className="min-w-[180px]">
                          {resourceLinks.company.map((link) => (
                            <NavLinkItem key={link.href} {...link} onClick={closeAll} />
                          ))}
                        </div>
                      </div>
                      {/* Explore */}
                      <div className="py-3 px-2">
                        <p className="px-4 py-2 text-[13px] font-medium text-white/30">
                          Explore
                        </p>
                        <div className="min-w-[180px]">
                          {resourceLinks.explore.map((link) => (
                            <NavLinkItem key={link.href} {...link} onClick={closeAll} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Pricing */}
            <Link href="/pricing" className="px-4 py-2 text-white/60 hover:text-white text-sm font-medium transition-colors">
              Pricing
            </Link>

            {/* Contact */}
            <Link href="/contact" className="px-4 py-2 text-white/60 hover:text-white text-sm font-medium transition-colors">
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
                <Link href="/auth/login" className="px-4 py-2 text-white/60 hover:text-white text-sm font-medium transition-colors">
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
            className="md:hidden p-2 text-white/60 hover:text-white transition-colors"
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
              <span className="text-xs font-medium text-white/30 uppercase tracking-wide">Product</span>
              <div className="mt-2 space-y-1">
                {[...productLinks.core, ...productLinks.more].map((link) => (
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

            {/* Resources Section */}
            <div className="py-2">
              <span className="text-xs font-medium text-white/30 uppercase tracking-wide">Resources</span>
              <div className="mt-2 space-y-1">
                {[...resourceLinks.company, ...resourceLinks.explore].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block py-2 text-white/70 hover:text-white"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="h-px bg-white/10 my-2" />

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
