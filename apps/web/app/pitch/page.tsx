// app/pitch/page.tsx

import { Metadata } from 'next'
import Link from 'next/link'
import StickyNav from '@/components/marketing/StickyNav'
import MainNav from '@/components/marketing/MainNav'

export const metadata: Metadata = {
  title: 'Pitch Workspaces - Harbor',
  description: 'Win new business with AI visibility reports. Show prospects their competitive positioning before they sign.',
}

// Features for the 3-column grid
const FEATURES = [
  {
    icon: '/images/icons/icon-rocket.png',
    title: 'Instant prospect reports',
    description: 'Generate AI visibility reports for any brand in minutes. Show prospects exactly how they appear across ChatGPT, Claude, Perplexity, and Gemini.',
  },
  {
    icon: '/images/icons/icon-benchmark.png',
    title: 'Competitive positioning',
    description: 'Reveal how prospects stack up against their competitors. Nothing closes deals faster than showing them what they\'re missing.',
  },
  {
    icon: '/images/icons/icon-report.png',
    title: 'White-label ready',
    description: 'Export polished reports with your branding. Present AI visibility data as part of your agency\'s service offering.',
  },
]

// Value props for the two-column section
const VALUE_PROPS = [
  {
    title: 'Pitch workspaces included on every Agency plan',
    description: 'While other platforms charge $500/month for "partnership" programs and gate features behind certification fees, Harbor includes pitch workspaces as a standard feature. Generate unlimited prospect reports without the enterprise sales pitch.',
    image: '/images/pitch/value-1.png',
  },
  {
    title: 'Turn cold outreach into warm conversations',
    description: 'Lead with value instead of a sales pitch. Send prospects a preview of their AI visibility score and competitive positioning. When they see competitors outranking them, they\'ll want to talk.',
    image: '/images/pitch/value-2.png',
  },
]

// FAQ items
const FAQS = [
  {
    question: 'How many pitch workspaces can I create?',
    answer: 'Agency plans include unlimited pitch workspaces. Create as many prospect reports as you need—no caps, no overage fees.',
  },
  {
    question: 'Can I customize reports with my branding?',
    answer: 'Yes. Export white-label PDFs with your agency logo and colors. Present AI visibility data as part of your own service offering.',
  },
  {
    question: 'How fast can I generate a report?',
    answer: 'Most reports are ready in under 2 minutes. Enter a prospect\'s domain, select their competitors, and Harbor does the rest.',
  },
  {
    question: 'Do prospects need a Harbor account to view reports?',
    answer: 'No. You can share reports via PDF export or a private link. Prospects see the data without needing to sign up.',
  },
]

