// Path: /apps/web/app/brands/HarborIndexClient.tsx
// Brand Index - Harbor's public directory of AI brand visibility

'use client'

import { useState, useEffect, useMemo } from 'react'
import { Search, ArrowRight, Loader2, Plus, ArrowUpRight, TrendingUp, TrendingDown } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import Nav from '@/components/landing-new/Nav'
import Footer from '@/components/landing-new/Footer'

interface LeaderboardBrand {
  id: string
  brand_name: string
  slug: string
  domain: string
  logo_url: string
  industry: string
  visibility_score: number
  total_mentions: number
  avg_position: number | null
  delta_7d: number | null
  featured: boolean
}

interface DirectoryBrand {
  id: string
  brand_name: string
  slug: string
  domain: string
  logo_url: string
  industry: string
}

interface Props {
  initialLeaderboard?: LeaderboardBrand[]
  initialDirectory?: DirectoryBrand[]
}

// Industry categories (matching our featured_brands industries)
const INDUSTRIES = [
  { value: 'all', label: 'All Industries' },
  { value: 'technology', label: 'Technology' },
  { value: 'finance', label: 'Finance' },
  { value: 'retail', label: 'E-commerce' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'healthcare', label: 'Healthcare' },
]

export default function HarborIndexClient({ initialLeaderboard = [], initialDirectory = [] }: Props) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardBrand[]>(initialLeaderboard)
  const [directory, setDirectory] = useState<DirectoryBrand[]>(initialDirectory)
  const [loading, setLoading] = useState(initialLeaderboard.length === 0)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<DirectoryBrand[]>([])
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [selectedIndustry, setSelectedIndustry] = useState('all')
  const [selectedModel, setSelectedModel] = useState<'all' | 'chatgpt' | 'perplexity'>('all')

  // Fetch data on mount
  useEffect(() => {
    if (initialLeaderboard.length === 0) {
      fetch('/api/index/brands')
        .then(res => res.json())
        .then(data => {
          if (data.leaderboard) setLeaderboard(data.leaderboard)
          if (data.directory) setDirectory(data.directory)
          setLoading(false)
        })
        .catch(err => {
          console.error('Failed to fetch brands:', err)
          setLoading(false)
        })
    }
  }, [initialLeaderboard.length])

  // Filter leaderboard by industry
  const filteredLeaderboard = useMemo(() => {
    if (selectedIndustry === 'all') return leaderboard
    return leaderboard.filter(b => b.industry === selectedIndustry)
  }, [leaderboard, selectedIndustry])

  // Top 3 for podium
  const topThree = useMemo(() => {
    return filteredLeaderboard.slice(0, 3)
  }, [filteredLeaderboard])

  // Table brands (4-15)
  const tableBrands = useMemo(() => {
    return filteredLeaderboard.slice(3, 15)
  }, [filteredLeaderboard])

  // Handle search (searches directory)
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const query = searchQuery.toLowerCase()
      const results = directory.filter(brand =>
        brand.brand_name.toLowerCase().includes(query) ||
        brand.domain.toLowerCase().includes(query)
      ).slice(0, 8)
      setSearchResults(results)
      setShowSearchDropdown(true)
    } else {
      setSearchResults([])
      setShowSearchDropdown(false)
    }
  }, [searchQuery, directory])

  const currentIndustryLabel = INDUSTRIES.find(i => i.value === selectedIndustry)?.label || 'All Industries'

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Nav />

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            How AI Sees Every Brand
          </h1>

          {/* Subtitle */}
          <p className="text-lg text-white/50 max-w-2xl mx-auto mb-8">
            Search any company to see how ChatGPT, Claude, and Perplexity describe them.
          </p>

          {/* Search Box */}
          <div className="relative max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
              <input
                type="text"
                placeholder="Search any brand..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length >= 2 && setShowSearchDropdown(true)}
                onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
                className="w-full pl-12 pr-4 py-4 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 focus:bg-white/[0.05] transition-all"
              />
            </div>

            {/* Search Dropdown */}
            {showSearchDropdown && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#111213] rounded-xl border border-white/[0.08] shadow-2xl overflow-hidden z-50">
                {searchResults.map((brand) => (
                  <Link
                    key={brand.id}
                    href={`/brands/${brand.slug}`}
                    className="flex items-center gap-4 px-4 py-3 hover:bg-white/[0.03] transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-white overflow-hidden flex-shrink-0 p-1">
                      <Image
                        src={brand.logo_url}
                        alt={brand.brand_name}
                        width={80}
                        height={80}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-logo.svg'
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium text-sm truncate">{brand.brand_name}</div>
                      <div className="text-white/40 text-xs truncate">{brand.domain}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-white/30" />
                  </Link>
                ))}
              </div>
            )}

            {/* No Results */}
            {showSearchDropdown && searchQuery.length >= 2 && searchResults.length === 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#111213] rounded-xl border border-white/[0.08] shadow-2xl p-6 text-center z-50">
                <p className="text-white/50 text-sm mb-4">No brands found for "{searchQuery}"</p>
                <Link
                  href={`/auth/signup?brand=${encodeURIComponent(searchQuery)}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.05] text-white border border-white/[0.1] text-sm font-medium hover:bg-white/[0.08] transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Add "{searchQuery}" to the Index
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Industry Pills */}
      <section className="pb-6 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {INDUSTRIES.map((industry) => (
              <button
                key={industry.value}
                onClick={() => setSelectedIndustry(industry.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  selectedIndustry === industry.value
                    ? 'bg-white text-black'
                    : 'bg-white/[0.03] text-white/70 border border-white/[0.08] hover:bg-white/[0.06]'
                }`}
              >
                {industry.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Leaderboard Header */}
      <section className="pb-6 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl text-white">
                Top <span className="font-semibold">{currentIndustryLabel}</span> brands
              </h2>
              <p className="text-white/40 text-sm mt-1">
                Based on AI recommendation frequency across models
              </p>
            </div>
            
            {/* Model Toggle */}
            <div className="flex items-center gap-1 p-1 bg-white/[0.03] rounded-lg border border-white/[0.08]">
              <button
                onClick={() => setSelectedModel('all')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  selectedModel === 'all'
                    ? 'bg-white/[0.1] text-white'
                    : 'text-white/50 hover:text-white/70'
                }`}
              >
                All Models
              </button>
              <button
                onClick={() => setSelectedModel('chatgpt')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${
                  selectedModel === 'chatgpt'
                    ? 'bg-white/[0.1] text-white'
                    : 'text-white/50 hover:text-white/70'
                }`}
              >
                <span className="w-4 h-4 rounded-sm bg-[#10a37f] flex items-center justify-center text-[10px] text-white font-bold">G</span>
                ChatGPT
              </button>
              <button
                onClick={() => setSelectedModel('perplexity')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${
                  selectedModel === 'perplexity'
                    ? 'bg-white/[0.1] text-white'
                    : 'text-white/50 hover:text-white/70'
                }`}
              >
                <span className="w-4 h-4 rounded-sm bg-[#1a1a2e] border border-white/20 flex items-center justify-center text-[10px] text-white font-bold">P</span>
                Perplexity
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Top 3 Podium Cards */}
      <section className="pb-8 px-6">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-white/30 animate-spin" />
            </div>
          ) : filteredLeaderboard.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-white/50">No visibility data yet for {currentIndustryLabel}</p>
              <p className="text-white/30 text-sm mt-2">Check back after the next weekly scan</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topThree.map((brand, index) => {
                const rankNumber = index + 1

                return (
                  <Link
                    key={brand.id}
                    href={`/brands/${brand.slug}`}
                    className="relative bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 pt-8 pb-8 overflow-hidden hover:bg-white/[0.04] hover:border-white/[0.1] transition-all group"
                  >
                    {/* Giant Rank Watermark */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[180px] font-bold text-white/[0.03] pointer-events-none select-none leading-none">
                      {rankNumber}
                    </div>

                    {/* Content */}
                    <div className="relative z-10">
                      {/* Visibility Score */}
                      <div className="mb-12">
                        <div className="text-white/40 text-xs mb-1">AI Visibility</div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-bold text-white">
                            {brand.visibility_score}%
                          </span>
                          {brand.delta_7d !== null && brand.delta_7d !== 0 && (
                            <span className={`text-sm font-medium flex items-center gap-0.5 ${
                              brand.delta_7d > 0 
                                ? 'text-emerald-400' 
                                : 'text-red-400'
                            }`}>
                              {brand.delta_7d > 0 ? (
                                <TrendingUp className="w-3 h-3" />
                              ) : (
                                <TrendingDown className="w-3 h-3" />
                              )}
                              {brand.delta_7d > 0 ? '+' : ''}{brand.delta_7d}%
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Brand */}
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white overflow-hidden flex-shrink-0 p-1">
                          <Image
                            src={brand.logo_url}
                            alt={brand.brand_name}
                            width={96}
                            height={96}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder-logo.svg'
                            }}
                          />
                        </div>
                        <div>
                          <div className="text-xl font-semibold text-white">
                            {brand.brand_name}
                          </div>
                          <div className="text-white/40 text-sm">
                            {brand.total_mentions} mentions
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Hover Arrow */}
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowUpRight className="w-5 h-5 text-white/50" />
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Rankings Table (4-15) */}
      {tableBrands.length > 0 && (
        <section className="pb-8 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left text-white/40 text-xs font-medium uppercase tracking-wider px-6 py-4 w-16">Rank</th>
                    <th className="text-left text-white/40 text-xs font-medium uppercase tracking-wider px-6 py-4">Company</th>
                    <th className="text-right text-white/40 text-xs font-medium uppercase tracking-wider px-6 py-4">Visibility</th>
                    <th className="text-right text-white/40 text-xs font-medium uppercase tracking-wider px-6 py-4 hidden sm:table-cell">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {tableBrands.map((brand, index) => (
                    <tr
                      key={brand.id}
                      className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors cursor-pointer"
                      onClick={() => window.location.href = `/brands/${brand.slug}`}
                    >
                      <td className="px-6 py-4">
                        <span className="text-white/50 font-mono text-sm">{index + 4}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white overflow-hidden flex-shrink-0 p-0.5">
                            <Image
                              src={brand.logo_url}
                              alt={brand.brand_name}
                              width={64}
                              height={64}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder-logo.svg'
                              }}
                            />
                          </div>
                          <span className="text-white font-medium">{brand.brand_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-white font-medium">{brand.visibility_score}%</span>
                      </td>
                      <td className="px-6 py-4 text-right hidden sm:table-cell">
                        {brand.delta_7d !== null && brand.delta_7d !== 0 ? (
                          <span className={`text-sm font-medium flex items-center justify-end gap-0.5 ${
                            brand.delta_7d > 0 ? 'text-emerald-400' : 'text-red-400'
                          }`}>
                            {brand.delta_7d > 0 ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            {brand.delta_7d > 0 ? '+' : ''}{brand.delta_7d}%
                          </span>
                        ) : (
                          <span className="text-white/30 text-sm">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Your Company Row */}
              <Link
                href="/auth/signup"
                className="block border-t border-white/[0.06] px-6 py-4 bg-white/[0.01] hover:bg-white/[0.03] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-white/30 font-mono text-sm w-8">?</span>
                    <div className="w-8 h-8 rounded-lg border border-dashed border-white/20 flex items-center justify-center">
                      <Plus className="w-4 h-4 text-white/30" />
                    </div>
                    <span className="text-white/50">Your company</span>
                  </div>
                  <span className="text-sm text-white/50 flex items-center gap-1">
                    Get tracked
                    <ArrowUpRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 px-6 border-t border-white/[0.06]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Track your AI visibility
          </h2>
          
          <p className="text-white/50 mb-8 max-w-xl mx-auto">
            Claim your brand to monitor how AI models describe you, track competitors, and improve your visibility.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/auth/signup"
              className="px-6 py-3 bg-white text-black font-medium rounded-xl hover:bg-white/90 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}