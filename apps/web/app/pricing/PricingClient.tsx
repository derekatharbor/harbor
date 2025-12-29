// Path: apps/web/app/pricing/PricingClient.tsx

'use client'

import { useState } from 'react'
import { Check, ArrowRight, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import StickyNav from '@/components/marketing/StickyNav'
import MobileMenu from '@/components/marketing/MobileMenu'

const plans = [
  {
    name: 'Solo',
    monthlyPrice: 79,
    yearlyPrice: 790,
    description: 'For individual marketers and small brands getting started with AI visibility.',
    features: [
      '1 brand dashboard',
      '50 prompts/month',
      '3 competitors',
      'Weekly visibility reports',
      'Email support',
    ],
    cta: 'Start free trial',
    planId: 'solo',
    highlight: false,
  },
  {
    name: 'Agency',
    monthlyPrice: 199,
    yearlyPrice: 1990,
    description: 'For agencies and teams managing multiple brands and client accounts.',
    features: [
      '5 brand dashboards',
      '250 prompts/month',
      '10 competitors per brand',
      'Daily visibility reports',
      'Pitch workspaces',
      'White-label exports',
      'Priority support',
    ],
    cta: 'Start free trial',
    planId: 'agency',
    highlight: true,
    badge: 'POPULAR',
  },
  {
    name: 'Enterprise',
    monthlyPrice: null,
    yearlyPrice: null,
    description: 'For organizations needing custom solutions, API access, and dedicated support.',
    features: [
      'Unlimited dashboards',
      'Unlimited prompts',
      'Unlimited competitors',
      'Real-time monitoring',
      'API access',
      'Custom integrations',
      'Dedicated account manager',
    ],
    cta: 'Contact sales',
    planId: 'enterprise',
    highlight: false,
  },
]

const faqs = [
  {
    question: 'What is AI visibility?',
    answer: 'AI visibility measures how often and how favorably AI models like ChatGPT, Claude, Perplexity, and Gemini mention your brand when users ask questions related to your industry. As more people use AI for research and recommendations, your AI visibility directly impacts brand awareness and customer acquisition.',
  },
  {
    question: 'What AI platforms do you track?',
    answer: 'Harbor tracks ChatGPT, Perplexity, Claude, and Google Gemini. We monitor how each platform describes your brand, where you rank in recommendations, and which sources they cite.',
  },
  {
    question: 'What is a "prompt"?',
    answer: 'A prompt is a search query we monitor on your behalf. For example, "best CRM for startups" or "alternatives to Salesforce". We track how AI responds to these prompts daily and whether your brand is mentioned.',
  },
  {
    question: 'Can I try Harbor before committing?',
    answer: 'Yes! All paid plans include a 14-day free trial with full access to features. No credit card required to start. You can also explore our free Brand Index to see basic visibility data for any brand.',
  },
  {
    question: 'What are Pitch Workspaces?',
    answer: "Pitch Workspaces are a feature for agencies to create branded AI visibility reports for prospective clients. Show potential clients their current AI visibility, competitor positioning, and opportunities—all before they sign. It's a powerful way to demonstrate value and win new business.",
  },
  {
    question: 'Can I change plans or cancel anytime?',
    answer: "Absolutely. You can upgrade, downgrade, or cancel your subscription at any time. If you cancel, you'll retain access until the end of your billing period. No long-term contracts or cancellation fees.",
  },
]

// AI Model links for footer
const AI_PROMPT = encodeURIComponent("I'm researching AI visibility and want to understand how Harbor helps brands track and optimize how they appear in AI search results like ChatGPT, Claude, Perplexity, and Gemini. Summarize what you find from Harbor's website: https://useharbor.io. Start with what stands out about their platform (bullet points), then explain who it's built for and how it works.")

const AI_MODELS = [
  { name: 'ChatGPT', icon: '/icons/ai-chatgpt.svg', url: `https://chat.openai.com/?q=${AI_PROMPT}` },
  { name: 'Gemini', icon: '/icons/ai-gemini.svg', url: `https://gemini.google.com/app?q=${AI_PROMPT}` },
  { name: 'Perplexity', icon: '/icons/ai-perplexity.svg', url: `https://www.perplexity.ai/search?q=${AI_PROMPT}` },
  { name: 'Claude', icon: '/icons/ai-claude.svg', url: `https://claude.ai/new?q=${AI_PROMPT}` },
  { name: 'Grok', icon: '/icons/ai-grok.svg', url: `https://grok.x.ai/?q=${AI_PROMPT}` },
]

export default function PricingClient() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const getPrice = (plan: typeof plans[0]) => {
    if (plan.monthlyPrice === null) return 'Custom'
    return billingPeriod === 'monthly' 
      ? `$${plan.monthlyPrice}` 
      : `$${Math.round(plan.yearlyPrice / 12)}`
  }

  const getPeriod = (plan: typeof plans[0]) => {
    if (plan.monthlyPrice === null) return ''
    return '/month'
  }

  const getBilledText = (plan: typeof plans[0]) => {
    if (plan.monthlyPrice === null) return ''
    return billingPeriod === 'yearly' ? `Billed $${plan.yearlyPrice}/year` : ''
  }

  const getHref = (plan: typeof plans[0]) => {
    if (plan.planId === 'enterprise') return '/contact?inquiry=enterprise'
    return `/signup?plan=${plan.planId}&billing=${billingPeriod}`
  }

  return (
    <div className="min-h-screen">
      <StickyNav />
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} isDark={true} />

      {/* Dark Hero Section */}
      <section id="dark-section" className="bg-[#111111]">
        {/* Navigation */}
        <nav className="flex items-center justify-between px-6 lg:px-14 py-4 lg:py-6">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center mr-4">
              <img
                src="/images/harbor-logo-white.svg"
                alt="Harbor"
                className="h-7 lg:h-8 w-auto"
                onError={(e) => { e.currentTarget.src = '/images/Harbor_White_Logo.png'; e.currentTarget.className = 'h-7 lg:h-8 w-auto'; }}
              />
            </Link>
            <div className="hidden lg:flex items-center gap-1">
              <Link href="/#features" className="px-3 py-2 text-[15px] font-medium font-source-sans text-white/70 hover:text-white transition-colors rounded hover:bg-white/5">Product</Link>
              <Link href="/#solutions" className="px-3 py-2 text-[15px] font-medium font-source-sans text-white/70 hover:text-white transition-colors rounded hover:bg-white/5">Solutions</Link>
              <Link href="/pricing" className="px-3 py-2 text-[15px] font-medium font-source-sans text-white transition-colors rounded bg-white/10">Pricing</Link>
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-2.5">
            <Link href="/login" className="h-[41px] px-6 rounded-[7px] border border-[#333] text-[15px] font-medium font-space tracking-[0.69px] text-white hover:bg-white/5 transition-colors flex items-center">Login</Link>
            <Link href="/signup" className="h-[41px] px-6 rounded-[7px] bg-white text-black text-[15px] font-medium font-space tracking-[0.69px] hover:bg-gray-100 transition-colors flex items-center">Get started</Link>
          </div>
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 -mr-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </nav>

        {/* Hero Content */}
        <div className="max-w-[1200px] mx-auto px-6 lg:px-14 pt-12 lg:pt-20 pb-16 lg:pb-24">
          {/* Header */}
          <div className="text-center mb-10 lg:mb-14">
            <p className="text-[13px] font-medium font-source-code text-white/40 uppercase tracking-wider mb-4">Pricing</p>
            <h1 className="text-[32px] lg:text-[52px] font-semibold font-source-sans tracking-tight text-white leading-[1.1] mb-4">
              Pick the plan that<br />suits you best
            </h1>
            <p className="text-[15px] lg:text-[17px] font-normal font-source-code text-white/50 max-w-[440px] mx-auto">
              Start free, upgrade when you need more. All plans include a 14-day trial.
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="flex justify-center mb-10 lg:mb-12">
            <div className="inline-flex items-center gap-1 p-1 bg-white/[0.06] rounded-lg border border-white/10">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-4 py-2 text-[14px] font-medium font-source-sans rounded-md transition-all ${
                  billingPeriod === 'monthly'
                    ? 'bg-white text-black'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`px-4 py-2 text-[14px] font-medium font-source-sans rounded-md transition-all flex items-center gap-2 ${
                  billingPeriod === 'yearly'
                    ? 'bg-white text-black'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Yearly
                <span className={`text-[11px] px-1.5 py-0.5 rounded font-semibold ${
                  billingPeriod === 'yearly' 
                    ? 'bg-black/10 text-black/70' 
                    : 'bg-white/10 text-white/50'
                }`}>
                  Save 17%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 max-w-[1000px] mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-[16px] p-6 lg:p-7 flex flex-col ${
                  plan.highlight
                    ? 'bg-white text-black'
                    : 'bg-[#1a1a1a] border border-white/10 text-white'
                }`}
              >
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className={`text-[17px] font-semibold font-source-sans ${plan.highlight ? 'text-black' : 'text-white'}`}>
                      {plan.name}
                    </h3>
                    {plan.badge && (
                      <span 
                        className="px-2 py-0.5 text-[10px] font-bold font-source-code rounded-full text-black uppercase tracking-wide"
                        style={{
                          backgroundImage: 'url(/images/holographic-bg.png)',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      >
                        POPULAR
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-[38px] font-bold font-source-sans leading-none ${plan.highlight ? 'text-black' : 'text-white'}`}>
                      {getPrice(plan)}
                    </span>
                    {getPeriod(plan) && (
                      <span className={`text-[15px] font-normal ${plan.highlight ? 'text-black/50' : 'text-white/50'}`}>
                        {getPeriod(plan)}
                      </span>
                    )}
                  </div>
                  {getBilledText(plan) && (
                    <p className={`text-[13px] mt-1 ${plan.highlight ? 'text-black/50' : 'text-white/40'}`}>
                      {getBilledText(plan)}
                    </p>
                  )}
                  <p className={`text-[13px] mt-3 leading-relaxed ${plan.highlight ? 'text-black/60' : 'text-white/50'}`}>
                    {plan.description}
                  </p>
                </div>

                <ul className="space-y-2.5 mb-6 flex-1">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${plan.highlight ? 'text-black' : 'text-white/60'}`} />
                      <span className={`text-[13px] ${plan.highlight ? 'text-black/70' : 'text-white/60'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* AI Platform Logos */}
                <div className="flex items-center gap-2 mb-6">
                  {[
                    { name: 'ChatGPT', logo: '/logos/chatgpt-dark.svg' },
                    { name: 'Perplexity', logo: '/logos/perplexity-dark.svg' },
                    { name: 'Claude', logo: '/logos/claude-dark.svg' },
                    { name: 'Gemini', logo: '/logos/gemini-dark.svg' },
                  ].map((ai) => (
                    <div 
                      key={ai.name}
                      className={`w-7 h-7 rounded-full overflow-hidden flex items-center justify-center ${
                        plan.highlight ? 'bg-black/5' : 'bg-white/10'
                      }`}
                      title={ai.name}
                    >
                      <img src={ai.logo} alt={ai.name} className="w-4 h-4 object-contain" />
                    </div>
                  ))}
                </div>

                <Link
                  href={getHref(plan)}
                  className={`block w-full h-[44px] rounded-[8px] text-[14px] font-semibold font-source-sans flex items-center justify-center ${
                    plan.highlight
                      ? 'btn-black'
                      : 'bg-white text-black hover:bg-gray-100 transition-colors'
                  }`}
                >
                  <span>{plan.cta}</span>
                </Link>
              </div>
            ))}
          </div>

          {/* Platform logos */}
          <div className="mt-14 lg:mt-16 text-center">
            <p className="text-[13px] font-normal font-source-code text-white/30 mb-5">
              Tracking visibility across
            </p>
            <div className="flex items-center justify-center gap-6 lg:gap-10 flex-wrap">
              <span className="text-white/40 text-[14px] font-medium font-source-sans">ChatGPT</span>
              <span className="text-white/40 text-[14px] font-medium font-source-sans">Claude</span>
              <span className="text-white/40 text-[14px] font-medium font-source-sans">Perplexity</span>
              <span className="text-white/40 text-[14px] font-medium font-source-sans">Gemini</span>
            </div>
          </div>
        </div>
      </section>

      {/* Light Section - Pitch Workspaces */}
      <section id="light-section" className="bg-[#F6F5F3] py-16 lg:py-24">
        <div className="max-w-[1100px] mx-auto px-6 lg:px-14">
          <div className="bg-white rounded-[20px] border border-[#EFEEED] p-6 lg:p-10 flex flex-col lg:flex-row gap-6 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="flex-1 lg:pr-4">
              <h2 className="text-[24px] lg:text-[32px] font-semibold font-source-sans text-black leading-tight mb-3">
                Pitch Workspaces
              </h2>
              <p className="text-[15px] lg:text-[16px] font-normal font-source-code text-[#6F6E6E] leading-relaxed mb-5">
                Use pitch workspaces to win new business and showcase your expertise, by delivering competitive positioning data and AI visibility reports.
              </p>
              <Link
                href="/pitch"
                className="btn-black inline-flex items-center gap-2 h-[42px] px-5 rounded-[8px] text-[14px] font-semibold font-source-sans"
              >
                <span>Learn more</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Right - Image */}
            <div className="flex-1 w-full">
              <div className="bg-[#F6F5F3] rounded-[12px] overflow-hidden">
                <img 
                  src="/images/pitch-workspaces-preview.png" 
                  alt="Pitch Workspaces"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-[#F6F5F3] py-16 lg:py-24">
        <div className="max-w-[700px] mx-auto px-6 lg:px-14">
          <div className="text-center mb-10">
            <h2 className="text-[26px] lg:text-[32px] font-semibold font-source-sans text-black mb-3">
              FAQs
            </h2>
            <p className="text-[15px] font-normal font-source-code text-[#6F6E6E]">
              Got questions? We&apos;ve got answers.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-[12px] border border-[#EFEEED] overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="text-[15px] lg:text-[16px] font-medium font-source-sans text-black pr-4">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-black/40 flex-shrink-0 transition-transform ${
                      openFaq === idx ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <div className={`transition-all duration-200 overflow-hidden ${
                  openFaq === idx ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="px-5 pb-5">
                    <p className="text-[14px] font-normal font-source-code text-[#6F6E6E] leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-[#111111] py-16 lg:py-24">
        <div className="max-w-[700px] mx-auto px-6 lg:px-14 text-center">
          <h2 className="text-[26px] lg:text-[38px] font-semibold font-source-sans tracking-tight text-white leading-tight mb-4">
            <span
              style={{
                backgroundImage: 'url(/images/holographic-bg.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              UNLOCK YOUR
            </span>
            <br />
            <span
              style={{
                backgroundImage: 'url(/images/holographic-bg.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              AI VISIBILITY
            </span>
          </h2>
          <p className="text-[15px] lg:text-[17px] font-normal font-source-code text-white/50 mb-8 max-w-[380px] mx-auto">
            Start your free trial today. No credit card required.
          </p>
          <Link
            href="/signup"
            className="inline-flex h-12 px-8 rounded-[10px] bg-white text-black text-[15px] font-semibold font-source-sans items-center justify-center hover:bg-gray-100 transition-colors"
          >
            Get started free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-[#111111] pt-16 pb-8 border-t border-[#222]">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-14">
          {/* Ask AI About Harbor */}
          <div className="flex flex-col items-center mb-12 lg:mb-16">
            <p className="text-[#888] text-[15px] font-source-sans mb-4">Ask AI about Harbor</p>
            <div className="flex items-center gap-2">
              {AI_MODELS.map((model) => (
                <a key={model.name} href={model.url} target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-lg bg-[#1a1a1a] border border-[#333] flex items-center justify-center hover:bg-[#222] hover:border-[#444] transition-colors" title={`Ask ${model.name} about Harbor`}>
                  <img src={model.icon} alt={model.name} className="w-5 h-5 opacity-60" />
                </a>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-16 mb-12 lg:mb-16">
            <div className="col-span-2 lg:col-span-1 flex justify-center lg:justify-start mb-4 lg:mb-0">
              <img src="/images/Harbor_White_Logo.png" alt="Harbor" className="w-10 h-10" />
            </div>
            <div>
              <h4 className="text-white text-[16px] lg:text-[18px] font-semibold font-source-sans mb-4 lg:mb-6">Product</h4>
              <ul className="space-y-3 lg:space-y-4">
                <li><Link href="/features/brand-visibility" className="text-[#888] text-[14px] lg:text-[15px] font-source-sans hover:text-white transition-colors">Brand Visibility</Link></li>
                <li><Link href="/features/shopping" className="text-[#888] text-[14px] lg:text-[15px] font-source-sans hover:text-white transition-colors">Shopping Intelligence</Link></li>
                <li><Link href="/features/conversations" className="text-[#888] text-[14px] lg:text-[15px] font-source-sans hover:text-white transition-colors">Conversation Tracking</Link></li>
                <li><Link href="/features/analytics" className="text-[#888] text-[14px] lg:text-[15px] font-source-sans hover:text-white transition-colors">Website Analytics</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white text-[16px] lg:text-[18px] font-semibold font-source-sans mb-4 lg:mb-6">Company</h4>
              <ul className="space-y-3 lg:space-y-4">
                <li><Link href="/pricing" className="text-[#888] text-[14px] lg:text-[15px] font-source-sans hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/about" className="text-[#888] text-[14px] lg:text-[15px] font-source-sans hover:text-white transition-colors">About us</Link></li>
                <li><Link href="/blog" className="text-[#888] text-[14px] lg:text-[15px] font-source-sans hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/contact" className="text-[#888] text-[14px] lg:text-[15px] font-source-sans hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white text-[16px] lg:text-[18px] font-semibold font-source-sans mb-4 lg:mb-6">Resources</h4>
              <ul className="space-y-3 lg:space-y-4">
                <li><Link href="/index" className="text-[#888] text-[14px] lg:text-[15px] font-source-sans hover:text-white transition-colors">Brand Index</Link></li>
                <li><Link href="/docs" className="text-[#888] text-[14px] lg:text-[15px] font-source-sans hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="/help" className="text-[#888] text-[14px] lg:text-[15px] font-source-sans hover:text-white transition-colors">Help Center</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white text-[16px] lg:text-[18px] font-semibold font-source-sans mb-4 lg:mb-6">Contact</h4>
              <ul className="space-y-3 lg:space-y-4">
                <li><a href="mailto:hello@useharbor.io" className="text-[#888] text-[14px] lg:text-[15px] font-source-sans hover:text-white transition-colors">hello@useharbor.io</a></li>
                <li><a href="https://twitter.com/useharbor" target="_blank" rel="noopener noreferrer" className="text-[#888] text-[14px] lg:text-[15px] font-source-sans hover:text-white transition-colors">Twitter / X</a></li>
                <li><a href="https://linkedin.com/company/useharbor" target="_blank" rel="noopener noreferrer" className="text-[#888] text-[14px] lg:text-[15px] font-source-sans hover:text-white transition-colors">LinkedIn</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="flex flex-col lg:flex-row items-center justify-between pt-8 border-t border-[#222] gap-4">
            <p className="text-[#666] text-[14px] font-source-sans">© 2025 Harbor</p>
            <div className="flex items-center gap-6 lg:gap-8">
              <Link href="/privacy" className="text-[#666] text-[14px] font-source-sans hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="text-[#666] text-[14px] font-source-sans hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}