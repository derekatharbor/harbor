// Path: apps/web/app/pricing/PricingClient.tsx

'use client'

import { useState } from 'react'
import { Check, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Nav from '@/components/landing-new/Nav'
import Footer from '@/components/landing-new/Footer'

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '',
    description: 'See how AI talks about your brand across all major platforms.',
    features: [
      '50 prompts tracked',
      '4 AI platforms',
      '2 competitors',
      'Daily monitoring',
      'Email support',
    ],
    cta: 'Get Started',
    href: '/auth/signup',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$99',
    period: '/month',
    description: 'For brands serious about understanding and improving their AI visibility.',
    features: [
      '100 prompts tracked',
      '4 AI platforms',
      '5 competitors',
      'Daily monitoring',
      'Visibility trends',
      'Source citations',
      'Priority support',
    ],
    cta: 'Start Pro',
    href: '/auth/signup?plan=pro',
    highlight: true,
  },
  {
    name: 'Growth',
    price: '$179',
    period: '/month',
    description: 'For teams managing multiple brands or tracking competitive markets.',
    features: [
      '200 prompts tracked',
      '4 AI platforms',
      '10 competitors',
      'Daily monitoring',
      'Advanced analytics',
      'Team seats',
      'API access',
      'Slack alerts',
    ],
    cta: 'Start Growth',
    href: '/auth/signup?plan=growth',
    highlight: false,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For organizations requiring scale, security, and dedicated support.',
    features: [
      'Unlimited prompts',
      '4 AI platforms',
      '20+ competitors',
      'Daily monitoring',
      'SSO / SAML',
      'Dedicated success manager',
      'Custom integrations',
      'SLA guarantee',
    ],
    cta: 'Contact Sales',
    href: '/contact?inquiry=enterprise',
    highlight: false,
  },
]

const faqs = [
  {
    question: 'What AI platforms do you track?',
    answer: 'Harbor tracks ChatGPT, Perplexity, Claude, and Google Gemini. We monitor how each platform describes your brand, where you rank in recommendations, and which sources they cite.',
  },
  {
    question: 'What is a "prompt"?',
    answer: 'A prompt is a search query we monitor on your behalf. For example, "best CRM for startups" or "alternatives to Salesforce". We track how AI responds to these prompts daily and whether your brand is mentioned.',
  },
  {
    question: 'How often is data refreshed?',
    answer: 'All plans include daily monitoring. We query each AI platform every 24 hours for your tracked prompts and update your dashboard with the latest results.',
  },
  {
    question: 'Can I change plans later?',
    answer: 'Yes. Upgrade instantly, downgrade at the end of your billing cycle. No long-term contracts.',
  },
  {
    question: 'Do you offer annual billing?',
    answer: 'Yes. Contact us for annual pricing with 2 months free.',
  },
]

export default function PricingClient() {
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  return (
    <div className="min-h-screen bg-[#0B0B0C]">
      <Nav />

      {/* Hero */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-semibold text-white leading-tight mb-6 font-['Space_Grotesk']">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-white/50 leading-relaxed max-w-xl mx-auto">
            Start free. Upgrade when you need more prompts, competitors, or team features.
          </p>
        </div>
      </section>

      {/* Pricing Grid */}
      <section className="pb-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-px bg-white/[0.06] rounded-2xl overflow-hidden">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative bg-[#0B0B0C] p-8 flex flex-col ${
                  plan.highlight ? 'ring-1 ring-white/20' : ''
                }`}
              >
                {plan.highlight && (
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                )}

                {/* Header */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-lg font-medium text-white font-['Space_Grotesk']">
                      {plan.name}
                    </h3>
                    {plan.highlight && (
                      <span className="text-[10px] uppercase tracking-wider text-white/40 bg-white/[0.06] px-2 py-0.5 rounded">
                        Popular
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-3xl font-semibold text-white font-['Space_Grotesk']">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-white/40 text-sm">{plan.period}</span>
                    )}
                  </div>
                  <p className="text-white/40 text-sm leading-relaxed min-h-[48px]">
                    {plan.description}
                  </p>
                </div>

                {/* Features */}
                <div className="flex-1 mb-8">
                  <div className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <Check className="w-4 h-4 text-white/30 flex-shrink-0 mt-0.5" />
                        <span className="text-white/60 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <Link
                  href={plan.href}
                  className={`flex items-center justify-center gap-2 w-full py-3 rounded-lg text-sm font-medium transition-all ${
                    plan.highlight
                      ? 'bg-white text-black hover:bg-white/90'
                      : 'bg-white/[0.06] text-white hover:bg-white/[0.1]'
                  }`}
                >
                  {plan.cta}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform logos */}
      <section className="pb-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-white/30 text-sm mb-8">Tracking visibility across</p>
          <div className="flex items-center justify-center gap-12 flex-wrap">
            <div className="text-white/40 font-medium">ChatGPT</div>
            <div className="text-white/40 font-medium">Perplexity</div>
            <div className="text-white/40 font-medium">Claude</div>
            <div className="text-white/40 font-medium">Gemini</div>
          </div>
        </div>
      </section>

      {/* Comparison note */}
      <section className="pb-24 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-8">
            <h3 className="text-white font-medium mb-3 font-['Space_Grotesk']">
              How we compare
            </h3>
            <p className="text-white/50 text-sm leading-relaxed mb-4">
              Harbor tracks 4 AI platforms with daily monitoring on all plans. 
              Competitors charge $200+ for 100 prompts and often limit you to 3 platforms 
              with weekly updates. Our free tier alone offers more than most paid entry plans.
            </p>
            <p className="text-white/30 text-sm">
              We believe AI visibility monitoring should be accessible, not gated behind enterprise contracts.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="pb-24 px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold text-white mb-8 font-['Space_Grotesk']">
            Questions
          </h2>
          
          <div className="space-y-0">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border-b border-white/[0.06]"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between py-5 text-left"
                >
                  <span className="text-white/80 text-sm pr-4">
                    {faq.question}
                  </span>
                  <span className="text-white/30 text-lg">
                    {openFaq === index ? '−' : '+'}
                  </span>
                </button>
                
                <div className={`transition-all duration-200 overflow-hidden ${
                  openFaq === index ? 'max-h-48 opacity-100 pb-5' : 'max-h-0 opacity-0'
                }`}>
                  <p className="text-white/40 text-sm leading-relaxed pr-8">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="pb-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-semibold text-white mb-4 font-['Space_Grotesk']">
            Ready to see how AI sees you?
          </h2>
          <p className="text-white/50 mb-8">
            Start free. No credit card required.
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 px-8 py-3 bg-white text-black rounded-lg font-medium hover:bg-white/90 transition-colors"
          >
            Get Started
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}