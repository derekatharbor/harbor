'use client'

import { useState } from 'react'
import { ArrowRight, Check } from 'lucide-react'

export default function CTASection() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // TODO: Connect to actual API endpoint
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setSubmitted(true)
    setIsSubmitting(false)
    setEmail('')
  }

  return (
    <section id="early-access" className="py-20 lg:py-28" style={{ backgroundColor: '#101A31' }}>
      <div className="mx-auto max-w-4xl px-6">
        {/* Main CTA Card */}
        <div className="relative overflow-hidden rounded-3xl bg-[#0C1422] border border-white/10 px-8 py-12 md:px-12 md:py-16">
          {/* Subtle Grid Pattern Background */}
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `
                linear-gradient(to right, white 1px, transparent 1px),
                linear-gradient(to bottom, white 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px'
            }}
          />

          {/* Content */}
          <div className="relative z-10">
            {/* Headline */}
            <div className="text-center mb-8">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-white mb-4 tracking-tight">
                Get early access
              </h2>
              <p className="text-base md:text-lg text-[#A4B1C3] max-w-2xl mx-auto">
                Join forward-thinking brands optimizing for AI search visibility.
              </p>
            </div>

            {/* Form or Success State */}
            {!submitted ? (
              <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="flex-1 px-5 py-3.5 rounded-lg bg-[#0F1B2C] border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center px-6 py-3.5 rounded-lg bg-white text-[#0C1422] font-semibold hover:bg-white/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      'Submitting...'
                    ) : (
                      <>
                        Request Access
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                <p className="text-sm text-[#A4B1C3] text-center mt-4">
                  No credit card required. We'll be in touch soon.
                </p>
              </form>
            ) : (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 mb-4">
                  <Check className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-heading font-bold text-white mb-2">
                  You're on the list!
                </h3>
                <p className="text-[#A4B1C3]">
                  We'll send you an invite as soon as spots open up.
                </p>
              </div>
            )}

            {/* Trust Indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-12 pt-10 border-t border-white/5">
              <div className="text-center">
                <div className="text-white font-heading font-bold text-lg mb-1">
                  SOC 2 Ready
                </div>
                <div className="text-sm text-[#A4B1C3]">
                  Enterprise-grade security
                </div>
              </div>

              <div className="text-center">
                <div className="text-white font-heading font-bold text-lg mb-1">
                  Weekly Scans
                </div>
                <div className="text-sm text-[#A4B1C3]">
                  Always up-to-date insights
                </div>
              </div>

              <div className="text-center">
                <div className="text-white font-heading font-bold text-lg mb-1">
                  4 AI Models
                </div>
                <div className="text-sm text-[#A4B1C3]">
                  Complete coverage
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}