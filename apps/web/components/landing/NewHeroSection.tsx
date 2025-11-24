// apps/web/components/landing/TheShiftSection.tsx
'use client'

export default function TheShiftSection() {
  return (
    <section className="relative">
      
      {/* Color Noise Transition Bar */}
      {/* 
        Your image specs:
        - Width: 1920px (or 100% scalable)
        - Height: 60-100px
        - Place at: /public/color-noise-bar.png
      */}
      <div 
        className="w-full h-16 md:h-24"
        style={{
          backgroundImage: 'url(/color-noise-bar.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />

      {/* Main Content - White Background */}
      <div className="bg-white py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            
            {/* Left: Floating Cards over Wireframe */}
            <div className="relative h-[500px] md:h-[600px] order-2 lg:order-1">
              
              {/* Wireframe Arc Background */}
              {/* 
                Your wireframe SVG specs:
                - Curved arc/wave pattern
                - Place at: /public/wireframe-arc.svg
              */}
              <div 
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: 'url(/wireframe-arc.svg)',
                  backgroundSize: 'contain',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              />

              {/* Floating Cards Container */}
              <div className="relative h-full flex flex-col justify-center items-center animate-float">
                
                {/* Card 1 */}
                <div className="absolute top-8 left-4 md:left-8 bg-white rounded-xl shadow-xl border border-gray-100 p-4 max-w-[280px] transform -rotate-2">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-[#10A37F] flex items-center justify-center">
                      <span className="text-white text-xs font-bold">G</span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">ChatGPT</p>
                      <p className="text-sm font-medium text-gray-900">Best tools for B2B payments</p>
                    </div>
                  </div>
                </div>

                {/* Card 2 */}
                <div className="absolute top-1/3 right-4 md:right-8 bg-white rounded-xl shadow-xl border border-gray-100 p-4 max-w-[280px] transform rotate-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-[#1A7F64] flex items-center justify-center">
                      <span className="text-white text-xs font-bold">P</span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Perplexity</p>
                      <p className="text-sm font-medium text-gray-900">Top fraud platforms in fintech</p>
                    </div>
                  </div>
                </div>

                {/* Card 3 */}
                <div className="absolute bottom-1/4 left-8 md:left-16 bg-white rounded-xl shadow-xl border border-gray-100 p-4 max-w-[280px] transform -rotate-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-[#D97706] flex items-center justify-center">
                      <span className="text-white text-xs font-bold">C</span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Claude</p>
                      <p className="text-sm font-medium text-gray-900">AI tools marketers trust</p>
                    </div>
                  </div>
                </div>

                {/* Card 4 */}
                <div className="absolute bottom-8 right-12 md:right-20 bg-white rounded-xl shadow-xl border border-gray-100 p-4 max-w-[280px] transform rotate-2">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-[#4285F4] flex items-center justify-center">
                      <span className="text-white text-xs font-bold">G</span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Gemini</p>
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

              {/* Headline */}
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-[#101A31] mb-6 leading-tight">
                <span className="bg-gradient-to-r from-[#0d9488] via-[#2dd4bf] to-[#22d3ee] bg-clip-text text-transparent">
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
                  <p className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-[#0d9488] to-[#2dd4bf] bg-clip-text text-transparent mb-2">
                    76%
                  </p>
                  <p className="text-sm font-semibold text-gray-900 mb-1">of buyers</p>
                  <p className="text-sm text-gray-500">
                    say they use AI tools to research products or vendors
                  </p>
                </div>

                {/* Stat 2 */}
                <div>
                  <p className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-[#0d9488] to-[#2dd4bf] bg-clip-text text-transparent mb-2">
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