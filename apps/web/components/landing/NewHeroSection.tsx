// apps/web/components/landing/NewHeroSection.tsx
'use client'

export default function NewHeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Gradient Background */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #101A31 0%, #1a3a52 50%, #2dd4bf 100%)'
        }}
      />

      {/* Wireframe Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Diagonal Lines (Plaid-style) */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              45deg,
              transparent,
              transparent 50px,
              rgba(255,255,255,0.03) 50px,
              rgba(255,255,255,0.03) 51px
            )
          `
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-24 text-center">
        
        {/* Headline with Gradient */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold mb-6 leading-tight">
          <span className="bg-gradient-to-r from-white via-cyan-200 to-blue-400 bg-clip-text text-transparent">
            AI is the new search.
          </span>
          <br />
          <span className="text-white">
            See how it sees your brand.
          </span>
        </h1>

        {/* Subheading */}
        <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto mb-12 leading-relaxed">
          Harbor reveals your true visibility across ChatGPT, Claude, Gemini, and Perplexity — and shows how to strengthen your position in AI-driven discovery.
        </p>

        {/* CTA Button */}
        <div className="flex items-center justify-center gap-4">
          <a
            href="/brands"
            className="inline-flex items-center justify-center px-8 py-4 rounded-lg bg-white text-[#101A31] text-lg font-semibold hover:bg-white/90 transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-105"
          >
            Run your visibility scan
          </a>
          
          <a
            href="#how-it-works"
            className="inline-flex items-center justify-center px-8 py-4 rounded-lg border-2 border-white/30 text-white text-lg font-semibold hover:bg-white/10 transition-all duration-200"
          >
            Learn more
          </a>
        </div>

        {/* AI Platform Logos Row */}
        <div className="mt-16 flex items-center justify-center gap-8 opacity-60">
          <p className="text-white/60 text-sm font-mono uppercase tracking-wider">
            Tracking visibility across
          </p>
          <div className="flex items-center gap-6">
            {/* You can add actual logo images here */}
            <span className="text-white/80 text-sm font-medium">ChatGPT</span>
            <span className="text-white/80 text-sm font-medium">Claude</span>
            <span className="text-white/80 text-sm font-medium">Gemini</span>
            <span className="text-white/80 text-sm font-medium">Perplexity</span>
          </div>
        </div>
      </div>

      {/* Subtle gradient orb (Plaid-style glow) */}
      <div 
        className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(45,212,191,0.4) 0%, transparent 70%)'
        }}
      />
      
      <div 
        className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(41,121,255,0.4) 0%, transparent 70%)'
        }}
      />
    </section>
  )
}
