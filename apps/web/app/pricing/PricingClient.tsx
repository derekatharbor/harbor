// apps/web/app/pricing/PricingClient.tsx
'use client'

import { useState } from 'react'
import { Check, Plus, Minus, ArrowRight, Menu, Database, Shield, Layers, Sparkles, BarChart3, Globe } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import FullscreenMenu from '@/components/landing/FullscreenMenu'

const platformFeatures = [
  {
    icon: BarChart3,
    title: 'Full AI visibility dashboard',
    description: 'See exactly how ChatGPT, Claude, Gemini, and Perplexity describe your brand.',
  },
  {
    icon: Layers,
    title: 'Ranked against 15,000+ companies',
    description: 'Know where you stand in your category and who\'s ahead.',
  },
  {
    icon: Database,
    title: 'Your structured AI profile',
    description: 'Verified brand data that AI systems can read and trust.',
  },
  {
    icon: Globe,
    title: 'AI-ready JSON feed',
    description: 'Machine-readable profile for direct AI integrations.',
  },
  {
    icon: Shield,
    title: 'Weekly scans across 4 models',
    description: 'Automatic monitoring so you never miss a shift.',
  },
  {
    icon: Sparkles,
    title: 'Optimization recommendations',
    description: 'Actionable steps to improve how AI represents you.',
  },
]

const faqs = [
  {
    question: 'Is Harbor really free?',
    answer: 'Yes. We believe brand visibility should be accessible to everyone, not hidden behind paywalls. No credit card, no trial period, no surprise fees.',
  },
  {
    question: 'Why is Harbor free?',
    answer: 'Because brands aren\'t our customers—they\'re our data partners. The more brands that verify their AI-visible data, the more accurate AI becomes for everyone. We win when you win.',
  },
  {
    question: 'Will you add paid features later?',
    answer: 'Only for enterprise. Multi-brand management, API access, and advanced analysis will be paid features for agencies and large teams. Individual brands always get free access.',
  },
  {
    question: 'What about advanced AI scans?',
    answer: 'Basic AI visibility scans are free and unlimited. Optional deep-analysis scans cost $0.75 per scan—only when you request them. Most brands never need them.',
  },
  {
    question: 'What about agencies managing multiple brands?',
    answer: 'We\'re building Enterprise plans for agencies and teams. If you manage 5+ brands, reach out and we\'ll set you up with early access and dedicated support.',
  },
]

