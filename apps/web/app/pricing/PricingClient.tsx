// apps/web/app/pricing/PricingClient.tsx
'use client'

import { useState, useEffect } from 'react'
import { Check, Plus, Minus, ArrowRight, BarChart3, Users, Sparkles, Globe, Database, RefreshCw, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Nav from '@/components/landing-new/Nav'
import Footer from '@/components/landing-new/Footer'

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
    title: 'Pay only when you scale',
    description: 'Individual brands use Harbor free forever. Agency and Enterprise plans exist for teams managing multiple brands.',
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

const agencyFeatures = [
  'Everything in Free',
  'Up to 5 brands',
  'Deep analysis scans',
  'Priority support',
  'API access (coming soon)',
  'White-label reports (coming soon)',
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
    answer: 'Yes — individual brands can use Harbor completely free, forever. You get full access to the AI visibility dashboard, weekly scans, and optimization recommendations.',
  },
  {
    question: 'What\'s the difference between Free and Agency?',
    answer: 'Free is for individual brands (1 dashboard). Agency is for teams managing up to 5 brands, with deep analysis scans and priority support.',
  },
  {
    question: 'What are Deep Analysis Scans?',
    answer: 'Deep scans run extended AI queries across more models and prompts for comprehensive visibility insights. Available on Agency plans or as one-time purchases ($7.99 each).',
  },
  {
    question: 'Can I upgrade or downgrade anytime?',
    answer: 'Yes. Upgrade instantly, downgrade at the end of your billing cycle. No lock-in.',
  },
  {
    question: 'What if I manage more than 5 brands?',
    answer: 'Enterprise plans offer unlimited brands, SSO, custom integrations, and dedicated support. Contact us for pricing.',
  },
]

export default function PricingClient() {
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [orgId, setOrgId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        const { data: role } = await supabase
          .from('user_roles')
          .select('org_id')
          .eq('user_id', user.id)
          .single()
        
        if (role?.org_id) {
          setOrgId(role.org_id)
        }
      }
    }
    getUser()
  }, [])

  const handleAgencyCheckout = async () => {
    if (!user) {
      router.push('/auth/signup?plan=agency')
      return
    }

    if (!orgId) {
      router.push('/onboarding?plan=agency')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          orgId: orgId,
          billingPeriod: billingPeriod,
        }),
      })

      const data = await response.json()
      
      if (data.url) {
        window.location.href = data.url
      } else {
        console.error('Checkout error:', data.error)
        alert('Failed to start checkout. Please try again.')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Failed to start checkout. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Nav />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl">
            {/* Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-8">
              <div className="w-2 h-2 bg-emerald-400 rounded-full" />
              <span className="text-white/60 text-sm">Simple pricing</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-8">
              See how AI sees your brand.{' '}
              <span className="text-white/50">For free. Forever.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/50 leading-relaxed mb-10 max-w-2xl">
              Full access to AI visibility intelligence. No paywalls. No trials. No limits. We're building the global index of how AI understands the world's brands.
            </p>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Link
                href="/auth/signup"
                className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-black font-semibold hover:bg-white/90 transition-all"
              >
                Create your free AI profile
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/brands"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-all"
              >
                Browse the Index
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Harbor is Free */}
      <section className="py-20 md:py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-16">
            Why Harbor is free
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {whyFreeReasons.map((reason, idx) => (
              <div key={idx} className="bg-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/[0.08] p-8 text-center">
                <h3 className="text-xl font-semibold text-white mb-4">
                  {reason.title}
                </h3>
                <p className="text-white/50 leading-relaxed">
                  {reason.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 md:py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Free Card */}
            <div className="bg-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/[0.08] p-8 md:p-10">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">
                  Free — for every brand
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-white">$0</span>
                  <span className="text-white/40">forever</span>
                </div>
              </div>

              <Link
                href="/auth/signup"
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-white text-black font-semibold hover:bg-white/90 transition-all mb-8"
              >
                Get started
                <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="space-y-4">
                {freeFeatures.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="text-white/70">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Agency Card */}
            <div className="bg-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/[0.08] p-8 md:p-10">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Agency — for growing teams
                </h3>
                
                {/* Billing Toggle */}
                <div className="flex items-center gap-2 mb-4">
                  <button
                    onClick={() => setBillingPeriod('monthly')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      billingPeriod === 'monthly'
                        ? 'bg-white text-black'
                        : 'bg-white/5 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setBillingPeriod('yearly')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      billingPeriod === 'yearly'
                        ? 'bg-white text-black'
                        : 'bg-white/5 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    Yearly
                    <span className="ml-1.5 text-emerald-400 text-xs font-semibold">Save 17%</span>
                  </button>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-white">
                    ${billingPeriod === 'monthly' ? '199' : '166'}
                  </span>
                  <span className="text-white/40">/month</span>
                </div>
                {billingPeriod === 'yearly' && (
                  <p className="text-sm text-white/40 mt-1">Billed annually ($1,990/year)</p>
                )}
              </div>

              <button
                type="button"
                onClick={handleAgencyCheckout}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-white text-black font-semibold hover:bg-white/90 transition-all mb-8 disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    Get started
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="space-y-4">
                {agencyFeatures.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="text-white/70">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Enterprise Banner */}
          <div className="mt-8 bg-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/[0.08] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Need more? Let's talk Enterprise.
              </h3>
              <p className="text-white/50">
                Unlimited brands, SSO, custom integrations, SLA, and dedicated support.
              </p>
            </div>
            <Link
              href="/contact?inquiry=enterprise"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-black font-semibold hover:bg-white/90 transition-all whitespace-nowrap"
            >
              Talk to Sales
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* What's Inside Your Free Account */}
      <section className="py-20 md:py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-16">
            What's inside your free Harbor account
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {insideFeatures.map((feature, idx) => (
              <div key={idx} className="bg-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/[0.08] p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-5">
                  <feature.icon className="w-6 h-6 text-white/70" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-white/50 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
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