// apps/web/components/landing/FinalCTASection.tsx
'use client'

import { useState } from 'react'
import { Search, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function FinalCTASection() {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/brands?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <section className="relative">
      
      {/* Color Noise Transition Bar */}
      <div 
        className="w-full h-4 md:h-6"
        style={{
          backgroundImage: 'url(/color-noise-bar.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />

      {/* Main Dark Section */}
      <div className="relative bg-[#101A31] py-20 md:py-32 overflow-hidden">
        
        {/* Wireframe Background */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.06]"
          style={{
            backgroundImage: 'url(/wireframe-hero.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />

        {/* Subtle radial glow behind search */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[800px] h-[300px] md:h-[400px] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse, rgba(34, 211, 238, 0.08) 0%, transparent 70%)'
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-6 text-center">
          
          {/* Eyebrow */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 mb-6">
            <p className="text-sm font-mono uppercase tracking-wider text-white/60">
              Find your brand
            </p>
          </div>

          {/* Headline */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4 md:mb-6 leading-tight">
            <span className="bg-gradient-to-r from-white via-cyan-200 to-blue-400 bg-clip-text text-transparent">
              See how AI sees you
            </span>
          </h2>

          {/* Subhead */}
          <p className="text-base md:text-xl text-white/60 max-w-2xl mx-auto mb-8 md:mb-10 px-2">
            Search for your brand in the Harbor Index. Claim your profile and start improving your AI visibility.
          </p>

          {/* Animated Search Input */}
          <form onSubmit={handleSubmit} className="relative max-w-xl mx-auto">
            
            {/* Animated gradient border container */}
            <div className="relative p-[2px] rounded-xl md:rounded-2xl gradient-border-wrapper">
              <div className="gradient-border"></div>
              
              {/* Inner input container */}
              <div className="relative bg-[#0a0f1a] rounded-xl md:rounded-2xl">
                
                {/* Desktop layout */}
                <div className="hidden md:flex items-center">
                  <div className="pl-5 text-white/40">
                    <Search className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="Search for a brand..."
                    className="flex-1 bg-transparent text-white text-lg px-4 py-5 outline-none placeholder:text-white/30"
                  />
                  <button
                    type="submit"
                    className="m-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-400 via-cyan-200 to-white text-[#101A31] font-semibold flex items-center gap-2 hover:brightness-90 transition-all"
                  >
                    Search
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Mobile layout - stacked */}
                <div className="md:hidden">
                  <div className="flex items-center px-4 py-4">
                    <div className="text-white/40">
                      <Search className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      placeholder="Search for a brand..."
                      className="flex-1 bg-transparent text-white text-base px-3 py-1 outline-none placeholder:text-white/30"
                    />
                  </div>
                  <div className="px-3 pb-3">
                    <button
                      type="submit"
                      className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-400 via-cyan-200 to-white text-[#101A31] font-semibold flex items-center justify-center gap-2 hover:brightness-90 transition-all"
                    >
                      Search
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            </div>

          </form>

          {/* Helper text */}
          <p className="mt-6 text-sm text-white/40">
            Over 15,000 brands indexed and growing
          </p>

        </div>
      </div>

      {/* CSS for smooth animated border */}
      <style jsx>{`
        .gradient-border-wrapper {
          position: relative;
          overflow: hidden;
        }
        
        .gradient-border {
          position: absolute;
          inset: 0;
          background: conic-gradient(
            from 0deg,
            #3b82f6,
            #22d3ee,
            #ffffff,
            #22d3ee,
            #3b82f6
          );
          animation: spin 3s linear infinite;
        }
        
        .gradient-border-wrapper > div:last-child {
          position: relative;
          z-index: 1;
        }
        
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </section>
  )
}