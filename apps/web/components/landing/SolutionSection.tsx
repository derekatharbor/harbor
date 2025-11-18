import { ShoppingBag, Sparkles, MessageSquare } from 'lucide-react'

export default function SolutionSection() {
  return (
    <section className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-white/[0.02]">
      <div className="max-w-6xl mx-auto">
        {/* Section Tag */}
        <div className="text-center mb-8">
          <span className="inline-block px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white/75 uppercase tracking-wider">
            Intelligence Layer
          </span>
        </div>

        {/* Main Headline */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white text-center leading-tight mb-6">
          Harbor shows you how AI sees your brand
        </h2>

        <p className="text-lg sm:text-xl text-white/75 text-center max-w-2xl mx-auto mb-16">
          Get real-time intelligence across shopping, brand perception, and customer conversations.
        </p>

        {/* Three Module Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Shopping Visibility */}
          <div className="group p-8 rounded-xl bg-white/5 border border-white/10 hover:bg-white/[0.07] hover:border-teal-500/30 transition-all duration-300">
            <div className="w-12 h-12 rounded-lg bg-teal-500/10 flex items-center justify-center mb-6 group-hover:bg-teal-500/20 transition-colors">
              <ShoppingBag className="w-6 h-6 text-teal-400" />
            </div>

            <h3 className="text-xl sm:text-2xl font-display font-bold text-white mb-3">
              Shopping Visibility
            </h3>

            <p className="text-white/75 leading-relaxed mb-4">
              See how your products surface in AI shopping recommendations across ChatGPT, Claude, Gemini, and Perplexity.
            </p>

            <ul className="space-y-2 text-sm text-white/60">
              <li className="flex items-start">
                <span className="text-teal-400 mr-2">•</span>
                <span>Category coverage and rank positions</span>
              </li>
              <li className="flex items-start">
                <span className="text-teal-400 mr-2">•</span>
                <span>Competitor comparison analysis</span>
              </li>
              <li className="flex items-start">
                <span className="text-teal-400 mr-2">•</span>
                <span>Model-specific mention frequency</span>
              </li>
            </ul>
          </div>

          {/* Brand Visibility */}
          <div className="group p-8 rounded-xl bg-white/5 border border-white/10 hover:bg-white/[0.07] hover:border-teal-500/30 transition-all duration-300">
            <div className="w-12 h-12 rounded-lg bg-teal-500/10 flex items-center justify-center mb-6 group-hover:bg-teal-500/20 transition-colors">
              <Sparkles className="w-6 h-6 text-teal-400" />
            </div>

            <h3 className="text-xl sm:text-2xl font-display font-bold text-white mb-3">
              Brand Visibility
            </h3>

            <p className="text-white/75 leading-relaxed mb-4">
              Understand how AI models describe and associate your brand with descriptors, entities, and sentiment.
            </p>

            <ul className="space-y-2 text-sm text-white/60">
              <li className="flex items-start">
                <span className="text-teal-400 mr-2">•</span>
                <span>Descriptor cloud with polarity</span>
              </li>
              <li className="flex items-start">
                <span className="text-teal-400 mr-2">•</span>
                <span>Entity graph relationships</span>
              </li>
              <li className="flex items-start">
                <span className="text-teal-400 mr-2">•</span>
                <span>Visibility index over time</span>
              </li>
            </ul>
          </div>

          {/* Conversation Volumes */}
          <div className="group p-8 rounded-xl bg-white/5 border border-white/10 hover:bg-white/[0.07] hover:border-teal-500/30 transition-all duration-300">
            <div className="w-12 h-12 rounded-lg bg-teal-500/10 flex items-center justify-center mb-6 group-hover:bg-teal-500/20 transition-colors">
              <MessageSquare className="w-6 h-6 text-teal-400" />
            </div>

            <h3 className="text-xl sm:text-2xl font-display font-bold text-white mb-3">
              Conversation Volumes
            </h3>

            <p className="text-white/75 leading-relaxed mb-4">
              Discover what users ask AI about your brand and category, with intent classification and emerging topics.
            </p>

            <ul className="space-y-2 text-sm text-white/60">
              <li className="flex items-start">
                <span className="text-teal-400 mr-2">•</span>
                <span>Top questions by intent type</span>
              </li>
              <li className="flex items-start">
                <span className="text-teal-400 mr-2">•</span>
                <span>Emerging topic detection</span>
              </li>
              <li className="flex items-start">
                <span className="text-teal-400 mr-2">•</span>
                <span>Co-mention competitor analysis</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-white/60 text-sm mb-4">
            Plus: Website Analytics to audit your AI readability
          </p>
        </div>
      </div>
    </section>
  )
}
