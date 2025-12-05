// apps/web/app/pricing/PricingClient.tsx
'use client'

import { useState } from 'react'
import { Check, Plus, Minus, ArrowRight, FileText } from 'lucide-react'
import Link from 'next/link'
import Nav from '@/components/landing-new/Nav'
import Footer from '@/components/landing-new/Footer'

const brandPlans = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'For individuals exploring how AI talks about their brand.',
    features: [
      'ChatGPT tracking only',
      '50 prompts tracked',
      'Email support',
    ],
    cta: 'Get Started',
    href: '/auth/signup',
    popular: false,
    hasToggle: false,
  },
  {
    name: 'Starter',
    price: '$79',
    yearlyPrice: '$66',
    period: '/month',
    description: 'For brands ready to monitor visibility across multiple AI platforms.',
    features: [
      '3 Answer Engines tracked',
      '100 prompts tracked',
      '5 competitors tracked',
      'Email support',
    ],
    cta: 'Get Started',
    href: '/auth/signup?plan=starter',
    popular: false,
    hasToggle: true,
  },
  {
    name: 'Growth',
    price: '$199',
    yearlyPrice: '$166',
    period: '/month',
    description: 'For growing brands that need comprehensive AI visibility and competitor tracking.',
    features: [
      '4 Answer Engines tracked',
      '200 prompts tracked',
      '10 competitors tracked',
      'Priority support',
    ],
    cta: 'Get Started',
    href: '/auth/signup?plan=growth',
    popular: true,
    hasToggle: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    subtitle: 'Tailored packages',
    description: 'For large organizations building and orchestrating AEO marketing campaigns.',
    features: [
      '4 Answer Engines tracked',
      'Unlimited prompts',
      '20+ competitors tracked',
      'Dedicated Slack support',
      'SSO/SAML + SOC2 compliance',
    ],
    cta: 'Get a Demo',
    href: '/contact?inquiry=enterprise',
    popular: false,
    hasToggle: false,
  },
]

const agencyPlans = [
  {
    name: 'Agency Growth',
    price: '$149',
    yearlyPrice: '$124',
    period: '/month + add-ons',
    description: 'For agencies pitching prospects and managing clients, offering comprehensive brand visibility across platforms.',
    features: [
      '3 Answer Engines tracked',
      '100 prompts per client',
      '5 competitors per client',
      'Up to 5 client dashboards',
      '2 team seats',
      'Consolidated billing',
    ],
    cta: 'Get Started',
    href: '/auth/signup?plan=agency-growth',
    popular: false,
    hasToggle: true,
  },
  {
    name: 'Agency Enterprise',
    price: 'Custom',
    period: '',
    subtitle: 'Tailored packages',
    description: 'For large agencies and networks managing dozens of clients with advanced AI visibility monitoring.',
    features: [
      '4 Answer Engines tracked',
      'Unlimited prompts',
      'Unlimited competitors',
      'Unlimited dashboards',
      'Unlimited seats',
      'Dedicated agency partner',
      'Premium Slack support',
    ],
    cta: 'Get a Demo',
    href: '/contact?inquiry=agency-enterprise',
    popular: false,
    hasToggle: false,
  },
]

const faqs = [
  {
    question: 'What are Answer Engines?',
    answer: 'Answer Engines are AI platforms that respond to user queries — like ChatGPT, Claude, Gemini, and Perplexity. We track how your brand appears in their responses.',
  },
  {
    question: 'What counts as a tracked prompt?',
    answer: 'A tracked prompt is any search query you want to monitor. For example, "best CRM for startups" or "alternatives to Salesforce". We check how AI responds to these prompts and whether your brand is mentioned.',
  },
  {
    question: 'Can I upgrade or downgrade anytime?',
    answer: 'Yes. Upgrade instantly, downgrade at the end of your billing cycle. No lock-in.',
  },
  {
    question: 'What\'s the difference between Brand and Agency plans?',
    answer: 'Brand plans are for companies tracking their own visibility. Agency plans include multi-client dashboards, team seats, and white-label reporting for managing multiple brands.',
  },
  {
    question: 'Do you offer annual billing?',
    answer: 'Yes! Save up to 17% with annual billing. Toggle the yearly option on any plan to see discounted pricing.',
  },
]

