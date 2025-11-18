export default function ProblemSection() {
  return (
    <section className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Section Tag */}
        <div className="text-center mb-8">
          <span className="inline-block px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white/75 uppercase tracking-wider">
            The Shift
          </span>
        </div>

        {/* Main Statement */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white text-center leading-tight mb-8">
          AI is the new search engine
        </h2>

        {/* Supporting Copy */}
        <div className="space-y-6 text-lg sm:text-xl text-white/75 text-center max-w-2xl mx-auto">
          <p>
            When customers ask ChatGPT, Claude, or Perplexity for recommendations, 
            they're getting answers—not a list of blue links.
          </p>
          <p>
            If your brand isn't part of those answers, you're invisible.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mt-16 sm:mt-20">
          <div className="text-center p-6 rounded-xl bg-white/5 border border-white/10">
            <div className="text-3xl sm:text-4xl font-display font-bold text-white mb-2">
              65%
            </div>
            <div className="text-sm sm:text-base text-white/75">
              of consumers now use AI for product research
            </div>
          </div>

          <div className="text-center p-6 rounded-xl bg-white/5 border border-white/10">
            <div className="text-3xl sm:text-4xl font-display font-bold text-white mb-2">
              0 clicks
            </div>
            <div className="text-sm sm:text-base text-white/75">
              needed to get an answer from AI
            </div>
          </div>

          <div className="text-center p-6 rounded-xl bg-white/5 border border-white/10">
            <div className="text-3xl sm:text-4xl font-display font-bold text-white mb-2">
              4 models
            </div>
            <div className="text-sm sm:text-base text-white/75">
              dominate consumer AI search today
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
