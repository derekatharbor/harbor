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
    subtitle: 'For brands exploring AI visibility',
    description: 'See how AI sees your brand. Explore your visibility profile and claim your public page.',
    price: 0,
    features: [
      'View your brand profile',
      'Basic visibility score',
      'See how AI describes you',
      'Public brand page',
    ],
    limitations: [
      'No weekly scans',
      'No optimization tools',
      'No competitor tracking',
    ],
    cta: 'Get Started Free',
    href: '/auth/signup?plan=free',
    dark: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    subtitle: 'For brands serious about AI presence',
    description: 'Full visibility intelligence with weekly scans and optimization tools to improve how AI represents you.',
    price: 79,
    popular: true,
    features: [
      'Everything in Free',
      'Weekly fresh scans',
      '10 verification re-scans/week',
      '25 optimization actions/day',
      'All 4 intelligence modules',
      'Competitor tracking',
      'Priority support',
    ],
    cta: 'Get Started',
    href: '/auth/signup?plan=pro',
    dark: true,
  },
]

const faqs = [
  {
    question: 'Is the Free plan really free forever?',
    answer: 'Yes. You can claim your brand profile, see your visibility score, and keep your public page live indefinitely. No credit card, no trial period, no catch.',
  },
  {
    question: 'What do I get with Pro that I don\'t get for free?',
    answer: 'Pro gives you ongoing monitoring. You get weekly scans to track how your visibility changes, tools to improve your AI presence, and the ability to see what competitors are doing. Free is a snapshot; Pro is the full picture over time.',
  },
  {
    question: 'Can I cancel anytime?',
    answer: 'Yes. Cancel from your dashboard whenever you want. You\'ll keep Pro access through the end of your billing period, then you\'ll drop back to Free.',
  },
  {
    question: 'How does annual billing work?',
    answer: 'Pay upfront for a year and save 20%. That\'s $63/month instead of $79, billed as one payment of $759. You can switch between monthly and annual anytime from your dashboard.',
  },
  {
    question: 'What if I manage multiple brands?',
    answer: 'We\'re building Agency plans for teams and consultants. Contact us at hello@useharbor.io to get early access.',
  },
]

