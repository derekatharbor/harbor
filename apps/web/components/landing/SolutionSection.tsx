import { ShoppingBag, Sparkles, MessageSquare } from 'lucide-react'
import Image from 'next/image'

export default function SolutionSection() {
  return (
    <section className="bg-[#1A2332] py-24 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header Block */}
        <div className="mx-auto max-w-3xl text-center">
          {/* Section Tag */}
          <div className="mb-6">
            <span className="inline-block px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white/75 uppercase tracking-wider">
              Intelligence Layer
            </span>
          </div>
          
          <h2 className="text-3xl md:text-[2.625rem] font-heading font-bold text-white tracking-tight leading-tight">
            Harbor shows you how AI sees your brand
          </h2>
          
          <p className="mt-6 text-lg md:text-xl text-[#CBD3E2] leading-relaxed max-w-[720px] mx-auto">
            Get real-time intelligence across shopping visibility, brand perception, and customer conversations.
          </p>
        </div>

        {/* Dashboard Screenshot */}
        <div className="mt-16 lg:mt-20">
          <div className="relative mx-auto max-w-[1240px]">
            <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
              <Image
                src="/dashboard-preview.png"
                alt="Harbor Dashboard - Shopping Visibility"
                width={2480}
                height={1600}
                className="w-full h-auto"
                priority
              />
            </div>
          </div>
        </div>

        {/* Three Pillars */}
        <div className="mt-18 lg:mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Shopping Visibility */}
          <article className="rounded-2xl bg-[#0C1422] border border-white/5 p-8">
            <div className="mb-4">
              <ShoppingBag className="h-7 w-7 text-white" strokeWidth={1.5} />
            </div>
            
            <h3 className="text-xl font-semibold text-white mb-3">
              Shopping Visibility
            </h3>
            
            <p className="text-[15.5px] text-[#A4B1C3] leading-relaxed">
              See how often your products appear in AI shopping recommendations across ChatGPT, Claude, Gemini, and Perplexity. Track rankings, category coverage, competitor share, and model-specific visibility.
            </p>
          </article>

          {/* Brand Visibility */}
          <article className="rounded-2xl bg-[#0C1422] border border-white/5 p-8">
            <div className="mb-4">
              <Sparkles className="h-7 w-7 text-white" strokeWidth={1.5} />
            </div>
            
            <h3 className="text-xl font-semibold text-white mb-3">
              Brand Visibility
            </h3>
            
            <p className="text-[15.5px] text-[#A4B1C3] leading-relaxed">
              Understand how AI models perceive your brand with descriptors, sentiment, associations, and consistency across models. Identify what you're known for — and what's missing.
            </p>
          </article>

          {/* Conversation Volumes */}
          <article className="rounded-2xl bg-[#0C1422] border border-white/5 p-8">
            <div className="mb-4">
              <MessageSquare className="h-7 w-7 text-white" strokeWidth={1.5} />
            </div>
            
            <h3 className="text-xl font-semibold text-white mb-3">
              Conversation Volumes
            </h3>
            
            <p className="text-[15.5px] text-[#A4B1C3] leading-relaxed">
              Discover what users ask AI about your brand and category. Monitor intent categories, trending topics, and co-mentions with competitors.
            </p>
          </article>
        </div>
      </div>
    </section>
  )
}