// apps/web/components/landing/FinalCTASection.tsx
'use client'

import { useState, useEffect } from 'react'
import { Search, ArrowRight, X, Plus } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface Brand {
  id: string
  brand_name: string
  slug: string
  domain: string
  logo_url: string
  visibility_score: number
  industry: string
  rank_global: number
  claimed: boolean
}

export default function FinalCTASection() {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [brands, setBrands] = useState<Brand[]>([])
  const [searchResults, setSearchResults] = useState<Brand[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const [hasFetched, setHasFetched] = useState(false)

  // Fetch brands on first focus (lazy load)
  useEffect(() => {
    if (isFocused && !hasFetched) {
      setLoading(true)
      fetch('/api/index/brands')
        .then(res => res.json())
        .then(data => {
          setBrands(data)
          setHasFetched(true)
          setLoading(false)
        })
        .catch(err => {
          console.error('Failed to fetch brands:', err)
          setLoading(false)
        })
    }
  }, [isFocused, hasFetched])

  // Filter results based on query
  useEffect(() => {
    if (query.trim() && brands.length > 0) {
      const results = brands.filter(brand =>
        brand.brand_name.toLowerCase().includes(query.toLowerCase()) ||
        brand.domain.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5)
      
      setSearchResults(results)
      setShowDropdown(true)
    } else if (query.trim() && hasFetched) {
      // Query exists but no results
      setSearchResults([])
      setShowDropdown(true)
    } else {
      setSearchResults([])
      setShowDropdown(false)
    }
  }, [query, brands, hasFetched])

  const handleBlur = () => {
    // Delay to allow click on dropdown items
    setTimeout(() => {
      setIsFocused(false)
      setShowDropdown(false)
    }, 200)
  }

  return (
    <section className="relative">
      
      {/* Color Noise Transition Bar */}
      <div 
        className="w-full h-4 md:h-6"
        style={{
          backgroundImage: 'url(/color-noise-bar.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />

      {/* Main Dark Section */}
      <div className="relative bg-[#101A31] py-20 md:py-32 overflow-hidden">
        
        {/* Wireframe Background */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.06]"
          style={{
            backgroundImage: 'url(/wireframe-hero.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />

        {/* Subtle radial glow behind search */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[800px] h-[300px] md:h-[400px] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse, rgba(34, 211, 238, 0.08) 0%, transparent 70%)'
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-6 text-center">
          
          {/* Eyebrow */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 mb-6">
            <p className="text-sm font-mono uppercase tracking-wider text-white/60">
              Find your brand
            </p>
          </div>

          {/* Headline */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4 md:mb-6 leading-tight">
            <span className="bg-gradient-to-r from-white via-cyan-200 to-blue-400 bg-clip-text text-transparent">
              See how AI sees you
            </span>
          </h2>

          {/* Subhead */}
          <p className="text-base md:text-xl text-white/60 max-w-2xl mx-auto mb-8 md:mb-10 px-2">
            Search for your brand in the Harbor Index. Claim your profile and start improving your AI visibility.
          </p>

          {/* Search Input with Dropdown */}
          <div className="relative max-w-xl mx-auto">
            
            {/* Animated gradient border container */}
            <div className="relative p-[2px] rounded-xl md:rounded-2xl gradient-border-wrapper">
              
              {/* Inner input container */}
              <div className="relative bg-[#0a0f1a] rounded-xl md:rounded-2xl">
                
                {/* Desktop layout */}
                <div className="hidden md:flex items-center">
                  <div className="pl-5 text-white/40">
                    <Search className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={handleBlur}
                    placeholder="Search for a brand..."
                    className="flex-1 bg-transparent text-white text-lg px-4 py-5 outline-none placeholder:text-white/30"
                  />
                  {query && (
                    <button
                      onClick={() => {
                        setQuery('')
                        setShowDropdown(false)
                      }}
                      className="mr-2 text-white/40 hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <Link
                    href="/brands"
                    className="m-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-400 via-cyan-200 to-white text-[#101A31] font-semibold flex items-center gap-2 hover:brightness-90 transition-all"
                  >
                    Browse All
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* Mobile layout - stacked */}
                <div className="md:hidden">
                  <div className="flex items-center px-4 py-4">
                    <div className="text-white/40">
                      <Search className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onFocus={() => setIsFocused(true)}
                      onBlur={handleBlur}
                      placeholder="Search for a brand..."
                      className="flex-1 bg-transparent text-white text-base px-3 py-1 outline-none placeholder:text-white/30"
                    />
                    {query && (
                      <button
                        onClick={() => {
                          setQuery('')
                          setShowDropdown(false)
                        }}
                        className="text-white/40 hover:text-white transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="px-3 pb-3">
                    <Link
                      href="/brands"
                      className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-400 via-cyan-200 to-white text-[#101A31] font-semibold flex items-center justify-center gap-2 hover:brightness-90 transition-all"
                    >
                      Browse All
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

              </div>
            </div>

            {/* Search Results Dropdown */}
            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#0C1422] rounded-xl border border-white/10 shadow-2xl overflow-hidden z-50">
                
                {/* Loading state */}
                {loading && (
                  <div className="px-6 py-4 text-center">
                    <p className="text-white/40 text-sm">Loading brands...</p>
                  </div>
                )}

                {/* Results */}
                {!loading && searchResults.length > 0 && (
                  <>
                    {searchResults.map((brand) => {
                      const delta = brand.rank_global <= 10 ? 5.8 : -1.2
                      const isPositive = delta > 0

                      return (
                        <Link
                          key={brand.id}
                          href={`/brands/${brand.slug}`}
                          className="flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                        >
                          {/* Logo */}
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                            {brand.logo_url && (
                              <Image
                                src={brand.logo_url}
                                alt={brand.brand_name}
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none'
                                }}
                              />
                            )}
                          </div>

                          {/* Brand Info */}
                          <div className="flex-1 min-w-0 text-left">
                            <div className="text-white font-medium truncate">{brand.brand_name}</div>
                            <div className="text-white/40 text-sm truncate">{brand.domain}</div>
                          </div>

                          {/* Rank */}
                          <div className="text-white/60 text-sm font-mono hidden sm:block">#{brand.rank_global}</div>

                          {/* Score */}
                          <div className="flex items-center gap-2">
                            <span className="text-white font-semibold">{brand.visibility_score.toFixed(1)}%</span>
                            <span className={`text-xs font-medium hidden sm:inline ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                              {isPositive ? '+' : ''}{delta.toFixed(1)}%
                            </span>
                          </div>

                          {/* Arrow */}
                          <ArrowRight className="w-4 h-4 text-white/40" />
                        </Link>
                      )
                    })}

                    {/* View All Results */}
                    {searchResults.length === 5 && (
                      <div className="px-6 py-3 bg-white/5 border-t border-white/10">
                        <Link
                          href={`/brands?q=${encodeURIComponent(query)}`}
                          className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                        >
                          View all results for "{query}"
                        </Link>
                      </div>
                    )}
                  </>
                )}

                {/* No Results - Add Your Brand */}
                {!loading && query.trim() && searchResults.length === 0 && (
                  <div className="p-6">
                    <p className="text-white/60 text-sm mb-4 text-center">
                      No brands found for "{query}"
                    </p>
                    <Link
                      href="/auth/signup"
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-400 font-medium hover:bg-cyan-500/30 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      Add "{query}" to the Index
                    </Link>
                  </div>
                )}

              </div>
            )}

          </div>

          {/* Helper text */}
          <p className="mt-6 text-sm text-white/40">
            Over 15,000 brands indexed and growing
          </p>

        </div>
      </div>

      {/* CSS for smooth animated border */}
      <style jsx>{`
        .gradient-border-wrapper {
          position: relative;
          background: linear-gradient(
            90deg,
            #3b82f6,
            #22d3ee,
            #ffffff,
            #22d3ee,
            #3b82f6,
            #22d3ee,
            #ffffff,
            #22d3ee,
            #3b82f6
          );
          background-size: 300% 100%;
          animation: shimmer 4s linear infinite;
        }
        
        @keyframes shimmer {
          0% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </section>
  )
}