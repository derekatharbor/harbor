// components/landing-new/CTASection.tsx
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function CTASection() {
  return (
    <section className="relative py-24 bg-[#0a0a0a]">
      <div className="max-w-4xl mx-auto px-6">
        {/* Frosted glass card */}
        <div className="bg-white/[0.02] backdrop-blur-xl rounded-3xl border border-white/[0.08] p-12 lg:p-16 text-center">
          
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-8">
            <div className="w-2 h-2 bg-emerald-400 rounded-full" />
            <span className="text-white/60 text-sm">Start for free</span>
          </div>

          {/* Headline */}
          <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-4">
            AI is the new search.
          </h2>
          <p className="text-2xl sm:text-3xl text-white/50 font-medium mb-10">
            See if you&apos;re in the results.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/auth/signup"
              className="group flex items-center gap-2 px-8 py-4 bg-white text-black font-semibold rounded-xl hover:bg-white/90 transition-colors"
            >
              Start free trial
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link 
              href="/contact"
              className="flex items-center gap-2 px-8 py-4 bg-white/5 border border-white/10 text-white font-medium rounded-xl hover:bg-white/10 hover:border-white/20 transition-colors"
            >
              Talk to Sales
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}