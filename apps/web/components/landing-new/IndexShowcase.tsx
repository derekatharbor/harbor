// components/landing-new/IndexShowcase.tsx
'use client'

import { ArrowRight, Search, TrendingUp, Users } from 'lucide-react'
import Link from 'next/link'

const SAMPLE_BRANDS = [
  { rank: 1, name: 'HubSpot', domain: 'hubspot.com', score: 87, change: +3 },
  { rank: 2, name: 'Salesforce', domain: 'salesforce.com', score: 84, change: +1 },
  { rank: 3, name: 'Slack', domain: 'slack.com', score: 82, change: -2 },
  { rank: 4, name: 'Notion', domain: 'notion.so', score: 79, change: +5 },
  { rank: 5, name: 'Figma', domain: 'figma.com', score: 77, change: +2 },
  { rank: 6, name: 'Linear', domain: 'linear.app', score: 75, change: +8 },
  { rank: 7, name: 'Vercel', domain: 'vercel.com', score: 73, change: +4 },
  { rank: 8, name: 'Stripe', domain: 'stripe.com', score: 71, change: 0 },
]

export default function IndexShowcase() {
  return (
    <section className="relative py-32 bg-[#0a0a0a] overflow-hidden">
      {/* Gradient accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-b from-cyan-500/10 to-transparent blur-[120px] pointer-events-none" />
      
      <div className="relative max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-white/60 text-sm mb-6">
            <Users className="w-4 h-4" />
            <span>50,000+ brands indexed</span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight">
            The AI Visibility Index
          </h2>
          
          <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed">
            See how your brand stacks up against competitors. Claim your free profile 
            and start tracking your AI visibility today.
          </p>
        </div>

        {/* Tilted Leaderboard */}
        <div className="relative max-w-3xl mx-auto" style={{ perspective: '1000px' }}>
          <div 
            className="relative bg-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/[0.08] shadow-2xl overflow-hidden"
            style={{ 
              transform: 'rotateX(10deg) rotateY(-5deg)',
              transformOrigin: 'center center'
            }}
          >
            {/* Search header */}
            <div className="p-6 border-b border-white/[0.06]">
              <div className="flex items-center gap-3 px-4 py-3 bg-white/[0.03] rounded-lg border border-white/[0.08]">
                <Search className="w-5 h-5 text-white/30" />
                <span className="text-white/30 text-sm">Search 50,000+ brands...</span>
              </div>
            </div>

            {/* Table header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/[0.06] text-xs text-white/30 uppercase tracking-wider">
              <div className="col-span-1">#</div>
              <div className="col-span-5">Brand</div>
              <div className="col-span-3 text-center">Score</div>
              <div className="col-span-3 text-right">Trend</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-white/[0.04]">
              {SAMPLE_BRANDS.map((brand) => (
                <div 
                  key={brand.rank} 
                  className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white/[0.02] transition-colors cursor-pointer"
                >
                  <div className="col-span-1 text-white/30 text-sm font-medium">
                    {brand.rank}
                  </div>
                  <div className="col-span-5 flex items-center gap-3">
                    <img 
                      src={`https://cdn.brandfetch.io/${brand.domain}?c=1id1Fyz-h7an5-5KR_y`}
                      alt={brand.name}
                      className="w-8 h-8 rounded-lg"
                    />
                    <div>
                      <div className="text-white font-medium text-sm">{brand.name}</div>
                      <div className="text-white/30 text-xs">{brand.domain}</div>
                    </div>
                  </div>
                  <div className="col-span-3 text-center">
                    <span className="text-white font-semibold">{brand.score}</span>
                    <span className="text-white/30 text-sm">/100</span>
                  </div>
                  <div className="col-span-3 text-right">
                    <span className={`inline-flex items-center gap-1 text-sm font-medium ${
                      brand.change > 0 ? 'text-emerald-400' : 
                      brand.change < 0 ? 'text-red-400' : 
                      'text-white/30'
                    }`}>
                      {brand.change > 0 && <TrendingUp className="w-3 h-3" />}
                      {brand.change > 0 ? '+' : ''}{brand.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Fade overlay at bottom */}
            <div 
              className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
              style={{
                background: 'linear-gradient(to top, #0a0a0a 0%, transparent 100%)'
              }}
            />
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center mt-12 gap-4">
          <Link
            href="/brands"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition-colors"
          >
            Browse the Index
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/claim"
            className="text-white/50 hover:text-white text-sm transition-colors"
          >
            Claim your brand profile for free →
          </Link>
        </div>
      </div>
    </section>
  )
}
