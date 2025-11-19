'use client'

import { useState, useEffect } from 'react'
import { Search, TrendingUp, ArrowRight } from 'lucide-react'
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
  accesses_last_30_days: number
}

interface Props {
  initialBrands: Brand[]
}

export default function IndexClient({ initialBrands }: Props) {
  const [brands] = useState<Brand[]>(initialBrands)
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>(initialBrands)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all')

  // Filter brands based on search and industry
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

  return (
    <div className="min-h-screen bg-[#0A0F1A]">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          {/* Tag */}
          <div className="mb-6">
            <span className="inline-block px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white/75 uppercase tracking-wider">
              AI Visibility Index
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-6">
            How AI sees the world's top brands
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-[#CBD4E1] leading-relaxed max-w-3xl mx-auto mb-12">
            Search 10,000+ brands to see their AI visibility scores across ChatGPT, Claude, Gemini, and Perplexity.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                placeholder="Search brands (e.g., Nike, Shopify, Tesla)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-6 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-white/30 transition-colors"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Filters & Stats Section */}
      <section className="px-6 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            {/* Industry Filter */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0">
              {industries.map((industry) => (
                <button
                  key={industry}
                  onClick={() => setSelectedIndustry(industry)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    selectedIndustry === industry
                      ? 'bg-white text-black'
                      : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  {industry === 'all' ? 'All Industries' : industry}
                </button>
              ))}
            </div>

            {/* Results Count */}
            <div className="text-sm text-white/50">
              {filteredBrands.length.toLocaleString()} brands
            </div>
          </div>
        </div>
      </section>

      {/* Table Section */}
      <section className="px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          {filteredBrands.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-white/50">No brands found</p>
              <p className="mt-2 text-sm text-white/30">Try a different search or filter</p>
            </div>
          ) : (
            <div className="rounded-2xl bg-[#0C1422] border border-white/5 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left px-6 py-4 text-sm font-semibold text-white/70 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-white/70 uppercase tracking-wider">
                        Brand
                      </th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-white/70 uppercase tracking-wider">
                        Industry
                      </th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-white/70 uppercase tracking-wider">
                        Visibility Score
                      </th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-white/70 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-right px-6 py-4 text-sm font-semibold text-white/70 uppercase tracking-wider">
                        
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBrands.map((brand, index) => (
                      <tr
                        key={brand.id}
                        className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                      >
                        {/* Rank */}
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-white/40">
                              {brand.rank_global}
                            </span>
                            {brand.rank_global <= 10 && (
                              <TrendingUp className="w-4 h-4 text-green-400" />
                            )}
                          </div>
                        </td>

                        {/* Brand */}
                        <td className="px-6 py-5">
                          <Link
                            href={`/index/${brand.slug}`}
                            className="flex items-center gap-3 group"
                          >
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/5 flex items-center justify-center flex-shrink-0">
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
                              <div className="font-semibold text-white group-hover:text-white/80 transition-colors">
                                {brand.brand_name}
                              </div>
                              <div className="text-sm text-white/40">
                                {brand.domain}
                              </div>
                            </div>
                          </Link>
                        </td>

                        {/* Industry */}
                        <td className="px-6 py-5">
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/5 text-sm text-white/70">
                            {brand.industry || 'Other'}
                          </span>
                        </td>

                        {/* Visibility Score */}
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden max-w-[120px]">
                              <div
                                className="h-full bg-gradient-to-r from-[#2979FF] to-[#00C9FF] rounded-full"
                                style={{ width: `${brand.visibility_score}%` }}
                              />
                            </div>
                            <span className="text-lg font-bold text-white min-w-[60px]">
                              {brand.visibility_score.toFixed(1)}%
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-5">
                          {brand.claimed ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-400/10 text-green-400 text-sm font-medium">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                              Claimed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 text-white/40 text-sm">
                              <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                              Unclaimed
                            </span>
                          )}
                        </td>

                        {/* View Link */}
                        <td className="px-6 py-5 text-right">
                          <Link
                            href={`/index/${brand.slug}`}
                            className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
                          >
                            View
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}