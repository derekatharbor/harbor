// components/marketing/StickyNav.tsx

'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Menu } from 'lucide-react'
import MobileMenu from './MobileMenu'

// Product dropdown - left items control right content
const PRODUCT_LEFT = [
  {
    id: 'competitors',
    color: '#3B82F6',
    title: 'Competitors',
    description: 'Benchmark against your competition',
  },
  {
    id: 'analytics',
    color: '#F97316',
    title: 'Website Analytics',
    description: 'Understand how AI crawlers access your site',
  },
  {
    id: 'sources',
    color: '#22C55E',
    title: 'Sources',
    description: 'See where AI gets info about you',
  },
  {
    id: 'prompts',
    color: '#EAB308',
    title: 'Prompts',
    description: 'Track the queries mentioning your brand',
  },
]

const PRODUCT_RIGHT: Record<string, { title: string; description: string; href: string }[]> = {
  competitors: [
    { title: 'Visibility Comparison', description: 'See how you stack up across AI models', href: '/features/competitors/visibility' },
    { title: 'Share of Voice', description: 'Track mention frequency vs competitors', href: '/features/competitors/share-of-voice' },
    { title: 'Sentiment Analysis', description: 'Compare brand perception side-by-side', href: '/features/competitors/sentiment' },
    { title: 'Trend Tracking', description: 'Monitor competitive shifts over time', href: '/features/competitors/trends' },
  ],
  analytics: [
    { title: 'AI Crawler Detection', description: 'See which AI bots visit your site', href: '/features/analytics/crawlers' },
    { title: 'AI Redirect', description: 'Serve optimized content to AI crawlers', href: '/features/analytics/redirect' },
    { title: 'Crawl Frequency', description: 'Track how often AI indexes your content', href: '/features/analytics/frequency' },
    { title: 'Content Coverage', description: 'See which pages AI models reference', href: '/features/analytics/coverage' },
  ],
  sources: [
    { title: 'Citation Tracking', description: 'See what AI models cite about you', href: '/features/sources/citations' },
    { title: 'Source Quality', description: 'Analyze the sources AI references', href: '/features/sources/quality' },
    { title: 'Missing Sources', description: 'Find gaps in your AI presence', href: '/features/sources/gaps' },
  ],
  prompts: [
    { title: 'Query Monitoring', description: 'Track prompts that mention your brand', href: '/features/prompts/monitoring' },
    { title: 'Category Queries', description: 'See "best of" queries in your space', href: '/features/prompts/categories' },
    { title: 'Custom Prompts', description: 'Add your own queries to track', href: '/features/prompts/custom' },
  ],
}

// Solutions dropdown - left items control right content
const SOLUTIONS_LEFT = [
  {
    id: 'marketers',
    color: '#3B82F6',
    title: 'For Marketers',
    description: 'Own your AI narrative',
  },
  {
    id: 'agencies',
    color: '#F97316',
    title: 'For Agencies',
    description: 'Add GEO to your service offerings',
  },
  {
    id: 'ecommerce',
    color: '#EAB308',
    title: 'For E-Commerce',
    description: 'Get recommended in shopping queries',
  },
  {
    id: 'enterprise',
    color: '#22C55E',
    title: 'For Enterprise',
    description: 'Monitor AI mentions at scale',
  },
]

