import { Search, Lightbulb, TrendingUp } from 'lucide-react'

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 lg:py-28" style={{ backgroundColor: '#101A31' }}>
      <div className="mx-auto max-w-5xl px-6">
        {/* Section Tag */}
        <div className="text-center mb-6">
          <span className="inline-block px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white/75 uppercase tracking-wider">
            How It Works
          </span>
        </div>

        {/* Headline */}
        <h2 className="text-3xl md:text-4xl font-heading font-semibold text-white tracking-tight text-center mb-10 lg:mb-12">
          Three steps to AI visibility
        </h2>

        {/* Steps Grid - Card Based */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Step 1 */}
          <article className="rounded-2xl bg-[#0C1422] border border-white/5 px-5 py-6 hover:border-white/20 hover:bg-[#0E1727] transition-colors duration-150">
            <div className="inline-flex items-center justify-center rounded-xl bg-[#0F1B2C] p-3 mb-4">
              <Search className="h-6 w-6 text-white" strokeWidth={1.5} />
            </div>

            <div className="mb-3">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/5 text-xs text-white/50 font-mono">
                Step 1
              </span>
            </div>

            <h3 className="text-lg font-semibold text-white mb-2">
              Scan Your Brand
            </h3>

            <p className="text-sm text-[#A4B1C3] leading-relaxed">
              Run a comprehensive scan across all four AI models to see how they perceive you.
            </p>
          </article>

          {/* Step 2 */}
          <article className="rounded-2xl bg-[#0C1422] border border-white/5 px-5 py-6 hover:border-white/20 hover:bg-[#0E1727] transition-colors duration-150">
            <div className="inline-flex items-center justify-center rounded-xl bg-[#0F1B2C] p-3 mb-4">
              <Lightbulb className="h-6 w-6 text-white" strokeWidth={1.5} />
            </div>

            <div className="mb-3">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/5 text-xs text-white/50 font-mono">
                Step 2
              </span>
            </div>

            <h3 className="text-lg font-semibold text-white mb-2">
              Get Actionable Insights
            </h3>

            <p className="text-sm text-[#A4B1C3] leading-relaxed">
              Receive prioritized actions to improve visibility—from schema fixes to content optimization.
            </p>
          </article>

          {/* Step 3 */}
          <article className="rounded-2xl bg-[#0C1422] border border-white/5 px-5 py-6 hover:border-white/20 hover:bg-[#0E1727] transition-colors duration-150">
            <div className="inline-flex items-center justify-center rounded-xl bg-[#0F1B2C] p-3 mb-4">
              <TrendingUp className="h-6 w-6 text-white" strokeWidth={1.5} />
            </div>

            <div className="mb-3">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/5 text-xs text-white/50 font-mono">
                Step 3
              </span>
            </div>

            <h3 className="text-lg font-semibold text-white mb-2">
              Track Your Growth
            </h3>

            <p className="text-sm text-[#A4B1C3] leading-relaxed">
              Run verification scans to measure impact and watch your visibility scores improve.
            </p>
          </article>
        </div>

        {/* Bottom Features */}
        <div className="mt-16 pt-12 border-t border-white/5">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-heading font-bold text-white mb-2">
                Weekly Scans
              </div>
              <div className="text-sm text-[#A4B1C3]">
                Automated monitoring
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
                Auto-create optimized content
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-heading font-bold text-white mb-2">
                Verification
              </div>
              <div className="text-sm text-[#A4B1C3]">
                Targeted re-scans
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}