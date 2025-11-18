import { Search, Lightbulb, TrendingUp } from 'lucide-react'

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative py-32 sm:py-40 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#0f1b2d]">
      <div className="max-w-6xl mx-auto">
        {/* Section Tag */}
        <div className="text-center mb-8">
          <span className="inline-block px-4 py-2 rounded-full bg-[rgba(15,27,45,0.06)] dark:bg-white/[0.06] border border-[rgba(15,27,45,0.06)] dark:border-white/[0.08] text-sm text-[rgba(15,27,45,0.5)] dark:text-white/[0.65] uppercase tracking-wider">
            How It Works
          </span>
        </div>

        {/* Headline */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-[#0f1b2d] dark:text-white text-center leading-tight mb-20" style={{ letterSpacing: '-0.02em' }}>
          Three steps to AI visibility
        </h2>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 sm:gap-16">
          {/* Step 1 */}
          <div className="relative">
            <div className="text-center">
              {/* Icon Container */}
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border-2 border-[rgba(15,27,45,0.12)] dark:border-white/[0.12] mb-8">
                <Search 
                  className="w-9 h-9 text-[rgba(15,27,45,0.6)] dark:text-[#E5E7EB]" 
                  strokeWidth={2}
                />
              </div>

              {/* Step Label */}
              <div className="mb-5">
                <span className="inline-block px-3 py-1 rounded-xl bg-[rgba(15,27,45,0.06)] dark:bg-white/[0.06] text-xs text-[rgba(15,27,45,0.5)] dark:text-white/[0.65] font-mono tracking-wide">
                  Step 1
                </span>
              </div>

              {/* Title */}
              <h3 className="text-xl sm:text-2xl font-display font-semibold text-[#0f1b2d] dark:text-white mb-3" style={{ letterSpacing: '-0.02em' }}>
                Scan Your Brand
              </h3>

              {/* Description */}
              <p className="text-[rgba(15,27,45,0.65)] dark:text-white/70 leading-relaxed">
                Connect your brand and run a comprehensive scan across all four AI models to see exactly how they perceive you.
              </p>
            </div>

            {/* Subtle Connector (Desktop) */}
            <div className="hidden md:block absolute top-10 left-full w-full h-0 border-b border-dashed border-[rgba(15,27,45,0.06)] dark:border-white/[0.08]" style={{ width: 'calc(100% - 80px)', left: 'calc(50% + 40px)' }} />
          </div>

          {/* Step 2 */}
          <div className="relative">
            <div className="text-center">
              {/* Icon Container */}
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border-2 border-[rgba(15,27,45,0.12)] dark:border-white/[0.12] mb-8">
                <Lightbulb 
                  className="w-9 h-9 text-[rgba(15,27,45,0.6)] dark:text-[#E5E7EB]" 
                  strokeWidth={2}
                />
              </div>

              {/* Step Label */}
              <div className="mb-5">
                <span className="inline-block px-3 py-1 rounded-xl bg-[rgba(15,27,45,0.06)] dark:bg-white/[0.06] text-xs text-[rgba(15,27,45,0.5)] dark:text-white/[0.65] font-mono tracking-wide">
                  Step 2
                </span>
              </div>

              {/* Title */}
              <h3 className="text-xl sm:text-2xl font-display font-semibold text-[#0f1b2d] dark:text-white mb-3" style={{ letterSpacing: '-0.02em' }}>
                Get Actionable Insights
              </h3>

              {/* Description */}
              <p className="text-[rgba(15,27,45,0.65)] dark:text-white/70 leading-relaxed">
                Receive specific, prioritized actions to improve your visibility—from schema fixes to content optimization.
              </p>
            </div>

            {/* Subtle Connector (Desktop) */}
            <div className="hidden md:block absolute top-10 left-full w-full h-0 border-b border-dashed border-[rgba(15,27,45,0.06)] dark:border-white/[0.08]" style={{ width: 'calc(100% - 80px)', left: 'calc(50% + 40px)' }} />
          </div>

          {/* Step 3 */}
          <div className="relative">
            <div className="text-center">
              {/* Icon Container */}
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border-2 border-[rgba(15,27,45,0.12)] dark:border-white/[0.12] mb-8">
                <TrendingUp 
                  className="w-9 h-9 text-[rgba(15,27,45,0.6)] dark:text-[#E5E7EB]" 
                  strokeWidth={2}
                />
              </div>

              {/* Step Label */}
              <div className="mb-5">
                <span className="inline-block px-3 py-1 rounded-xl bg-[rgba(15,27,45,0.06)] dark:bg-white/[0.06] text-xs text-[rgba(15,27,45,0.5)] dark:text-white/[0.65] font-mono tracking-wide">
                  Step 3
                </span>
              </div>

              {/* Title */}
              <h3 className="text-xl sm:text-2xl font-display font-semibold text-[#0f1b2d] dark:text-white mb-3" style={{ letterSpacing: '-0.02em' }}>
                Track Your Growth
              </h3>

              {/* Description */}
              <p className="text-[rgba(15,27,45,0.65)] dark:text-white/70 leading-relaxed">
                Run verification scans to measure impact and watch your visibility scores improve across all platforms.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Features */}
        <div className="mt-24 pt-12 border-t border-[rgba(15,27,45,0.06)] dark:border-white/[0.08]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-2xl font-display font-bold text-[#0f1b2d] dark:text-white mb-2">
                Weekly Scans
              </div>
              <div className="text-sm text-[rgba(15,27,45,0.5)] dark:text-white/60">
                Stay current with automated monitoring
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-display font-bold text-[#0f1b2d] dark:text-white mb-2">
                4 AI Models
              </div>
              <div className="text-sm text-[rgba(15,27,45,0.5)] dark:text-white/60">
                ChatGPT, Claude, Gemini, Perplexity
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-display font-bold text-[#0f1b2d] dark:text-white mb-2">
                Smart Generators
              </div>
              <div className="text-sm text-[rgba(15,27,45,0.5)] dark:text-white/60">
                Auto-create optimized schema & content
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-display font-bold text-[#0f1b2d] dark:text-white mb-2">
                Verification
              </div>
              <div className="text-sm text-[rgba(15,27,45,0.5)] dark:text-white/60">
                Targeted re-scans to prove impact
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}