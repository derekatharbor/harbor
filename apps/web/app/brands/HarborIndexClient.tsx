'use client'

import { useState, useEffect } from 'react'
import { Menu, Search, ArrowRight } from 'lucide-react'
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
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [loading, setLoading] = useState(initialBrands.length === 0)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAllFilters, setShowAllFilters] = useState(false)

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

    // Limit to top 50 for display
    setFilteredBrands(filtered.slice(0, 50))
  }, [searchQuery, selectedIndustry, brands])

  // Get unique industries with counts
  const industryData = brands.reduce((acc: Record<string, number>, brand) => {
    if (brand.industry) {
      acc[brand.industry] = (acc[brand.industry] || 0) + 1
    }
    return acc
  }, {})

  // Top industries to show
  const topIndustries = ['Technology', 'SaaS', 'E-commerce', 'AI', 'Payments', 'Fintech', 'Consulting']
  const otherIndustries = Object.keys(industryData).filter(i => !topIndustries.includes(i)).sort()

  const totalBrands = brands.length
  const displayedBrands = filteredBrands.length

  return (
    <div className="min-h-screen bg-[#101A31] relative overflow-hidden">
      {/* Wireframe Wave Background - Full Width */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <Image
          src="/images/wireframe-wave.png"
          alt=""
          fill
          className="object-cover opacity-30"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#101A31]/60 via-[#101A31]/80 to-[#101A31]" />
      </div>

      {/* Frosted Nav */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-3rem)] max-w-[1400px]">
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

      {/* Spacer */}
      <div className="h-28" />

      {/* Hero Section */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-6 pt-16 pb-12 text-center">
        {/* Frosted Glass Pill */}
        <div className="inline-flex items-center px-4 py-2 rounded-full backdrop-blur-md bg-white/10 border border-white/20 mb-6">
          <span className="text-white/90 text-sm font-medium tracking-wide uppercase">
            HARBOR INDEX
          </span>
        </div>

        {/* Gradient Title */}
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-cyan-200 to-blue-400 bg-clip-text text-transparent">
          The AI Visibility Index
        </h1>

        {/* Explainer */}
        <p className="text-white/60 text-lg md:text-xl max-w-3xl mx-auto mb-12">
          AI Visibility Score shows how well AI systems understand and surface your brand across ChatGPT, Claude, Gemini, and Perplexity.
        </p>

        {/* Glowing Search Box */}
        <div className="max-w-2xl mx-auto relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur-lg opacity-30" />
          <div className="relative flex items-center bg-[#0C1422] rounded-2xl border border-cyan-500/30 p-2">
            <Search className="w-5 h-5 text-cyan-400 ml-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search brands..."
              className="flex-1 px-4 py-3 bg-transparent text-white placeholder-white/40 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 pb-20">
        
        {/* Industry Filters */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 items-center">
            {/* All button */}
            <button
              onClick={() => setSelectedIndustry('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedIndustry === 'all'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
              }`}
            >
              All ({totalBrands})
            </button>

            {/* Top industries */}
            {topIndustries.map(industry => (
              industryData[industry] && (
                <button
                  key={industry}
                  onClick={() => setSelectedIndustry(industry)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedIndustry === industry
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {industry} ({industryData[industry]})
                </button>
              )
            ))}

            {/* More button */}
            {otherIndustries.length > 0 && (
              <button
                onClick={() => setShowAllFilters(!showAllFilters)}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 transition-all"
              >
                {showAllFilters ? 'Less' : `More (${otherIndustries.length})`}
              </button>
            )}
          </div>

          {/* Expanded filters */}
          {showAllFilters && (
            <div className="mt-2 flex flex-wrap gap-2">
              {otherIndustries.map(industry => (
                <button
                  key={industry}
                  onClick={() => setSelectedIndustry(industry)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedIndustry === industry
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {industry} ({industryData[industry]})
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Brand Table */}
        <div className="bg-[#0C1422]/80 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-white/50 text-sm font-medium px-6 py-4">Rank</th>
                  <th className="text-left text-white/50 text-sm font-medium px-6 py-4">Brand</th>
                  <th className="text-left text-white/50 text-sm font-medium px-6 py-4">Industry</th>
                  <th className="text-right text-white/50 text-sm font-medium px-6 py-4">Visibility Score</th>
                  <th className="text-right text-white/50 text-sm font-medium px-6 py-4">Status</th>
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
                      <td className="px-6 py-4">
                        <span className="text-white/60 font-mono text-sm">#{brand.rank_global}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
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
                          <div>
                            <div className="text-white font-medium">{brand.brand_name}</div>
                            <div className="text-white/40 text-sm">{brand.domain}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-white/60 text-sm">{brand.industry}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-white font-bold">{brand.visibility_score.toFixed(1)}%</span>
                          <span className={`text-sm font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                            {isPositive ? '+' : ''}{delta.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {brand.claimed ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-400/10 text-green-400 text-xs font-medium">
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-white/5 text-white/40 text-xs font-medium">
                            Unclaimed
                          </span>
                        )}
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
      </div>

      {/* Fullscreen Menu */}
      <FullscreenMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </div>
  )
}