export default function PricingClient() {
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')

  const getPrice = (basePrice: number) => {
    if (billingCycle === 'annual') {
      return Math.round(basePrice * 0.8) // 20% off
    }
    return basePrice
  }

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
              <Link href="/" className="flex items-center">
                <Image 
                  src="/images/harbor-dark-solo.svg" 
                  alt="Harbor" 
                  width={120} 
                  height={32}
                  className="h-7 md:h-8 w-auto"
                />
              </Link>

              <div className="flex items-center space-x-2 md:space-x-4">
                <button
                  onClick={() => setIsMenuOpen(true)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
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

      {/* Hero Section with Wireframe */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 px-6 overflow-hidden">
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
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-[#101A31] leading-tight mb-6">
            Simple, transparent pricing
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Start free and see how AI sees your brand. Upgrade to Pro for full visibility intelligence.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 md:pb-28 px-6">
        <div className="max-w-5xl mx-auto">
          
          {/* Billing Toggle */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex items-center p-1 rounded-full bg-gray-100 border border-gray-200">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-[#101A31] shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                  billingCycle === 'annual'
                    ? 'bg-white text-[#101A31] shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Annual
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-2xl overflow-hidden transition-all duration-200 ${
                  plan.dark
                    ? 'bg-[#101A31] text-white shadow-2xl shadow-[#101A31]/20'
                    : 'bg-white text-[#101A31] shadow-xl shadow-gray-200/50 border border-gray-100'
                }`}
              >
                {/* Wireframe pattern for dark card */}
                {plan.dark && (
                  <div 
                    className="absolute inset-0 pointer-events-none opacity-[0.06]"
                    style={{
                      backgroundImage: 'url(/wireframe-hero.png)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                )}

                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute top-4 right-4 z-10">
                    <span className="px-3 py-1 rounded-full bg-white/10 text-white text-xs font-medium uppercase tracking-wider border border-white/20">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="relative z-10 p-8 lg:p-10">
                  {/* Plan Header */}
                  <div className="mb-6">
                    <h2 className={`text-2xl font-heading font-bold mb-1 ${
                      plan.dark ? 'text-white' : 'text-[#101A31]'
                    }`}>
                      {plan.name}
                    </h2>
                    <p className={`text-sm font-medium ${
                      plan.dark ? 'text-cyan-400' : 'text-emerald-600'
                    }`}>
                      {plan.subtitle}
                    </p>
                  </div>

                  {/* Description */}
                  <p className={`text-sm leading-relaxed mb-6 ${
                    plan.dark ? 'text-white/70' : 'text-gray-600'
                  }`}>
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="mb-8">
                    <div className="flex items-baseline gap-1">
                      {plan.price === 0 ? (
                        <span className={`text-5xl lg:text-6xl font-heading font-bold ${
                          plan.dark ? 'text-white' : 'text-[#101A31]'
                        }`}>
                          $0
                        </span>
                      ) : (
                        <>
                          <span className={`text-5xl lg:text-6xl font-heading font-bold ${
                            plan.dark ? 'text-white' : 'text-[#101A31]'
                          }`}>
                            ${getPrice(plan.price)}
                          </span>
                        </>
                      )}
                      <span className={`text-lg ${
                        plan.dark ? 'text-white/60' : 'text-gray-500'
                      }`}>
                        /month
                      </span>
                    </div>
                    {plan.price > 0 && billingCycle === 'annual' && (
                      <p className={`text-sm mt-1 ${
                        plan.dark ? 'text-emerald-400' : 'text-emerald-600'
                      }`}>
                        ${getPrice(plan.price) * 12}/year · Save ${(plan.price * 12) - (getPrice(plan.price) * 12)}/year
                      </p>
                    )}
                  </div>

                  {/* CTA Button */}
                  <Link
                    href={plan.href}
                    className={`flex items-center justify-center gap-2 w-full py-4 rounded-xl font-semibold transition-all duration-200 mb-8 ${
                      plan.dark
                        ? 'bg-white text-[#101A31] hover:bg-gray-100'
                        : 'bg-[#101A31] text-white hover:bg-[#1a2a4a]'
                    }`}
                  >
                    {plan.cta}
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  {/* Features */}
                  <div>
                    <p className={`text-xs uppercase tracking-wider font-medium mb-4 ${
                      plan.dark ? 'text-white/50' : 'text-gray-400'
                    }`}>
                      Key Features
                    </p>
                    <ul className="space-y-3">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                            plan.dark ? 'text-cyan-400' : 'text-emerald-500'
                          }`} strokeWidth={2} />
                          <span className={`text-sm ${
                            plan.dark ? 'text-white/90' : 'text-gray-700'
                          }`}>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* Limitations for Free plan */}
                    {plan.limitations && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <ul className="space-y-3">
                          {plan.limitations.map((limitation, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                              <span className="w-5 h-5 flex-shrink-0 mt-0.5 text-center text-gray-300">–</span>
                              <span className="text-sm text-gray-400">
                                {limitation}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Enterprise Callout */}
          <div className="mt-8 p-6 md:p-8 rounded-2xl bg-white border border-gray-100 shadow-lg shadow-gray-100/50 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-heading font-bold text-[#101A31] mb-1">
                Need more?
              </h3>
              <p className="text-gray-600 text-sm">
                Agency and Enterprise plans coming soon. Unlimited brands, API access, and dedicated support.
              </p>
            </div>
            <Link
              href="/contact?inquiry=enterprise"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 text-[#101A31] font-medium hover:bg-gray-50 transition-colors whitespace-nowrap"
            >
              Contact Sales
              <ArrowRight className="w-4 h-4" />
            </Link>
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

      {/* FAQ Section - Plaid-inspired two column layout */}
      <section className="py-20 md:py-28 px-6 bg-[#f1f5f9]">
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

      {/* Footer with Rounded Top */}
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