export default function PricingClient() {
  const [planType, setPlanType] = useState<'brands' | 'agencies'>('brands')
  const [yearlyBilling, setYearlyBilling] = useState<Record<string, boolean>>({})
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const plans = planType === 'brands' ? brandPlans : agencyPlans

  const toggleYearly = (planName: string) => {
    setYearlyBilling(prev => ({ ...prev, [planName]: !prev[planName] }))
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Nav />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 px-6 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6">
            Flexible plans for<br />every marketing team
          </h1>
          
          <p className="text-lg text-white/50 leading-relaxed mb-10 max-w-2xl mx-auto">
            From bootstrapped startups to global enterprises, Harbor delivers the visibility, insights, and control you need to stand out in Answer Engines.
          </p>
          
          {/* Plan Type Toggle */}
          <div className="inline-flex items-center p-1 bg-white/5 border border-white/10 rounded-full">
            <button
              onClick={() => setPlanType('brands')}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                planType === 'brands'
                  ? 'bg-white text-black'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              For brands
            </button>
            <button
              onClick={() => setPlanType('agencies')}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                planType === 'agencies'
                  ? 'bg-white text-black'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              For agencies
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 md:pb-28 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Cards container with dividers */}
          <div className="relative border-t border-white/[0.08]">
            <div className={`grid ${plans.length === 4 ? 'md:grid-cols-4' : 'md:grid-cols-2'}`}>
              {plans.map((plan, idx) => (
                <div 
                  key={idx} 
                  className={`relative p-8 md:p-10 ${
                    idx !== plans.length - 1 ? 'border-r border-white/[0.08]' : ''
                  }`}
                >
                  {/* Popular glow effect */}
                  {plan.popular && (
                    <div 
                      className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
                      style={{
                        background: 'radial-gradient(ellipse at top, rgba(59, 130, 246, 0.15) 0%, transparent 70%)'
                      }}
                    />
                  )}

                  <div className="relative">
                    {/* Plan name + badge */}
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                      {plan.popular && (
                        <span className="px-2.5 py-1 bg-white/10 text-white/80 text-xs rounded-full font-medium">
                          Popular
                        </span>
                      )}
                    </div>
                    
                    {/* Price */}
                    <div className="mb-1">
                      <span className="text-white font-medium">
                        {yearlyBilling[plan.name] && plan.yearlyPrice ? plan.yearlyPrice : plan.price}
                      </span>
                      <span className="text-white/50">{plan.period}</span>
                    </div>

                    {/* Yearly toggle OR subtitle */}
                    {plan.hasToggle ? (
                      <button
                        onClick={() => toggleYearly(plan.name)}
                        className="flex items-center gap-2 mb-6 group"
                      >
                        <div className={`w-9 h-5 rounded-full relative transition-colors ${
                          yearlyBilling[plan.name] ? 'bg-cyan-500' : 'bg-white/20'
                        }`}>
                          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${
                            yearlyBilling[plan.name] ? 'left-4' : 'left-0.5'
                          }`} />
                        </div>
                        <span className="text-white/50 text-sm group-hover:text-white/70">
                          Billed yearly
                        </span>
                      </button>
                    ) : plan.subtitle ? (
                      <div className="flex items-center gap-2 text-white/50 text-sm mb-6">
                        <FileText className="w-4 h-4" />
                        {plan.subtitle}
                      </div>
                    ) : (
                      <div className="mb-6" />
                    )}

                    {/* Description */}
                    <p className="text-white/40 text-sm mb-8 leading-relaxed min-h-[60px]">
                      {plan.description}
                    </p>

                    {/* Features */}
                    <div className="space-y-3 mb-8">
                      {plan.features.map((feature, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-white/50 flex-shrink-0 mt-0.5" />
                          <span className="text-white/70 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* CTA */}
                    <Link
                      href={plan.href}
                      className={`flex items-center justify-center w-full py-3 rounded-lg font-medium transition-all ${
                        plan.price === 'Custom'
                          ? 'bg-transparent border border-white/20 text-white hover:bg-white/5'
                          : 'bg-white/10 text-white hover:bg-white/15'
                      }`}
                    >
                      {plan.cta}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 md:py-28 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/[0.08] p-8 md:p-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Frequently asked questions
            </h2>
            <p className="text-white/50 mb-10">
              Have another question?{' '}
              <Link href="/contact" className="text-white underline underline-offset-4 hover:text-white/80">
                Talk with our team
              </Link>
            </p>

            <div className="space-y-0">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className={`border-b border-white/[0.08] ${index === 0 ? 'border-t' : ''}`}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full flex items-center justify-between py-5 text-left cursor-pointer group"
                  >
                    <span className="font-medium text-white pr-4 group-hover:text-white/80 transition-colors">
                      {faq.question}
                    </span>
                    {openFaq === index ? (
                      <Minus className="w-5 h-5 text-white/40 flex-shrink-0" />
                    ) : (
                      <Plus className="w-5 h-5 text-white/40 flex-shrink-0" />
                    )}
                  </button>
                  
                  <div className={`transition-all duration-200 overflow-hidden ${
                    openFaq === index ? 'max-h-96 opacity-100 pb-5' : 'max-h-0 opacity-0'
                  }`}>
                    <p className="text-white/50 leading-relaxed pr-8">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}