const SOLUTIONS_RIGHT: Record<string, { title: string; description: string; href: string }[]> = {
  marketers: [
    { title: 'Brand Monitoring', description: 'Track how AI describes your brand', href: '/solutions/marketers/monitoring' },
    { title: 'Competitive Intel', description: 'Benchmark against competitors', href: '/solutions/marketers/competitive' },
    { title: 'Reporting', description: 'Share AI visibility metrics with stakeholders', href: '/solutions/marketers/reporting' },
  ],
  agencies: [
    { title: 'Client Dashboards', description: 'White-label reporting for clients', href: '/solutions/agencies/dashboards' },
    { title: 'Pitch Workspace', description: 'Win new business with AI visibility data', href: '/pitch' },
    { title: 'Multi-Brand Management', description: 'Manage all clients in one place', href: '/solutions/agencies/multi-brand' },
  ],
  ecommerce: [
    { title: 'Product Visibility', description: 'Track product mentions in AI answers', href: '/solutions/ecommerce/products' },
    { title: 'Shopping Queries', description: 'Monitor "best X under $Y" prompts', href: '/solutions/ecommerce/shopping' },
    { title: 'Category Rankings', description: 'See where you rank in your category', href: '/solutions/ecommerce/rankings' },
  ],
  enterprise: [
    { title: 'Multi-Model Tracking', description: 'Monitor all major AI platforms', href: '/solutions/enterprise/multi-model' },
    { title: 'API Access', description: 'Integrate visibility data into your stack', href: '/solutions/enterprise/api' },
    { title: 'Custom Reporting', description: 'Enterprise-grade analytics and exports', href: '/solutions/enterprise/reporting' },
  ],
}

interface DropdownProps {
  items: typeof PRODUCT_LEFT
  rightContent: typeof PRODUCT_RIGHT
  defaultActive: string
}

