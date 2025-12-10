// Path: /apps/web/app/brands/HarborIndexClient.tsx
// Brand Index - Harbor's public directory of AI brand visibility

'use client'

import { useState, useEffect, useMemo } from 'react'
import { Search, ArrowRight, ChevronDown, X, Loader2, Plus, ArrowUpRight, Info, MessageSquare, Filter, Layers, BarChart3, Shield } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import Nav from '@/components/landing-new/Nav'
import Footer from '@/components/landing-new/Footer'

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
  delta_7d?: number // Real delta from DB when available
}

interface Props {
  brands: Brand[]
}

// Industry categories
const INDUSTRIES = [
  { value: 'all', label: 'All Industries' },
  { value: 'technology', label: 'Technology' },
  { value: 'software', label: 'Software' },
  { value: 'finance', label: 'Finance' },
  { value: 'retail', label: 'Retail' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'automotive', label: 'Automotive' },
  { value: 'food', label: 'Food & Beverage' },
  { value: 'travel', label: 'Travel' },
  { value: 'education', label: 'Education' },
]

// AI Models
const AI_MODELS = [
  { value: 'all', label: 'All Models' },
  { value: 'chatgpt', label: 'ChatGPT' },
  { value: 'claude', label: 'Claude' },
  { value: 'perplexity', label: 'Perplexity' },
  { value: 'gemini', label: 'Gemini' },
]

// Sample prompts by industry
const SAMPLE_PROMPTS: Record<string, string[]> = {
  all: [
    'What are the best companies in this industry?',
    'Which brands are most recommended?',
    'Top companies for quality and value',
    'Most trusted brands in this category',
    'Best options for enterprise customers',
  ],
  technology: [
    'Best enterprise software companies',
    'Top cloud infrastructure providers',
    'Most innovative tech companies',
    'Best B2B SaaS platforms',
    'Leading AI companies to watch',
  ],
  software: [
    'Best project management software',
    'Top CRM platforms for startups',
    'Most user-friendly design tools',
    'Best collaboration software for teams',
    'Leading developer tools',
  ],
  finance: [
    'Best banks for small business',
    'Top credit cards for rewards',
    'Most trusted investment platforms',
    'Best fintech apps for budgeting',
    'Leading payment processors',
  ],
  retail: [
    'Best online shopping platforms',
    'Top retailers for electronics',
    'Most sustainable fashion brands',
    'Best home goods stores',
    'Leading e-commerce marketplaces',
  ],
}

// Methodology cards
const METHODOLOGY = [
  {
    icon: MessageSquare,
    title: 'Real Conversations',
    description: 'We analyze real questions people ask AI assistants like ChatGPT, Claude, and Gemini daily.',
    color: 'text-cyan-400',
  },
  {
    icon: Filter,
    title: 'AI-Powered Filtering',
    description: 'We use semantic analysis to filter for commercially relevant conversations, eliminating noise.',
    color: 'text-blue-400',
  },
  {
    icon: Layers,
    title: 'Intelligent Clustering',
    description: 'We use vector embeddings and ML clustering to identify real user topics and generate authentic question variations.',
    color: 'text-pink-400',
  },
  {
    icon: BarChart3,
    title: 'Ranked by Impact',
    description: 'We run prompts through AI models daily, scoring visibility with the same method used for all Harbor customers.',
    color: 'text-amber-400',
  },
]

