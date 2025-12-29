// app/page.tsx
// Harbor Homepage - Marketing landing page (Responsive)

import { Metadata } from 'next'
import Link from 'next/link'
import StickyNav from '@/components/marketing/StickyNav'
import MainNav from '@/components/marketing/MainNav'
import PromptsMarquee from '@/components/marketing/PromptsMarquee'
import AudienceTabs from '@/components/marketing/AudienceTabs'

export const metadata: Metadata = {
  title: 'Harbor - AI Visibility Analytics',
  description: 'Visibility analytics to win AI search. Measure your presence across AI answers and competitor comparisons.',
}

// AI Model links with pre-loaded prompt
const AI_PROMPT = encodeURIComponent("I'm researching AI visibility and want to understand how Harbor helps brands track and optimize how they appear in AI search results like ChatGPT, Claude, Perplexity, and Gemini. Summarize what you find from Harbor's website: https://useharbor.io. Start with what stands out about their platform (bullet points), then explain who it's built for and how it works.")

const AI_MODELS = [
  { name: 'ChatGPT', icon: '/icons/ai-chatgpt.svg', url: `https://chat.openai.com/?q=${AI_PROMPT}` },
  { name: 'Gemini', icon: '/icons/ai-gemini.svg', url: `https://gemini.google.com/app?q=${AI_PROMPT}` },
  { name: 'Perplexity', icon: '/icons/ai-perplexity.svg', url: `https://www.perplexity.ai/search?q=${AI_PROMPT}` },
  { name: 'Claude', icon: '/icons/ai-claude.svg', url: `https://claude.ai/new?q=${AI_PROMPT}` },
  { name: 'Grok', icon: '/icons/ai-grok.svg', url: `https://grok.x.ai/?q=${AI_PROMPT}` },
]

