import { Search, Lightbulb, TrendingUp } from 'lucide-react'

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Section Tag */}
        <div className="text-center mb-8">
          <span className="inline-block px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white/75 uppercase tracking-wider">
            How It Works
          </span>
        </div>

        {/* Headline */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white text-center leading-tight mb-16">
          Three steps to AI visibility
        </h2>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
          {/* Step 1 */}
          <div className="relative">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-500/10 border-2 border-teal-500/30 mb-6">
                <Search className="w-8 h-8 text-teal-400" />
              </div>

              <div className="mb-4">
                <span className="inline-block px-3 py-1 rounded-full bg-white/5 text-sm text-white/50 font-mono">
                  Step 1
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-display font-bold text-white mb-3">
                Scan Your Brand
              </h3>

              <p className="text-white/75 leading-relaxed">
                Connect your brand and run a comprehensive scan across all four AI models to see exactly how they perceive you.
              </p>
            </div>

            {/* Connector Arrow (Desktop) */}
            <div className="hidden md:block absolute top-8 left-full w-12 h-0.5 bg-gradient-to-r from-teal-500/30 to-transparent" />
          </div>

          {/* Step 2 */}
          <div className="relative">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-500/10 border-2 border-teal-500/30 mb-6">
                <Lightbulb className="w-8 h-8 text-teal-400" />
              </div>

              <div className="mb-4">
                <span className="inline-block px-3 py-1 rounded-full bg-white/5 text-sm text-white/50 font-mono">
                  Step 2
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-display font-bold text-white mb-3">
                Get Actionable Insights
              </h3>

              <p className="text-white/75 leading-relaxed">
                Receive specific, prioritized actions to improve your visibility—from schema fixes to content optimization.
              </p>
            </div>

            {/* Connector Arrow (Desktop) */}
            <div className="hidden md:block absolute top-8 left-full w-12 h-0.5 bg-gradient-to-r from-teal-500/30 to-transparent" />
          </div>

          {/* Step 3 */}
          <div className="relative">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-500/10 border-2 border-teal-500/30 mb-6">
                <TrendingUp className="w-8 h-8 text-teal-400" />
              </div>

              <div className="mb-4">
                <span className="inline-block px-3 py-1 rounded-full bg-white/5 text-sm text-white/50 font-mono">
                  Step 3
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-display font-bold text-white mb-3">
                Track Your Growth
              </h3>

              <p className="text-white/75 leading-relaxed">
                Run verification scans to measure impact and watch your visibility scores improve across all platforms.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Features */}
        <div className="mt-20 pt-12 border-t border-white/10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-display font-bold text-white mb-2">
                Weekly Scans
              </div>
              <div className="text-sm text-white/60">
                Stay current with automated monitoring
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-display font-bold text-white mb-2">
                4 AI Models
              </div>
              <div className="text-sm text-white/60">
                ChatGPT, Claude, Gemini, Perplexity
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-display font-bold text-white mb-2">
                Smart Generators
              </div>
              <div className="text-sm text-white/60">
                Auto-create optimized schema & content
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-display font-bold text-white mb-2">
                Verification
              </div>
              <div className="text-sm text-white/60">
                Targeted re-scans to prove impact
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
