// apps/web/app/pricing/PricingClient.tsx
'use client'

import { useState } from 'react'
import { Check, Plus, Minus, ArrowRight, Menu } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import FullscreenMenu from '@/components/landing/FullscreenMenu'

const plans = [
  {
    id: 'free',
    name: 'Free',
    description: 'Full platform access for individual brands. No limits on what matters.',
    price: '$0',
    priceDetail: 'forever',
    cta: 'Get started',
    href: '/auth/signup',
    featured: true,
    features: [
      'Weekly AI visibility scans',
      'All 4 intelligence modules',
      'Competitor tracking',
      'Optimization recommendations',
      'Public brand profile',
      'AI-ready JSON feed',
      'Unlimited profile updates',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For agencies and teams managing multiple brands with advanced needs.',
    price: 'Custom',
    priceDetail: 'contact us',
    cta: 'Talk to sales',
    href: '/contact?inquiry=enterprise',
    featured: false,
    features: [
      'Everything in Free',
      'Multi-brand management',
      'API access',
      'Advanced analysis scans',
      'Custom onboarding',
      'Dedicated support',
      'SSO & team controls',
    ],
  },
]

const comparisonFeatures = [
  { name: 'AI visibility dashboard', free: true, enterprise: true },
  { name: 'Weekly scans (4 models)', free: true, enterprise: true },
  { name: 'Competitor insights', free: true, enterprise: true },
  { name: 'Public brand profile', free: true, enterprise: true },
  { name: 'Optimization recommendations', free: true, enterprise: true },
  { name: 'AI-ready JSON feed', free: true, enterprise: true },
  { name: 'Share cards for LinkedIn', free: true, enterprise: true },
  { name: 'Multiple brands', free: false, enterprise: true },
  { name: 'API access', free: false, enterprise: true },
  { name: 'Deep analysis scans', free: false, enterprise: true },
  { name: 'White-label reports', free: false, enterprise: true },
  { name: 'Dedicated support', free: false, enterprise: true },
]

const faqs = [
  {
    question: 'Is Harbor really free?',
    answer: 'Yes. Full platform access for individual brands—no credit card, no trial period, no surprise fees. We believe every brand should understand how AI sees them.',
  },
  {
    question: 'Why is Harbor free?',
    answer: 'Brands aren\'t our customers—they\'re our data partners. The more brands that verify their AI-visible data, the more accurate AI becomes for everyone. We monetize through enterprise features, not individual brands.',
  },
  {
    question: 'What about advanced scans?',
    answer: 'Basic AI visibility scans are free and unlimited. Optional deep-analysis scans cost $0.75 per scan—only when you request them. Most brands never need them.',
  },
  {
    question: 'Will you add paid features later?',
    answer: 'Only for enterprise. Multi-brand management, API access, and advanced analysis are paid features for agencies. Individual brands will always have free access to the core platform.',
  },
  {
    question: 'What if I manage multiple brands?',
    answer: 'Enterprise plans support unlimited brands with centralized management. Reach out and we\'ll set you up with early access.',
  },
]

export default function PricingClient() {
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      
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

      {/* Header */}
      <section className="pt-32 pb-8 md:pt-40 md:pb-12 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm font-mono uppercase tracking-wider text-[#101A31]/60 mb-4">
            Pricing
          </p>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-[#101A31] leading-tight mb-4">
            Free for brands. Built for scale.
          </h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Full AI visibility for every brand. Enterprise features for teams that need more.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-16 md:pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-8 ${
                  plan.featured
                    ? 'bg-[#101A31] text-white'
                    : 'bg-white text-[#101A31] border border-gray-200'
                }`}
              >
                {plan.featured && (
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/30">
                      Most popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h2 className="text-xl font-heading font-bold mb-2">{plan.name}</h2>
                  <p className={`text-sm ${plan.featured ? 'text-white/60' : 'text-gray-500'}`}>
                    {plan.description}
                  </p>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-heading font-bold">{plan.price}</span>
                  <span className={`text-sm ml-2 ${plan.featured ? 'text-white/50' : 'text-gray-400'}`}>
                    {plan.priceDetail}
                  </span>
                </div>

                <Link
                  href={plan.href}
                  className={`flex items-center justify-center gap-2 w-full py-3 rounded-lg font-medium transition-all duration-200 mb-8 ${
                    plan.featured
                      ? 'bg-white text-[#101A31] hover:bg-white/90'
                      : 'bg-[#101A31] text-white hover:bg-[#1a2a4a]'
                  }`}
                >
                  {plan.cta}
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <div className="space-y-3">
                  <p className={`text-xs font-medium uppercase tracking-wider ${plan.featured ? 'text-white/40' : 'text-gray-400'}`}>
                    Key features
                  </p>
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.featured ? 'text-emerald-400' : 'text-emerald-500'}`} />
                      <span className={`text-sm ${plan.featured ? 'text-white/80' : 'text-gray-600'}`}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Subtext */}
          <p className="text-center text-sm text-gray-500 mt-6">
            No credit card required · Set up in 2 minutes
          </p>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-16 md:py-20 px-6 bg-white border-y border-gray-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-heading font-bold text-[#101A31] text-center mb-12">
            Compare plans
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 pr-4 font-medium text-gray-500 text-sm">Features</th>
                  <th className="text-center py-4 px-4 font-heading font-bold text-[#101A31]">Free</th>
                  <th className="text-center py-4 pl-4 font-heading font-bold text-[#101A31]">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((feature, idx) => (
                  <tr key={idx} className="border-b border-gray-100">
                    <td className="py-4 pr-4 text-sm text-gray-700">{feature.name}</td>
                    <td className="py-4 px-4 text-center">
                      {feature.free ? (
                        <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="py-4 pl-4 text-center">
                      {feature.enterprise ? (
                        <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

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