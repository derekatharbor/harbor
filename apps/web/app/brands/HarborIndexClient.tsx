'use client'

import { useState, useEffect } from 'react'
import { Menu, Search } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import FullscreenMenu from '@/components/FullscreenMenu' // Import the unified menu

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
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>(initialBrands)
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [loading, setLoading] = useState(initialBrands.length === 0)
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch brands if not provided
  useEffect(() => {
    if (initialBrands.length === 0) {
      fetch('/api/brands')
        .then(res => res.json())
        .then(data => {
          setBrands(data)
          setFilteredBrands(data)
          setLoading(false)
        })
        .catch(err => {
          console.error('Failed to fetch brands:', err)
          setLoading(false)
        })
    }
  }, [initialBrands])

  // Filter brands based on industry and search
  useEffect(() => {
    let filtered = brands

    if (searchQuery) {
      filtered = filtered.filter(brand =>
        brand.brand_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        brand.domain.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (selectedIndustry !== 'all') {
      filtered = filtered.filter(brand => brand.industry === selectedIndustry)
    }

    setFilteredBrands(filtered)
  }, [searchQuery, selectedIndustry, brands])

  // Get unique industries
  const industries = ['all', ...Array.from(new Set(brands.map(b => b.industry).filter(Boolean)))]
  
  // Top 3 brands
  const topThree = filteredBrands.slice(0, 3)
  
  // Calculate mock delta (you'll replace with real data later)
  const getDelta = (rank: number) => {
    const deltas = [5.8, -3.0, 1.3, -0.6, 9.7, 1.5, 6.9, 6.3, 3.1, 2.1]
    return deltas[rank - 1] || 0
  }

  return (
    <div className="min-h-screen bg-[#101A31] relative">
      {/* Wireframe Background */}
      <div className="fixed inset-0 pointer-events-none opacity-40">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#101A31]/50 to-[#101A31]" />
      </div>

      {/* Frosted Nav */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-3rem)] max-w-[1400px]">
        <div 
          className="backdrop-blur-xl bg-white/15 rounded-2xl shadow-2xl border border-white/10"
          style={{ backdropFilter: 'blur(12px)' }}
        >
          <div className="px-4 md:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14 md:h-16">
              {/* Logo */}
              <a href="/" className="flex items-center space-x-2 md:space-x-3">
                <Image 
                  src="/logo-icon.png" 
                  alt="Harbor" 
                  width={32} 
                  height={32}
                  className="w-7 h-7 md:w-8 md:h-8"
                />
                <span className="text-lg md:text-xl font-bold text-white">Harbor</span>
              </a>

              {/* Right side */}
              <div className="flex items-center space-x-2 md:space-x-4">
                <a 
                  href="/login" 
                  className="hidden md:block text-white text-sm md:text-base hover:text-white/80 transition-colors duration-200"
                >
                  Log in
                </a>
                
                <a
                  href="/dashboard"
                  className="hidden md:inline-flex items-center px-4 md:px-5 py-2 md:py-2.5 rounded-lg bg-white text-black text-sm md:text-base font-medium hover:bg-white/90 transition-all duration-200"
                >
                  Get started
                </a>

                <button
                  onClick={() => setIsMenuOpen(true)}
                  className="p-2 rounded-lg hover:bg-white/5 transition-colors duration-200"
                  aria-label="Open menu"
                >
                  <Menu className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Use the unified FullscreenMenu component */}
      <FullscreenMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {/* Spacer for fixed nav */}
      <div className="h-24 md:h-28" />

      {/* Hero Section */}
      <section className="relative pt-16 md:pt-24 lg:pt-32 pb-12 md:pb-16 px-4 md:px-6 z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6">
            The Harbor Index
          </h1>
          <p className="text-base md:text-lg text-white/70 mb-8 md:mb-12 max-w-2xl mx-auto">
            Track how AI models see your brand. Real-time visibility scores across ChatGPT, Claude, Gemini, and Perplexity.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto mb-6 md:mb-8">
            <Search className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Search brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 md:pl-14 pr-4 md:pr-6 py-3 md:py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl md:rounded-2xl text-white placeholder-white/40 focus:outline-none focus:border-white/40 transition-all text-sm md:text-base"
            />
          </div>

          {/* Industry Filters */}
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
            {industries.map((industry) => (
              <button
                key={industry}
                onClick={() => setSelectedIndustry(industry)}
                className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${
                  selectedIndustry === industry
                    ? 'bg-white text-black'
                    : 'bg-transparent text-white/70 hover:bg-white/5'
                }`}
              >
                {industry === 'all' ? 'All' : industry}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Top 3 Featured Cards */}
      <section className="relative z-10 px-4 md:px-6 py-8 md:py-12">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-1 md:mb-2">
            Top {selectedIndustry === 'all' ? '' : selectedIndustry} brands this week
          </h2>
          <p className="text-white/50 text-xs md:text-sm mb-6 md:mb-8">Week of Nov 10</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {topThree.map((brand, index) => {
              const delta = getDelta(brand.rank_global)
              const isPositive = delta > 0

              return (
                <Link
                  key={brand.id}
                  href={`/brands/${brand.slug}`}
                  className="group relative bg-[#0C1422] rounded-xl md:rounded-2xl border border-white/5 p-6 md:p-8 hover:border-white/20 transition-all"
                >
                  {/* Visibility Score */}
                  <div className="mb-6 md:mb-8">
                    <div className="flex items-center gap-2 text-white/50 text-xs md:text-sm mb-2">
                      <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-white/5 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-white/30" />
                      </div>
                      Visibility Score
                    </div>
                    <div className="flex items-baseline gap-2 md:gap-3">
                      <span className="text-4xl md:text-5xl font-bold text-white">
                        {brand.visibility_score.toFixed(1)}%
                      </span>
                      <span className={`text-base md:text-lg font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {isPositive ? '+' : ''}{delta.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Brand Info */}
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg md:rounded-xl overflow-hidden bg-white/5 flex items-center justify-center flex-shrink-0">
                      <Image
                        src={brand.logo_url}
                        alt={brand.brand_name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    </div>
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold text-white group-hover:text-white/80 transition-colors">
                        {brand.brand_name}
                      </h3>
                    </div>
                  </div>

                  {/* Rank Badge */}
                  <div className="absolute top-4 md:top-6 right-4 md:right-6 w-7 h-7 md:w-8 md:h-8 rounded-full bg-white/10 flex items-center justify-center text-white text-sm md:text-base font-bold">
                    {index + 1}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Leaderboard Table */}
      <section className="relative z-10 px-4 md:px-6 pb-16 md:pb-20">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4" />
              <p className="text-white/50">Loading brands...</p>
            </div>
          ) : filteredBrands.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-white/50">No brands found</p>
            </div>
          ) : (
            <div className="rounded-xl md:rounded-2xl bg-[#0C1422] border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left px-4 md:px-8 py-3 md:py-4 text-xs md:text-sm font-medium text-white/40 uppercase tracking-wider w-12 md:w-16">
                      #
                    </th>
                    <th className="text-left px-4 md:px-8 py-3 md:py-4 text-xs md:text-sm font-medium text-white/40 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="text-right px-4 md:px-8 py-3 md:py-4 text-xs md:text-sm font-medium text-white/40 uppercase tracking-wider">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-white/10" />
                        <span className="hidden md:inline">Visibility Score</span>
                        <span className="md:hidden">Score</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBrands.slice(0, 50).map((brand) => {
                    const delta = getDelta(brand.rank_global)
                    const isPositive = delta > 0

                    return (
                      <tr
                        key={brand.id}
                        className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group"
                      >
                        {/* Rank */}
                        <td className="px-4 md:px-8 py-4 md:py-6">
                          <span className="text-base md:text-lg font-medium text-white/40 group-hover:text-white/60 transition-colors">
                            {brand.rank_global}
                          </span>
                        </td>

                        {/* Brand */}
                        <td className="px-4 md:px-8 py-4 md:py-6">
                          <Link
                            href={`/brands/${brand.slug}`}
                            className="flex items-center gap-3 md:gap-4"
                          >
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg overflow-hidden bg-white/5 flex items-center justify-center flex-shrink-0">
                              <Image
                                src={brand.logo_url}
                                alt={brand.brand_name}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none'
                                }}
                              />
                            </div>
                            <div>
                              <div className="text-base md:text-lg font-medium text-white group-hover:text-white/80 transition-colors">
                                {brand.brand_name}
                              </div>
                            </div>
                          </Link>
                        </td>

                        {/* Visibility Score */}
                        <td className="px-4 md:px-8 py-4 md:py-6 text-right">
                          <div className="flex items-center justify-end gap-2 md:gap-4">
                            <span className="text-xl md:text-2xl font-bold text-white">
                              {brand.visibility_score.toFixed(1)}%
                            </span>
                            <span className={`text-xs md:text-sm font-medium min-w-[50px] md:min-w-[60px] ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
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
          </div>
          )}
        </div>
      </section>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}