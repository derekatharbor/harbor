// apps/web/components/landing/NewHeroSection.tsx
'use client'

import { useState, useEffect } from 'react'
import { Search, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface Brand {
  id: string
  brand_name: string
  slug: string
  domain: string
  visibility_score: number
}

export default function NewHeroSection() {
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
      setSearchResults([])
      setShowDropdown(true)
    } else {
      setSearchResults([])
      setShowDropdown(false)
    }
  }, [query, brands, hasFetched])

  const handleBlur = () => {
    setTimeout(() => {
      setIsFocused(false)
      setShowDropdown(false)
    }, 200)
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#101A31]">
      
      {/* Wireframe Background Image */}
      <div 
        className="absolute top-0 left-0 right-0 h-[600px] pointer-events-none"
        style={{
          backgroundImage: 'url(/wireframe-hero.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          backgroundRepeat: 'no-repeat',
          opacity: 0.15
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-32 md:pt-48 pb-16 md:pb-24 text-center">
        
        {/* Headline with animated gradient */}
        <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-heading font-bold mb-4 md:mb-6 leading-tight">
          <span className="animated-gradient-text">
            AI is the new search.
          </span>
          <br />
          <span className="text-white">
            See how it sees your brand.
          </span>
        </h1>

        {/* Subheading */}
        <p className="text-base md:text-lg lg:text-xl text-white/60 max-w-2xl mx-auto mb-10 md:mb-12 leading-relaxed px-2">
          Find out what ChatGPT, Claude, Gemini, and Perplexity say about you.
        </p>

        {/* Search Input */}
        <div className="relative max-w-xl mx-auto">
          <div className="relative bg-white/5 border border-white/20 rounded-xl overflow-hidden hover:border-white/30 focus-within:border-white/40 transition-colors">
            <div className="flex items-center">
              <div className="pl-5 text-white/40">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={handleBlur}
                placeholder="Search for your brand..."
                className="flex-1 bg-transparent text-white text-lg px-4 py-4 md:py-5 outline-none placeholder:text-white/40"
              />
              <Link
                href="/brands"
                className="m-2 px-5 py-2.5 rounded-lg bg-white text-[#101A31] font-semibold text-sm hover:bg-white/90 transition-colors hidden sm:block"
              >
                Browse All
              </Link>
            </div>
          </div>

          {/* Search Results Dropdown */}
          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#0C1422] rounded-xl border border-white/10 shadow-2xl overflow-hidden z-50">
              
              {loading && (
                <div className="px-6 py-4 text-center">
                  <p className="text-white/40 text-sm">Loading brands...</p>
                </div>
              )}

              {!loading && searchResults.length > 0 && (
                <>
                  {searchResults.map((brand) => (
                    <Link
                      key={brand.id}
                      href={`/brands/${brand.slug}`}
                      className="flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                    >
                      <div className="text-left">
                        <div className="text-white font-medium">{brand.brand_name}</div>
                        <div className="text-white/40 text-sm">{brand.domain}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-white/60 text-sm font-mono">{brand.visibility_score}%</span>
                        <ArrowRight className="w-4 h-4 text-white/40" />
                      </div>
                    </Link>
                  ))}
                </>
              )}

              {!loading && query.trim() && searchResults.length === 0 && (
                <div className="px-5 py-4 text-center">
                  <p className="text-white/50 text-sm">
                    No results for "{query}" — <Link href="/brands" className="text-[#FF6B4A] hover:underline">browse all brands</Link>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Helper text */}
        <p className="mt-6 text-sm text-white/40">
          20,000+ brands indexed
        </p>

        {/* AI Platform Logos Row */}
        <div className="mt-12 md:mt-16 flex flex-col items-center justify-center gap-3 md:gap-4">
          <p className="text-white/40 text-xs md:text-sm font-mono uppercase tracking-wider">
            Tracking visibility across
          </p>
          <div className="flex items-center gap-4 md:gap-6 flex-wrap justify-center">
            <span className="text-white/60 text-xs md:text-sm font-medium">ChatGPT</span>
            <span className="text-white/60 text-xs md:text-sm font-medium">Claude</span>
            <span className="text-white/60 text-xs md:text-sm font-medium">Gemini</span>
            <span className="text-white/60 text-xs md:text-sm font-medium">Perplexity</span>
          </div>
        </div>
      </div>

      {/* Animated gradient text style */}
      <style jsx>{`
        .animated-gradient-text {
          background: linear-gradient(
            90deg,
            #ffffff,
            #22d3ee,
            #3b82f6,
            #22d3ee,
            #ffffff,
            #22d3ee,
            #3b82f6,
            #22d3ee,
            #ffffff
          );
          background-size: 300% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gradient-shift 6s linear infinite;
        }
        
        @keyframes gradient-shift {
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