function DropdownContent({ items, rightContent, defaultActive }: DropdownProps) {
  const [activeItem, setActiveItem] = useState(defaultActive)

  return (
    <div className="flex">
      {/* Left Column */}
      <div className="w-[260px] py-3 px-2">
        {items.map((item) => (
          <div
            key={item.id}
            onMouseEnter={() => setActiveItem(item.id)}
            className={`group flex items-start gap-3 px-4 py-2.5 rounded-lg cursor-pointer transition-colors ${
              activeItem === item.id ? 'bg-[#F6F5F3]' : 'hover:bg-[#F6F5F3]'
            }`}
          >
            <div
              className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[14px] font-semibold font-source-sans text-black">
                  {item.title}
                </span>
                <svg
                  className={`w-3.5 h-3.5 transition-all ${
                    activeItem === item.id ? 'text-black/50 translate-x-0.5' : 'text-black/30'
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <p className="text-[12px] font-normal font-source-sans text-[#6F6E6E] mt-0.5">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="w-px bg-[#EFEEED] my-3" />

      {/* Right Column - Dynamic based on hover */}
      <div className="w-[260px] py-3 pl-2">
        {rightContent[activeItem]?.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block px-4 py-2 rounded-lg hover:bg-[#F6F5F3] transition-colors"
          >
            <span className="text-[13px] font-semibold font-source-sans text-black">
              {item.title}
            </span>
            <p className="text-[11px] font-normal font-source-sans text-[#6F6E6E] mt-0.5">
              {item.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}

interface NavDropdownProps {
  label: string
  children: React.ReactNode
  isDark: boolean
}

function NavDropdown({ label, children, isDark }: NavDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setIsOpen(false), 150)
  }

  return (
    <div 
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        className={`flex items-center gap-1 px-2 py-1.5 text-[13px] font-medium font-source-sans transition-colors rounded ${
          isDark 
            ? isOpen ? 'text-white bg-white/10' : 'text-white/80 hover:text-white hover:bg-white/10'
            : isOpen ? 'text-black bg-black/5' : 'text-black/70 hover:text-black hover:bg-black/5'
        }`}
      >
        {label}
        <svg
          className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Panel - Left aligned */}
      <div
        className={`absolute top-full left-0 mt-3 bg-white rounded-xl shadow-[0px_8px_30px_rgba(0,0,0,0.12)] border border-black/5 transition-all duration-150 ${
          isOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}
      >
        {children}
      </div>
    </div>
  )
}

export default function StickyNav() {
  const [isVisible, setIsVisible] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 100)
      
      const darkSection = document.getElementById('dark-section')
      const lightSection = document.getElementById('light-section')
      
      if (darkSection && lightSection) {
        const darkRect = darkSection.getBoundingClientRect()
        const lightRect = lightSection.getBoundingClientRect()
        const overDark = darkRect.top < 80 && lightRect.top > 80
        setIsDark(overDark)
      } else if (darkSection) {
        const darkRect = darkSection.getBoundingClientRect()
        setIsDark(darkRect.top < 80)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <div
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
          isVisible 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        {/* Desktop Nav */}
        <div className={`hidden lg:flex items-center justify-between w-[768px] h-14 px-5 rounded-xl transition-all duration-300 backdrop-blur-md ${
          isDark 
            ? 'bg-[#111111]/80 shadow-[0px_4px_12px_2px_rgba(0,0,0,0.5)] border border-white/10' 
            : 'bg-[#FBFAF8]/80 shadow-[0px_4px_4px_1px_rgba(120,120,120,0.25)] border border-black/5'
        }`}>
          {/* Left: Logo + Nav Links */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center mr-3">
              <Image
                src={isDark ? '/images/Harbor_White_Logo.png' : '/images/harbor-dark-solo.svg'}
                alt="Harbor"
                width={25}
                height={25}
                className="transition-opacity duration-300"
              />
            </Link>

            {/* Nav Dropdowns */}
            <NavDropdown label="Product" isDark={isDark}>
              <DropdownContent 
                items={PRODUCT_LEFT} 
                rightContent={PRODUCT_RIGHT} 
                defaultActive="competitors" 
              />
            </NavDropdown>

            <NavDropdown label="Solutions" isDark={isDark}>
              <DropdownContent 
                items={SOLUTIONS_LEFT} 
                rightContent={SOLUTIONS_RIGHT} 
                defaultActive="marketers" 
              />
            </NavDropdown>

            <Link
              href="/pricing"
              className={`px-2 py-1.5 text-[13px] font-medium font-source-sans transition-colors rounded ${
                isDark 
                  ? 'text-white/80 hover:text-white hover:bg-white/10' 
                  : 'text-black/70 hover:text-black hover:bg-black/5'
              }`}
            >
              Pricing
            </Link>
          </div>

          {/* Right: Buttons */}
          <div className="flex items-center gap-2">
            <Link 
              href="/login"
              className={`h-9 px-5 rounded-md border text-[13px] font-medium font-space tracking-[0.61px] transition-colors flex items-center ${
                isDark 
                  ? 'border-[#333] text-white hover:bg-white/10' 
                  : 'border-[#B1B0AF] text-black hover:bg-black/5'
              }`}
            >
              Login
            </Link>
            <Link 
              href="/signup"
              className={`h-9 px-5 rounded-md text-[13px] font-medium font-space tracking-[0.61px] flex items-center transition-colors ${
                isDark
                  ? 'bg-white text-black hover:bg-gray-200'
                  : 'btn-black'
              }`}
            >
              Get started
            </Link>
          </div>
        </div>

        {/* Mobile Nav */}
        <div className={`lg:hidden flex items-center justify-between w-[calc(100vw-32px)] max-w-[400px] h-12 px-4 rounded-xl transition-all duration-300 backdrop-blur-md ${
          isDark 
            ? 'bg-[#111111]/80 shadow-[0px_4px_12px_2px_rgba(0,0,0,0.5)] border border-white/10' 
            : 'bg-[#FBFAF8]/80 shadow-[0px_4px_4px_1px_rgba(120,120,120,0.25)] border border-black/5'
        }`}>
          <Link href="/" className="flex items-center">
            <Image
              src={isDark ? '/images/Harbor_White_Logo.png' : '/images/harbor-dark-solo.svg'}
              alt="Harbor"
              width={24}
              height={24}
              className="transition-opacity duration-300"
            />
          </Link>

          <div className="flex items-center gap-2">
            <Link 
              href="/signup"
              className={`h-8 px-4 rounded-md text-[12px] font-medium font-space tracking-[0.5px] flex items-center transition-colors ${
                isDark
                  ? 'bg-white text-black hover:bg-gray-200'
                  : 'btn-black'
              }`}
            >
              Get started
            </Link>
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className={`p-1.5 rounded-lg transition-colors ${
                isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'
              }`}
            >
              <Menu className={`w-5 h-5 ${isDark ? 'text-white' : 'text-black'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileMenu 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
        isDark={isDark}
      />
    </>
  )
}