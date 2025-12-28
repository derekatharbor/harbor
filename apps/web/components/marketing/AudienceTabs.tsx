'use client'

import { useState } from 'react'

// Define audience segments - you'll add your own illustrations
const AUDIENCES = [
  {
    id: 'marketers',
    title: 'Marketers',
    imageBW: '/images/audiences/marketers-bw.png',
    imageColor: '/images/audiences/marketers-color.png',
    headline: 'Own your AI narrative',
    stat: 'Track visibility across 4 AI platforms',
    description: 'See exactly how ChatGPT, Claude, Perplexity, and Gemini describe your brand. Monitor sentiment shifts and get alerts when your positioning changes.',
    cta: 'Explore Marketer solutions',
    ctaLink: '/solutions/marketers'
  },
  {
    id: 'founders',
    title: 'Founders',
    imageBW: '/images/audiences/founders-bw.png',
    imageColor: '/images/audiences/founders-color.png',
    headline: 'Win before they search Google',
    stat: '73% of AI users trust recommendations',
    description: 'AI is becoming the first touchpoint for product discovery. Make sure your startup shows up when prospects ask "what\'s the best tool for X?"',
    cta: 'Explore Founder solutions',
    ctaLink: '/solutions/founders'
  },
  {
    id: 'agencies',
    title: 'Agencies',
    imageBW: '/images/audiences/agencies-bw.png',
    imageColor: '/images/audiences/agencies-color.png',
    headline: 'New revenue stream',
    stat: 'Add GEO to your service offering',
    description: 'Generative Engine Optimization is the next SEO. Be first to offer AI visibility audits and ongoing monitoring to your clients.',
    cta: 'Explore Agency solutions',
    ctaLink: '/solutions/agencies'
  },
  {
    id: 'ecommerce',
    title: 'E-commerce',
    imageBW: '/images/audiences/ecommerce-bw.png',
    imageColor: '/images/audiences/ecommerce-color.png',
    headline: 'Get recommended',
    stat: 'Track product mentions in shopping queries',
    description: 'When someone asks AI "best running shoes under $150", is your product in the answer? Track shopping intent queries across all major AI platforms.',
    cta: 'Explore E-commerce solutions',
    ctaLink: '/solutions/ecommerce'
  },
  {
    id: 'enterprise',
    title: 'Enterprise',
    imageBW: '/images/audiences/enterprise-bw.png',
    imageColor: '/images/audiences/enterprise-color.png',
    headline: 'Protect your brand',
    stat: 'Monitor AI mentions at scale',
    description: 'Enterprise-grade monitoring across all AI touchpoints. Track brand sentiment, competitive positioning, and misinformation in real-time.',
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
        <h2 className="text-center text-[42px] font-semibold font-source-sans tracking-tight text-black leading-tight mb-16">
          Built for teams who want to<br />
          <span className="holographic-text">win AI search</span>
        </h2>

        {/* Tab Cards Container */}
        <div className="bg-[#FBFAF9] rounded-[15px] border border-[#EFEEED] p-6">
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
                  className="w-[160px] h-[232px] flex flex-col items-center pt-5 rounded-[7px] border border-[#EBEBE8] bg-[#F6F5F3] transition-colors duration-200"
                >
                  {/* Title */}
                  <span className={`text-[17px] font-medium font-source-sans mb-4 transition-colors ${
                    isActive ? 'text-black' : 'text-black/50'
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
          <div className="flex gap-16 px-2">
            {/* Left - Title + CTA */}
            <div className="w-[305px] flex-shrink-0">
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

            {/* Right - Stat + Description */}
            <div className="flex-1">
              <p className="text-[25px] font-normal font-source-sans text-black">
                {active.stat}
              </p>
              
              <p className="text-[20px] font-normal font-source-sans text-[#6F6E6E] mt-2 leading-relaxed">
                {active.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}