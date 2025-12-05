// components/landing-new/CTASection.tsx
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function CTASection() {
  return (
    <section className="relative py-24 bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto px-6">
        {/* Main container */}
        <div className="relative bg-white/[0.02] backdrop-blur-xl rounded-3xl border border-white/[0.08] overflow-hidden">
          
          <div className="grid lg:grid-cols-2 min-h-[480px]">
            
            {/* Left side - Text and CTAs */}
            <div className="flex flex-col justify-center p-10 lg:p-16 relative z-10">
              <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-8">
                AI is the new search.{' '}
                <span className="text-white/50">See if you&apos;re in the results.</span>
              </h2>

              <div className="flex flex-col sm:flex-row items-start gap-4">
                <Link 
                  href="/auth/signup"
                  className="group flex items-center gap-2 px-6 py-3.5 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition-colors"
                >
                  Start free trial
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link 
                  href="/contact"
                  className="flex items-center gap-2 px-6 py-3.5 bg-white/5 border border-white/10 text-white font-medium rounded-lg hover:bg-white/10 hover:border-white/20 transition-colors"
                >
                  <div className="w-2 h-2 bg-white/40 rounded-sm" />
                  Talk to Sales
                </Link>
              </div>
            </div>

            {/* Right side - Dashboard image */}
            <div className="relative hidden lg:flex items-center justify-start overflow-visible">
              <img
                src="/images/dashboard-cta.png"
                alt="Harbor Dashboard"
                className="absolute left-0 w-[900px] max-w-none rounded-xl opacity-80"
                style={{ 
                  transform: 'perspective(1500px) rotateY(-15deg) rotateX(5deg)',
                  transformOrigin: 'left center'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}