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
    cta: 'Explore for Marketers',
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
    cta: 'Explore for Founders',
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
    cta: 'Explore for Agencies',
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
    cta: 'Explore for E-commerce',
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
    cta: 'Explore for Enterprise',
    ctaLink: '/solutions/enterprise'
  },
]

export default function AudienceTabs() {
  const [activeTab, setActiveTab] = useState(0)
  const active = AUDIENCES[activeTab]

  return (
    <section className="w-full bg-[#F6F5F3] py-24">
      <div className="max-w-[1200px] mx-auto px-14">
        {/* Section Header */}
        <h2 className="text-center text-[42px] font-semibold font-source-sans tracking-tight text-black leading-tight mb-16">
          Built for teams who want to<br />
          <span className="holographic-text">win AI search</span>
        </h2>

        {/* Tab Cards */}
        <div className="flex justify-center gap-1 mb-16">
          {AUDIENCES.map((audience, index) => (
            <button
              key={audience.id}
              onClick={() => setActiveTab(index)}
              className={`flex flex-col items-center p-6 rounded-xl transition-all duration-300 w-[180px] ${
                activeTab === index 
                  ? 'bg-white shadow-md' 
                  : 'bg-transparent hover:bg-white/50'
              }`}
            >
              {/* Illustration - swap between BW and color */}
              <div className="w-[120px] h-[120px] mb-3 relative">
                {/* B/W version - always present, fades out when active */}
                <img
                  src={audience.imageBW}
                  alt=""
                  className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${
                    activeTab === index ? 'opacity-0' : 'opacity-100'
                  }`}
                />
                {/* Color version - fades in when active */}
                <img
                  src={audience.imageColor}
                  alt=""
                  className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${
                    activeTab === index ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              </div>
              {/* Title */}
              <span className={`text-[15px] font-medium font-source-sans transition-colors ${
                activeTab === index ? 'text-black' : 'text-black/60'
              }`}>
                {audience.title}
              </span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-2 gap-16 items-center">
          {/* Left - Text Content */}
          <div>
            <h3 className="text-[36px] font-semibold font-source-sans tracking-tight text-black leading-tight">
              {active.headline}
            </h3>
            
            <p className="text-[18px] font-semibold font-source-sans text-black mt-6">
              {active.stat}
            </p>
            
            <p className="text-[16px] font-normal font-source-code text-[#6C6C6B] mt-4 leading-relaxed">
              {active.description}
            </p>

            <a 
              href={active.ctaLink}
              className="inline-flex items-center mt-8 h-12 px-6 rounded-[7px] border border-[#B1B0AF] text-[15px] font-medium font-source-sans text-black hover:bg-black hover:text-white hover:border-black transition-colors"
            >
              {active.cta}
            </a>
          </div>

          {/* Right - Screenshot/Visual placeholder */}
          <div className="aspect-[4/3] bg-white rounded-xl border border-black/10 shadow-sm flex items-center justify-center">
            <span className="text-black/20 text-lg font-source-code">Feature Screenshot</span>
          </div>
        </div>
      </div>
    </section>
  )
}
