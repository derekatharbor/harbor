// components/marketing/MainNav.tsx

'use client'

import { useState, useRef } from 'react'
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
      <div className="w-[280px] py-3 px-2">
        {items.map((item) => (
          <div
            key={item.id}
            onMouseEnter={() => setActiveItem(item.id)}
            className={`group flex items-start gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors ${
              activeItem === item.id ? 'bg-[#F6F5F3]' : 'hover:bg-[#F6F5F3]'
            }`}
          >
            <div
              className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[15px] font-semibold font-source-sans text-black">
                  {item.title}
                </span>
                <svg
                  className={`w-4 h-4 transition-all ${
                    activeItem === item.id ? 'text-black/50 translate-x-0.5' : 'text-black/30'
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <p className="text-[13px] font-normal font-source-sans text-[#6F6E6E] mt-0.5">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="w-px bg-[#EFEEED] my-3" />

      {/* Right Column - Dynamic based on hover */}
      <div className="w-[280px] py-3 pl-2">
        {rightContent[activeItem]?.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block px-4 py-2.5 rounded-lg hover:bg-[#F6F5F3] transition-colors"
          >
            <span className="text-[14px] font-semibold font-source-sans text-black">
              {item.title}
            </span>
            <p className="text-[12px] font-normal font-source-sans text-[#6F6E6E] mt-0.5">
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
}

function NavDropdown({ label, children }: NavDropdownProps) {
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
        className={`flex items-center gap-1.5 px-3 py-2 text-[15px] font-medium font-source-sans transition-colors rounded ${
          isOpen ? 'text-black bg-black/5' : 'text-black/70 hover:text-black hover:bg-black/5'
        }`}
      >
        {label}
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Panel - Left aligned */}
      <div
        className={`absolute top-full left-0 mt-2 bg-white rounded-xl shadow-[0px_8px_30px_rgba(0,0,0,0.12)] border border-black/5 transition-all duration-150 ${
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

export default function MainNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      <nav className="flex items-center justify-between px-6 lg:px-14 py-4 lg:py-6">
        {/* Left: Logo + Nav Links */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center mr-4">
            <Image
              src="/images/harbor-logo-black.svg"
              alt="Harbor"
              width={140}
              height={32}
              className="h-7 lg:h-8 w-auto"
            />
          </Link>

          {/* Desktop Nav Dropdowns - Hidden on mobile */}
          <div className="hidden lg:flex items-center gap-2">
            <NavDropdown label="Product">
              <DropdownContent 
                items={PRODUCT_LEFT} 
                rightContent={PRODUCT_RIGHT} 
                defaultActive="competitors" 
              />
            </NavDropdown>

            <NavDropdown label="Solutions">
              <DropdownContent 
                items={SOLUTIONS_LEFT} 
                rightContent={SOLUTIONS_RIGHT} 
                defaultActive="marketers" 
              />
            </NavDropdown>

            <Link
              href="/pricing"
              className="px-3 py-2 text-[15px] font-medium font-source-sans text-black/70 hover:text-black transition-colors rounded hover:bg-black/5"
            >
              Pricing
            </Link>
          </div>
        </div>

        {/* Right: Desktop Buttons - Hidden on mobile */}
        <div className="hidden lg:flex items-center gap-2.5">
          <Link 
            href="/login"
            className="h-[41px] px-6 rounded-[7px] border border-[#B1B0AF] text-[15px] font-medium font-space tracking-[0.69px] text-black hover:bg-black/5 transition-colors flex items-center"
          >
            Login
          </Link>
          <Link 
            href="/signup"
            className="btn-black h-[41px] px-6 rounded-[7px] text-[15px] font-medium font-space tracking-[0.69px] flex items-center"
          >
            Get started
          </Link>
        </div>

        {/* Mobile: Hamburger Menu */}
        <button 
          onClick={() => setMobileMenuOpen(true)}
          className="lg:hidden p-2 -mr-2 hover:bg-black/5 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6 text-black" />
        </button>
      </nav>

      {/* Mobile Menu */}
      <MobileMenu 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
        isDark={false}
      />
    </>
  )
}