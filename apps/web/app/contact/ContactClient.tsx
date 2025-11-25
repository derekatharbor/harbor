// apps/web/app/contact/ContactClient.tsx
'use client'

import { useState } from 'react'
import { ArrowRight, Mail, MessageSquare } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import FrostedNav from '@/components/landing/FrostedNav'

export default function ContactClient() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    company: '',
    email: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission - replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsSubmitting(false)
    setSubmitted(true)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <FrostedNav />

      {/* Main Content */}
      <div data-nav-theme="light" className="pt-28 md:pt-32 pb-20 md:pb-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            
            {/* Left Column - Info */}
            <div className="lg:pt-8">
              <h1 className="text-4xl md:text-5xl font-heading font-bold text-[#101A31] mb-6 leading-tight">
                Contact Us
              </h1>
              
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Have a question about Harbor? Want to learn more about how we can help your brand? 
                We'd love to hear from you.
              </p>

              {/* Contact Options */}
              <div className="space-y-6 mb-12">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#101A31]/5 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-[#101A31]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#101A31] mb-1">Email us directly</h3>
                    <a href="mailto:hello@useharbor.io" className="text-gray-600 hover:text-[#101A31] transition-colors">
                      hello@useharbor.io
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#101A31]/5 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-5 h-5 text-[#101A31]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#101A31] mb-1">For existing customers</h3>
                    <p className="text-gray-600">
                      Access support through your{' '}
                      <Link href="/dashboard" className="text-[#101A31] underline underline-offset-4 hover:text-gray-700">
                        dashboard
                      </Link>
                    </p>
                  </div>
                </div>
              </div>

              {/* Illustration placeholder - you can add a custom image here */}
              <div className="hidden lg:block">
                <div 
                  className="w-full max-w-md aspect-square rounded-3xl opacity-60"
                  style={{
                    backgroundImage: 'url(/images/wireframe-wave.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
              </div>
            </div>

            {/* Right Column - Form */}
            <div>
              {!submitted ? (
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-10">
                  <h2 className="text-2xl font-heading font-bold text-[#101A31] mb-6">
                    Send us a message
                  </h2>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                          First name
                        </label>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[#101A31] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#101A31]/20 focus:border-[#101A31] transition-all"
                          placeholder="Jane"
                        />
                      </div>
                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                          Last name
                        </label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[#101A31] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#101A31]/20 focus:border-[#101A31] transition-all"
                          placeholder="Smith"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                        Company name
                      </label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[#101A31] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#101A31]/20 focus:border-[#101A31] transition-all"
                        placeholder="Acme Inc."
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Work email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[#101A31] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#101A31]/20 focus:border-[#101A31] transition-all"
                        placeholder="jane@acme.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                        How can we help?
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={4}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[#101A31] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#101A31]/20 focus:border-[#101A31] transition-all resize-none"
                        placeholder="Tell us about your brand and what you're looking for..."
                      />
                    </div>

                    <p className="text-xs text-gray-500">
                      By submitting this form, I confirm that I have read and understood Harbor's{' '}
                      <Link href="/privacy" className="underline hover:text-gray-700">
                        Privacy Policy
                      </Link>.
                    </p>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#101A31] text-white font-semibold hover:bg-[#1a2a4a] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {isSubmitting ? 'Sending...' : 'Send message'}
                      {!isSubmitting && <ArrowRight className="w-4 h-4" />}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-10 text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-heading font-bold text-[#101A31] mb-3">
                    Message sent!
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Thanks for reaching out. We'll get back to you within 24 hours.
                  </p>
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-[#101A31] font-medium hover:underline"
                  >
                    Back to home
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dark CTA Section */}
      <section className="relative py-20 md:py-28 overflow-hidden" style={{ backgroundColor: '#101A31' }}>
        {/* Wireframe Background */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: 'url(/wireframe-hero.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        {/* Color Noise Top Border */}
        <div 
          className="absolute top-0 left-0 right-0 h-1.5"
          style={{
            backgroundImage: 'url(/color-noise-bar.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
            Ready to see how AI sees you?
          </h2>
          <p className="text-lg text-white/60 mb-8">
            Join thousands of brands tracking their AI visibility with Harbor.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-[#101A31] font-semibold hover:bg-gray-100 transition-all"
            >
              Get started free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/brands"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-white/20 text-white font-semibold hover:bg-white/10 transition-all"
            >
              Browse the Index
            </Link>
          </div>
        </div>
      </section>

      {/* Footer - No rounded corners on this page */}
      <footer className="relative py-12 px-6 bg-[#0a0f1a] border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Image src="/logo-icon.png" alt="Harbor" width={32} height={32} className="w-8 h-8" />
                <span className="text-xl font-bold text-white font-heading">Harbor</span>
              </div>
              <p className="text-[#A4B1C3] text-sm leading-relaxed">
                The AI visibility standard. See how ChatGPT, Claude, Gemini, and Perplexity talk about your brand.
              </p>
            </div>

            <div>
              <h3 className="text-white font-heading font-semibold mb-4">Product</h3>
              <ul className="space-y-3">
                <li><Link href="/brands" className="text-[#A4B1C3] hover:text-white transition-colors text-sm">Brand Index</Link></li>
                <li><Link href="/pricing" className="text-[#A4B1C3] hover:text-white transition-colors text-sm">Pricing</Link></li>
                <li><Link href="/about" className="text-[#A4B1C3] hover:text-white transition-colors text-sm">About</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-heading font-semibold mb-4">Company</h3>
              <ul className="space-y-3">
                <li><Link href="/contact" className="text-[#A4B1C3] hover:text-white transition-colors text-sm">Contact</Link></li>
                <li><Link href="/privacy" className="text-[#A4B1C3] hover:text-white transition-colors text-sm">Privacy</Link></li>
                <li><Link href="/terms" className="text-[#A4B1C3] hover:text-white transition-colors text-sm">Terms</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 text-center md:text-left">
            <div className="text-sm text-[#A4B1C3]">
              © {new Date().getFullYear()} Harbor. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}