export default function PricingClient() {
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#101A31]">
      
      {/* Fixed Nav */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-3rem)] max-w-[1400px]">
        <div 
          className="backdrop-blur-xl bg-[#101A31]/80 rounded-2xl shadow-lg border border-white/10"
          style={{ backdropFilter: 'blur(12px)' }}
        >
          <div className="px-4 md:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14 md:h-16">
              <Link href="/" className="flex items-center space-x-2 md:space-x-3">
                <Image 
                  src="/logo-icon.png" 
                  alt="Harbor" 
                  width={32} 
                  height={32}
                  className="h-7 md:h-8 w-auto"
                />
                <span className="text-lg md:text-xl font-bold text-white">Harbor</span>
              </Link>

              <div className="flex items-center space-x-2 md:space-x-4">
                <button
                  onClick={() => setIsMenuOpen(true)}
                  className="p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                  aria-label="Menu"
                >
                  <Menu className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </button>
                
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center px-4 md:px-5 py-2 md:py-2.5 rounded-lg bg-white text-[#101A31] text-sm md:text-base font-medium hover:bg-white/90 transition-all duration-200"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Bold, Movement Feel */}
      <section className="relative pt-36 pb-20 md:pt-44 md:pb-28 px-6 overflow-hidden">
        {/* Wireframe Background */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: 'url(/wireframe-hero.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
            backgroundRepeat: 'no-repeat'
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Strategic Pill */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 mb-8">
            <p className="text-sm font-mono uppercase tracking-wider text-white/70">
              Free forever — no credit card required
            </p>
          </div>
          
          {/* Main Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold leading-tight mb-6">
            <span className="bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent">
              See how AI sees your brand.
            </span>
            <br />
            <span className="text-white">For free — forever.</span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-lg md:text-xl text-[#CBD4E1] leading-relaxed mb-6 max-w-2xl mx-auto">
            Harbor helps brands understand their visibility across ChatGPT, Claude, Gemini, and Perplexity—and gives them the tools to improve it. No paywalls. No trials. No limits.
          </p>
          
          {/* Strategic Positioning Line */}
          <p className="text-sm md:text-base text-cyan-400/80 font-mono mb-10 max-w-xl mx-auto">
            Harbor is free because brands aren't our customers—they're our data partners.
          </p>
          
          {/* CTA */}
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-[#101A31] text-lg font-semibold hover:bg-white/90 transition-all duration-200 shadow-lg shadow-white/10"
          >
            Create your free profile
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Credibility Bar */}
      <section className="py-8 px-6 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
            <p className="text-white/60 text-sm font-mono uppercase tracking-wider">
              Already tracking
            </p>
            <p className="text-3xl md:text-4xl font-heading font-bold text-white">
              15,000+ brands
            </p>
            <p className="text-white/60 text-sm font-mono uppercase tracking-wider">
              across every category
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Card - Single Free Tier */}
      <section className="py-20 md:py-28 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden bg-[#0D1424] border border-white/10">
            
            {/* Card Header */}
            <div className="px-8 lg:px-12 pt-10 lg:pt-12 pb-8 border-b border-white/5">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <h2 className="text-2xl lg:text-3xl font-heading font-bold text-white">
                      Everything included
                    </h2>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-semibold border border-emerald-500/30">
                      FREE
                    </span>
                  </div>
                  <p className="text-white/60 max-w-md">
                    Full platform access. The same tools other platforms charge $99–$400/month for.
                  </p>
                </div>
                <div className="text-left md:text-right">
                  <div className="text-5xl lg:text-6xl font-heading font-bold text-white">
                    $0
                  </div>
                  <div className="text-white/40 text-sm mt-1">forever</div>
                  <p className="text-xs text-white/30 mt-2 max-w-[180px] md:ml-auto">
                    No usage caps. No credits.<br />No surprise bills.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Features Grid */}
            <div className="px-8 lg:px-12 py-10 lg:py-12">
              <div className="grid md:grid-cols-2 gap-6">
                {platformFeatures.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 border border-white/5">
                      <feature.icon className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium mb-1">{feature.title}</h3>
                      <p className="text-white/50 text-sm leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* CTA */}
              <div className="mt-10 pt-8 border-t border-white/5">
                <Link
                  href="/auth/signup"
                  className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-white text-[#101A31] font-semibold hover:bg-white/90 transition-all duration-200"
                >
                  Create Your Free Account
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <p className="text-center text-sm text-white/40 mt-4">
                  Set up in 2 minutes · No credit card required
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Free Section */}
      <section className="py-20 md:py-28 px-6 bg-white" data-nav-theme="light">
        <div className="max-w-5xl mx-auto">
          
          {/* Eyebrow */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-[#101A31]/5 backdrop-blur-sm border border-[#101A31]/10 mb-6">
              <p className="text-sm font-mono uppercase tracking-wider text-[#101A31]/70">
                Our model
              </p>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4">
              <span className="bg-gradient-to-r from-[#101A31] via-[#0891b2] to-[#2979FF] bg-clip-text text-transparent">
                Why Harbor is free
              </span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              We're not building a subscription product. We're building the AI visibility layer for the internet.
            </p>
          </div>
          
          {/* Three Pillars */}
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-cyan-100 flex items-center justify-center mx-auto mb-5">
                <Database className="w-8 h-8 text-cyan-600" />
              </div>
              <h3 className="text-xl font-heading font-bold text-[#101A31] mb-3">
                Build the Index
              </h3>
              <p className="text-gray-600 leading-relaxed">
                We're creating the definitive dataset of how AI understands the world's brands. More verified profiles = better data for everyone.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center mx-auto mb-5">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-heading font-bold text-[#101A31] mb-3">
                Accurate AI = Better AI
              </h3>
              <p className="text-gray-600 leading-relaxed">
                When brands verify their profile, AI stops hallucinating. Your verified data makes AI better for everyone who searches.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-5">
                <Layers className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-heading font-bold text-[#101A31] mb-3">
                Enterprise Comes Later
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Large companies will pay for advanced analysis, API access, and multi-brand management. Individual brands shouldn't pay—ever.
              </p>
            </div>
            
          </div>
        </div>
      </section>

      {/* Enterprise Callout */}
      <section className="py-16 md:py-20 px-6 bg-[#0a0f1a]">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#141E38] to-[#101A31] p-8 md:p-12 border border-white/5">
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left">
                <h3 className="text-2xl md:text-3xl font-heading font-bold text-white mb-3">
                  Managing multiple brands?
                </h3>
                <p className="text-white/60 max-w-md leading-relaxed">
                  Enterprise plans for agencies and teams coming soon. Get early access with dedicated support, API access, and custom onboarding.
                </p>
              </div>
              <Link
                href="/contact?inquiry=enterprise"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-[#101A31] font-semibold hover:bg-white/90 transition-colors whitespace-nowrap flex-shrink-0"
              >
                Contact Us
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Color Noise Divider */}
      <div 
        className="w-full h-4 md:h-6"
        style={{
          backgroundImage: 'url(/color-noise-bar.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />

      {/* FAQ Section */}
      <section className="py-20 md:py-28 px-6 bg-[#f1f5f9]">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
            
            {/* Left Column - Header */}
            <div className="lg:col-span-2">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-[#101A31] mb-4 leading-tight">
                Questions about our pricing
              </h2>
              <p className="text-gray-600 mb-2">
                Still have questions?
              </p>
              <Link
                href="/contact"
                className="text-[#101A31] font-medium underline underline-offset-4 hover:text-gray-700 transition-colors"
              >
                Talk with our team
              </Link>
            </div>

            {/* Right Column - FAQ Accordion */}
            <div className="lg:col-span-3">
              <div className="space-y-0">
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    className={`border-b border-gray-200 ${index === 0 ? 'border-t' : ''}`}
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                      className="w-full flex items-center justify-between py-5 text-left cursor-pointer group"
                    >
                      <span className="font-medium text-[#101A31] pr-4 group-hover:text-gray-700 transition-colors">
                        {faq.question}
                      </span>
                      {openFaq === index ? (
                        <Minus className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      ) : (
                        <Plus className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      )}
                    </button>
                    
                    <div className={`transition-all duration-200 overflow-hidden ${
                      openFaq === index ? 'max-h-96 opacity-100 pb-5' : 'max-h-0 opacity-0'
                    }`}>
                      <p className="text-gray-600 leading-relaxed pr-8">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/5 py-12 px-4 sm:px-6 lg:px-8 rounded-t-[2rem] md:rounded-t-[3rem]" style={{ backgroundColor: '#101A31' }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Image 
                  src="/logo-icon.png" 
                  alt="Harbor" 
                  width={32} 
                  height={32}
                  className="w-8 h-8"
                />
                <span className="text-xl font-bold text-white font-heading">Harbor</span>
              </div>
              <p className="text-[#A4B1C3] text-sm leading-relaxed">
                The first platform for AI search visibility. 
                See how ChatGPT, Claude, Gemini, and Perplexity talk about your brand.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-heading font-semibold mb-4">Product</h3>
              <ul className="space-y-3">
                <li>
                  <Link 
                    href="/#how-it-works" 
                    className="text-[#A4B1C3] hover:text-white transition-colors text-sm"
                  >
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/pricing" 
                    className="text-[#A4B1C3] hover:text-white transition-colors text-sm"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/brands" 
                    className="text-[#A4B1C3] hover:text-white transition-colors text-sm"
                  >
                    Brand Index
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-white font-heading font-semibold mb-4">Company</h3>
              <ul className="space-y-3">
                <li>
                  <Link 
                    href="/contact" 
                    className="text-[#A4B1C3] hover:text-white transition-colors text-sm"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/privacy" 
                    className="text-[#A4B1C3] hover:text-white transition-colors text-sm"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/terms" 
                    className="text-[#A4B1C3] hover:text-white transition-colors text-sm"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-white/5 text-center md:text-left">
            <div className="text-sm text-[#A4B1C3]">
              © {new Date().getFullYear()} Harbor. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      {/* Fullscreen Menu */}
      <FullscreenMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </div>
  )
}