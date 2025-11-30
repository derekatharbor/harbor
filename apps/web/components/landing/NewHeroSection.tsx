// apps/web/components/landing/NewHeroSection.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, ArrowRight, Plus } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import AddBrandModal from './AddBrandModal'

interface Brand {
  id: string
  brand_name: string
  slug: string
  domain: string
  logo_url: string
  visibility_score: number
  rank_global: number
}

export default function NewHeroSection() {
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Brand[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Debounced search - hits API directly
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (!query.trim() || query.length < 2) {
      setSearchResults([])
      setShowDropdown(false)
      return
    }

    setLoading(true)
    setShowDropdown(true)

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/brands/search?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setSearchResults(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('Search failed:', err)
        setSearchResults([])
      } finally {
        setLoading(false)
      }
    }, 150) // 150ms debounce - fast but prevents spam

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [query])

  const handleBlur = () => {
    setTimeout(() => {
      setShowDropdown(false)
    }, 200)
  }

  const handleAddBrand = () => {
    setShowDropdown(false)
    setShowAddModal(true)
  }

  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center overflow-visible bg-[#101A31] z-20">
        
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
        <div className="relative z-30 max-w-4xl mx-auto px-6 pt-32 md:pt-48 pb-16 md:pb-24 text-center">
          
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
          <div className="relative max-w-xl mx-auto z-50">
            <div className="relative bg-white/5 border border-white/20 rounded-xl overflow-hidden hover:border-white/30 focus-within:border-white/40 transition-colors">
              <div className="flex items-center">
                <div className="pl-5 text-white/40">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => query.length >= 2 && setShowDropdown(true)}
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
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#0C1422] rounded-xl border border-white/10 shadow-2xl overflow-hidden z-[100]">
                
                {loading && (
                  <div className="px-6 py-4 text-center">
                    <p className="text-white/40 text-sm">Searching...</p>
                  </div>
                )}

                {!loading && searchResults.length > 0 && (
                  <>
                    {searchResults.map((brand) => (
                      <Link
                        key={brand.id}
                        href={`/brands/${brand.slug}`}
                        className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                      >
                        {/* Logo */}
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/10 flex-shrink-0 flex items-center justify-center">
                          {brand.logo_url ? (
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
                          ) : (
                            <span className="text-white/30 text-xs font-bold">
                              {brand.brand_name.charAt(0)}
                            </span>
                          )}
                        </div>

                        {/* Brand Info */}
                        <div className="flex-1 min-w-0 text-left">
                          <div className="text-white font-medium truncate">{brand.brand_name}</div>
                          <div className="text-white/40 text-sm truncate">{brand.domain}</div>
                        </div>

                        {/* Score */}
                        <div className="flex items-center gap-3">
                          <span className="text-white/60 text-sm font-mono">{brand.visibility_score}%</span>
                          <ArrowRight className="w-4 h-4 text-white/40" />
                        </div>
                      </Link>
                    ))}
                  </>
                )}

                {!loading && query.trim().length >= 2 && searchResults.length === 0 && (
                  <div className="p-5">
                    <p className="text-white/50 text-sm text-center mb-4">
                      No results for "{query}"
                    </p>
                    <button
                      onClick={handleAddBrand}
                      className="w-full py-3 px-4 bg-white/5 border border-white/10 rounded-lg text-white font-medium hover:bg-white/10 hover:border-white/20 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add "{query}" to the index
                    </button>
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

      {/* Add Brand Modal */}
      <AddBrandModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        initialBrandName={query}
      />
    </>
  )
}