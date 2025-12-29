// components/marketing/AudienceTabs.tsx

'use client'

import { useState } from 'react'

// Define audience segments
const AUDIENCES = [
  {
    id: 'marketers',
    title: 'Marketers',
    imageBW: '/images/audiences/marketers-bw.png',
    imageColor: '/images/audiences/marketers-color.png',
    headline: 'Own your AI narrative',
    stat1: 'Track visibility across 4 AI platforms',
    desc1: 'See exactly how ChatGPT, Claude, Perplexity, and Gemini describe your brand. Monitor sentiment shifts and get alerts when your positioning changes.',
    stat2: 'Benchmark against competitors',
    desc2: 'Know where you stand. Compare your AI visibility scores against competitors and identify opportunities to improve your positioning.',
    cta: 'Explore Marketer solutions',
    ctaLink: '/solutions/marketers'
  },
  {
    id: 'universities',
    title: 'Universities',
    imageBW: '/images/audiences/universities-bw.png',
    imageColor: '/images/audiences/universities-color.png',
    headline: 'Attract the right students',
    stat1: 'Gen Z asks AI for college advice',
    desc1: 'Prospective students are asking AI which schools to apply to. Make sure your programs, campus life, and outcomes are represented accurately.',
    stat2: 'Track program visibility',
    desc2: 'See how AI describes your specific programs, departments, and campus. Identify gaps in how your institution is being presented.',
    cta: 'Explore University solutions',
    ctaLink: '/solutions/universities'
  },
  {
    id: 'smbs',
    title: 'SMBs',
    imageBW: '/images/audiences/smbs-bw.png',
    imageColor: '/images/audiences/smbs-color.png',
    headline: 'Compete with the big guys',
    stat1: 'AI levels the playing field',
    desc1: 'You don\'t need a massive SEO budget to show up in AI answers. Track how you\'re positioned against larger competitors.',
    stat2: 'Find your niche',
    desc2: 'Discover the specific queries where you can win. AI often recommends specialists over generalists — use that to your advantage.',
    cta: 'Explore SMB solutions',
    ctaLink: '/solutions/smbs'
  },
  {
    id: 'ecommerce',
    title: 'E-Commerce',
    imageBW: '/images/audiences/ecommerce-bw.png',
    imageColor: '/images/audiences/ecommerce-color.png',
    headline: 'Get recommended',
    stat1: 'Track product mentions in shopping queries',
    desc1: 'When someone asks AI "best running shoes under $150", is your product in the answer? Track shopping intent queries across all major AI platforms.',
    stat2: 'Monitor category positioning',
    desc2: 'See which products AI recommends in your category and understand why. Optimize your product content to improve AI visibility.',
    cta: 'Explore E-Commerce solutions',
    ctaLink: '/solutions/ecommerce'
  },
  {
    id: 'enterprise',
    title: 'Enterprise',
    imageBW: '/images/audiences/enterprise-bw.png',
    imageColor: '/images/audiences/enterprise-color.png',
    headline: 'Protect your brand',
    stat1: 'Monitor AI mentions at scale',
    desc1: 'Enterprise-grade monitoring across all AI touchpoints. Track brand sentiment, competitive positioning, and misinformation in real-time.',
    stat2: 'Mitigate AI-driven risks',
    desc2: 'Get alerts when AI models spread inaccurate information about your brand. Respond quickly before misinformation spreads.',
    cta: 'Explore Enterprise solutions',
    ctaLink: '/solutions/enterprise'
  },
]

export default function AudienceTabs() {
  const [activeTab, setActiveTab] = useState(0)
  const [hoveredTab, setHoveredTab] = useState<number | null>(null)
  const active = AUDIENCES[activeTab]

  return (
    <section className="w-full bg-[#F6F5F3] py-24">
      <div className="max-w-[1200px] mx-auto px-14">
        {/* Section Header */}
        <h2 className="text-center text-[42px] font-medium font-source-sans tracking-tight text-black leading-tight mb-16">
          Built for teams who want to<br />
          win AI search
        </h2>

        {/* Tab Cards Container */}
        <div className="w-[880px] mx-auto bg-[#FBFAF9] rounded-[15px] border border-[#EFEEED] p-6">
          {/* Cards Row */}
          <div className="flex gap-3 mb-8">
            {AUDIENCES.map((audience, index) => {
              const isActive = activeTab === index
              const isHovered = hoveredTab === index
              const showColor = isActive || isHovered

              return (
                <button
                  key={audience.id}
                  onClick={() => setActiveTab(index)}
                  onMouseEnter={() => setHoveredTab(index)}
                  onMouseLeave={() => setHoveredTab(null)}
                  className={`w-[160px] h-[232px] flex flex-col items-center pt-5 rounded-[7px] border border-[#EBEBE8] transition-colors duration-200 ${
                    showColor ? 'bg-[#F6F5F3]' : 'bg-[#F7F7F4] hover:bg-[#F6F5F3]'
                  }`}
                >
                  {/* Title */}
                  <span className={`text-[17px] font-medium font-source-sans mb-4 transition-colors ${
                    showColor ? 'text-black' : 'text-black/50'
                  }`}>
                    {audience.title}
                  </span>

                  {/* Illustration */}
                  <div className="w-[114px] h-[151px] relative">
                    {/* B/W version */}
                    <img
                      src={audience.imageBW}
                      alt=""
                      className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-200 ${
                        showColor ? 'opacity-0' : 'opacity-100'
                      }`}
                    />
                    {/* Color version */}
                    <img
                      src={audience.imageColor}
                      alt=""
                      className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-200 ${
                        showColor ? 'opacity-100' : 'opacity-0'
                      }`}
                    />
                  </div>
                </button>
              )
            })}
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-[#EFEEED] mb-8" />

          {/* Content Area */}
          <div className="flex gap-12 px-2">
            {/* Left - Title + CTA */}
            <div className="w-[280px] flex-shrink-0">
              <h3 className="text-[35px] font-medium font-inter text-black leading-tight">
                {active.headline}
              </h3>

              <a 
                href={active.ctaLink}
                className="inline-flex items-center mt-6 h-[39px] px-5 rounded-[7px] border border-[#B4B4B3] bg-[#FBFAF9] text-[15px] font-normal font-source-sans text-black hover:bg-black hover:text-white hover:border-black transition-colors"
              >
                {active.cta}
              </a>
            </div>

            {/* Right - Two stacked text blocks */}
            <div className="flex-1 space-y-6">
              {/* Block 1 */}
              <div>
                <p className="text-[25px] font-normal font-source-sans text-black">
                  {active.stat1}
                </p>
                <p className="text-[17px] font-normal font-source-sans text-[#6F6E6E] mt-2 leading-relaxed">
                  {active.desc1}
                </p>
              </div>

              {/* Divider */}
              <div className="w-full h-px bg-[#EFEEED]" />

              {/* Block 2 */}
              <div>
                <p className="text-[25px] font-normal font-source-sans text-black">
                  {active.stat2}
                </p>
                <p className="text-[17px] font-normal font-source-sans text-[#6F6E6E] mt-2 leading-relaxed">
                  {active.desc2}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}