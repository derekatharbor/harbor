// Path: /apps/web/app/brands/HarborIndexClient.tsx

'use client'

import { useState, useEffect } from 'react'
import { Menu, Search, ArrowRight, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import FullscreenMenu from '@/components/landing/FullscreenMenu'

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

interface Props {
  brands: Brand[]
}

export default function HarborIndexClient({ brands: initialBrands }: Props) {
  const [brands, setBrands] = useState<Brand[]>(initialBrands)
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>(initialBrands.slice(0, 50))
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [loading, setLoading] = useState(initialBrands.length === 0)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [searchResults, setSearchResults] = useState<Brand[]>([])

  // Fetch brands if not provided
  useEffect(() => {
    if (initialBrands.length === 0) {
      fetch('/api/index/brands')
        .then(res => res.json())
        .then(data => {
          setBrands(data)
          setFilteredBrands(data.slice(0, 50))
          setLoading(false)
        })
        .catch(err => {
          console.error('Failed to fetch brands:', err)
          setLoading(false)
        })
    }
  }, [initialBrands])

  // Handle search with dropdown
  useEffect(() => {
    if (searchQuery.trim()) {
      const results = brands.filter(brand =>
        brand.brand_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        brand.domain.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5) // Show top 5 results
      
      setSearchResults(results)
      setShowSearchDropdown(true)
    } else {
      setSearchResults([])
      setShowSearchDropdown(false)
    }
  }, [searchQuery, brands])

  const totalBrands = brands.length
  const displayedBrands = filteredBrands.length

  return (
    <div className="min-h-screen bg-[#101A31] relative">
      {/* Frosted Nav */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-3rem)] max-w-[1400px] overflow-visible">
        <div 
          className="backdrop-blur-xl bg-white/15 rounded-2xl shadow-2xl border border-white/10"
          style={{ backdropFilter: 'blur(12px)' }}
        >
          <div className="px-4 md:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14 md:h-16">
              <Link href="/" className="flex items-center space-x-2 md:space-x-3">
                <Image 
                  src="/logo-icon.png" 
                  alt="Harbor" 
                  width={32} 
                  height={32}
                  className="w-7 h-7 md:w-8 md:h-8"
                />
                <span className="text-lg md:text-xl font-bold text-white">Harbor</span>
              </Link>

              <div className="flex items-center space-x-2 md:space-x-4">
                <button
                  onClick={() => setIsMenuOpen(true)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  aria-label="Menu"
                >
                  <Menu className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </button>
                
                <Link
                  href="/dashboard"
                  className="inline-flex items-center px-4 md:px-5 py-2 md:py-2.5 rounded-lg bg-white text-black text-sm md:text-base font-medium hover:bg-white/90 transition-all duration-200"
                >
                  Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Container - Starts below navbar */}
      <div className="relative pt-12 md:pt-16">
        {/* Hero Section with Wireframe */}
        <section className="relative min-h-[400px] md:min-h-[500px] pt-8 md:pt-16 pb-4 md:pb-6 z-[1]">
          {/* Wireframe Background - Centered, behind everything */}
          <div 
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0"
            style={{ 
              width: '95vw',
              maxWidth: '1600px',
              opacity: 0.2
            }}
          >
            <div className="relative w-full aspect-[3/1] md:aspect-[2/1]">
              <Image
                src="/images/wireframe-wave.png"
                alt=""
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Hero Content */}
          <div className="relative max-w-5xl mx-auto px-4 md:px-6 text-center z-10 flex flex-col items-center justify-center min-h-[400px] md:min-h-[500px]">
            {/* Frosted Glass Pill */}
            <div className="inline-flex items-center px-4 py-2 rounded-full backdrop-blur-md bg-white/10 border border-white/20 mb-4">
              <span className="text-white/90 text-sm font-medium tracking-wide uppercase">
                HARBOR INDEX
              </span>
            </div>

                {/* Gradient Title */}
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-white via-cyan-200 to-blue-400 bg-clip-text text-transparent">
              The AI Visibility Index
            </h1>

            {/* Explainer */}
            <p className="text-base md:text-lg lg:text-xl text-white/60 max-w-3xl mx-auto mb-6 md:mb-8 px-4">
              The global leaderboard for how AI models interpret and surface the world's brands.
            </p>

            {/* Search Box with Dropdown */}
                <div className="w-full max-w-2xl relative">
              <div className="relative flex items-center bg-[#0C1422] rounded-2xl border border-[#2A2F38] p-2 shadow-lg">
                <Search className="w-5 h-5 text-white/40 ml-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery && setShowSearchDropdown(true)}
                  onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
                  placeholder="Search brands..."
                  className="flex-1 px-4 py-3 bg-transparent text-white placeholder-white/40 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setShowSearchDropdown(false)
                    }}
                    className="mr-4 text-white/40 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                  </div>

              {/* Search Dropdown */}
              {showSearchDropdown && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#0C1422] rounded-xl border border-white/10 shadow-2xl overflow-hidden z-50">
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
                    </div>

                    {/* Brand Info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium truncate">{brand.brand_name}</div>
                      <div className="text-white/40 text-sm truncate">{brand.domain}</div>
                    </div>

                    {/* Rank */}
                    <div className="text-white/60 text-sm font-mono">#{brand.rank_global}</div>

                    {/* Score */}
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold">{brand.visibility_score.toFixed(1)}%</span>
                      <span className={`text-xs font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
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
                    href={`/brands/search?q=${encodeURIComponent(searchQuery)}`}
                    className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    View all results for "{searchQuery}"
                  </Link>
                </div>
              )}
            </div>
          )}

              {/* No Results */}
              {showSearchDropdown && searchQuery && searchResults.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#0C1422] rounded-xl border border-white/10 shadow-2xl p-6 text-center z-50">
                  <p className="text-white/60 text-sm">No brands found for "{searchQuery}"</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Table Section - No wireframe */}
      <section className="relative max-w-7xl mx-auto px-3 md:px-4 lg:px-6 pb-12 md:pb-20">
        
        {/* Brand Table */}
        <div className="bg-[#0C1422]/80 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-white/50 text-xs md:text-sm font-medium px-3 md:px-6 py-3 md:py-4">Rank</th>
                  <th className="text-left text-white/50 text-xs md:text-sm font-medium px-3 md:px-6 py-3 md:py-4">Brand</th>
                  <th className="text-left text-white/50 text-xs md:text-sm font-medium px-3 md:px-6 py-3 md:py-4 hidden sm:table-cell">Industry</th>
                  <th className="text-right text-white/50 text-xs md:text-sm font-medium px-3 md:px-6 py-3 md:py-4">Score</th>
                </tr>
              </thead>
              <tbody>
                {filteredBrands.map((brand, index) => {
                  const delta = brand.rank_global <= 10 ? 5.8 : -1.2
                  const isPositive = delta > 0

                  return (
                    <tr 
                      key={brand.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                      onClick={() => window.location.href = `/brands/${brand.slug}`}
                    >
                      <td className="px-3 md:px-6 py-3 md:py-4">
                        <span className="text-white/60 font-mono text-xs md:text-sm">#{brand.rank_global}</span>
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4">
                        <div className="flex items-center gap-2 md:gap-3">
                          <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
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
                          </div>
                          <div>
                            <div className="text-white font-medium text-sm md:text-base">{brand.brand_name}</div>
                            <div className="text-white/40 text-xs md:text-sm">{brand.domain}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 hidden sm:table-cell">
                        <span className="text-white/60 text-xs md:text-sm">{brand.industry}</span>
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 text-right">
                      <td className="px-3 md:px-6 py-3 md:py-4 text-right">
                        <div className="flex items-center justify-end gap-1 md:gap-2">
                          <span className="text-white font-bold text-sm md:text-base">{brand.visibility_score.toFixed(1)}%</span>
                          <span className={`text-xs font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                            {isPositive ? '+' : ''}{delta.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* View All Button */}
          {displayedBrands < totalBrands && (
            <div className="border-t border-white/10 p-6 text-center">
              <Link
                href="/brands/all"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-medium hover:bg-cyan-500/30 transition-all"
              >
                View all {totalBrands} brands
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

        {/* Stats Footer */}
        <div className="mt-8 text-center">
          <p className="text-white/40 text-sm">
            Showing {displayedBrands} of {totalBrands} brands • Updated daily
          </p>
        </div>
      </section>

      {/* Fullscreen Menu */}
      <FullscreenMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </div>
  )
}