export default function PitchPage() {
  return (
    <div className="min-h-screen">
      <StickyNav />

      {/* Light Hero Section */}
      <section id="light-section" className="bg-[#F6F5F3]">
        <MainNav isDark={false} />

        <div className="max-w-[1200px] mx-auto px-6 lg:px-14 pt-8 lg:pt-16 pb-16 lg:pb-24">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
            {/* Left - Text Content */}
            <div className="flex-1 text-left">
              {/* Badge */}
              <div className="flex mb-6">
                <span className="px-3 py-1 bg-black/5 border border-black/10 rounded-full text-[12px] font-semibold font-source-code text-black/60 uppercase tracking-wider">
                  Pitch Workspaces
                </span>
              </div>

              <h1 className="text-[36px] lg:text-[52px] font-semibold font-source-sans tracking-tight text-black leading-[1.1] mb-5">
                Win new business<br />before the first call
              </h1>
              <p className="text-[16px] lg:text-[18px] font-normal font-source-code text-[#6F6E6E] mb-8 max-w-[480px]">
                Generate instant AI visibility reports for prospects. Show them exactly how they stack up against competitors—and watch response rates climb.
              </p>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row items-start gap-3">
                <Link
                  href="/signup?plan=agency"
                  className="btn-black h-12 px-8 rounded-[10px] text-[15px] font-semibold font-source-sans flex items-center justify-center"
                >
                  <span>Start free trial</span>
                </Link>
                <Link
                  href="/demo"
                  className="h-12 px-8 rounded-[10px] border border-black/20 text-black text-[15px] font-medium font-source-sans flex items-center justify-center hover:bg-black/5 transition-colors"
                >
                  See a demo report
                </Link>
              </div>
            </div>

            {/* Right - Hero Image */}
            <div className="flex-1 w-full">
              <img 
                src="/images/pitch/hero-illustration.png" 
                alt="Pitch Workspaces"
                className="w-full h-auto max-w-[500px] mx-auto lg:mx-0"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Dark Section - Features Grid */}
      <section id="dark-section" className="bg-[#111111] py-16 lg:py-24">
        <div className="max-w-[1100px] mx-auto px-6 lg:px-14">
          {/* Section Header */}
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-[28px] lg:text-[40px] font-semibold font-source-sans text-white leading-tight mb-4">
              Everything you need to close deals faster
            </h2>
            <p className="text-[16px] font-normal font-source-code text-white/50 max-w-[500px] mx-auto">
              Turn AI visibility into your agency's secret weapon.
            </p>
          </div>

          {/* 3-Column Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((feature, idx) => (
              <div 
                key={idx}
                className="bg-[#1a1a1a] rounded-[16px] border border-white/10 p-6 lg:p-8"
              >
                <div className="w-10 h-10 mb-4">
                  <img src={feature.icon} alt="" className="w-full h-full object-contain" />
                </div>
                <h3 className="text-[18px] font-semibold font-source-sans text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-[14px] font-normal font-source-code text-white/50 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Light Section - Value Props */}
      <section className="bg-[#F6F5F3] py-16 lg:py-24">
        <div className="max-w-[1100px] mx-auto px-6 lg:px-14 space-y-16 lg:space-y-24">
          {VALUE_PROPS.map((prop, idx) => (
            <div 
              key={idx}
              className={`flex flex-col ${idx % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 lg:gap-16 items-center`}
            >
              {/* Text */}
              <div className="flex-1">
                <h3 className="text-[24px] lg:text-[32px] font-semibold font-source-sans text-black leading-tight mb-4">
                  {prop.title}
                </h3>
                <p className="text-[15px] lg:text-[16px] font-normal font-source-code text-[#6F6E6E] leading-relaxed">
                  {prop.description}
                </p>
              </div>

              {/* Image */}
              <div className="flex-1 w-full">
                <div className="bg-[#F6F5F3] rounded-[16px] border border-[#EFEEED] overflow-hidden aspect-[4/3]">
                  <img 
                    src={prop.image} 
                    alt={prop.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonial / Quote - Dark */}
      <section className="bg-[#111111] py-16 lg:py-24">
        <div className="max-w-[800px] mx-auto px-6 lg:px-14 text-center">
          <div className="text-[24px] lg:text-[32px] font-medium font-source-sans text-white leading-snug mb-6">
            "We used to spend hours building competitive analysis decks. Now we generate AI visibility reports in minutes and close 40% more deals."
          </div>
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10" />
            <div className="text-left">
              <div className="text-[14px] font-semibold font-source-sans text-white">Agency Founder</div>
              <div className="text-[13px] font-normal font-source-code text-white/50">GEO Agency</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section - Light */}
      <section className="bg-[#F6F5F3] py-16 lg:py-24">
        <div className="max-w-[700px] mx-auto px-6 lg:px-14">
          <div className="text-center mb-10">
            <h2 className="text-[26px] lg:text-[32px] font-semibold font-source-sans text-black mb-3">
              FAQs
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => (
              <details
                key={idx}
                className="group bg-white rounded-[12px] border border-[#EFEEED] overflow-hidden"
              >
                <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
                  <span className="text-[15px] lg:text-[16px] font-medium font-source-sans text-black pr-4">
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
                  <p className="text-[14px] font-normal font-source-code text-[#6F6E6E] leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-[#111111] py-16 lg:py-24">
        <style jsx>{`
          @keyframes gradient-shift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .animated-gradient-text {
            background: linear-gradient(
              90deg,
              #c9b8d4,
              #d4b8c9,
              #e8c4b8,
              #f0d0b8,
              #d4b8c9,
              #c9b8d4
            );
            background-size: 200% auto;
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: gradient-shift 4s ease infinite;
          }
        `}</style>
        <div className="max-w-[700px] mx-auto px-6 lg:px-14 text-center">
          <h2 className="text-[32px] lg:text-[56px] font-bold font-source-sans tracking-tight leading-tight mb-4">
            <span className="text-white">UNLOCK YOUR</span>
            <br />
            <span className="animated-gradient-text">AI SEARCH</span>
            <br />
            <span className="animated-gradient-text">SUPERPOWERS</span>
          </h2>
          <p className="text-[15px] lg:text-[17px] font-normal font-source-code text-white/50 mb-8 max-w-[400px] mx-auto">
            Start generating AI visibility reports today.
          </p>
          <Link
            href="/signup?plan=agency"
            className="inline-flex h-12 px-8 rounded-[10px] bg-white text-black text-[15px] font-semibold font-source-sans items-center justify-center hover:bg-gray-100 transition-colors"
          >
            Get started free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-[#111111] pt-16 pb-8 border-t border-[#222]">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-14">
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