export default function HarborIndexClient({ brands: initialBrands }: Props) {
  const [brands, setBrands] = useState<Brand[]>(initialBrands)
  const [totalIndexed, setTotalIndexed] = useState<number>(initialBrands.length)
  const [loading, setLoading] = useState(initialBrands.length === 0)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Brand[]>([])
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [selectedIndustry, setSelectedIndustry] = useState('all')
  const [selectedModel, setSelectedModel] = useState('all')

  // Fetch brands if not provided
  useEffect(() => {
    if (initialBrands.length === 0) {
      fetch('/api/index/brands')
        .then(res => res.json())
        .then(data => {
          // Handle both old format (array) and new format (object with brands)
          if (Array.isArray(data)) {
            setBrands(data)
            setTotalIndexed(data.length)
          } else {
            setBrands(data.brands || [])
            setTotalIndexed(data.totalIndexed || data.brands?.length || 0)
          }
          setLoading(false)
        })
        .catch(err => {
          console.error('Failed to fetch brands:', err)
          setLoading(false)
        })
    }
  }, [initialBrands])

  // Filter brands by industry
  const filteredBrands = useMemo(() => {
    if (selectedIndustry === 'all') return brands
    return brands.filter(b => 
      b.industry?.toLowerCase().includes(selectedIndustry.toLowerCase())
    )
  }, [brands, selectedIndustry])

  // Top 3 for podium
  const topThree = useMemo(() => {
    return filteredBrands.slice(0, 3)
  }, [filteredBrands])

  // Table brands (limit to 15)
  const tableBrands = useMemo(() => {
    return filteredBrands.slice(0, 15)
  }, [filteredBrands])

  // Handle search
  useEffect(() => {
    if (searchQuery.trim()) {
      const results = brands.filter(brand =>
        brand.brand_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        brand.domain.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
      setSearchResults(results)
      setShowSearchDropdown(true)
    } else {
      setSearchResults([])
      setShowSearchDropdown(false)
    }
  }, [searchQuery, brands])

  // Get delta - use real data if available, otherwise null (don't show fake data)
  const getDelta = (brand: Brand): number | null => {
    if (brand.delta_7d !== undefined && brand.delta_7d !== null) {
      return brand.delta_7d
    }
    return null // Don't show fake deltas
  }

  const currentIndustryLabel = INDUSTRIES.find(i => i.value === selectedIndustry)?.label || 'All Industries'
  const prompts = SAMPLE_PROMPTS[selectedIndustry] || SAMPLE_PROMPTS.all
  const totalBrandsScored = brands.length

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Nav />
      
      {/* Hero Section */}
      <section className="pt-32 pb-8 px-6">
        <div className="max-w-6xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] mb-6">
            <span className="text-white/60 text-sm font-medium tracking-wide uppercase">
              Harbor Index
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            How AI Sees Every Brand
          </h1>

          {/* Subtitle */}
          <p className="text-lg text-white/50 max-w-2xl mx-auto mb-8">
            The open directory of AI brand visibility. Search {totalIndexed.toLocaleString()}+ companies to see how ChatGPT, Claude, and Perplexity describe them.
          </p>

          {/* Search Box */}
          <div className="max-w-xl mx-auto relative">
            <div className="relative flex items-center bg-white/[0.03] rounded-xl border border-white/[0.08] overflow-hidden">
              <Search className="w-5 h-5 text-white/40 ml-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery && setShowSearchDropdown(true)}
                onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
                placeholder="Search brands..."
                className="flex-1 px-4 py-3.5 bg-transparent text-white placeholder-white/40 focus:outline-none text-sm"
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
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#111213] rounded-xl border border-white/[0.08] shadow-2xl overflow-hidden z-50">
                {searchResults.map((brand) => {
                  const delta = getDelta(brand)

                  return (
                    <Link
                      key={brand.id}
                      href={`/brands/${brand.slug}`}
                      className="flex items-center gap-4 px-4 py-3 hover:bg-white/[0.03] transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-white/[0.05] overflow-hidden flex-shrink-0">
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
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-medium text-sm truncate">{brand.brand_name}</div>
                        <div className="text-white/40 text-xs truncate">{brand.domain}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium text-sm">{brand.visibility_score?.toFixed(1)}%</span>
                        {delta !== null && (
                          <span className={`text-xs font-medium ${delta > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {delta > 0 ? '+' : ''}{delta.toFixed(1)}%
                          </span>
                        )}
                      </div>
                      <ArrowRight className="w-4 h-4 text-white/30" />
                    </Link>
                  )
                })}
              </div>
            )}

            {/* No Results */}
            {showSearchDropdown && searchQuery && searchResults.length === 0 && (
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

      {/* Top Section Header with Filters */}
      <section className="pb-6 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-xl text-white">
              Top <span className="font-semibold">{currentIndustryLabel}</span> brands this week
            </h2>
            
            <div className="flex items-center gap-3">
              {/* Model Filter */}
              <div className="relative">
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="appearance-none px-4 py-2 pr-10 bg-white/[0.03] border border-white/[0.08] rounded-lg text-white text-sm focus:outline-none focus:border-white/20 cursor-pointer"
                >
                  {AI_MODELS.map(model => (
                    <option key={model.value} value={model.value} className="bg-[#111213]">
                      {model.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
              </div>

              {/* Time Filter */}
              <div className="relative">
                <select
                  className="appearance-none px-4 py-2 pr-10 bg-white/[0.03] border border-white/[0.08] rounded-lg text-white text-sm focus:outline-none focus:border-white/20 cursor-pointer"
                  defaultValue="week"
                >
                  <option value="week" className="bg-[#111213]">This Week</option>
                  <option value="month" className="bg-[#111213]">This Month</option>
                  <option value="quarter" className="bg-[#111213]">This Quarter</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
              </div>
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topThree.map((brand, index) => {
                const delta = getDelta(brand)
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
                      <div className="mb-16">
                        <div className="flex items-center gap-1.5 text-white/50 text-xs mb-1">
                          <Info className="w-3 h-3" />
                          Visibility Score
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-bold text-white">
                            {brand.visibility_score?.toFixed(1)}%
                          </span>
                          {delta !== null && (
                            <span className={`text-sm font-medium px-1.5 py-0.5 rounded ${
                              delta > 0 
                                ? 'text-emerald-400 bg-emerald-400/10' 
                                : 'text-red-400 bg-red-400/10'
                            }`}>
                              {delta > 0 ? '+' : ''}{delta.toFixed(1)}%
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Brand */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white overflow-hidden flex-shrink-0">
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
                        <span className="text-2xl font-semibold text-white">
                          {brand.brand_name}
                        </span>
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

      {/* Full Rankings Table */}
      <section className="pb-8 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left text-white/40 text-xs font-medium uppercase tracking-wider px-6 py-4 w-16">Rank</th>
                  <th className="text-left text-white/40 text-xs font-medium uppercase tracking-wider px-6 py-4">Company</th>
                  <th className="text-right text-white/40 text-xs font-medium uppercase tracking-wider px-6 py-4">Visibility Score</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-20 text-center">
                      <Loader2 className="w-6 h-6 text-white/30 animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : tableBrands.map((brand, index) => {
                  const delta = getDelta(brand)

                  return (
                    <tr
                      key={brand.id}
                      className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors cursor-pointer"
                      onClick={() => window.location.href = `/brands/${brand.slug}`}
                    >
                      <td className="px-6 py-4">
                        <span className="text-white/50 font-mono text-sm">{index + 1}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white/[0.05] overflow-hidden flex-shrink-0">
                            <Image
                              src={brand.logo_url}
                              alt={brand.brand_name}
                              width={32}
                              height={32}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none'
                              }}
                            />
                          </div>
                          <span className="text-white font-medium">{brand.brand_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-white font-medium">{brand.visibility_score?.toFixed(1)}%</span>
                          {delta !== null && (
                            <span className={`text-xs font-medium ${delta > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {delta > 0 ? '+' : ''}{delta.toFixed(1)}%
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {/* Your Company Row - Fully Clickable */}
            <Link
              href="/auth/signup"
              className="block border-t border-white/[0.06] px-6 py-4 bg-white/[0.01] hover:bg-white/[0.03] transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-white/30 font-mono text-sm">?</span>
                  <div className="w-8 h-8 rounded-lg border border-dashed border-white/20 flex items-center justify-center">
                    <Plus className="w-4 h-4 text-white/30" />
                  </div>
                  <span className="text-white/50">Your company</span>
                </div>
                <span className="text-sm text-white/50 flex items-center gap-1">
                  Track your AI Visibility
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          </div>

          {/* View All */}
          {totalBrandsScored > 15 && (
            <div className="mt-6 text-center">
              <Link
                href="/brands/all"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/[0.03] border border-white/[0.08] text-white font-medium rounded-xl hover:bg-white/[0.06] transition-colors"
              >
                View all {totalIndexed.toLocaleString()} brands
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Methodology Section - How We Build The Index */}
      <section className="py-16 px-6 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              How We Build The Index
            </h2>
            <p className="text-white/50 max-w-xl">
              Every insight from the Harbor ecosystem feeds into our brand visibility rankings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.06] rounded-2xl overflow-hidden">
            {METHODOLOGY.map((item, index) => {
              const Icon = item.icon
              return (
                <div key={index} className="bg-[#0a0a0a] p-6">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-4 ${item.color}`}>
                    {/* Placeholder for custom icon - will be replaced */}
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{item.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Harbor-Unique: What AI Says About Brands - Interactive Preview */}
      <section className="py-16 px-6 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-4">
                <span className="text-cyan-400 text-xs font-medium">What makes Harbor different</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                See exactly how AI describes every brand
              </h2>
              <p className="text-white/50 mb-6">
                Unlike traditional SEO tools, Harbor shows you the actual words AI uses to describe companies. 
                Search any brand to see their AI perception across ChatGPT, Claude, Perplexity, and more.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Shield className="w-3 h-3 text-emerald-400" />
                  </div>
                  <span className="text-white/70 text-sm">See if AI recommends your brand in buying decisions</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Shield className="w-3 h-3 text-emerald-400" />
                  </div>
                  <span className="text-white/70 text-sm">Compare how different models perceive you vs competitors</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Shield className="w-3 h-3 text-emerald-400" />
                  </div>
                  <span className="text-white/70 text-sm">Track changes over time as AI knowledge updates</span>
                </li>
              </ul>
              <Link
                href="/brands"
                className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
              >
                Browse all {totalIndexed.toLocaleString()}+ brands
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Right: Mock AI Response Card */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 relative">
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <span className="text-xs text-white/30">Powered by</span>
                <span className="text-xs text-white/50 font-medium">GPT-4</span>
              </div>
              
              <div className="mb-4">
                <span className="text-white/40 text-xs">What AI says about</span>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-500 to-purple-600"></div>
                  <span className="text-white font-semibold">Linear</span>
                </div>
              </div>

              <div className="space-y-4 text-sm">
                <p className="text-white/70 leading-relaxed">
                  <span className="text-white">"Linear is a project management tool</span> designed for modern software teams. 
                  It's known for its speed, keyboard-first design, and clean interface..."
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-white/[0.05] rounded text-white/50 text-xs">Project Management</span>
                  <span className="px-2 py-1 bg-white/[0.05] rounded text-white/50 text-xs">B2B SaaS</span>
                  <span className="px-2 py-1 bg-emerald-500/20 rounded text-emerald-400 text-xs">Recommended</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-white font-bold">92%</div>
                    <div className="text-white/40 text-xs">Visibility</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white font-bold">#3</div>
                    <div className="text-white/40 text-xs">In Category</div>
                  </div>
                </div>
                <Link
                  href="/brands/linear"
                  className="text-xs text-white/50 hover:text-white transition-colors flex items-center gap-1"
                >
                  View full profile
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sample Prompts Section */}
      <section className="pb-8 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
            <h3 className="text-white/40 text-sm font-medium mb-4">
              Sample prompts we track for {currentIndustryLabel}
            </h3>
            <div className="space-y-3">
              {prompts.map((prompt, i) => (
                <div key={i} className="text-white/70 text-sm py-2 border-b border-white/[0.04] last:border-0">
                  {prompt}
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-white/[0.06] text-right">
              <Link
                href="/auth/signup"
                className="text-sm text-white/50 hover:text-white transition-colors inline-flex items-center gap-1"
              >
                Start tracking your prompts
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Product Focused */}
      <section className="py-20 px-6 border-t border-white/[0.06]">
        <div className="max-w-4xl mx-auto text-center">
          {/* Live Stats */}
          <div className="flex items-center justify-center gap-8 mb-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{totalIndexed.toLocaleString()}+</div>
              <div className="text-white/40 text-sm">Brands Indexed</div>
            </div>
            <div className="w-px h-12 bg-white/[0.08]"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">4</div>
              <div className="text-white/40 text-sm">AI Models Tracked</div>
            </div>
            <div className="w-px h-12 bg-white/[0.08]"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">Daily</div>
              <div className="text-white/40 text-sm">Updates</div>
            </div>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            The Yelp for AI visibility
          </h2>
          
          <p className="text-white/50 mb-8 max-w-xl mx-auto">
            Search any company to see how AI models describe them. Claim your brand to track visibility, monitor competitors, and improve how AI represents you.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/brands/all"
              className="px-6 py-3 bg-white/[0.03] border border-white/[0.08] text-white font-medium rounded-xl hover:bg-white/[0.06] transition-colors"
            >
              Browse All Brands
            </Link>
            <Link
              href="/auth/signup"
              className="px-6 py-3 bg-white text-black font-medium rounded-xl hover:bg-white/90 transition-colors"
            >
              Claim Your Brand
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}