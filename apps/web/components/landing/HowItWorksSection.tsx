import { Search, Lightbulb, TrendingUp } from 'lucide-react'

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-[#1A2332] py-20 lg:py-28">
      <div className="mx-auto max-w-5xl px-6">
        {/* Section Tag */}
        <div className="text-center mb-6">
          <span className="inline-block px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white/75 uppercase tracking-wider">
            How It Works
          </span>
        </div>

        {/* Headline */}
        <h2 className="text-3xl md:text-4xl font-heading font-semibold text-white tracking-tight text-center mb-16">
          Three steps to AI visibility
        </h2>

        {/* Steps Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Step 1 */}
          <div className="relative">
            <div className="text-center">
              {/* Icon Container */}
              <div className="inline-flex items-center justify-center rounded-xl bg-[#0F1B2C] p-3 mb-6">
                <Search className="h-6 w-6 text-white" strokeWidth={1.5} />
              </div>

              {/* Step Label */}
              <div className="mb-4">
                <span className="inline-block px-3 py-1 rounded-full bg-white/5 text-xs text-white/50 font-mono tracking-wide">
                  Step 1
                </span>
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-white mb-3">
                Scan Your Brand
              </h3>

              {/* Description */}
              <p className="text-sm text-[#A4B1C3] leading-relaxed">
                Connect your brand and run a comprehensive scan across all four AI models to see exactly how they perceive you.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative">
            <div className="text-center">
              {/* Icon Container */}
              <div className="inline-flex items-center justify-center rounded-xl bg-[#0F1B2C] p-3 mb-6">
                <Lightbulb className="h-6 w-6 text-white" strokeWidth={1.5} />
              </div>

              {/* Step Label */}
              <div className="mb-4">
                <span className="inline-block px-3 py-1 rounded-full bg-white/5 text-xs text-white/50 font-mono tracking-wide">
                  Step 2
                </span>
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-white mb-3">
                Get Actionable Insights
              </h3>

              {/* Description */}
              <p className="text-sm text-[#A4B1C3] leading-relaxed">
                Receive specific, prioritized actions to improve your visibility—from schema fixes to content optimization.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative">
            <div className="text-center">
              {/* Icon Container */}
              <div className="inline-flex items-center justify-center rounded-xl bg-[#0F1B2C] p-3 mb-6">
                <TrendingUp className="h-6 w-6 text-white" strokeWidth={1.5} />
              </div>

              {/* Step Label */}
              <div className="mb-4">
                <span className="inline-block px-3 py-1 rounded-full bg-white/5 text-xs text-white/50 font-mono tracking-wide">
                  Step 3
                </span>
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-white mb-3">
                Track Your Growth
              </h3>

              {/* Description */}
              <p className="text-sm text-[#A4B1C3] leading-relaxed">
                Run verification scans to measure impact and watch your visibility scores improve across all platforms.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Features */}
        <div className="mt-16 pt-12 border-t border-white/5">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-heading font-bold text-white mb-2">
                Weekly Scans
              </div>
              <div className="text-sm text-[#A4B1C3]">
                Stay current with automated monitoring
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-heading font-bold text-white mb-2">
                4 AI Models
              </div>
              <div className="text-sm text-[#A4B1C3]">
                ChatGPT, Claude, Gemini, Perplexity
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-heading font-bold text-white mb-2">
                Smart Generators
              </div>
              <div className="text-sm text-[#A4B1C3]">
                Auto-create optimized schema & content
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-heading font-bold text-white mb-2">
                Verification
              </div>
              <div className="text-sm text-[#A4B1C3]">
                Targeted re-scans to prove impact
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}