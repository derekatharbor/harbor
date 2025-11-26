// apps/web/app/pricing/PricingClient.tsx
'use client'

import { useState } from 'react'
import { Check, Plus, Minus, ArrowRight, Menu, Zap, Shield, BarChart3, Users } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import FullscreenMenu from '@/components/landing/FullscreenMenu'

const freeFeatures = [
  'Unlimited brand monitoring',
  'Weekly AI visibility scans',
  'All 4 intelligence modules',
  'Competitor tracking',
  'Optimization recommendations',
  'Public brand profile page',
  'AI-ready JSON feed',
  'Share cards for LinkedIn',
]

const faqs = [
  {
    question: 'Is Harbor really free?',
    answer: 'Yes. Harbor is free for all brands. We believe every brand should understand how AI sees them. No credit card required, no trial period, no hidden fees.',
  },
  {
    question: 'Why is it free?',
    answer: "We're building the definitive index of how AI understands brands. The more brands on Harbor, the more valuable this data becomes for everyone. Your participation helps shape the future of AI search.",
  },
  {
    question: 'What do I get with a free account?',
    answer: 'Everything. Weekly scans across ChatGPT, Claude, Gemini, and Perplexity. Full access to all four intelligence modules. Competitor tracking. Optimization tools. A public brand profile. No features are locked behind a paywall.',
  },
  {
    question: 'Will you add paid features later?',
    answer: "We may offer premium add-ons for power users who want more frequent scans or advanced features. But the core product will always be free. We won't take away what you have today.",
  },
  {
    question: 'What about agencies managing multiple brands?',
    answer: "We're building Enterprise plans for agencies and teams. If you manage 5+ brands, reach out and we'll set you up with early access.",
  },
]

export default function PricingClient() {
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      
      {/* Light Nav for Pricing Page */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-3rem)] max-w-[1400px]">
        <div 
          className="backdrop-blur-xl bg-white/80 rounded-2xl shadow-lg border border-gray-200/50"
          style={{ backdropFilter: 'blur(12px)' }}
        >
          <div className="px-4 md:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14 md:h-16">
              <Link href="/" className="flex items-center space-x-2 md:space-x-3">
                <Image 
                  src="/images/harbor-dark-solo.svg" 
                  alt="Harbor" 
                  width={120} 
                  height={32}
                  className="h-7 md:h-8 w-auto"
                />
                <span className="text-lg md:text-xl font-bold text-[#101A31]">Harbor</span>
              </Link>

              <div className="flex items-center space-x-2 md:space-x-4">
                <button
                  onClick={() => setIsMenuOpen(true)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  aria-label="Menu"
                >
                  <Menu className="w-5 h-5 md:w-6 md:h-6 text-[#101A31]" />
                </button>
                
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center px-4 md:px-5 py-2 md:py-2.5 rounded-lg bg-[#101A31] text-white text-sm md:text-base font-medium hover:bg-[#1a2a4a] transition-all duration-200"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-12 md:pt-40 md:pb-16 px-6 overflow-hidden">
        {/* Wireframe Background */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: 'url(/wireframe-hero.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
            backgroundRepeat: 'no-repeat'
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            Free forever. No credit card required.
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-[#101A31] leading-tight mb-6">
            See how AI sees your brand.
            <br />
            <span className="text-emerald-600">For free.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            Full access to AI visibility intelligence. No paywalls, no trials, no catch.
            Just sign up and start understanding how ChatGPT, Claude, and others talk about you.
          </p>
          
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#101A31] text-white text-lg font-semibold hover:bg-[#1a2a4a] transition-all duration-200 shadow-lg shadow-[#101A31]/20"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Main Feature Card */}
      <section className="pb-16 md:pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden bg-white shadow-xl shadow-gray-200/50 border border-gray-100">
            {/* Header */}
            <div className="px-8 lg:px-10 pt-8 lg:pt-10 pb-6 border-b border-gray-100">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl lg:text-3xl font-heading font-bold text-[#101A31]">
                      Everything included
                    </h2>
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold">
                      FREE
                    </span>
                  </div>
                  <p className="text-gray-600">
                    Full platform access for every brand. No limits on what matters.
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-5xl lg:text-6xl font-heading font-bold text-[#101A31]">
                    $0
                  </div>
                  <div className="text-gray-500 text-sm">forever</div>
                </div>
              </div>
            </div>
            
            {/* Features Grid */}
            <div className="px-8 lg:px-10 py-8 lg:py-10">
              <div className="grid md:grid-cols-2 gap-4">
                {freeFeatures.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-emerald-600" strokeWidth={3} />
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 pt-8 border-t border-gray-100">
                <Link
                  href="/auth/signup"
                  className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-[#101A31] text-white font-semibold hover:bg-[#1a2a4a] transition-all duration-200"
                >
                  Create Your Free Account
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <p className="text-center text-sm text-gray-500 mt-3">
                  No credit card required · Set up in 2 minutes
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Free Section */}
      <section className="py-16 md:py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-[#101A31] mb-4">
              Why we're free
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We're building something bigger than a subscription product.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-cyan-100 flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-7 h-7 text-cyan-600" />
              </div>
              <h3 className="text-lg font-heading font-bold text-[#101A31] mb-2">
                Build the index
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                We're creating the definitive database of how AI understands every brand. 
                More brands = better data for everyone.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-lg font-heading font-bold text-[#101A31] mb-2">
                Help brands claim their truth
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                AI models are shaping how people discover brands. 
                Everyone deserves to know—and influence—what AI says about them.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <Users className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-lg font-heading font-bold text-[#101A31] mb-2">
                Enterprise comes later
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                We'll monetize through enterprise features for agencies and large teams. 
                Individual brands stay free.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Callout */}
      <section className="py-16 md:py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden bg-[#101A31] p-8 md:p-12">
            {/* Wireframe pattern */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-[0.06]"
              style={{
                backgroundImage: 'url(/wireframe-hero.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <h3 className="text-2xl md:text-3xl font-heading font-bold text-white mb-2">
                  Managing multiple brands?
                </h3>
                <p className="text-white/70 max-w-md">
                  Enterprise plans for agencies and teams coming soon. 
                  Get early access with dedicated support and custom onboarding.
                </p>
              </div>
              <Link
                href="/contact?inquiry=enterprise"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-[#101A31] font-semibold hover:bg-gray-100 transition-colors whitespace-nowrap flex-shrink-0"
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