// components/landing-new/Nav.tsx
'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, Menu, X, BarChart3, Globe, Users, FileText, BookOpen, Code, GraduationCap, Building2, ArrowRight } from 'lucide-react'
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

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-black/80 backdrop-blur-xl border-b border-white/10' 
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
              <button className={`px-4 py-2 text-sm font-medium flex items-center gap-1 transition-colors rounded-full ${
                activeDropdown === 'product' ? 'bg-white/10 text-white' : 'text-white/70 hover:text-white'
              }`}>
                Product
                <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === 'product' ? 'rotate-180' : ''}`} />
              </button>
              
              {activeDropdown === 'product' && (
                <div className="absolute top-full left-0 pt-2">
                  <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-2 min-w-[320px] shadow-2xl">
                    <div className="px-3 py-2">
                      <span className="text-xs font-medium text-white/40 uppercase tracking-wider">Platform</span>
                    </div>
                    
                    <Link href="/product" className="flex items-start gap-3 px-3 py-3 rounded-xl hover:bg-white/5 transition-colors group">
                      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-white/10 transition-colors">
                        <BarChart3 className="w-5 h-5 text-white/70" />
                      </div>
                      <div>
                        <span className="text-white font-medium text-sm block">Brand Visibility</span>
                        <span className="text-white/40 text-xs mt-0.5 block">Track how AI models describe your brand</span>
                      </div>
                    </Link>
                    
                    <Link href="/product/sources" className="flex items-start gap-3 px-3 py-3 rounded-xl hover:bg-white/5 transition-colors group">
                      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-white/10 transition-colors">
                        <Globe className="w-5 h-5 text-white/70" />
                      </div>
                      <div>
                        <span className="text-white font-medium text-sm block">Citation Sources</span>
                        <span className="text-white/40 text-xs mt-0.5 block">See which sites AI pulls from</span>
                      </div>
                    </Link>
                    
                    <Link href="/product/competitors" className="flex items-start gap-3 px-3 py-3 rounded-xl hover:bg-white/5 transition-colors group">
                      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-white/10 transition-colors">
                        <Users className="w-5 h-5 text-white/70" />
                      </div>
                      <div>
                        <span className="text-white font-medium text-sm block">Competitor Intel</span>
                        <span className="text-white/40 text-xs mt-0.5 block">Benchmark against your rivals</span>
                      </div>
                    </Link>
                    
                    <Link href="/product/website" className="flex items-start gap-3 px-3 py-3 rounded-xl hover:bg-white/5 transition-colors group">
                      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-white/10 transition-colors">
                        <FileText className="w-5 h-5 text-white/70" />
                      </div>
                      <div>
                        <span className="text-white font-medium text-sm block">Website Analysis</span>
                        <span className="text-white/40 text-xs mt-0.5 block">AI readability audit for your site</span>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Index Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setActiveDropdown('index')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className={`px-4 py-2 text-sm font-medium flex items-center gap-1 transition-colors rounded-full ${
                activeDropdown === 'index' ? 'bg-white/10 text-white' : 'text-white/70 hover:text-white'
              }`}>
                Index
                <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === 'index' ? 'rotate-180' : ''}`} />
              </button>
              
              {activeDropdown === 'index' && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2">
                  <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden" style={{ width: '580px' }}>
                    <div className="flex">
                      {/* Left side - Brand Directory */}
                      <div className="flex-1 p-4 border-r border-white/10">
                        <div className="px-2 py-2">
                          <span className="text-xs font-medium text-white/40 uppercase tracking-wider">Browse</span>
                        </div>
                        
                        <Link href="/brands" className="flex items-start gap-3 px-2 py-3 rounded-xl hover:bg-white/5 transition-colors group">
                          <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-white/10 transition-colors">
                            <Building2 className="w-5 h-5 text-white/70" />
                          </div>
                          <div>
                            <span className="text-white font-medium text-sm block">Brand Directory</span>
                            <span className="text-white/40 text-xs mt-0.5 block">36,000+ companies tracked</span>
                          </div>
                        </Link>
                      </div>
                      
                      {/* Right side - University Index Featured */}
                      <div className="flex-1 p-4 bg-gradient-to-br from-white/[0.02] to-transparent">
                        <div className="px-2 py-2">
                          <span className="text-xs font-medium text-white/40 uppercase tracking-wider">Featured</span>
                        </div>
                        
                        <Link href="/universities" className="block group">
                          <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-[#1a1a2e] to-[#0a0a0a] border border-white/10 p-4 hover:border-white/20 transition-colors">
                            {/* Mini visualization */}
                            <div className="flex items-center justify-center mb-4">
                              <div className="relative w-20 h-20">
                                <div className="absolute inset-0 rounded-full border border-white/10"></div>
                                <div className="absolute inset-2 rounded-full border border-white/10"></div>
                                <div className="absolute inset-4 rounded-full border border-white/10"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <GraduationCap className="w-6 h-6 text-white" />
                                </div>
                                {/* Orbiting dots */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-blue-400"></div>
                                <div className="absolute bottom-2 right-0 w-2 h-2 rounded-full bg-emerald-400"></div>
                                <div className="absolute bottom-2 left-0 w-2 h-2 rounded-full bg-amber-400"></div>
                              </div>
                            </div>
                            
                            <div className="text-center">
                              <span className="text-white font-semibold text-sm block">University Index</span>
                              <span className="text-white/40 text-xs mt-1 block">1,200+ schools ranked by AI visibility</span>
                            </div>
                            
                            <div className="flex items-center justify-center gap-1 mt-3 text-white/60 group-hover:text-white transition-colors">
                              <span className="text-xs font-medium">Explore rankings</span>
                              <ArrowRight className="w-3 h-3" />
                            </div>
                          </div>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Pricing */}
            <Link href="/pricing" className="px-4 py-2 text-white/70 hover:text-white text-sm font-medium transition-colors">
              Pricing
            </Link>

            {/* Resources Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setActiveDropdown('resources')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className={`px-4 py-2 text-sm font-medium flex items-center gap-1 transition-colors rounded-full ${
                activeDropdown === 'resources' ? 'bg-white/10 text-white' : 'text-white/70 hover:text-white'
              }`}>
                Resources
                <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === 'resources' ? 'rotate-180' : ''}`} />
              </button>
              
              {activeDropdown === 'resources' && (
                <div className="absolute top-full right-0 pt-2">
                  <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-2 min-w-[260px] shadow-2xl">
                    <Link href="/docs" className="flex items-start gap-3 px-3 py-3 rounded-xl hover:bg-white/5 transition-colors group">
                      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-white/10 transition-colors">
                        <BookOpen className="w-5 h-5 text-white/70" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium text-sm">Documentation</span>
                          <span className="px-1.5 py-0.5 text-[10px] font-medium bg-white/10 text-white/60 rounded">Soon</span>
                        </div>
                        <span className="text-white/40 text-xs mt-0.5 block">Learn how Harbor works</span>
                      </div>
                    </Link>
                    
                    <Link href="/blog" className="flex items-start gap-3 px-3 py-3 rounded-xl hover:bg-white/5 transition-colors group">
                      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-white/10 transition-colors">
                        <FileText className="w-5 h-5 text-white/70" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium text-sm">Blog</span>
                          <span className="px-1.5 py-0.5 text-[10px] font-medium bg-white/10 text-white/60 rounded">Soon</span>
                        </div>
                        <span className="text-white/40 text-xs mt-0.5 block">GEO insights & updates</span>
                      </div>
                    </Link>
                    
                    <Link href="/api" className="flex items-start gap-3 px-3 py-3 rounded-xl hover:bg-white/5 transition-colors group">
                      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-white/10 transition-colors">
                        <Code className="w-5 h-5 text-white/70" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium text-sm">API</span>
                          <span className="px-1.5 py-0.5 text-[10px] font-medium bg-white/10 text-white/60 rounded">Soon</span>
                        </div>
                        <span className="text-white/40 text-xs mt-0.5 block">Build integrations</span>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/auth/login" className="px-4 py-2 text-white/70 hover:text-white text-sm font-medium transition-colors">
              Log in
            </Link>
            <Link 
              href="/auth/signup" 
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
        <div className="md:hidden bg-[#0a0a0a] border-t border-white/10">
          <div className="px-6 py-4 space-y-1">
            <div className="py-2">
              <span className="text-xs font-medium text-white/40 uppercase tracking-wider">Product</span>
            </div>
            <Link href="/product" className="block py-2 text-white/70 hover:text-white pl-2">Brand Visibility</Link>
            <Link href="/product/sources" className="block py-2 text-white/70 hover:text-white pl-2">Citation Sources</Link>
            <Link href="/product/competitors" className="block py-2 text-white/70 hover:text-white pl-2">Competitor Intel</Link>
            
            <div className="py-2 pt-4">
              <span className="text-xs font-medium text-white/40 uppercase tracking-wider">Index</span>
            </div>
            <Link href="/brands" className="block py-2 text-white/70 hover:text-white pl-2">Brand Directory</Link>
            <Link href="/universities" className="block py-2 text-white/70 hover:text-white pl-2">University Index</Link>
            
            <div className="py-2 pt-4">
              <span className="text-xs font-medium text-white/40 uppercase tracking-wider">More</span>
            </div>
            <Link href="/pricing" className="block py-2 text-white/70 hover:text-white pl-2">Pricing</Link>
            <Link href="/docs" className="block py-2 text-white/70 hover:text-white pl-2">Documentation</Link>
            
            <div className="pt-4 border-t border-white/10 space-y-3 mt-4">
              <Link href="/auth/login" className="block py-2 text-white/70 hover:text-white">Log in</Link>
              <Link href="/auth/signup" className="block py-3 bg-white text-black text-center font-semibold rounded-lg">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}