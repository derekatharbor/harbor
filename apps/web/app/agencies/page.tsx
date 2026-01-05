// app/page.tsx
// Scout Homepage - Marketing landing page

import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import StickyNav from '@/components/marketing/StickyNav'
import MainNav from '@/components/marketing/MainNav'

export const metadata: Metadata = {
  title: 'Scout - Find Brands. Win More Deals.',
  description: 'The brand database built for creators. Find brands actively working with creators. Direct contacts. Real rates. Stop guessing, start pitching.',
}

// Features for the "Everything you need" section
const FEATURES = [
  {
    icon: '🔍',
    title: 'Brand Database',
    description: 'Browse 700+ verified brands actively working with creators. Filter by niche, budget, and audience size.',
  },
  {
    icon: '✉️',
    title: 'AI Pitch Generator',
    description: 'Generate personalized outreach emails in seconds. Sound like you, not a robot.',
  },
  {
    icon: '📊',
    title: 'Deal Tracker',
    description: 'Track every brand from first pitch to payment. Never lose a deal in your DMs again.',
  },
  {
    icon: '💰',
    title: 'Rate Intelligence',
    description: 'See what brands typically pay creators like you. Stop undercharging.',
  },
]

// FAQ items
const FAQS = [
  {
    question: 'How is Scout different from other creator tools?',
    answer: 'Most creator tools help brands find you. Scout flips the script—we give you a database of brands actively working with creators, with direct contacts and real rate data. Think of it as Apollo or LinkedIn Sales Navigator, but built for creators.',
  },
  {
    question: 'What brands are in the database?',
    answer: 'We have 700+ brands across fashion, beauty, food, lifestyle, tech, and more. Every brand has been verified as actively running creator partnerships. No wasted pitches to brands that don\'t work with influencers.',
  },
  {
    question: 'How does the 7-day free trial work?',
    answer: 'You get full access to everything—the brand database, AI pitch generator, and deal tracker. No credit card required to start. If you love it, you can upgrade to keep access.',
  },
  {
    question: 'Can I cancel anytime?',
    answer: 'Yes. No contracts, no commitments. Cancel with one click whenever you want.',
  },
  {
    question: 'What if I\'m a small creator?',
    answer: 'Scout works for creators of all sizes. We include filters to find brands specifically looking for micro and nano creators. Many brands prefer working with smaller, more engaged audiences.',
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <StickyNav />
      
      {/* Hero Section - Light */}
      <section id="light-section" className="bg-[#F6F5F3]">
        <MainNav />

        <div className="max-w-[1200px] mx-auto px-6 lg:px-14 pt-8 lg:pt-16 pb-16 lg:pb-24">
          <div className="flex flex-col items-center text-center">
            {/* Badge - Clickable */}
            <Link 
              href="/signup"
              className="flex items-center gap-2 h-8 px-3 bg-white rounded-lg shadow-sm border border-black/5 mb-6 lg:mb-8 hover:shadow-md hover:border-black/10 transition-all"
            >
              <span className="px-2 py-0.5 bg-[#111827] rounded text-[11px] font-semibold tracking-wide text-white">
                NEW
              </span>
              <span 
                className="text-[12px] font-medium text-[#111827]"
                style={{ fontFamily: 'var(--font-libre), sans-serif' }}
              >
                700+ verified brands in database
              </span>
            </Link>

            {/* Headline */}
            <h1 
              className="max-w-[600px] text-[36px] lg:text-[56px] font-semibold text-[#111827] leading-[1.1] mb-5"
              style={{ fontFamily: 'var(--font-bricolage), sans-serif' }}
            >
              Find brands. Win more deals.
            </h1>

            {/* Subheadline */}
            <p 
              className="max-w-[480px] text-[16px] lg:text-[18px] text-[#6B7280] leading-relaxed mb-8"
              style={{ fontFamily: 'var(--font-libre), sans-serif' }}
            >
              The brand database built for creators. Direct contacts. Real rates. Stop guessing, start pitching.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
              <Link 
                href="/signup"
                className="h-12 px-8 rounded-lg bg-[#111827] text-[15px] font-semibold text-white flex items-center hover:bg-black/80 transition-colors"
                style={{ fontFamily: 'var(--font-libre), sans-serif' }}
              >
                Start for free
              </Link>
              <Link 
                href="#how-it-works"
                className="h-12 px-8 rounded-lg border border-black/20 bg-white text-[15px] font-medium text-[#111827] flex items-center hover:bg-black/5 transition-colors"
                style={{ fontFamily: 'var(--font-libre), sans-serif' }}
              >
                See how it works
              </Link>
            </div>

            <p 
              className="text-[13px] text-[#9CA3AF]"
              style={{ fontFamily: 'var(--font-libre), sans-serif' }}
            >
              No credit card required
            </p>

            {/* Hero Image */}
            <div className="mt-12 lg:mt-16 w-full max-w-[1000px]">
              <div className="relative rounded-xl lg:rounded-2xl overflow-hidden border border-black/10 shadow-2xl bg-white">
                {/* Replace with actual screenshot */}
                <div className="aspect-[16/10] bg-gradient-to-br from-[#F8F9FB] to-[#E5E7EB] flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-[#9CA3AF] text-sm mb-2">Hero image</p>
                    <p className="text-[#6B7280] text-xs">/public/marketing/hero-scout.png</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="w-full bg-white border-y border-black/5 py-12">
        <div className="max-w-[900px] mx-auto px-6">
          <div className="grid grid-cols-3 gap-8">
            {[
              { stat: '700+', label: 'Verified brands' },
              { stat: '50+', label: 'Categories' },
              { stat: '100%', label: 'Direct contacts' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <p 
                  className="text-[32px] lg:text-[40px] font-semibold text-[#111827]"
                  style={{ fontFamily: 'var(--font-bricolage), sans-serif' }}
                >
                  {item.stat}
                </p>
                <p 
                  className="text-[13px] lg:text-[14px] text-[#6B7280]"
                  style={{ fontFamily: 'var(--font-libre), sans-serif' }}
                >
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dark Section - "Everything you need" */}
      <section id="dark-section" className="bg-[#111111] py-16 lg:py-24">
        <div className="max-w-[1100px] mx-auto px-6 lg:px-14">
          {/* Section Header */}
          <div className="text-center mb-12 lg:mb-16">
            <h2 
              className="text-[28px] lg:text-[40px] font-semibold text-white leading-tight mb-4"
              style={{ fontFamily: 'var(--font-bricolage), sans-serif' }}
            >
              Everything you need to land brand deals
            </h2>
            <p 
              className="text-[16px] text-white/50 max-w-[500px] mx-auto"
              style={{ fontFamily: 'var(--font-libre), sans-serif' }}
            >
              Stop juggling spreadsheets, DMs, and email threads. One workspace for your entire brand partnership workflow.
            </p>
          </div>

          {/* 4-Column Feature Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((feature, idx) => (
              <div 
                key={idx}
                className="bg-[#1a1a1a] rounded-2xl border border-white/10 p-6"
              >
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 
                  className="text-[16px] font-semibold text-white mb-2"
                  style={{ fontFamily: 'var(--font-bricolage), sans-serif' }}
                >
                  {feature.title}
                </h3>
                <p 
                  className="text-[13px] text-white/50 leading-relaxed"
                  style={{ fontFamily: 'var(--font-libre), sans-serif' }}
                >
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Light */}
      <section className="w-full bg-[#F6F5F3] py-16 lg:py-24">
        <div id="how-it-works" className="max-w-[1200px] mx-auto px-6 lg:px-14 scroll-mt-24">
          {/* Section Header */}
          <div className="text-center mb-12 lg:mb-16">
            <h2 
              className="text-[28px] lg:text-[40px] font-semibold text-[#111827] leading-tight mb-4"
              style={{ fontFamily: 'var(--font-bricolage), sans-serif' }}
            >
              Built to turn your content into consistent income
            </h2>
            <p 
              className="text-[16px] text-[#6B7280] max-w-[500px] mx-auto"
              style={{ fontFamily: 'var(--font-libre), sans-serif' }}
            >
              Three steps. That's all it takes.
            </p>
          </div>

          {/* Three Steps */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                title: 'Find brands',
                description: 'Search our database of verified brands by niche, budget, and audience size. Every brand is confirmed as actively working with creators.',
              },
              {
                step: '02',
                title: 'Pitch with AI',
                description: 'Generate personalized outreach in seconds. Our AI learns your voice and crafts pitches that sound like you—not a template.',
              },
              {
                step: '03',
                title: 'Close deals',
                description: 'Track every conversation from first pitch to payment. See your pipeline value, follow-up reminders, and close more deals.',
              },
            ].map((step, i) => (
              <div 
                key={i}
                className="bg-white rounded-2xl border border-black/5 p-6 lg:p-8"
              >
                <span 
                  className="text-[12px] font-semibold text-[#9CA3AF] tracking-wider"
                  style={{ fontFamily: 'var(--font-libre), sans-serif' }}
                >
                  STEP {step.step}
                </span>
                <h3 
                  className="text-[20px] font-semibold text-[#111827] mt-3 mb-3"
                  style={{ fontFamily: 'var(--font-bricolage), sans-serif' }}
                >
                  {step.title}
                </h3>
                <p 
                  className="text-[14px] text-[#6B7280] leading-relaxed"
                  style={{ fontFamily: 'var(--font-libre), sans-serif' }}
                >
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / Logos */}
      <section className="w-full bg-white py-12">
        <div className="max-w-[1200px] mx-auto px-6">
          <p 
            className="text-center text-[13px] font-medium text-[#9CA3AF] mb-8"
            style={{ fontFamily: 'var(--font-libre), sans-serif' }}
          >
            Creators using Scout pitch brands like
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-12">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-8 opacity-40 grayscale hover:opacity-60 hover:grayscale-0 transition-all">
                <Image
                  src={`/marketing/brand-logo-${i}.png`}
                  alt={`Brand ${i}`}
                  width={100}
                  height={32}
                  className="h-full w-auto object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-[#F6F5F3] py-16 lg:py-24">
        <div className="max-w-[700px] mx-auto px-6 lg:px-14">
          <div className="text-center mb-10">
            <h2 
              className="text-[26px] lg:text-[32px] font-semibold text-[#111827] mb-3"
              style={{ fontFamily: 'var(--font-bricolage), sans-serif' }}
            >
              Frequently asked questions
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => (
              <details
                key={idx}
                className="group bg-white rounded-xl border border-black/5 overflow-hidden"
              >
                <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
                  <span 
                    className="text-[15px] lg:text-[16px] font-medium text-[#111827] pr-4"
                    style={{ fontFamily: 'var(--font-libre), sans-serif' }}
                  >
                    {faq.question}
                  </span>
                  <svg
                    className="w-5 h-5 text-black/40 flex-shrink-0 transition-transform group-open:rotate-180"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-5 pb-5">
                  <p 
                    className="text-[14px] text-[#6B7280] leading-relaxed"
                    style={{ fontFamily: 'var(--font-libre), sans-serif' }}
                  >
                    {faq.answer}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA - Dark with style */}
      <section className="bg-[#111111] py-20 lg:py-28">
        <div className="max-w-[800px] mx-auto px-6 lg:px-14 text-center">
          <h2 
            className="text-[32px] lg:text-[48px] font-semibold text-white leading-tight mb-4"
            style={{ fontFamily: 'var(--font-bricolage), sans-serif' }}
          >
            Ready to land more brand deals?
          </h2>
          <p 
            className="text-[16px] lg:text-[18px] text-white/50 mb-8 max-w-[450px] mx-auto"
            style={{ fontFamily: 'var(--font-libre), sans-serif' }}
          >
            Join creators who are finding, pitching, and closing brand partnerships faster with Scout.
          </p>
          
          {/* Price */}
          <div className="inline-flex items-baseline gap-1 mb-8">
            <span 
              className="text-[48px] lg:text-[56px] font-semibold text-white"
              style={{ fontFamily: 'var(--font-bricolage), sans-serif' }}
            >
              $39
            </span>
            <span 
              className="text-[16px] text-white/50"
              style={{ fontFamily: 'var(--font-libre), sans-serif' }}
            >
              /month
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link 
              href="/signup"
              className="w-full sm:w-auto h-12 px-8 rounded-lg bg-white text-[15px] font-semibold text-[#111827] flex items-center justify-center hover:bg-gray-100 transition-colors"
              style={{ fontFamily: 'var(--font-libre), sans-serif' }}
            >
              Start for free
            </Link>
          </div>
          
          <p 
            className="mt-4 text-[13px] text-white/40"
            style={{ fontFamily: 'var(--font-libre), sans-serif' }}
          >
            7-day free trial • No credit card required
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-[#111111] pt-16 pb-8 border-t border-white/10">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-14">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-16 mb-12">
            {/* Logo */}
            <div className="col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <Image
                  src="/white-logo.png"
                  alt="Scout"
                  width={32}
                  height={32}
                  className="w-8 h-8"
                />
                <span 
                  className="text-xl font-semibold text-white"
                  style={{ fontFamily: 'var(--font-bricolage), sans-serif' }}
                >
                  scout
                </span>
              </div>
              <p 
                className="text-[14px] text-white/40"
                style={{ fontFamily: 'var(--font-libre), sans-serif' }}
              >
                The brand database for creators.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 
                className="text-white text-[14px] font-semibold mb-4"
                style={{ fontFamily: 'var(--font-libre), sans-serif' }}
              >
                Product
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link 
                    href="#how-it-works" 
                    className="text-white/50 text-[14px] hover:text-white transition-colors"
                    style={{ fontFamily: 'var(--font-libre), sans-serif' }}
                  >
                    How it works
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/pricing" 
                    className="text-white/50 text-[14px] hover:text-white transition-colors"
                    style={{ fontFamily: 'var(--font-libre), sans-serif' }}
                  >
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 
                className="text-white text-[14px] font-semibold mb-4"
                style={{ fontFamily: 'var(--font-libre), sans-serif' }}
              >
                Company
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link 
                    href="/contact" 
                    className="text-white/50 text-[14px] hover:text-white transition-colors"
                    style={{ fontFamily: 'var(--font-libre), sans-serif' }}
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 
                className="text-white text-[14px] font-semibold mb-4"
                style={{ fontFamily: 'var(--font-libre), sans-serif' }}
              >
                Legal
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link 
                    href="/privacy" 
                    className="text-white/50 text-[14px] hover:text-white transition-colors"
                    style={{ fontFamily: 'var(--font-libre), sans-serif' }}
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/terms" 
                    className="text-white/50 text-[14px] hover:text-white transition-colors"
                    style={{ fontFamily: 'var(--font-libre), sans-serif' }}
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="pt-8 border-t border-white/10 flex flex-col lg:flex-row items-center justify-between gap-4">
            <p 
              className="text-[13px] text-white/30"
              style={{ fontFamily: 'var(--font-libre), sans-serif' }}
            >
              © {new Date().getFullYear()} Scout. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}