// apps/web/app/pricing/PricingClient.tsx
'use client'

import { useState } from 'react'
import { Check, Plus, Minus, ArrowRight, Menu, BarChart3, Users, Sparkles, Globe, Database, RefreshCw } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import FullscreenMenu from '@/components/landing/FullscreenMenu'

const whyFreeReasons = [
  {
    title: 'Build the Index',
    description: 'Harbor exists to map how AI understands the world\'s brands. The more brands that join, the better the data becomes.',
  },
  {
    title: 'Help models stop hallucinating',
    description: 'AI guesses about pricing, integrations, and features. Verified data makes responses accurate — for everyone.',
  },
  {
    title: 'Enterprise comes later',
    description: 'Teams managing dozens of brands pay for API access, deep scans, and analytics. Individual brands never pay.',
  },
]

const freeFeatures = [
  'AI visibility dashboard',
  'Weekly scans across ChatGPT, Claude, Gemini, Perplexity',
  'Competitor visibility insights',
  'Optimization recommendations',
  'Verified AI-ready JSON feed',
  'Public AI profile page',
  'Unlimited updates',
  'Share cards for LinkedIn',
]

const enterpriseFeatures = [
  'Everything in Free',
  'Multi-brand management',
  'API access',
  'Deep analysis scans',
  'White-label reports',
  'Dedicated support',
  'SSO + team controls',
]

const insideFeatures = [
  {
    icon: BarChart3,
    title: 'AI Visibility Dashboard',
    description: 'See how your brand appears across 4 major AI models.',
  },
  {
    icon: Users,
    title: 'Competitor Insights',
    description: 'Understand your category visibility vs similar brands.',
  },
  {
    icon: Sparkles,
    title: 'Optimize Your AI Presence',
    description: 'Get recommendations that make AI responses more accurate.',
  },
  {
    icon: Globe,
    title: 'Public AI Profile Page',
    description: 'Your verified brand info for AI models to reference.',
  },
  {
    icon: Database,
    title: 'AI-Ready JSON Feed',
    description: 'Machine-readable profile for future integrations.',
  },
  {
    icon: RefreshCw,
    title: 'Unlimited Updates',
    description: 'Fix, refine, and evolve your AI-visible narrative anytime.',
  },
]

const faqs = [
  {
    question: 'Is Harbor really free?',
    answer: 'Yes — individual brands never pay.',
  },
  {
    question: 'Why is Harbor free?',
    answer: 'Because Harbor relies on verified brand data to build the global AI visibility index.',
  },
  {
    question: 'What about advanced scans?',
    answer: 'You can optionally run deeper AI analysis for $0.75 per scan. Basic scans are always free.',
  },
  {
    question: 'Will you add paid features later?',
    answer: 'Only for enterprise teams. Never for individual brands.',
  },
  {
    question: 'What if I manage multiple brands?',
    answer: 'Enterprise plans with API access and multi-brand tools are available.',
  },
]

export default function PricingClient() {
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="min-h-screen">
      
      {/* Nav */}
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

      {/* Hero Section - Expansive, Premium */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 px-6 bg-gradient-to-br from-[#f0f9ff] via-[#f8fafc] to-[#f0fdfa] overflow-hidden">
        {/* Wireframe illustration on right */}
        <div 
          className="absolute right-0 top-0 bottom-0 w-1/2 opacity-[0.15] pointer-events-none hidden lg:block"
          style={{
            backgroundImage: 'url(/wireframe-hero.png)',
            backgroundSize: 'contain',
            backgroundPosition: 'right center',
            backgroundRepeat: 'no-repeat'
          }}
        />

        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <p className="text-sm font-mono uppercase tracking-widest text-[#101A31]/50 mb-6">
              Pricing
            </p>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-[#101A31] leading-[1.1] mb-8">
              See how AI sees your brand. For free. Forever.
            </h1>
            
            <p className="text-lg md:text-xl text-[#101A31]/70 leading-relaxed mb-10 max-w-2xl">
              Full access to AI visibility intelligence. No paywalls. No trials. No limits. We're building the global index of how AI understands the world's brands — and every verified profile makes the index smarter.
            </p>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-[#101A31] text-white font-medium hover:bg-[#1a2a4a] transition-all duration-200"
              >
                Create your free AI profile
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/brands"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg border border-[#101A31]/20 text-[#101A31] font-medium hover:bg-[#101A31]/5 transition-all duration-200"
              >
                Browse the Index
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Harbor is Free */}
      <section className="py-20 md:py-28 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-[#101A31] text-center mb-16">
            Why Harbor is free
          </h2>
          
          <div className="grid md:grid-cols-3 gap-12 md:gap-8">
            {whyFreeReasons.map((reason, idx) => (
              <div key={idx} className="text-center">
                <h3 className="text-xl font-heading font-bold text-[#101A31] mb-4">
                  {reason.title}
                </h3>
                <p className="text-[#101A31]/60 leading-relaxed">
                  {reason.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 md:py-28 px-6 bg-[#f8fafc]">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            
            {/* Free Card - Dark, Bold */}
            <div className="relative rounded-2xl p-8 md:p-10 bg-[#101A31] text-white">
              <div className="absolute top-6 right-6">
                <span className="px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-medium border border-white/20">
                  Most Popular
                </span>
              </div>

              <div className="mb-8">
                <h3 className="text-2xl font-heading font-bold mb-2">
                  Free — for every brand
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-heading font-bold">$0</span>
                  <span className="text-white/50">forever</span>
                </div>
              </div>

              <Link
                href="/auth/signup"
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-lg bg-white text-[#101A31] font-semibold hover:bg-white/90 transition-all duration-200 mb-8"
              >
                Get started
                <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="space-y-4">
                {freeFeatures.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="text-white/80">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Enterprise Card - White, Minimal */}
            <div className="rounded-2xl p-8 md:p-10 bg-white border border-gray-200">
              <div className="mb-8">
                <h3 className="text-2xl font-heading font-bold text-[#101A31] mb-2">
                  Enterprise — for agencies & teams
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-heading font-bold text-[#101A31]">Custom</span>
                </div>
              </div>

              <Link
                href="/contact?inquiry=enterprise"
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-lg bg-[#101A31] text-white font-semibold hover:bg-[#1a2a4a] transition-all duration-200 mb-8"
              >
                Talk to Sales
                <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="space-y-4">
                {enterpriseFeatures.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-[#101A31]/70">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* What's Inside Your Free Account */}
      <section className="py-20 md:py-28 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-[#101A31] text-center mb-16">
            What's inside your free Harbor account
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {insideFeatures.map((feature, idx) => (
              <div key={idx} className="text-center">
                <div className="w-12 h-12 rounded-xl bg-[#101A31]/5 flex items-center justify-center mx-auto mb-5">
                  <feature.icon className="w-6 h-6 text-[#101A31]" />
                </div>
                <h3 className="text-lg font-heading font-bold text-[#101A31] mb-2">
                  {feature.title}
                </h3>
                <p className="text-[#101A31]/60 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
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
      <section className="py-20 md:py-28 px-6 bg-[#f8fafc]">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
            
            {/* Left Column - Header */}
            <div className="lg:col-span-2">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-[#101A31] mb-4 leading-tight">
                Get answers to your pricing questions
              </h2>
              <p className="text-gray-600 mb-2">
                Have a question we didn't answer?
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