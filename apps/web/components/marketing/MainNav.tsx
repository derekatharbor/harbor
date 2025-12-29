// components/marketing/MainNav.tsx

'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'

// Product dropdown items
const PRODUCT_ITEMS = {
  left: [
    {
      color: '#3B82F6',
      title: 'Brand Visibility',
      description: 'Track how AI models describe your brand',
      href: '/features/brand-visibility',
    },
    {
      color: '#F97316',
      title: 'Shopping Intelligence',
      description: 'Monitor product mentions in shopping queries',
      href: '/features/shopping',
    },
    {
      color: '#EAB308',
      title: 'Conversation Tracking',
      description: 'See how often your brand comes up',
      href: '/features/conversations',
    },
    {
      color: '#22C55E',
      title: 'Website Analytics',
      description: 'Understand how AI crawlers access your site',
      href: '/features/analytics',
    },
  ],
  right: [
    {
      title: 'Brand Index',
      description: 'Explore 100K+ indexed brand profiles',
      href: '/index',
    },
    {
      title: 'Competitor Tracking',
      description: 'Benchmark against your competition',
      href: '/features/competitors',
    },
    {
      title: 'AI Redirect',
      description: 'Optimize content for AI crawlers',
      href: '/features/ai-redirect',
    },
    {
      title: 'Alerts & Reports',
      description: 'Get notified when visibility changes',
      href: '/features/alerts',
    },
  ],
}

// Solutions dropdown items
const SOLUTIONS_ITEMS = {
  left: [
    {
      color: '#3B82F6',
      title: 'For Marketers',
      description: 'Own your AI narrative',
      href: '/solutions/marketers',
    },
    {
      color: '#F97316',
      title: 'For Agencies',
      description: 'Add GEO services to your offerings',
      href: '/solutions/agencies',
    },
    {
      color: '#EAB308',
      title: 'For E-Commerce',
      description: 'Get recommended in shopping queries',
      href: '/solutions/ecommerce',
    },
    {
      color: '#22C55E',
      title: 'For Enterprise',
      description: 'Monitor AI mentions at scale',
      href: '/solutions/enterprise',
    },
  ],
  right: [
    {
      title: 'Universities',
      description: 'Attract the right students',
      href: '/solutions/universities',
    },
    {
      title: 'SMBs',
      description: 'Compete with the big guys',
      href: '/solutions/smbs',
    },
    {
      title: 'SaaS Companies',
      description: 'Win AI-driven software discovery',
      href: '/solutions/saas',
    },
    {
      title: 'Local Businesses',
      description: 'Show up in local AI recommendations',
      href: '/solutions/local',
    },
  ],
}

interface DropdownItem {
  color?: string
  title: string
  description: string
  href: string
}

interface DropdownItems {
  left: DropdownItem[]
  right: DropdownItem[]
}

interface NavDropdownProps {
  label: string
  items: DropdownItems
  isOpen: boolean
  onToggle: () => void
  onClose: () => void
}

function NavDropdown({ label, items, isOpen, onToggle, onClose }: NavDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={onToggle}
        className="flex items-center gap-1.5 px-3 py-2 text-[15px] font-medium font-source-sans text-black/70 hover:text-black transition-colors rounded hover:bg-black/5"
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

      {/* Dropdown Panel */}
      <div
        className={`absolute top-full left-0 mt-2 w-[620px] bg-white rounded-xl shadow-[0px_8px_30px_rgba(0,0,0,0.12)] border border-black/5 transition-all duration-200 ${
          isOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}
      >
        <div className="p-5">
          {/* Two Column Grid */}
          <div className="flex gap-6">
            {/* Left Column */}
            <div className="flex-1 space-y-0.5">
              {items.left.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-start gap-3 p-3 rounded-lg hover:bg-[#F6F5F3] transition-colors"
                  onClick={onClose}
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
                        className="w-4 h-4 text-black/30 group-hover:text-black/50 group-hover:translate-x-0.5 transition-all"
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
                </Link>
              ))}
            </div>

            {/* Divider */}
            <div className="w-px bg-[#EFEEED]" />

            {/* Right Column */}
            <div className="flex-1 space-y-0.5">
              {items.right.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group block p-3 rounded-lg hover:bg-[#F6F5F3] transition-colors"
                  onClick={onClose}
                >
                  <span className="text-[15px] font-semibold font-source-sans text-black">
                    {item.title}
                  </span>
                  <p className="text-[13px] font-normal font-source-sans text-[#6F6E6E] mt-0.5">
                    {item.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MainNav() {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  return (
    <nav className="flex items-center justify-between px-14 py-6">
      {/* Left: Logo + Nav Links */}
      <div className="flex items-center gap-2">
        <Link href="/" className="flex items-center mr-4">
          <Image
            src="/images/harbor-logo-black.svg"
            alt="Harbor"
            width={140}
            height={32}
            className="h-8 w-auto"
          />
        </Link>

        {/* Nav Dropdowns */}
        <NavDropdown
          label="Product"
          items={PRODUCT_ITEMS}
          isOpen={openDropdown === 'product'}
          onToggle={() => setOpenDropdown(openDropdown === 'product' ? null : 'product')}
          onClose={() => setOpenDropdown(null)}
        />
        <NavDropdown
          label="Solutions"
          items={SOLUTIONS_ITEMS}
          isOpen={openDropdown === 'solutions'}
          onToggle={() => setOpenDropdown(openDropdown === 'solutions' ? null : 'solutions')}
          onClose={() => setOpenDropdown(null)}
        />
        <Link
          href="/pricing"
          className="px-3 py-2 text-[15px] font-medium font-source-sans text-black/70 hover:text-black transition-colors rounded hover:bg-black/5"
        >
          Pricing
        </Link>
      </div>

      {/* Right: Buttons */}
      <div className="flex items-center gap-2.5">
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
    </nav>
  )
}
