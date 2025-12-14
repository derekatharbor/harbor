'use client'

import { useState, useEffect } from 'react'
import { Search, ExternalLink, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import Nav from '@/components/landing-new/Nav'
import Footer from '@/components/landing-new/Footer'

// PH brand color
const PH_ORANGE = '#DA552F'

interface Product {
  id: string
  name: string
  domain: string
  slug: string
  category: string
  logo_url: string
  mention_count: number
  avg_position: number | null
  positive_mentions: number
  visibility_score: number
  rank: number
}

interface LeaderboardData {
  leaderboard: Product[]
  total_products: number
  total_results: number
  updated_at: string
}

export default function ProductHuntIndex() {
  const [data, setData] = useState<LeaderboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null)

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const res = await fetch('/api/producthunt/leaderboard')
        const json = await res.json()
        setData(json)
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err)
      }
      setLoading(false)
    }
    fetchLeaderboard()
  }, [])

  const filteredProducts = data?.leaderboard.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.domain.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  return (
    <div className="min-h-screen bg-[#0B0B0C]">
      <Nav />
      
      <div className="h-20" />

      {/* Hero */}
      <section className="pt-16 pb-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* PH Logo with link */}
          <a 
            href="https://www.producthunt.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 mb-8 opacity-80 hover:opacity-100 transition-opacity"
          >
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="40" rx="10" fill={PH_ORANGE}/>
              <path d="M22.5 15H17.5V20H22.5C23.88 20 25 18.88 25 17.5C25 16.12 23.88 15 22.5 15Z" fill="white"/>
              <path d="M20 8C13.373 8 8 13.373 8 20C8 26.627 13.373 32 20 32C26.627 32 32 26.627 32 20C32 13.373 26.627 8 20 8ZM22.5 23H17.5V27H14.5V13H22.5C25.537 13 28 15.463 28 18.5C28 21.537 25.537 23 22.5 23Z" fill="white"/>
            </svg>
            <span className="text-white/50 text-sm">Product Hunt</span>
          </a>

          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            How AI sees{' '}
            <span style={{ color: PH_ORANGE }}>Product Hunt</span>
          </h1>
          
          <p className="text-white/50 text-lg max-w-2xl mx-auto mb-8">
            We asked ChatGPT, Perplexity, and Claude about the top products that launched on Product Hunt. 
            Here's how they ranked.
          </p>

          {/* Stats */}
          {data && (
            <div className="flex items-center justify-center gap-8 text-sm mb-12">
              <div>
                <span className="text-white font-semibold">{data.total_products}</span>
                <span className="text-white/40 ml-1">products tracked</span>
              </div>
              <div className="w-px h-4 bg-white/10" />
              <div>
                <span className="text-white font-semibold">{data.total_results}</span>
                <span className="text-white/40 ml-1">AI queries analyzed</span>
              </div>
            </div>
          )}

          {/* Search */}
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
              <input
                type="text"
                placeholder="Search for a product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 transition-colors"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Leaderboard */}
      <section className="pb-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Column Headers */}
          <div className="grid grid-cols-12 gap-4 px-4 py-3 text-xs text-white/40 uppercase tracking-wide border-b border-white/[0.06]">
            <div className="col-span-1">#</div>
            <div className="col-span-5">Product</div>
            <div className="col-span-2 text-center">Mentions</div>
            <div className="col-span-2 text-center">Avg Position</div>
            <div className="col-span-2 text-right">Visibility</div>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="py-20 text-center text-white/40">
              Loading leaderboard...
            </div>
          )}

          {/* Empty state */}
          {!loading && filteredProducts.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-white/40 mb-2">No products found</p>
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  Clear search
                </button>
              )}
            </div>
          )}

          {/* Product rows */}
          <div className="divide-y divide-white/[0.04]">
            {filteredProducts.map((product) => (
              <div key={product.id}>
                {/* Main row */}
                <button
                  onClick={() => setExpandedProduct(
                    expandedProduct === product.id ? null : product.id
                  )}
                  className="w-full grid grid-cols-12 gap-4 px-4 py-4 items-center hover:bg-white/[0.02] transition-colors text-left"
                >
                  {/* Rank */}
                  <div className="col-span-1">
                    <span className={`text-lg font-semibold ${
                      product.rank <= 3 ? 'text-white' : 'text-white/40'
                    }`}>
                      {product.rank}
                    </span>
                  </div>

                  {/* Product */}
                  <div className="col-span-5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white overflow-hidden flex-shrink-0">
                      <Image
                        src={product.logo_url}
                        alt={product.name}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-logo.svg'
                        }}
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="text-white font-medium truncate">{product.name}</div>
                      <div className="text-white/40 text-sm truncate">{product.category}</div>
                    </div>
                  </div>

                  {/* Mentions */}
                  <div className="col-span-2 text-center">
                    <span className="text-white/70">{product.mention_count}</span>
                  </div>

                  {/* Avg Position */}
                  <div className="col-span-2 text-center">
                    <span className="text-white/70">
                      {product.avg_position ? `#${product.avg_position}` : '-'}
                    </span>
                  </div>

                  {/* Visibility Score */}
                  <div className="col-span-2 flex items-center justify-end gap-2">
                    <div 
                      className="w-16 h-2 rounded-full bg-white/10 overflow-hidden"
                    >
                      <div 
                        className="h-full rounded-full"
                        style={{ 
                          width: `${product.visibility_score}%`,
                          backgroundColor: PH_ORANGE
                        }}
                      />
                    </div>
                    <span className="text-white font-medium w-8 text-right">
                      {product.visibility_score}
                    </span>
                    {expandedProduct === product.id ? (
                      <ChevronUp className="w-4 h-4 text-white/30" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-white/30" />
                    )}
                  </div>
                </button>

                {/* Expanded details */}
                {expandedProduct === product.id && (
                  <div className="px-4 pb-4">
                    <div className="ml-12 p-4 bg-white/[0.02] rounded-xl border border-white/[0.06]">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <a
                            href={`https://${product.domain}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-white/50 hover:text-white flex items-center gap-1 transition-colors"
                          >
                            {product.domain}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          <a
                            href={`https://www.producthunt.com/products/${product.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm flex items-center gap-1 transition-colors hover:opacity-80"
                            style={{ color: PH_ORANGE }}
                          >
                            View on Product Hunt
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="p-3 bg-white/[0.02] rounded-lg">
                          <div className="text-white/40 text-xs mb-1">Total Mentions</div>
                          <div className="text-white font-semibold">{product.mention_count}</div>
                        </div>
                        <div className="p-3 bg-white/[0.02] rounded-lg">
                          <div className="text-white/40 text-xs mb-1">Positive Mentions</div>
                          <div className="text-white font-semibold" style={{ color: product.positive_mentions > 0 ? '#22c55e' : undefined }}>
                            {product.positive_mentions}
                          </div>
                        </div>
                        <div className="p-3 bg-white/[0.02] rounded-lg">
                          <div className="text-white/40 text-xs mb-1">Avg Position</div>
                          <div className="text-white font-semibold">
                            {product.avg_position ? `#${product.avg_position}` : 'Not ranked'}
                          </div>
                        </div>
                      </div>

                      {/* Claim CTA */}
                      <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                        <p className="text-white/40 text-sm">
                          Is this your product?
                        </p>
                        <Link
                          href={`/brands/${product.slug}?claim=true`}
                          className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          style={{ backgroundColor: PH_ORANGE, color: 'white' }}
                        >
                          Claim & manage profile
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="pb-20 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="p-8 bg-white/[0.02] rounded-2xl border border-white/[0.08]">
            <h2 className="text-2xl font-semibold text-white mb-3">
              Your product launched on Product Hunt?
            </h2>
            <p className="text-white/50 mb-6">
              See how AI models describe your product and claim your profile to keep the information accurate.
            </p>
            <Link
              href="/brands"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-medium rounded-xl hover:bg-white/90 transition-colors"
            >
              Search the full index
            </Link>
          </div>
        </div>
      </section>

      {/* Attribution */}
      <section className="pb-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-white/30 text-sm">
            Product data sourced from{' '}
            <a 
              href="https://www.producthunt.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-white/50 transition-colors"
              style={{ color: PH_ORANGE }}
            >
              Product Hunt
            </a>
            . This is an independent analysis by Harbor.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  )
}
