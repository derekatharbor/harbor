import { TrendingUp, MousePointerClick, Network } from 'lucide-react'

export default function ProblemSection() {
  return (
    <section className="bg-[#1A2332] py-20 lg:py-28">
      <div className="mx-auto max-w-5xl px-6">
        {/* Header Block */}
        <div className="mx-auto max-w-3xl text-center">
          {/* Section Tag */}
          <div className="mb-6">
            <span className="inline-block px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white/75 uppercase tracking-wider">
              The Shift
            </span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-heading font-semibold text-white tracking-tight">
            AI is the new search engine
          </h2>
          
          <p className="mt-4 text-base md:text-lg text-[#CBD3E2]">
            Customers don't browse anymore—they ask AI. And AI doesn't give blue links, it gives answers.
          </p>
          
          <p className="mt-4 text-sm md:text-base text-[#A4B1C3] font-medium">
            If your brand isn't part of those answers, it's invisible.
          </p>
        </div>

        {/* Proof Cards */}
        <div className="mt-10 lg:mt-12 grid gap-6 md:grid-cols-3">
          {/* Card 1: AI drives research */}
          <article className="rounded-2xl bg-[#0C1422] border border-white/5 px-5 py-6 hover:border-white/20 hover:bg-[#0E1727] transition-colors duration-150">
            <div className="inline-flex items-center justify-center rounded-xl bg-[#0F1B2C] p-3 mb-4">
              <TrendingUp className="h-6 w-6 text-white" strokeWidth={1.5} />
            </div>
            
            <h3 className="text-sm font-semibold text-white">
              AI now drives product research
            </h3>
            
            <p className="mt-2 text-sm text-[#A4B1C3] leading-relaxed">
              65% of consumers use AI tools when evaluating products.
            </p>
          </article>

          {/* Card 2: Zero-click */}
          <article className="rounded-2xl bg-[#0C1422] border border-white/5 px-5 py-6 hover:border-white/20 hover:bg-[#0E1727] transition-colors duration-150">
            <div className="inline-flex items-center justify-center rounded-xl bg-[#0F1B2C] p-3 mb-4">
              <MousePointerClick className="h-6 w-6 text-white" strokeWidth={1.5} />
            </div>
            
            <h3 className="text-sm font-semibold text-white">
              Zero-click behavior
            </h3>
            
            <p className="mt-2 text-sm text-[#A4B1C3] leading-relaxed">
              Models summarize everything—customers rarely visit the website first.
            </p>
          </article>

          {/* Card 3: Four models */}
          <article className="rounded-2xl bg-[#0C1422] border border-white/5 px-5 py-6 hover:border-white/20 hover:bg-[#0E1727] transition-colors duration-150">
            <div className="inline-flex items-center justify-center rounded-xl bg-[#0F1B2C] p-3 mb-4">
              <Network className="h-6 w-6 text-white" strokeWidth={1.5} />
            </div>
            
            <h3 className="text-sm font-semibold text-white">
              Four models control the funnel
            </h3>
            
            <p className="mt-2 text-sm text-[#A4B1C3] leading-relaxed">
              ChatGPT, Claude, Gemini, and Perplexity now shape what customers see.
            </p>
          </article>
        </div>
      </div>
    </section>
  )
}