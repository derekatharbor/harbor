// apps/web/app/pricing/PricingClient.tsx
'use client'

import { useState } from 'react'
import { Check, ChevronDown, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import FrostedNav from '@/components/landing/FrostedNav'
import Footer from '@/components/landing/Footer'

const plans = [
  {
    id: 'free',
    name: 'Free',
    description: 'See how AI sees your brand. Explore your visibility profile with limited access.',
    price: 0,
    period: 'forever',
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
    cta: 'Get Started',
    href: '/auth/signup?plan=free',
    dark: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Full visibility intelligence with weekly scans and optimization tools to improve your AI presence.',
    price: 79,
    period: '/month',
    popular: true,
    features: [
      '1 brand dashboard',
      'Weekly fresh scans',
      '10 verification re-scans/week',
      '25 optimization actions/day',
      'All 4 intelligence modules',
      'Competitor tracking',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    href: '/auth/signup?plan=pro',
    dark: true,
  },
]

const faqs = [
  {
    question: 'What is a "fresh scan"?',
    answer: 'A fresh scan queries ChatGPT, Claude, Gemini, and Perplexity with the prompts your customers actually use. We analyze how each model talks about your brand, what they recommend, and where you rank against competitors. Pro plans include weekly fresh scans to track changes over time.',
  },
  {
    question: 'What are verification re-scans?',
    answer: 'After you make optimizations (like adding schema or updating content), verification re-scans check specific pages or prompts to confirm the changes improved your visibility. They\'re faster and more targeted than full scans.',
  },
  {
    question: 'What are the 4 intelligence modules?',
    answer: 'Harbor provides four views into your AI presence: Shopping Visibility (product recommendations), Brand Visibility (how AI describes you), Conversation Volumes (what people ask about you), and Website Analytics (how AI reads your site).',
  },
  {
    question: 'Can I try Pro before paying?',
    answer: 'Yes! Pro includes a 14-day free trial with full access to all features. No credit card required to start.',
  },
  {
    question: 'What happens when my trial ends?',
    answer: 'You\'ll be prompted to add a payment method to continue with Pro. If you choose not to, your account will switch to the Free plan and you\'ll retain read-only access to your brand profile.',
  },
  {
    question: 'Do you offer team or agency plans?',
    answer: 'We\'re building Agency plans for teams managing multiple brands. Join our waitlist or contact us at hello@useharbor.io to learn more.',
  },
  {
    question: 'How do I cancel?',
    answer: 'You can cancel anytime from your dashboard settings. Your Pro access continues until the end of your billing period.',
  },
]

export default function PricingClient() {
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  return (
    <div className="min-h-screen bg-white">
      <FrostedNav />

      {/* Hero Section */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-[#101A31] leading-tight mb-6">
            Pricing built for brands of all sizes
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Start free and see how AI sees your brand. Upgrade to Pro for full visibility intelligence and optimization tools.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 md:pb-32 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-2xl overflow-hidden ${
                  plan.dark
                    ? 'bg-[#101A31] text-white'
                    : 'bg-white border border-gray-200 text-[#101A31]'
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 rounded-full bg-white/10 text-white text-xs font-medium uppercase tracking-wider border border-white/20">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="p-8 lg:p-10">
                  {/* Plan Header */}
                  <div className="mb-8">
                    <h2 className={`text-2xl font-heading font-bold mb-3 ${
                      plan.dark ? 'text-white' : 'text-[#101A31]'
                    }`}>
                      {plan.name}
                    </h2>
                    <p className={`text-sm leading-relaxed ${
                      plan.dark ? 'text-white/70' : 'text-gray-600'
                    }`}>
                      {plan.description}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="mb-8">
                    <div className="flex items-baseline gap-1">
                      {plan.price === 0 ? (
                        <span className={`text-5xl lg:text-6xl font-heading font-bold ${
                          plan.dark ? 'text-white' : 'text-[#101A31]'
                        }`}>
                          Free
                        </span>
                      ) : (
                        <>
                          <span className={`text-5xl lg:text-6xl font-heading font-bold ${
                            plan.dark ? 'text-white' : 'text-[#101A31]'
                          }`}>
                            ${plan.price}
                          </span>
                          <span className={`text-lg ${
                            plan.dark ? 'text-white/60' : 'text-gray-500'
                          }`}>
                            {plan.period}
                          </span>
                        </>
                      )}
                    </div>
                    {plan.price === 0 && (
                      <p className={`text-sm mt-1 ${
                        plan.dark ? 'text-white/60' : 'text-gray-500'
                      }`}>
                        No credit card required
                      </p>
                    )}
                    {plan.price > 0 && (
                      <p className={`text-sm mt-1 ${
                        plan.dark ? 'text-white/60' : 'text-gray-500'
                      }`}>
                        14-day free trial included
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
                      What's included
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
          <div className="mt-8 p-6 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
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
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-300 text-[#101A31] font-medium hover:bg-white transition-colors whitespace-nowrap"
            >
              Contact Sales
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 md:py-32 px-6 bg-gray-50 border-t border-gray-200">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-[#101A31] mb-4">
              Frequently asked questions
            </h2>
            <p className="text-gray-600">
              Everything you need to know about Harbor pricing.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-5 text-left cursor-pointer"
                >
                  <span className="font-medium text-[#101A31] pr-4">
                    {faq.question}
                  </span>
                  <ChevronDown 
                    className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                      openFaq === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                
                <div className={`transition-all duration-200 overflow-hidden ${
                  openFaq === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="px-5 pb-5">
                    <p className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Still have questions */}
          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">
              Still have questions?
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 text-[#101A31] font-medium hover:underline"
            >
              Get in touch
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