export default function HomePage() {
  return (
    <>
      <StickyNav />
      
      {/* Hero Section */}
      <div className="min-h-screen lg:h-[1040px] bg-[#F6F5F3] relative overflow-hidden">
        <img src="/images/hero-noise.png" alt="" className="absolute bottom-0 left-0 w-full pointer-events-none" />
        <MainNav />

        <div className="flex flex-col items-center pt-12 lg:pt-[100px] px-6 lg:px-0">
          <Link href="/pitch" className="flex items-center gap-1.5 h-8 px-2 bg-white rounded-[7px] shadow-[0px_2px_2px_rgba(120,120,120,0.25)] mb-6 lg:mb-8 hover:shadow-[0px_3px_6px_rgba(120,120,120,0.3)] transition-shadow">
            <span className="px-2 py-0.5 bg-black rounded-[3px] text-[11px] lg:text-[12px] font-semibold font-source-code tracking-[0.69px] text-white">NEW</span>
            <span className="text-[11px] lg:text-[12px] font-semibold font-source-sans tracking-[0.69px] text-black">Try our new Agency Pitch space</span>
          </Link>

          <h1 className="max-w-[320px] lg:max-w-[448px] text-center text-[32px] lg:text-[50px] font-semibold font-source-sans tracking-[0.69px] text-black leading-[1.1] lg:leading-[1.04]">
            Visibility analytics to win AI search
          </h1>

          <p className="max-w-[320px] lg:max-w-[448px] mt-4 lg:mt-6 text-center text-[16px] lg:text-[20px] font-normal font-source-code tracking-[0.5px] lg:tracking-[0.69px] text-[#6C6C6B]">
            Measure your presence across AI answers and competitor comparisons.
          </p>

          {/* Desktop Email Form */}
          <form className="hidden lg:flex items-center mt-8 h-14 bg-white rounded-[10px] border border-[#E8E8E7] shadow-sm">
            <input type="email" name="email" placeholder="Enter your company email" className="w-[340px] h-full px-5 text-[16px] font-normal font-source-sans tracking-[0.5px] text-black placeholder:text-[#A0A0A0] bg-transparent outline-none" required />
            <button type="submit" className="btn-black h-[42px] px-7 mr-1.5 rounded-[7px] text-[15px] font-medium font-source-sans tracking-[0.69px] whitespace-nowrap">Get started</button>
          </form>

          {/* Mobile Email Form + Login */}
          <div className="lg:hidden flex flex-col gap-3 mt-6 w-full max-w-[320px]">
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
            <Link href="/login" className="h-12 rounded-[10px] border border-[#B1B0AF] text-[15px] font-medium font-source-sans text-black flex items-center justify-center hover:bg-black/5 transition-colors">
              Login
            </Link>
          </div>
        </div>
      </div>

      {/* Dark Section */}
      <section id="dark-section" className="w-full bg-[#111111]">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-14 py-16 lg:py-24">
          <div className="text-center mb-10 lg:mb-16">
            <div className="inline-flex items-center gap-2 h-[34px] px-3 bg-[#272625] rounded-[9px] mb-4 lg:mb-6">
              <div className="flex items-center justify-center w-[44px] h-[22px] rounded-[5px] overflow-hidden" style={{ backgroundImage: 'url(/images/holographic-bg.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <span className="text-[10px] font-bold font-source-code text-black tracking-wider">NEW</span>
              </div>
              <span className="text-[13px] font-medium font-source-sans text-white/80">Competitor Intelligence</span>
            </div>
            <h2 className="text-[28px] lg:text-[42px] font-semibold font-source-sans tracking-tight text-white leading-tight">See how you compare</h2>
            <p className="mt-3 lg:mt-4 text-[15px] lg:text-[18px] font-normal font-source-code text-white/50 max-w-[500px] mx-auto px-4 lg:px-0">Track your brand visibility against competitors across all major AI platforms.</p>
          </div>

          <div className="relative max-w-5xl mx-auto">
            <div className="relative h-[300px] sm:h-[400px] lg:h-[680px] bg-[#1a1a1a] rounded-xl border border-white/10 overflow-hidden">
              <img src="/images/dashboard-preview.png" alt="Harbor Dashboard" className="w-full h-full object-cover object-top" />
            </div>

            {/* Floating Cards - Desktop only */}
            <div className="hidden lg:block absolute -left-20 top-1/4" style={{ animation: 'float 5s ease-in-out infinite' }}>
              <div className="flex items-start gap-3 p-4 bg-white/80 backdrop-blur-xl rounded-xl border border-white/50 shadow-[0px_4px_20px_rgba(0,0,0,0.15)] max-w-[280px]">
                <div className="w-8 h-8 rounded-lg flex-shrink-0 overflow-hidden bg-black/5">
                  <img src="https://cdn.brandfetch.io/openai.com?c=1id1Fyz-h7an5-5KR_y" alt="ChatGPT" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-black text-sm font-medium leading-snug">Best CRM for small businesses?</p>
                  <p className="text-black/50 text-xs mt-1">ChatGPT • 2.4M monthly searches</p>
                </div>
              </div>
            </div>

            <div className="hidden lg:block absolute -right-20 top-1/3" style={{ animation: 'float 4.5s ease-in-out infinite 0.5s' }}>
              <div className="flex items-start gap-3 p-4 bg-white/80 backdrop-blur-xl rounded-xl border border-white/50 shadow-[0px_4px_20px_rgba(0,0,0,0.15)] max-w-[280px]">
                <div className="w-8 h-8 rounded-lg flex-shrink-0 overflow-hidden bg-black/5">
                  <img src="https://cdn.brandfetch.io/perplexity.ai?c=1id1Fyz-h7an5-5KR_y" alt="Perplexity" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-black text-sm font-medium leading-snug">Compare HubSpot vs Salesforce</p>
                  <p className="text-black/50 text-xs mt-1">Perplexity • 1.8M monthly searches</p>
                </div>
              </div>
            </div>

            <div className="hidden lg:block absolute -left-16 bottom-1/4" style={{ animation: 'float 4s ease-in-out infinite 0.25s' }}>
              <div className="flex items-start gap-3 p-4 bg-white/80 backdrop-blur-xl rounded-xl border border-white/50 shadow-[0px_4px_20px_rgba(0,0,0,0.15)] max-w-[260px]">
                <div className="w-8 h-8 rounded-lg flex-shrink-0 overflow-hidden bg-black/5">
                  <img src="https://cdn.brandfetch.io/anthropic.com?c=1id1Fyz-h7an5-5KR_y" alt="Claude" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-black text-sm font-medium leading-snug">What&apos;s the easiest CRM to use?</p>
                  <p className="text-black/50 text-xs mt-1">Claude • 890K monthly searches</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <PromptsMarquee />
      </section>

      {/* Light Section */}
      <section id="light-section" className="w-full bg-[#F6F5F3] py-16 lg:py-24">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-14">
          <div className="text-center mb-10 lg:mb-16">
            <h2 className="text-[28px] lg:text-[42px] font-semibold font-source-sans tracking-tight text-black leading-tight">Track your AI presence</h2>
            <p className="mt-3 lg:mt-4 text-[15px] lg:text-[18px] font-normal font-source-code text-[#6F6E6E] max-w-[500px] mx-auto">Understand how ChatGPT, Claude, Perplexity, and Gemini describe your brand to millions of users.</p>
          </div>
          <div className="max-w-[1100px] mx-auto">
            <img src="/images/competitors-preview.png" alt="Harbor Competitors Dashboard" className="w-full" />
          </div>
        </div>
      </section>

      {/* CTA Card Section */}
      <section className="w-full bg-[#F6F5F3] pb-16 lg:pb-24">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-14">
          <div className="w-full rounded-[20px] py-12 lg:py-16 px-6 lg:px-12 flex flex-col items-center" style={{ backgroundColor: '#10054D' }}>
            <h2 className="text-center font-source-sans font-black tracking-tight mb-6 lg:mb-8 text-[40px] lg:text-[90px] leading-[1]">
              <span style={{ backgroundImage: 'url(/images/holographic-bg.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: 'drop-shadow(0 0 30px rgba(255, 255, 255, 0.4))' }}>AI SEARCH</span>
              <br /><span className="text-white">IS THE NEW SEO</span>
            </h2>
            <div className="hidden lg:flex items-center h-[52px] bg-[#1a1a3e]/50 rounded-[10px] border border-white/20">
              <input type="email" placeholder="Enter your company email" className="w-[280px] h-full px-5 text-[15px] font-light font-source-sans text-white placeholder:text-white/50 bg-transparent outline-none" />
              <button className="h-[38px] px-5 mr-1.5 bg-white rounded-[6px] text-[13px] font-semibold font-source-sans text-black hover:bg-gray-100 transition-colors whitespace-nowrap">Get started</button>
            </div>
            <Link href="/signup" className="lg:hidden h-12 px-8 rounded-[10px] bg-white text-black text-[15px] font-semibold font-source-sans flex items-center justify-center">Get started free</Link>
          </div>
        </div>
      </section>

      <AudienceTabs />

      {/* Features Grid */}
      <section className="w-full bg-[#F6F5F3] py-16 lg:py-24">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-14">
          <div className="text-center mb-10 lg:mb-16">
            <h2 className="text-[28px] lg:text-[42px] font-semibold font-source-sans tracking-tight text-black leading-tight">Understand how AI sees your brand</h2>
            <p className="mt-3 lg:mt-4 text-[15px] lg:text-[18px] font-normal font-source-code text-[#6F6E6E] max-w-[500px] mx-auto">Comprehensive visibility analytics across ChatGPT, Claude, Perplexity, and Gemini.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 max-w-[900px] mx-auto">
            {[
              { icon: 'visibility.png', title: 'Track AI visibility', desc: 'See exactly how often AI models mention your brand in responses.' },
              { icon: 'user.png', title: 'Benchmark competitors', desc: 'Compare your visibility against competitors across all AI platforms.' },
              { icon: 'trophy.png', title: 'Get actionable insights', desc: 'Receive recommendations to improve how AI describes your brand.' },
              { icon: 'mentions.png', title: 'Monitor sentiment', desc: 'Track whether AI portrays your brand positively, neutrally, or negatively.' },
            ].map((f, i) => (
              <div key={i} className="bg-white rounded-[15px] border border-[#EFEEED] p-6 lg:p-8">
                <div className="w-14 h-14 rounded-xl bg-[#F6F5F3] flex items-center justify-center mb-4">
                  <img src={`/icons/${f.icon}`} alt="" className="w-8 h-8" />
                </div>
                <h3 className="text-[18px] lg:text-[20px] font-semibold font-source-sans text-black mb-2">{f.title}</h3>
                <p className="text-[14px] lg:text-[15px] font-normal font-source-code text-[#6F6E6E] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="w-full bg-[#111111] py-16 lg:py-24">
        <div className="max-w-[800px] mx-auto px-6 lg:px-14 text-center">
          <h2 className="text-[28px] lg:text-[42px] font-semibold font-source-sans tracking-tight text-white leading-tight mb-4">
            <span style={{ backgroundImage: 'url(/images/holographic-bg.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>UNLOCK YOUR</span>
            <br />
            <span style={{ backgroundImage: 'url(/images/holographic-bg.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI VISIBILITY</span>
          </h2>
          <div className="hidden lg:flex items-center justify-center mt-8">
            <div className="flex items-center h-[56px] bg-[#1a1a1a] rounded-[10px] border border-[#333]">
              <input type="email" placeholder="Enter your company email" className="w-[300px] h-full px-5 text-[16px] font-light font-source-sans text-white placeholder:text-[#666] bg-transparent outline-none" />
              <button className="h-[42px] px-6 mr-2 bg-white rounded-[7px] text-[14px] font-semibold font-source-sans text-black hover:bg-gray-100 transition-colors whitespace-nowrap">Get free trial</button>
            </div>
          </div>
          <Link href="/signup" className="lg:hidden inline-flex h-12 px-8 mt-6 rounded-[10px] bg-white text-black text-[15px] font-semibold font-source-sans items-center justify-center">Get started free</Link>
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
            <div className="hidden lg:block"><img src="/images/Harbor_White_Logo.png" alt="Harbor" className="w-10 h-10 mb-6" /></div>
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
    </>
  )
}