'use client'

import { useState } from 'react'
import { ShoppingBag, Sparkles, MessageSquare, Globe } from 'lucide-react'
import Image from 'next/image'

type IntelligenceTab = 'shopping' | 'brand' | 'conversations' | 'website'

const tabs = [
  {
    id: 'shopping' as const,
    icon: ShoppingBag,
    title: 'Shopping Visibility',
    description: 'See how often your products appear in AI shopping recommendations and where you rank by category.',
  },
  {
    id: 'brand' as const,
    icon: Sparkles,
    title: 'Brand Visibility',
    description: 'Understand how AI models describe your brand with sentiment, descriptors, and associations.',
  },
  {
    id: 'conversations' as const,
    icon: MessageSquare,
    title: 'Conversation Volumes',
    description: 'Discover what users ask AI about your brand, topics that trend, and how you compare to competitors.',
  },
  {
    id: 'website' as const,
    icon: Globe,
    title: 'Website Analytics',
    description: 'Audit how AI reads your site content, structure, and schema so your brand is easier to recommend.',
  },
]

const previewByTab: Record<IntelligenceTab, string> = {
  shopping: '/previews/shopping.png',
  brand: '/previews/brand.png',
  conversations: '/previews/conversations.png',
  website: '/previews/website.png',
}

export default function SolutionSection() {
  const [activeTab, setActiveTab] = useState<IntelligenceTab>('shopping')

  return (
    <section className="bg-[#1A2332] py-24 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header Block */}
        <div className="mx-auto max-w-3xl text-center">
          {/* Section Tag */}
          <div className="mb-6">
            <span className="inline-block px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white/75 uppercase tracking-wider">
              Intelligence Layer
            </span>
          </div>
          
          <h2 className="text-3xl md:text-[2.625rem] font-heading font-bold text-white tracking-tight leading-tight">
            Harbor shows you how AI sees your brand
          </h2>
          
          <p className="mt-6 text-lg md:text-xl text-[#CBD3E2] leading-relaxed max-w-[720px] mx-auto">
            Get real-time intelligence across shopping visibility, brand perception, and customer conversations.
          </p>
        </div>

        {/* Tab Cards */}
        <div className="mt-16 lg:mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  relative text-left rounded-[20px] p-6 lg:p-8 cursor-pointer
                  transition-all duration-200
                  ${isActive 
                    ? 'bg-[#0f1b2d] border-2 border-[#1FE0B7] -translate-y-1' 
                    : 'bg-[#0f1b2d] border border-white/[0.04] hover:-translate-y-0.5 hover:shadow-2xl'
                  }
                `}
              >
                <div className="mb-4">
                  <Icon 
                    className={`h-6 w-6 transition-colors ${
                      isActive ? 'text-[#1FE0B7]' : 'text-white'
                    }`} 
                    strokeWidth={1.5} 
                  />
                </div>
                
                <h3 className={`text-base lg:text-lg font-semibold mb-2 transition-colors ${
                  isActive ? 'text-white' : 'text-white'
                }`}>
                  {tab.title}
                </h3>
                
                <p className="text-sm text-[#A4B1C3] leading-relaxed">
                  {tab.description}
                </p>
              </button>
            )
          })}
        </div>

        {/* Dashboard Preview */}
        <div className="mt-12 lg:mt-16">
          <div className="relative mx-auto max-w-[1200px]">
            <div className="rounded-[28px] overflow-hidden bg-white shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
              <Image
                key={activeTab}
                src={previewByTab[activeTab]}
                alt={`Harbor ${tabs.find(t => t.id === activeTab)?.title} dashboard preview`}
                width={2400}
                height={1550}
                className="w-full h-auto transition-opacity duration-200"
                style={{
                  animation: 'fadeIn 200ms ease-in-out'
                }}
                priority={activeTab === 'shopping'}
              />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  )
}
}