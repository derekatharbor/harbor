// app/agencies/page.tsx
// Agency Landing Page - Free audit tool for pitching prospects

'use client'

import Link from 'next/link'
import StickyNav from '@/components/marketing/StickyNav'
import MainNav from '@/components/marketing/MainNav'

export default function AgenciesPage() {
  return (
    <>
      <StickyNav />
      
      {/* Hero Section */}
      <section className="bg-[#F6F5F3]">
        <MainNav isDark={false} />

        <div className="max-w-[1200px] mx-auto px-6 lg:px-14 pt-8 lg:pt-16 pb-16 lg:pb-24">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
            {/* Left - Text Content */}
            <div className="flex-1 text-left">
              {/* Badge */}
              <div className="flex mb-6">
                <span className="px-3 py-1 bg-black/5 border border-black/10 rounded-full text-[12px] font-semibold font-source-code text-black/60 uppercase tracking-wider">
                  For Agencies
                </span>
              </div>

              <h1 className="text-[36px] lg:text-[52px] font-semibold font-source-sans tracking-tight text-black leading-[1.1] mb-5">
                Close deals by showing<br />what prospects can't see
              </h1>
              <p className="text-[16px] lg:text-[18px] font-normal font-source-code text-[#6F6E6E] mb-8 max-w-[480px]">
                Generate AI visibility audits for any brand. Show them the gap, then sell the fix.
              </p>

              {/* CTA */}
              <form className="hidden lg:flex items-center h-14 bg-white rounded-[10px] border border-[#E8E8E7] shadow-sm max-w-[460px]">
                <input type="email" name="email" placeholder="Enter your company email" className="flex-1 h-full px-5 text-[16px] font-normal font-source-sans tracking-[0.5px] text-black placeholder:text-[#A0A0A0] bg-transparent outline-none" required />
                <button type="submit" className="btn-black h-[42px] px-7 mr-1.5 rounded-[7px] text-[15px] font-medium font-source-sans tracking-[0.69px] whitespace-nowrap">Get started</button>
              </form>

              {/* Mobile */}
              <div className="lg:hidden flex flex-col gap-3 w-full">
                <form className="flex flex-col gap-2">
                  <input 
                    type="email" 
                    name="email" 
                    placeholder="Enter your company email" 
                    className="h-12 px-4 rounded-[10px] border border-[#E8E8E7] bg-white text-[15px] font-normal font-source-sans text-black placeholder:text-[#A0A0A0] outline-none" 
                    required 
                  />
                  <button type="submit" className="btn-black h-12 rounded-[10px] text-[15px] font-semibold font-source-sans flex items-center justify-center">
                    Get started free
                  </button>
                </form>
              </div>
            </div>

            {/* Right - Hero Image */}
            <div className="flex-1 w-full lg:pl-8">
              <img 
                src="/images/agencies/hero-illustration.png" 
                alt="AI Visibility Audit"
                className="w-full h-auto max-w-[500px] mx-auto lg:ml-auto lg:mr-0"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Dark Section */}
      <section className="w-full bg-[#111111]">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-14 py-16 lg:py-24">
          <div className="text-center mb-10 lg:mb-16">
            <h2 className="text-[28px] lg:text-[42px] font-semibold font-source-sans tracking-tight text-white leading-tight">How it works</h2>
            <p className="mt-3 lg:mt-4 text-[15px] lg:text-[18px] font-normal font-source-code text-white/50 max-w-[500px] mx-auto">
              Turn AI visibility gaps into signed contracts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 lg:gap-8 max-w-[1000px] mx-auto">
            {[
              { num: '01', title: 'Enter their URL', desc: 'Paste the website of any brand you want to pitch.' },
              { num: '02', title: 'We scan AI models', desc: 'Harbor queries ChatGPT, Claude, Perplexity, and Gemini.' },
              { num: '03', title: 'See the gap', desc: 'Get visibility scores, sentiment, and competitor comparisons.' },
              { num: '04', title: 'Send the report', desc: 'Share a report showing exactly what they\'re missing.' },
            ].map((step, i) => (
              <div key={i} className="text-center lg:text-left">
                <div className="text-[42px] lg:text-[56px] font-semibold font-source-sans text-white/10 leading-none mb-2">{step.num}</div>
                <h3 className="text-[18px] lg:text-[20px] font-semibold font-source-sans text-white mb-2">{step.title}</h3>
                <p className="text-[14px] lg:text-[15px] font-normal font-source-code text-white/50 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Props - Light Section */}
      <section className="w-full bg-[#F6F5F3]">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-14 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 max-w-[1000px] mx-auto">
            {/* Pitch New Clients */}
            <div className="bg-white rounded-[15px] border border-[#EFEEED] p-6 lg:p-8">
              <div className="w-14 h-14 rounded-xl bg-[#F6F5F3] flex items-center justify-center mb-4">
                <img src="/icons/trophy.png" alt="" className="w-8 h-8" />
              </div>
              <h3 className="text-[20px] lg:text-[24px] font-semibold font-source-sans text-black mb-3">Pitch new clients</h3>
              <p className="text-[15px] font-normal font-source-code text-[#6F6E6E] leading-relaxed mb-4">
                Stop competing on price. Win deals by showing prospects problems they didn't know they had.
              </p>
              <ul className="space-y-2">
                {[
                  'Show prospects their AI visibility gap',
                  'Compare them to competitors they care about',
                  'Prove the problem before selling the fix'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-[14px] font-normal font-source-code text-[#6F6E6E]">
                    <span className="text-black mt-0.5">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Upsell Existing Clients */}
            <div className="bg-white rounded-[15px] border border-[#EFEEED] p-6 lg:p-8">
              <div className="w-14 h-14 rounded-xl bg-[#F6F5F3] flex items-center justify-center mb-4">
                <img src="/icons/visibility.png" alt="" className="w-8 h-8" />
              </div>
              <h3 className="text-[20px] lg:text-[24px] font-semibold font-source-sans text-black mb-3">Upsell existing clients</h3>
              <p className="text-[15px] font-normal font-source-code text-[#6F6E6E] leading-relaxed mb-4">
                Add AI visibility as a new service line. Create recurring revenue from monitoring.
              </p>
              <ul className="space-y-2">
                {[
                  'Add AI Search Optimization as a retainer',
                  'Show clients what competitors are doing',
                  'Prove ROI with visibility trend reports'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-[14px] font-normal font-source-code text-[#6F6E6E]">
                    <span className="text-black mt-0.5">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pitch Workspace Teaser - Dark Section */}
      <section className="w-full bg-[#111111]">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-14 py-16 lg:py-24">
          <div className="max-w-[800px] mx-auto">
            <div className="inline-flex items-center gap-2 h-[34px] px-3 bg-[#272625] rounded-[9px] mb-4 lg:mb-6">
              <div className="flex items-center justify-center w-[44px] h-[22px] rounded-[5px] overflow-hidden" style={{ backgroundImage: 'url(/images/holographic-bg.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <span className="text-[10px] font-bold font-source-code text-black tracking-wider">SOON</span>
              </div>
              <span className="text-[13px] font-medium font-source-sans text-white/80">Pitch Workspace</span>
            </div>
            
            <h2 className="text-[28px] lg:text-[42px] font-semibold font-source-sans tracking-tight text-white leading-tight mb-4">
              Manage your entire pipeline
            </h2>
            <p className="text-[15px] lg:text-[18px] font-normal font-source-code text-white/50 mb-8 max-w-[600px]">
              Stop juggling spreadsheets. Track prospects, generate reports, and close deals from one workspace.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'Prospect Pipeline', desc: 'Track every prospect from lead to closed-won.' },
                { title: 'Historical Tracking', desc: 'Monitor visibility over time, even before they sign.' },
                { title: 'One-Click Reports', desc: 'Generate branded audits instantly.' },
              ].map((feature, i) => (
                <div key={i} className="bg-[#1a1a1a] rounded-[10px] border border-[#333] p-5">
                  <h3 className="text-[16px] font-semibold font-source-sans text-white mb-2">{feature.title}</h3>
                  <p className="text-[14px] font-normal font-source-code text-white/50 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <Link href="/auth/signup" className="inline-flex h-12 px-6 rounded-[10px] bg-white text-black text-[15px] font-semibold font-source-sans items-center justify-center hover:bg-gray-100 transition-colors">
                Get early access
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ - Light Section */}
      <section className="w-full bg-[#F6F5F3]">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-14 py-16 lg:py-24">
          <div className="max-w-[700px] mx-auto">
            <h2 className="text-[28px] lg:text-[36px] font-semibold font-source-sans tracking-tight text-black leading-tight mb-8 lg:mb-12">
              Questions & Answers
            </h2>
            
            <div className="space-y-0 divide-y divide-[#E0DFDE]">
              {[
                { q: 'Is the audit tool really free?', a: 'Yes. Run unlimited audits without signing up. We want you to see the value before committing.' },
                { q: 'What AI models do you scan?', a: 'ChatGPT, Claude, Perplexity, Gemini, and Google AI Overviews. Results show how each model perceives the brand.' },
                { q: 'Can I white-label reports?', a: 'Coming soon on Agency plans. For now, reports are Harbor-branded but fully shareable.' },
                { q: 'How is this different from SEO tools?', a: 'SEO tracks Google rankings. Harbor tracks how AI models talk about brands — a different channel entirely.' },
              ].map((faq, i) => (
                <div key={i} className="py-5">
                  <h3 className="text-[16px] lg:text-[18px] font-semibold font-source-sans text-black mb-2">{faq.q}</h3>
                  <p className="text-[14px] lg:text-[15px] font-normal font-source-code text-[#6F6E6E] leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
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
          .holographic-text {
            background: linear-gradient(
              90deg,
              #f8c8dc,
              #e8b4f8,
              #d4b4f8,
              #b4c8f8,
              #8fd8f8,
              #b4f0f0,
              #c8e8f8,
              #f8d8c8,
              #f8c8dc
            );
            background-size: 300% auto;
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: gradient-shift 6s ease infinite;
          }
        `}</style>
        <div className="max-w-[800px] mx-auto px-6 lg:px-14 text-center">
          <h2 className="text-[36px] lg:text-[72px] font-black tracking-tight leading-[0.95] mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            <span className="text-white">START CLOSING</span>
            <br />
            <span className="holographic-text">WITH DATA</span>
          </h2>
          <p className="text-[15px] lg:text-[17px] font-normal font-source-code text-white/50 mb-8 max-w-[400px] mx-auto">
            Generate AI visibility reports for prospects today.
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
                <li><Link href="/agencies" className="text-[#888] text-[14px] lg:text-[15px] font-source-sans hover:text-white transition-colors">For Agencies</Link></li>
                <li><Link href="/docs" className="text-[#888] text-[14px] lg:text-[15px] font-source-sans hover:text-white transition-colors">Documentation</Link></li>
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
    </>
  )
}