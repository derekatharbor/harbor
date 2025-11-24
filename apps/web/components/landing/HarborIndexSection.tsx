// apps/web/components/landing/HarborIndexSection.tsx
'use client'

import Image from 'next/image'

export default function HarborIndexSection() {
  return (
    <section className="relative bg-white py-20 md:py-32" data-nav-theme="light">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Eyebrow Pill - Matching TheShiftSection style */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-[#101A31]/5 backdrop-blur-sm border border-[#101A31]/10">
            <p className="text-sm font-mono uppercase tracking-wider text-[#101A31]/70">
              The Harbor Index
            </p>
          </div>
        </div>

        {/* Main Navy Card with Glow */}
        <div className="relative">
          
          {/* Outer Glow Effect */}
          <div 
            className="absolute -inset-1 rounded-[2rem] opacity-50 blur-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(6, 182, 212, 0.3), rgba(59, 130, 246, 0.2))'
            }}
          />
          
          {/* Card Container */}
          <div className="relative bg-[#0f1629] rounded-[1.5rem] overflow-hidden">
            
            {/* Wireframe Background Pattern */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-[0.07]"
              style={{
                backgroundImage: 'url(/wireframe-arc.svg)',
                backgroundSize: '120%',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            />

            {/* Card Content */}
            <div className="relative z-10 px-8 md:px-16 pt-16 md:pt-20 pb-8 md:pb-12">
              
              {/* Headline - Gradient Text */}
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-center mb-6 leading-tight">
                <span 
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage: 'linear-gradient(90deg, #a78bfa, #22d3ee, #60a5fa)'
                  }}
                >
                  An AI visibility index built from
                </span>
                <br />
                <span 
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage: 'linear-gradient(90deg, #a78bfa, #22d3ee, #60a5fa)'
                  }}
                >
                  15,000+ brands.
                </span>
              </h2>

              {/* Body Text */}
              <p className="text-lg md:text-xl text-white/70 text-center max-w-3xl mx-auto mb-10 leading-relaxed">
                Harbor continuously scans major AI models for thousands of brands. We track which companies are mentioned, how they're described, and who gets recommended first. That data powers your Harbor Index score and your roadmap to stronger AI visibility.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 md:mb-16">
                
                {/* Primary Button - Gradient Fill */}
                <a
                  href="/brands"
                  className="group relative inline-flex items-center justify-center px-8 py-4 rounded-full text-lg font-semibold text-[#0f1629] transition-all duration-200 hover:scale-[1.02]"
                  style={{
                    background: 'linear-gradient(135deg, #a78bfa, #67e8f9)'
                  }}
                >
                  Browse the Index
                </a>

                {/* Secondary Button - Gradient Border */}
                <a
                  href="/auth/signup"
                  className="group relative inline-flex items-center justify-center px-8 py-4 rounded-full text-lg font-semibold text-white transition-all duration-200 hover:bg-white/5"
                  style={{
                    background: 'linear-gradient(#0f1629, #0f1629) padding-box, linear-gradient(135deg, #f472b6, #facc15, #34d399, #22d3ee) border-box',
                    border: '2px solid transparent'
                  }}
                >
                  Claim your brand
                </a>
              </div>

            </div>

            {/* Screenshot/Leaderboard Preview Area */}
            <div className="relative px-6 md:px-12 pb-8 md:pb-12">
              <div className="relative bg-[#0a0f1a] rounded-xl overflow-hidden border border-white/10">
                
                {/* Tab Bar - Like Plaid's /auth/get */}
                <div className="flex items-center gap-4 px-6 py-4 border-b border-white/10">
                  <span className="text-sm font-mono text-white/50">/brands/leaderboard</span>
                </div>

                {/* Leaderboard Preview Content */}
                <div className="p-6">
                  {/* This is where your screenshot will go */}
                  {/* For now, showing a stylized placeholder that looks like a leaderboard */}
                  
                  <div className="space-y-3">
                    {/* Header Row */}
                    <div className="flex items-center gap-4 text-xs font-mono text-white/40 pb-2 border-b border-white/10">
                      <span className="w-8">#</span>
                      <span className="flex-1">Brand</span>
                      <span className="w-24 text-right">Category</span>
                      <span className="w-20 text-right">Score</span>
                    </div>

                    {/* Sample Rows */}
                    {[
                      { rank: 1, name: 'Stripe', category: 'Fintech', score: 94 },
                      { rank: 2, name: 'Notion', category: 'Productivity', score: 91 },
                      { rank: 3, name: 'Figma', category: 'Design', score: 89 },
                      { rank: 4, name: 'Linear', category: 'Dev Tools', score: 87 },
                      { rank: 5, name: 'Vercel', category: 'Infrastructure', score: 85 },
                    ].map((item, i) => (
                      <div 
                        key={item.rank}
                        className="flex items-center gap-4 py-2 text-sm"
                        style={{ opacity: 1 - (i * 0.12) }}
                      >
                        <span className="w-8 font-mono text-white/50">{item.rank}</span>
                        <span className="flex-1 font-medium text-white">{item.name}</span>
                        <span className="w-24 text-right text-white/50">{item.category}</span>
                        <span className="w-20 text-right">
                          <span 
                            className="inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-semibold"
                            style={{
                              background: `linear-gradient(135deg, rgba(34, 211, 238, ${0.2 + (5-i) * 0.05}), rgba(167, 139, 250, ${0.2 + (5-i) * 0.05}))`,
                              color: '#22d3ee'
                            }}
                          >
                            {item.score}
                          </span>
                        </span>
                      </div>
                    ))}

                    {/* Fade out indicator */}
                    <div className="flex items-center justify-center pt-4">
                      <span className="text-xs text-white/30 font-mono">+ 5,739 more brands</span>
                    </div>
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
