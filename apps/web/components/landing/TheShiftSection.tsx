// apps/web/components/landing/TheShiftSection.tsx
'use client'

import Image from 'next/image'

export default function TheShiftSection() {
  return (
    <section className="relative">
      
      {/* Color Noise Transition Bar - Thin strip like currency security strip */}
      {/* 
        Your image specs:
        - Width: 1920px (or 100% scalable)
        - Height: 20-30px
        - Place at: /public/color-noise-bar.png
      */}
      <div 
        className="w-full h-4 md:h-6"
        style={{
          backgroundImage: 'url(/color-noise-bar.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />

      {/* Main Content - White Background */}
      <div className="bg-white py-20 md:py-32 overflow-hidden" data-nav-theme="light">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            
            {/* Left: Floating Cards over Wireframe */}
            <div className="relative h-[500px] md:h-[600px] order-2 lg:order-1">
              
              {/* Wireframe Arc Background - Large, positioned from left edge */}
              {/* 
                Your wireframe SVG specs:
                - Large curved arc/wave pattern
                - Size: ~800-1000px wide
                - Place at: /public/wireframe-arc.svg
              */}
              <div 
                className="absolute -left-32 md:-left-48 lg:-left-64 top-0 bottom-0 w-[800px] md:w-[1000px] opacity-60"
                style={{
                  backgroundImage: 'url(/wireframe-arc.svg)',
                  backgroundSize: 'contain',
                  backgroundPosition: 'left center',
                  backgroundRepeat: 'no-repeat'
                }}
              />

              {/* Floating Cards Container */}
              <div className="relative h-full flex flex-col justify-center items-center animate-float">
                
                {/* Card 1 - ChatGPT */}
                <div className="absolute top-8 left-4 md:left-8 bg-white rounded-xl shadow-xl border border-gray-100 p-4 max-w-[300px] transform -rotate-2">
                  <div className="flex items-center gap-3">
                    <Image 
                      src="/logos/chatgpt-dark.svg" 
                      alt="ChatGPT" 
                      width={32} 
                      height={32}
                      className="w-8 h-8"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">ChatGPT</p>
                        <p className="text-xs text-gray-400">2m ago</p>
                      </div>
                      <p className="text-sm font-medium text-gray-900">Best tools for B2B payments</p>
                    </div>
                  </div>
                </div>

                {/* Card 2 - Perplexity */}
                <div className="absolute top-1/3 right-4 md:right-8 bg-white rounded-xl shadow-xl border border-gray-100 p-4 max-w-[300px] transform rotate-1">
                  <div className="flex items-center gap-3">
                    <Image 
                      src="/logos/perplexity-dark.svg" 
                      alt="Perplexity" 
                      width={32} 
                      height={32}
                      className="w-8 h-8"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">Perplexity</p>
                        <p className="text-xs text-gray-400">5m ago</p>
                      </div>
                      <p className="text-sm font-medium text-gray-900">Top fraud platforms in fintech</p>
                    </div>
                  </div>
                </div>

                {/* Card 3 - Claude */}
                <div className="absolute bottom-1/4 left-8 md:left-16 bg-white rounded-xl shadow-xl border border-gray-100 p-4 max-w-[300px] transform -rotate-1">
                  <div className="flex items-center gap-3">
                    <Image 
                      src="/logos/claude-dark.svg" 
                      alt="Claude" 
                      width={32} 
                      height={32}
                      className="w-8 h-8"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">Claude</p>
                        <p className="text-xs text-gray-400">1hr ago</p>
                      </div>
                      <p className="text-sm font-medium text-gray-900">AI tools marketers trust</p>
                    </div>
                  </div>
                </div>

                {/* Card 4 - Gemini */}
                <div className="absolute bottom-8 right-12 md:right-20 bg-white rounded-xl shadow-xl border border-gray-100 p-4 max-w-[300px] transform rotate-2">
                  <div className="flex items-center gap-3">
                    <Image 
                      src="/logos/gemini-dark.svg" 
                      alt="Gemini" 
                      width={32} 
                      height={32}
                      className="w-8 h-8"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">Gemini</p>
                        <p className="text-xs text-gray-400">Now</p>
                      </div>
                      <p className="text-sm font-medium text-gray-900">Enterprise SaaS recommendations</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Right: Copy + Stats */}
            <div className="order-1 lg:order-2">
              
              {/* Eyebrow - Frosted Pill */}
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-[#101A31]/5 backdrop-blur-sm border border-[#101A31]/10 mb-6">
                <p className="text-sm font-mono uppercase tracking-wider text-[#101A31]/70">
                  The shift
                </p>
              </div>

              {/* Headline - Using hero gradient (white to cyan to blue) adjusted for white bg */}
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-[#101A31] via-[#0891b2] to-[#2979FF] bg-clip-text text-transparent">
                  Discovery moved from search results to AI answers
                </span>
              </h2>

              {/* Body */}
              <p className="text-lg text-gray-600 leading-relaxed mb-10">
                Customers don't scroll through ten blue links anymore. They ask AI tools for the best option. Those answers come from how models interpret your brand across the web. Harbor gives you visibility into that layer so you're not guessing how you show up.
              </p>

              {/* Stats Row */}
              <div className="grid grid-cols-2 gap-8">
                
                {/* Stat 1 */}
                <div>
                  <p className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-[#101A31] to-[#2979FF] bg-clip-text text-transparent mb-2">
                    76%
                  </p>
                  <p className="text-sm font-semibold text-gray-900 mb-1">of buyers</p>
                  <p className="text-sm text-gray-500">
                    say they use AI tools to research products or vendors
                  </p>
                </div>

                {/* Stat 2 */}
                <div>
                  <p className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-[#101A31] to-[#2979FF] bg-clip-text text-transparent mb-2">
                    1
                  </p>
                  <p className="text-sm font-semibold text-gray-900 mb-1">answer</p>
                  <p className="text-sm text-gray-500">
                    is all most AI models return for a typical query
                  </p>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Float Animation */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </section>
  )
}