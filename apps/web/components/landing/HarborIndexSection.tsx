// apps/web/components/landing/HarborIndexSection.tsx
'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface Brand {
  id: string
  brand_name: string
  slug: string
  domain: string
  logo_url: string
  visibility_score: number
  industry: string
}

export default function HarborIndexSection() {
  const [topBrands, setTopBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/index/brands?limit=5')
      .then(res => res.json())
      .then(data => {
        setTopBrands(data.slice(0, 5))
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch brands:', err)
        setLoading(false)
      })
  }, [])

  return (
    <section className="relative bg-white py-20 md:py-32" data-nav-theme="light">
      {/* Animation styles */}
      <style jsx>{`
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-shift {
          animation: gradient-shift 6s ease infinite;
        }
        @keyframes glow-pulse {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.3), 0 0 40px rgba(34, 211, 238, 0.2);
          }
          50% { 
            box-shadow: 0 0 30px rgba(255, 255, 255, 0.5), 0 0 60px rgba(34, 211, 238, 0.3);
          }
        }
        .animate-glow-pulse {
          animation: glow-pulse 3s ease-in-out infinite;
        }
        @keyframes border-shimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        .animate-border-shimmer {
          background-size: 200% 100%;
          animation: border-shimmer 3s linear infinite;
        }
      `}</style>

      <div className="max-w-6xl mx-auto px-6">

        {/* Main Navy Card with Glow */}
        <div className="relative">
          
          {/* Outer Glow Effect */}
          <div 
            className="absolute -inset-1 rounded-[2rem] opacity-40 blur-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.4), rgba(96, 165, 250, 0.3), rgba(255, 255, 255, 0.1))'
            }}
          />
          
          {/* Card Container - overflow hidden clips the leaderboard */}
          <div className="relative bg-[#101A31] rounded-[1.5rem] overflow-hidden">
            
            {/* Wireframe Background Pattern */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-[0.08]"
              style={{
                backgroundImage: 'url(/wireframe-index-card.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            />

            {/* Card Content */}
            <div className="relative z-10 px-8 md:px-16 pt-12 md:pt-16">
              
              {/* Eyebrow Pill - INSIDE the card */}
              <div className="flex justify-center mb-6">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10">
                  <p className="text-sm font-mono uppercase tracking-wider text-white/60">
                    The Harbor Index
                  </p>
                </div>
              </div>

              {/* Animated Headline */}
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-center mb-6 leading-tight">
                <span 
                  className="bg-clip-text text-transparent animate-gradient-shift"
                  style={{
                    backgroundImage: 'linear-gradient(90deg, #fff, #a5f3fc, #60a5fa, #a5f3fc, #fff)',
                    backgroundSize: '200% 100%',
                  }}
                >
                  An AI visibility index built from
                </span>
                <br />
                <span 
                  className="bg-clip-text text-transparent animate-gradient-shift"
                  style={{
                    backgroundImage: 'linear-gradient(90deg, #fff, #a5f3fc, #60a5fa, #a5f3fc, #fff)',
                    backgroundSize: '200% 100%',
                  }}
                >
                  20,000+ brands.
                </span>
              </h2>

              {/* Body Text */}
              <p className="text-lg md:text-xl text-white/70 text-center max-w-3xl mx-auto mb-10 leading-relaxed">
                Harbor continuously scans major AI models for thousands of brands. We track which companies are mentioned, how they're described, and who gets recommended first. That data powers your Harbor Index score and your roadmap to stronger AI visibility.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 md:mb-16">
                
                {/* Primary Button - Solid white with animated glow */}
                <a
                  href="/brands"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-lg text-lg font-semibold text-[#101A31] bg-white transition-all duration-200 hover:bg-white/90 animate-glow-pulse"
                >
                  Browse the Index
                </a>

                {/* Secondary Button - Animated gradient border */}
                <a
                  href="/auth/signup"
                  className="relative inline-flex items-center justify-center px-8 py-4 rounded-lg text-lg font-semibold text-white overflow-hidden group"
                >
                  {/* Animated gradient border */}
                  <span 
                    className="absolute inset-0 rounded-lg animate-border-shimmer"
                    style={{
                      background: 'linear-gradient(90deg, #3b82f6, #22d3ee, #ffffff, #22d3ee, #3b82f6)',
                      padding: '2px',
                    }}
                  />
                  {/* Inner background */}
                  <span className="absolute inset-[2px] rounded-[6px] bg-[#101A31] group-hover:bg-[#1a2a4a] transition-colors" />
                  {/* Text */}
                  <span className="relative z-10">Claim your brand</span>
                </a>
              </div>

            </div>

            {/* Leaderboard Preview Area - Positioned to clip at bottom */}
            <div className="relative h-[320px] md:h-[380px] px-6 md:px-12">
              
              {/* Glow behind leaderboard */}
              <div 
                className="absolute inset-x-12 top-0 h-[300px] rounded-xl opacity-30 blur-2xl"
                style={{
                  background: 'linear-gradient(180deg, rgba(34, 211, 238, 0.3), rgba(96, 165, 250, 0.2), transparent)'
                }}
              />

              {/* Leaderboard Container - Will be clipped by parent overflow-hidden */}
              <div className="relative bg-[#0a0f1a] rounded-t-xl border border-white/10 border-b-0">
                
                {/* Tab Bar */}
                <div className="flex items-center gap-4 px-6 py-4 border-b border-white/10">
                  <span className="text-sm font-mono text-white/50">/brands/leaderboard</span>
                </div>

                {/* Leaderboard Content */}
                <div className="p-6">
                  
                  <div className="space-y-0">
                    {/* Header Row */}
                    <div className="flex items-center text-xs font-mono text-white/40 pb-3 border-b border-white/10">
                      <span className="w-16">Rank</span>
                      <span className="flex-1">Brand</span>
                      <span className="w-32 text-left hidden md:block">Industry</span>
                      <span className="w-24 text-right">Score</span>
                    </div>

                    {/* Real brand rows from API */}
                    {loading ? (
                      // Skeleton loading
                      [...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center py-4 border-b border-white/5 animate-pulse">
                          <span className="w-16 h-4 bg-white/10 rounded" />
                          <div className="flex-1 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-white/10" />
                            <div className="space-y-2">
                              <div className="w-24 h-4 bg-white/10 rounded" />
                              <div className="w-16 h-3 bg-white/5 rounded" />
                            </div>
                          </div>
                          <span className="w-32 h-4 bg-white/10 rounded hidden md:block" />
                          <span className="w-16 h-4 bg-white/10 rounded ml-auto" />
                        </div>
                      ))
                    ) : (
                      topBrands.map((brand, i) => (
                        <div 
                          key={brand.id}
                          className="flex items-center py-4 border-b border-white/5"
                        >
                          <span className="w-16 text-sm text-white/50">#{i + 1}</span>
                          <div className="flex-1 flex items-center gap-3">
                            {/* Brand logo */}
                            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden">
                              {brand.logo_url ? (
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
                              ) : (
                                <span className="text-xs text-white/30">{brand.brand_name.charAt(0)}</span>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{brand.brand_name}</p>
                              <p className="text-xs text-white/40">{brand.domain}</p>
                            </div>
                          </div>
                          <span className="w-32 text-sm text-white/50 text-left hidden md:block">{brand.industry || 'Technology'}</span>
                          <div className="w-24 text-right">
                            <span className="text-sm font-semibold text-white">{brand.visibility_score?.toFixed(1) || '95.0'}%</span>
                            <span className="text-xs text-emerald-400 ml-2">+5.8%</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  )
}