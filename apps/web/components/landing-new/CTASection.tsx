// components/landing-new/CTASection.tsx
import Link from 'next/link'

export default function CTASection() {
  return (
    <section className="relative py-24 bg-[#0a0a0a]">
      <div className="max-w-4xl mx-auto px-6 text-center">
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-[100px] pointer-events-none" />
        
        <div className="relative">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to see where you stand?
          </h2>
          <p className="text-white/50 text-lg mb-10 max-w-2xl mx-auto">
            Join thousands of brands tracking their AI visibility. 
            Free to start, powerful insights from day one.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/signup"
              className="px-8 py-4 bg-white text-black font-semibold rounded-xl hover:bg-white/90 transition-colors text-lg"
            >
              Get started free
            </Link>
            <Link 
              href="/demo"
              className="px-8 py-4 bg-white/5 border border-white/10 text-white font-semibold rounded-xl hover:bg-white/10 hover:border-white/20 transition-colors text-lg"
            >
              Request demo
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
