// components/modals/UpgradeModal.tsx
'use client'

import { useState } from 'react'
import { X, Check, Loader2, Zap } from 'lucide-react'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  currentPlan: string
}

const PLANS = {
  pro: {
    name: 'Pro',
    monthlyPrice: 99,
    yearlyPrice: 990,
    prompts: 100,
    competitors: 5,
    features: [
      '100 prompts tracked',
      '5 competitors monitored',
      'All 4 AI platforms',
      'Daily monitoring',
      'Email alerts',
    ],
  },
  growth: {
    name: 'Growth',
    monthlyPrice: 179,
    yearlyPrice: 1790,
    prompts: 200,
    competitors: 10,
    features: [
      '200 prompts tracked',
      '10 competitors monitored',
      'All 4 AI platforms',
      'Daily monitoring',
      'Email alerts',
      'Priority support',
    ],
  },
}

export default function UpgradeModal({ isOpen, onClose, currentPlan }: UpgradeModalProps) {
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly')
  const [loading, setLoading] = useState<string | null>(null)

  if (!isOpen) return null

  const handleUpgrade = async (plan: 'pro' | 'growth') => {
    setLoading(plan)
    
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, period }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url
    } catch (err) {
      console.error('Checkout error:', err)
      setLoading(null)
    }
  }

  const yearlySavings = (plan: 'pro' | 'growth') => {
    const monthly = PLANS[plan].monthlyPrice * 12
    const yearly = PLANS[plan].yearlyPrice
    return monthly - yearly
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="relative w-full max-w-2xl mx-4 rounded-xl border overflow-hidden"
        style={{ 
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border)',
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-6 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#22D3EE]/10">
              <Zap className="w-5 h-5 text-[#22D3EE]" />
            </div>
            <div>
              <h2 className="text-xl font-heading font-bold text-primary">
                Upgrade Your Plan
              </h2>
              <p className="text-sm text-secondary/60">
                Unlock more visibility intelligence
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5 text-secondary/60" />
          </button>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center py-6">
          <div 
            className="inline-flex p-1 rounded-lg"
            style={{ backgroundColor: 'var(--bg-primary)' }}
          >
            <button
              onClick={() => setPeriod('monthly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                period === 'monthly'
                  ? 'bg-white/10 text-primary'
                  : 'text-secondary/60 hover:text-primary'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setPeriod('yearly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                period === 'yearly'
                  ? 'bg-white/10 text-primary'
                  : 'text-secondary/60 hover:text-primary'
              }`}
            >
              Yearly
              <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                2 months free
              </span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 gap-4 px-6 pb-6">
          {(['pro', 'growth'] as const).map((planKey) => {
            const plan = PLANS[planKey]
            const price = period === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice
            const isCurrentPlan = currentPlan === planKey
            const isRecommended = planKey === 'pro'

            return (
              <div
                key={planKey}
                className={`relative rounded-xl border p-6 ${
                  isRecommended ? 'ring-1 ring-[#22D3EE]/50' : ''
                }`}
                style={{ 
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: isRecommended ? 'rgba(34, 211, 238, 0.3)' : 'var(--border)',
                }}
              >
                {isRecommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="text-xs px-3 py-1 rounded-full bg-[#22D3EE] text-[#0B1521] font-medium">
                      Recommended
                    </span>
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="text-lg font-heading font-bold text-primary">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-3xl font-bold text-primary">${price}</span>
                    <span className="text-secondary/60">/{period === 'monthly' ? 'mo' : 'yr'}</span>
                  </div>
                  {period === 'yearly' && (
                    <p className="text-xs text-emerald-400 mt-1">
                      Save ${yearlySavings(planKey)}/year
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-secondary/80">
                      <Check className="w-4 h-4 text-[#22D3EE] flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleUpgrade(planKey)}
                  disabled={isCurrentPlan || loading !== null}
                  className={`w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                    isCurrentPlan
                      ? 'bg-white/5 text-secondary/40 cursor-not-allowed'
                      : isRecommended
                        ? 'bg-[#22D3EE] text-[#0B1521] hover:bg-[#22D3EE]/90'
                        : 'bg-white/10 text-primary hover:bg-white/15'
                  }`}
                >
                  {loading === planKey ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : isCurrentPlan ? (
                    'Current Plan'
                  ) : (
                    `Upgrade to ${plan.name}`
                  )}
                </button>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div 
          className="px-6 py-4 border-t text-center"
          style={{ borderColor: 'var(--border)' }}
        >
          <p className="text-xs text-secondary/40">
            Secure checkout powered by Stripe. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  )
}
