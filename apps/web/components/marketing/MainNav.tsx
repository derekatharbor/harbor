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

const PRODUCT_RIGHT: Record<string, { title: string; description: string; href: string; isNew?: boolean; isFree?: boolean }[]> = {
  competitors: [
    { title: 'Competitor Intelligence', description: 'Visibility, share of voice, sentiment, and trends', href: '/features/competitors' },
  ],
  analytics: [
    { title: 'Website Analytics', description: 'Crawl frequency and content coverage', href: '/features/analytics' },
  ],
  sources: [
    { title: 'Source Tracking', description: 'Citations and content gaps', href: '/features/sources' },
  ],
  prompts: [
    { title: 'Prompt Monitoring', description: 'Query tracking, categories, and custom prompts', href: '/features/prompts' },
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

const SOLUTIONS_RIGHT: Record<string, { title: string; description: string; href: string; isNew?: boolean; isFree?: boolean }[]> = {
  marketers: [
    { title: 'For Marketers', description: 'Brand monitoring and competitive intelligence', href: '/solutions/marketers' },
  ],
  agencies: [
    { title: 'Free Visibility Audit', description: 'Run a free AI audit for any brand', href: '/agencies/free-audit', isFree: true },
    { title: 'Pitch Workspaces', description: 'White-label reports for prospects', href: '/pitch' },
    { title: 'For Agencies', description: 'Add GEO to your service offerings', href: '/agencies' },
  ],
  ecommerce: [
    { title: 'Shopify Plugin', description: 'Add AI visibility to your store', href: '/shopify', isNew: true },
    { title: 'For E-Commerce', description: 'Product visibility and shopping queries', href: '/solutions/ecommerce' },
  ],
  enterprise: [
    { title: 'For Enterprise', description: 'API access and custom reporting', href: '/solutions/enterprise' },
  ],
}

interface DropdownProps {
  items: typeof PRODUCT_LEFT
  rightContent: typeof PRODUCT_RIGHT
  defaultActive: string
  showIndexCTA?: boolean
}

function DropdownContent({ items, rightContent, defaultActive, showIndexCTA }: DropdownProps) {
  const [activeItem, setActiveItem] = useState(defaultActive)

  return (
    <div className="flex flex-col">
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
              <span className="text-[14px] font-semibold font-source-sans text-black flex items-center gap-2">
                {item.title}
                {item.isNew && (
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-[#22C55E] text-white rounded uppercase">
                    New
                  </span>
                )}
                {item.isFree && (
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-[#3B82F6] text-white rounded uppercase">
                    Free
                  </span>
                )}
              </span>
              <p className="text-[12px] font-normal font-source-sans text-[#6F6E6E] mt-0.5">
                {item.description}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Index CTA Lip */}
      {showIndexCTA && (
        <Link 
          href="/brands"
          className="flex items-center justify-between px-5 py-3 bg-[#F6F5F3] rounded-b-xl border-t border-[#EFEEED] hover:bg-[#EFEEED] transition-colors group"
        >
          <span className="text-[13px] font-medium font-source-sans text-[#6C6C6B] group-hover:text-black transition-colors">
            Claim your free AI visibility profile
          </span>
          <svg 
            className="w-4 h-4 text-[#6C6C6B] group-hover:text-black group-hover:translate-x-0.5 transition-all" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      )}
    </div>
  )
}

interface NavDropdownProps {
  label: string
  children: React.ReactNode
  isDark?: boolean
}

function NavDropdown({ label, children, isDark = false }: NavDropdownProps) {
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
          isDark
            ? isOpen ? 'text-white bg-white/10' : 'text-white/70 hover:text-white hover:bg-white/5'
            : isOpen ? 'text-black bg-black/5' : 'text-black/70 hover:text-black hover:bg-black/5'
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
        className={`absolute top-full left-0 mt-2 bg-white rounded-xl shadow-[0px_8px_30px_rgba(0,0,0,0.12)] border border-black/5 transition-all duration-150 overflow-hidden ${
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

interface MainNavProps {
  isDark?: boolean
}

export default function MainNav({ isDark = false }: MainNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      <nav className="flex items-center justify-between px-6 lg:px-14 py-4 lg:py-6">
        {/* Left: Logo + Nav Links */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center mr-4">
            <Image
              src={isDark ? "/images/Harbor_White_Logo.png" : "/images/harbor-logo-black.svg"}
              alt="Harbor"
              width={140}
              height={32}
              className="h-7 lg:h-8 w-auto"
            />
          </Link>

          {/* Desktop Nav Dropdowns - Hidden on mobile */}
          <div className="hidden lg:flex items-center gap-2">
            <NavDropdown label="Product" isDark={isDark}>
              <DropdownContent 
                items={PRODUCT_LEFT} 
                rightContent={PRODUCT_RIGHT} 
                defaultActive="competitors"
                showIndexCTA
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
              className={`px-3 py-2 text-[15px] font-medium font-source-sans transition-colors rounded ${
                isDark 
                  ? 'text-white/70 hover:text-white hover:bg-white/5' 
                  : 'text-black/70 hover:text-black hover:bg-black/5'
              }`}
            >
              Pricing
            </Link>
          </div>
        </div>

        {/* Right: Desktop Buttons - Hidden on mobile */}
        <div className="hidden lg:flex items-center gap-2.5">
          <Link 
            href="/login"
            className={`h-[41px] px-6 rounded-[7px] border text-[15px] font-medium font-space tracking-[0.69px] transition-colors flex items-center ${
              isDark
                ? 'border-white/20 text-white hover:bg-white/5'
                : 'border-[#B1B0AF] text-black hover:bg-black/5'
            }`}
          >
            Login
          </Link>
          <Link 
            href="/signup"
            className={`h-[41px] px-6 rounded-[7px] text-[15px] font-medium font-space tracking-[0.69px] flex items-center transition-colors ${
              isDark
                ? 'bg-white text-black hover:bg-gray-100'
                : 'bg-black text-white hover:bg-black/80'
            }`}
          >
            <span>Get started</span>
          </Link>
        </div>

        {/* Mobile: Hamburger Menu */}
        <button 
          onClick={() => setMobileMenuOpen(true)}
          className={`lg:hidden p-2 -mr-2 rounded-lg transition-colors ${
            isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'
          }`}
        >
          <Menu className={`w-6 h-6 ${isDark ? 'text-white' : 'text-black'}`} />
        </button>
      </nav>

      {/* Mobile Menu */}
      <MobileMenu 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
        isDark={isDark}
      />
    </>
  )
}