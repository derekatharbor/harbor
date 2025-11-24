// Path: /apps/web/app/brands/HarborIndexClient.tsx

'use client'

import { useState, useEffect } from 'react'
import { Search, ArrowRight, X, Plus } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import FrostedNav from '@/components/landing/FrostedNav'

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
      {/* Use FrostedNav from landing */}
      <FrostedNav />

      {/* Hero Container - Starts below navbar */}
      <div className="relative pt-12 md:pt-16">
        {/* Hero Section with Wireframe */}
        <section className="relative min-h-[420px] md:min-h-[500px] pt-8 md:pt-16 pb-4 md:pb-6">
          
          {/* Radial Gradient Glow - Subtle accent */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] md:w-[1200px] h-[400px] md:h-[600px] pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(34, 211, 238, 0.08) 0%, rgba(59, 130, 246, 0.04) 40%, transparent 70%)',
            }}
          />

          {/* Wireframe Background - Fixed for mobile */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{ 
              opacity: 0.15
            }}
          >
            {/* Mobile: Use CSS background for better scaling */}
            <div 
              className="absolute inset-0 md:hidden"
              style={{
                backgroundImage: 'url(/images/wireframe-wave.png)',
                backgroundSize: '180% auto',
                backgroundPosition: 'center center',
                backgroundRepeat: 'no-repeat',
              }}
            />
            {/* Desktop: Use Next Image */}
            <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-[1600px]">
              <div className="relative w-full aspect-[2/1]">
                <Image
                  src="/images/wireframe-wave.png"
                  alt=""
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>

          {/* Hero Content */}
          <div className="relative max-w-5xl mx-auto px-4 md:px-6 text-center z-20 flex flex-col items-center justify-center min-h-[420px] md:min-h-[500px]">
            
            {/* Frosted Glass Pill */}
            <div className="inline-flex items-center px-4 py-2 rounded-full backdrop-blur-md bg-white/10 border border-white/20 mb-4">
              <span className="text-white/90 text-xs md:text-sm font-medium tracking-wide uppercase">
                Harbor Index
              </span>
            </div>

            {/* Gradient Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-3 md:mb-4 leading-[1.1]">
              <span className="bg-gradient-to-r from-white via-cyan-200 to-blue-400 bg-clip-text text-transparent">
                The AI Visibility Index
              </span>
            </h1>

            {/* Explainer */}
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/60 max-w-3xl mx-auto mb-6 md:mb-8 px-2">
              The global leaderboard for how AI models interpret and surface the world's brands.
            </p>

            {/* Search Box with Dropdown */}
            <div className="w-full max-w-2xl relative z-[100]">
              
              {/* Subtle glow behind search */}
              <div 
                className="absolute -inset-1 rounded-2xl opacity-50 blur-xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.2), rgba(59, 130, 246, 0.2))'
                }}
              />
              
              <div className="relative flex items-center bg-[#0C1422] rounded-2xl border border-white/10 p-2 shadow-2xl">
                <Search className="w-5 h-5 text-white/40 ml-3 md:ml-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery && setShowSearchDropdown(true)}
                  onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
                  placeholder="Search brands..."
                  className="flex-1 px-3 md:px-4 py-2.5 md:py-3 bg-transparent text-white placeholder-white/40 focus:outline-none text-sm md:text-base"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setShowSearchDropdown(false)
                    }}
                    className="mr-3 md:mr-4 text-white/40 hover:text-white transition-colors"
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
                        className="flex items-center gap-3 md:gap-4 px-4 md:px-6 py-3 md:py-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                      >
                        {/* Logo */}
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

                        {/* Brand Info */}
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-medium truncate text-sm md:text-base">{brand.brand_name}</div>
                          <div className="text-white/40 text-xs md:text-sm truncate">{brand.domain}</div>
                        </div>

                        {/* Rank - Hidden on small mobile */}
                        <div className="text-white/60 text-sm font-mono hidden sm:block">#{brand.rank_global}</div>

                        {/* Score */}
                        <div className="flex items-center gap-1 md:gap-2">
                          <span className="text-white font-semibold text-sm md:text-base">{brand.visibility_score.toFixed(1)}%</span>
                          <span className={`text-xs font-medium hidden sm:inline ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                            {isPositive ? '+' : ''}{delta.toFixed(1)}%
                          </span>
                        </div>

                        {/* Arrow */}
                        <ArrowRight className="w-4 h-4 text-white/40 hidden md:block" />
                      </Link>
                    )
                  })}

                  {/* View All Results */}
                  {searchResults.length === 5 && (
                    <div className="px-4 md:px-6 py-3 bg-white/5 border-t border-white/10">
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

              {/* No Results - Add Brand CTA */}
              {showSearchDropdown && searchQuery && searchResults.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#0C1422] rounded-xl border border-white/10 shadow-2xl p-5 md:p-6 z-50">
                  <p className="text-white/60 text-sm mb-4 text-center">No brands found for "{searchQuery}"</p>
                  <Link
                    href="/auth/signup"
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-400 font-medium hover:bg-cyan-500/30 transition-all text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add "{searchQuery}" to the Index
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Table Section */}
      <section className="relative z-0 max-w-7xl mx-auto px-3 md:px-4 lg:px-6 pb-12 md:pb-20">
        
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

    </div>
  )
}