// components/landing-new/CTASection.tsx
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function CTASection() {
  return (
    <section className="relative py-24 bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto px-6">
        {/* Main container with rounded corners */}
        <div className="relative bg-white/[0.02] backdrop-blur-xl rounded-3xl border border-white/[0.08] overflow-hidden min-h-[480px]">
          
          {/* Content grid */}
          <div className="grid lg:grid-cols-2 gap-8 h-full">
            
            {/* Left side - Text and CTAs */}
            <div className="flex flex-col justify-center p-10 lg:p-16">
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
            <div className="relative hidden lg:block overflow-visible">
              {/* Image container with perspective tilt */}
              <div 
                className="absolute inset-0"
                style={{ perspective: '1500px' }}
              >
                <div 
                  className="absolute top-1/2 -translate-y-1/2 left-0"
                  style={{ 
                    transform: 'rotateY(-12deg) rotateX(4deg)',
                    transformOrigin: 'left center'
                  }}
                >
                  {/* Dashboard image - large and bleeding off right */}
                  <img
                    src="/images/dashboard-cta.png"
                    alt="Harbor Dashboard"
                    className="w-[800px] max-w-none h-auto rounded-xl shadow-2xl opacity-90"
                  />
                </div>
              </div>

              {/* Soft fade on the left edge of image area */}
              <div 
                className="absolute inset-y-0 left-0 w-24 pointer-events-none z-10"
                style={{
                  background: 'linear-gradient(to right, rgba(255,255,255,0.02) 0%, transparent 100%)'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}