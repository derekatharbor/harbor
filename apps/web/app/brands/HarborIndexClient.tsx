'use client'

import { useState, useEffect } from 'react'
import { Search, TrendingUp, TrendingDown } from 'lucide-react'
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

interface Props {
  brands: Brand[]
}

export default function HarborIndexClient({ brands: initialBrands }: Props) {
  const [brands] = useState<Brand[]>(initialBrands)
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>(initialBrands)
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all')

  // Filter brands based on industry
  useEffect(() => {
    if (selectedIndustry === 'all') {
      setFilteredBrands(brands)
    } else {
      setFilteredBrands(brands.filter(brand => brand.industry === selectedIndustry))
    }
  }, [selectedIndustry, brands])

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
    <div className="min-h-screen bg-[#0A0F1A]">
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          {/* Tag */}
          <div className="mb-6">
            <span className="inline-block px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-[#6B7CFF] uppercase tracking-wider font-medium">
              Harbor Index
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight mb-6">
            See who is<br />winning AI Search
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-[#CBD4E1]/70 leading-relaxed max-w-4xl mx-auto">
            Explore the top brands leading AI search visibility, powered by 6+ million daily prompts 
            and insights from hundreds of millions of real AI conversations.
          </p>
        </div>
      </section>

      {/* Industry Filter Tabs */}
      <section className="px-6 pb-8 sticky top-0 bg-[#0A0F1A]/80 backdrop-blur-xl z-10 border-b border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {industries.map((industry) => (
              <button
                key={industry}
                onClick={() => setSelectedIndustry(industry)}
                className={`px-6 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  selectedIndustry === industry
                    ? 'bg-white text-black'
                    : 'bg-transparent text-white/70 hover:bg-white/5'
                }`}
              >
                {industry === 'all' ? 'All Industries' : industry}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Top 3 Featured Cards */}
      <section className="px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-2">
            Top {selectedIndustry === 'all' ? '' : selectedIndustry} brands this week
          </h2>
          <p className="text-white/50 text-sm mb-8">Week of Nov 10</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topThree.map((brand, index) => {
              const delta = getDelta(brand.rank_global)
              const isPositive = delta > 0

              return (
                <Link
                  key={brand.id}
                  href={`/brands/${brand.slug}`}
                  className="group relative bg-[#0C1422] rounded-2xl border border-white/5 p-8 hover:border-white/20 transition-all"
                >
                  {/* Visibility Score */}
                  <div className="mb-8">
                    <div className="flex items-center gap-2 text-white/50 text-sm mb-2">
                      <div className="w-4 h-4 rounded-full bg-white/5 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white/30" />
                      </div>
                      Visibility Score
                    </div>
                    <div className="flex items-baseline gap-3">
                      <span className="text-5xl font-bold text-white">
                        {brand.visibility_score.toFixed(1)}%
                      </span>
                      <span className={`text-lg font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {isPositive ? '+' : ''}{delta.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Brand Info */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/5 flex items-center justify-center flex-shrink-0">
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
                      <h3 className="text-2xl font-bold text-white group-hover:text-white/80 transition-colors">
                        {brand.brand_name}
                      </h3>
                    </div>
                  </div>

                  {/* Rank Badge */}
                  <div className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Leaderboard Table */}
      <section className="px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-2xl bg-[#0C1422] border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left px-8 py-4 text-sm font-medium text-white/40 uppercase tracking-wider w-16">
                      #
                    </th>
                    <th className="text-left px-8 py-4 text-sm font-medium text-white/40 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="text-right px-8 py-4 text-sm font-medium text-white/40 uppercase tracking-wider">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-3 h-3 rounded-full bg-white/10" />
                        Visibility Score
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
                        <td className="px-8 py-6">
                          <span className="text-lg font-medium text-white/40 group-hover:text-white/60 transition-colors">
                            {brand.rank_global}
                          </span>
                        </td>

                        {/* Brand */}
                        <td className="px-8 py-6">
                          <Link
                            href={`/brands/${brand.slug}`}
                            className="flex items-center gap-4"
                          >
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/5 flex items-center justify-center flex-shrink-0">
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
                              <div className="text-lg font-medium text-white group-hover:text-white/80 transition-colors">
                                {brand.brand_name}
                              </div>
                            </div>
                          </Link>
                        </td>

                        {/* Visibility Score */}
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-4">
                            <span className="text-2xl font-bold text-white">
                              {brand.visibility_score.toFixed(1)}%
                            </span>
                            <span className={`text-sm font-medium min-w-[60px] ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
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
      `}</style>
    </div>
  )
}
