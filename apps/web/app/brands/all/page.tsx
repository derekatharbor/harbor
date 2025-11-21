// Path: /apps/web/app/brands/all/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, TrendingUp, ArrowRight } from 'lucide-react'
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

export default function AllBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'rank' | 'score' | 'name'>('rank')

  useEffect(() => {
    fetch('/api/index/brands')
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
  }, [])

  // Filter and sort logic
  useEffect(() => {
    let filtered = brands

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(brand =>
        brand.brand_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        brand.domain.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Industry filter
    if (selectedIndustry !== 'all') {
      filtered = filtered.filter(brand => brand.industry === selectedIndustry)
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'rank':
          return a.rank_global - b.rank_global
        case 'score':
          return b.visibility_score - a.visibility_score
        case 'name':
          return a.brand_name.localeCompare(b.brand_name)
        default:
          return 0
      }
    })

    setFilteredBrands(filtered)
  }, [searchQuery, selectedIndustry, sortBy, brands])

  // Get unique industries
  const industries = ['all', ...Array.from(new Set(brands.map(b => b.industry)))]

  return (
    <div className="min-h-screen bg-[#101A31]">
      {/* Header */}
      <div className="bg-[#0C1422] border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Link href="/brands" className="text-white/60 text-sm hover:text-white transition-colors mb-2 inline-block">
                ← Back to Index
              </Link>
              <h1 className="text-3xl md:text-4xl font-bold text-white">All Brands</h1>
              <p className="text-white/60 mt-2">Browse {brands.length} brands in the Harbor Index</p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search brands..."
                className="w-full pl-12 pr-4 py-3 bg-[#101A31] border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/20 transition-colors"
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'rank' | 'score' | 'name')}
              className="px-4 py-3 bg-[#101A31] border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/20 transition-colors"
            >
              <option value="rank">Sort by Rank</option>
              <option value="score">Sort by Score</option>
              <option value="name">Sort by Name</option>
            </select>

            {/* Industry Filter */}
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="px-4 py-3 bg-[#101A31] border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/20 transition-colors"
            >
              <option value="all">All Industries</option>
              {industries.slice(1).map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Stats Bar */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-white/60 text-sm">
            Showing {filteredBrands.length} of {brands.length} brands
            {selectedIndustry !== 'all' && ` in ${selectedIndustry}`}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Clear search
            </button>
          )}
        </div>

        {/* Grid View */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBrands.map((brand) => {
            const delta = brand.rank_global <= 10 ? 5.8 : -1.2
            const isPositive = delta > 0

            return (
              <Link
                key={brand.id}
                href={`/brands/${brand.slug}`}
                className="bg-[#0C1422] rounded-xl border border-white/5 p-6 hover:border-white/20 hover:bg-[#0E1727] transition-all duration-200 group"
              >
                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
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
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold truncate group-hover:text-cyan-400 transition-colors">
                      {brand.brand_name}
                    </h3>
                    <p className="text-white/40 text-sm truncate">{brand.domain}</p>
                  </div>
                  {brand.claimed && (
                    <div className="px-2 py-1 rounded bg-green-400/10 text-green-400 text-xs font-medium">
                      Verified
                    </div>
                  )}
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-white/50 text-xs mb-1">Global Rank</div>
                    <div className="text-white font-bold">#{brand.rank_global}</div>
                  </div>
                  <div>
                    <div className="text-white/50 text-xs mb-1">Visibility</div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold">{brand.visibility_score.toFixed(1)}%</span>
                      <span className={`text-xs font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {isPositive ? '+' : ''}{delta.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Industry Tag */}
                <div className="flex items-center justify-between">
                  <span className="px-2 py-1 rounded bg-white/5 text-white/60 text-xs">
                    {brand.industry}
                  </span>
                  <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            )
          })}
        </div>

        {/* Empty State */}
        {filteredBrands.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-white/60 text-lg mb-2">No brands found</p>
            <p className="text-white/40 text-sm">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-white/60">Loading brands...</p>
          </div>
        )}
      </div>
    </div>
  )
}
