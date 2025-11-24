// apps/web/components/landing/NewHeroSection.tsx
'use client'

export default function NewHeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#101A31]">
      
      {/* Wireframe Background Image */}
      {/* 
        Recommended image specs:
        - Width: 1920px (or wider for large screens)
        - Height: 600-800px
        - Format: PNG with transparency OR SVG
        - Place at: /public/wireframe-hero.png
      */}
      <div 
        className="absolute top-0 left-0 right-0 h-[600px] pointer-events-none"
        style={{
          backgroundImage: 'url(/wireframe-hero.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          backgroundRepeat: 'no-repeat',
          opacity: 0.3
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-32 md:pt-48 pb-16 md:pb-24 text-center">
        
        {/* Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-heading font-bold mb-4 md:mb-6 leading-tight">
          <span className="bg-gradient-to-r from-white via-cyan-200 to-blue-400 bg-clip-text text-transparent">
            AI is the new search.
          </span>
          <br />
          <span className="text-white">
            See how it sees your brand.
          </span>
        </h1>

        {/* Subheading */}
        <p className="text-base md:text-lg lg:text-xl text-white/70 max-w-3xl mx-auto mb-8 md:mb-12 leading-relaxed px-2">
          Harbor reveals your true visibility across ChatGPT, Claude, Gemini, and Perplexity — and shows how to strengthen your position in AI-driven discovery.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4">
          <a
            href="/brands"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 md:px-8 py-3 md:py-4 rounded-lg bg-white text-[#101A31] text-base md:text-lg font-semibold hover:bg-white/85 transition-colors duration-200"
          >
            Run your visibility scan
          </a>
          
          <a
            href="#how-it-works"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 md:px-8 py-3 md:py-4 rounded-lg border-2 border-white/30 text-white text-base md:text-lg font-semibold hover:bg-white/10 hover:border-white/50 transition-colors duration-200"
          >
            Learn more
          </a>
        </div>

        {/* AI Platform Logos Row */}
        <div className="mt-12 md:mt-16 flex flex-col items-center justify-center gap-3 md:gap-4">
          <p className="text-white/50 text-xs md:text-sm font-mono uppercase tracking-wider">
            Tracking visibility across
          </p>
          <div className="flex items-center gap-4 md:gap-6 flex-wrap justify-center">
            <span className="text-white/70 text-xs md:text-sm font-medium">ChatGPT</span>
            <span className="text-white/70 text-xs md:text-sm font-medium">Claude</span>
            <span className="text-white/70 text-xs md:text-sm font-medium">Gemini</span>
            <span className="text-white/70 text-xs md:text-sm font-medium">Perplexity</span>
          </div>
        </div>
      </div>
    </section>
  )
}