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
    <section id="early-access" className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Main CTA Card */}
        <div className="relative rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 p-8 sm:p-12 overflow-hidden">
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent pointer-events-none" />

          <div className="relative z-10">
            {/* Headline */}
            <div className="text-center mb-8">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white mb-4">
                Get early access
              </h2>
              <p className="text-lg sm:text-xl text-white/75 max-w-2xl mx-auto">
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
                    className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-coral text-white font-medium hover:bg-coral/90 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
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

                <p className="text-sm text-white/50 text-center mt-4">
                  No credit card required. We'll be in touch soon.
                </p>
              </form>
            ) : (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-500/20 mb-4">
                  <Check className="w-8 h-8 text-teal-400" />
                </div>
                <h3 className="text-2xl font-display font-bold text-white mb-2">
                  You're on the list!
                </h3>
                <p className="text-white/75">
                  We'll send you an invite as soon as spots open up.
                </p>
              </div>
            )}

            {/* Trust Indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 pt-8 border-t border-white/10">
              <div className="text-center">
                <div className="text-teal-400 font-display font-bold text-lg mb-1">
                  SOC 2 Ready
                </div>
                <div className="text-sm text-white/60">
                  Enterprise-grade security
                </div>
              </div>

              <div className="text-center">
                <div className="text-teal-400 font-display font-bold text-lg mb-1">
                  Weekly Scans
                </div>
                <div className="text-sm text-white/60">
                  Always up-to-date insights
                </div>
              </div>

              <div className="text-center">
                <div className="text-teal-400 font-display font-bold text-lg mb-1">
                  4 AI Models
                </div>
                <div className="text-sm text-white/60">
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
