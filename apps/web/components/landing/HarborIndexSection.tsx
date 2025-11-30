// apps/web/components/landing/HarborIndexSection.tsx
'use client'

import Image from 'next/image'

export default function HarborIndexSection() {
  return (
    <section className="relative bg-white py-20 md:py-32" data-nav-theme="light">
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
            {/* 
              Derek: Add wireframe image at /public/wireframe-index-card.png
              Recommended size: 1400x800px, PNG with transparency
              Should be subtle abstract lines/grid pattern
            */}
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

              {/* Headline - Using hero gradient (white → cyan → blue) */}
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-center mb-6 leading-tight">
                <span className="bg-gradient-to-r from-white via-cyan-200 to-blue-400 bg-clip-text text-transparent">
                  An AI visibility index built from
                </span>
                <br />
                <span className="bg-gradient-to-r from-white via-cyan-200 to-blue-400 bg-clip-text text-transparent">
                  20,000+ brands.
                </span>
              </h2>

              {/* Body Text */}
              <p className="text-lg md:text-xl text-white/70 text-center max-w-3xl mx-auto mb-10 leading-relaxed">
                Harbor continuously scans major AI models for thousands of brands. We track which companies are mentioned, how they're described, and who gets recommended first. That data powers your Harbor Index score and your roadmap to stronger AI visibility.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 md:mb-16">
                
                {/* Primary Button - Reversed gradient (blue → cyan → white) */}
                <a
                  href="/brands"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-lg text-lg font-semibold text-[#101A31] transition-all duration-200 hover:brightness-90 bg-gradient-to-r from-blue-400 via-cyan-200 to-white"
                >
                  Browse the Index
                </a>

                {/* Secondary Button - Same gradient as border */}
                <a
                  href="/auth/signup"
                  className="relative inline-flex items-center justify-center px-8 py-4 rounded-lg text-lg font-semibold text-white transition-all duration-200 hover:bg-white/5"
                  style={{
                    background: 'linear-gradient(#101A31, #101A31) padding-box, linear-gradient(to right, #3b82f6, #67e8f9, #ffffff) border-box',
                    border: '2px solid transparent'
                  }}
                >
                  Claim your brand
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

                    {/* Sample Rows - Matching your screenshot style */}
                    {[
                      { rank: 1, name: 'Microsoft', domain: 'microsoft.com', industry: 'Technology', score: '100.0%', delta: '+5.8%' },
                      { rank: 2, name: 'SketchUp', domain: 'sketchup.com', industry: '3D Design', score: '100.0%', delta: '+5.8%' },
                      { rank: 3, name: 'SpotHero', domain: 'spothero.com', industry: 'Transportation', score: '100.0%', delta: '+5.8%' },
                      { rank: 4, name: 'Nike', domain: 'nike.com', industry: 'Retail', score: '95.2%', delta: '+5.8%' },
                      { rank: 5, name: 'Lumion', domain: 'lumion.com', industry: '3D Rendering', score: '95.0%', delta: '+5.8%' },
                    ].map((item, i) => (
                      <div 
                        key={item.rank}
                        className="flex items-center py-4 border-b border-white/5"
                      >
                        <span className="w-16 text-sm text-white/50">#{item.rank}</span>
                        <div className="flex-1 flex items-center gap-3">
                          {/* Placeholder for logo */}
                          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                            <span className="text-xs text-white/30">{item.name.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{item.name}</p>
                            <p className="text-xs text-white/40">{item.domain}</p>
                          </div>
                        </div>
                        <span className="w-32 text-sm text-white/50 text-left hidden md:block">{item.industry}</span>
                        <div className="w-24 text-right">
                          <span className="text-sm font-semibold text-white">{item.score}</span>
                          <span className="text-xs text-emerald-400 ml-2">{item.delta}</span>
                        </div>
                      </div>
                    ))}
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