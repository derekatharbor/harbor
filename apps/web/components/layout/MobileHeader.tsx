// apps/web/components/layout/MobileHeader.tsx

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Menu,
  X,
  Home,
  ShoppingBag, 
  Star,
  MessageSquare, 
  Globe,
  Settings,
  FileText,
  Video,
  BookOpen,
} from 'lucide-react'
import BrandSwitcher from './BrandSwitcher'

export default function MobileHeader() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const favorites = [
    { name: 'Quick Start Guide', href: '/dashboard/guide', icon: FileText },
    { name: 'Video Tutorials', href: '/dashboard/tutorials', icon: Video },
    { name: 'Documentation', href: '/dashboard/docs', icon: BookOpen },
  ]

  const intelligence = [
    { name: 'Overview', href: '/dashboard/overview', icon: Home },
    { name: 'Shopping Visibility', href: '/dashboard/shopping', icon: ShoppingBag },
    { name: 'Brand Visibility', href: '/dashboard/brand', icon: Star },
    { name: 'Conversation Volumes', href: '/dashboard/conversations', icon: MessageSquare },
    { name: 'Website Analytics', href: '/dashboard/website', icon: Globe },
  ]

  // Get current page accent color
  const getAccentColor = () => {
    if (pathname === '/dashboard/overview') return '#2979FF'
    if (pathname === '/dashboard/shopping') return '#00C6B7'
    if (pathname === '/dashboard/brand') return '#4EE4FF'
    if (pathname === '/dashboard/conversations') return '#FFB84D'
    if (pathname === '/dashboard/website') return '#E879F9'
    return '#FF6B4A'
  }

  const accentColor = getAccentColor()

  const closeMenu = () => setIsOpen(false)

  return (
    <>
      {/* Mobile Header Bar - Fixed at top */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#0B1521] border-b border-white/5 h-16 flex items-center justify-between px-4">
        {/* Logo */}
        <Link href="/dashboard/overview" className="flex items-center gap-2">
          <img 
            src="/images/Harbor_White_Logo.png" 
            alt="Harbor" 
            className="w-8 h-8 object-contain"
          />
          <span className="text-white font-heading font-bold text-lg">Harbor</span>
        </Link>

        {/* Hamburger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <X className="w-6 h-6 text-white" strokeWidth={2} />
          ) : (
            <Menu className="w-6 h-6 text-white" strokeWidth={2} />
          )}
        </button>
      </header>

      {/* Mobile Menu Overlay - Slides in from left with maritime feel */}
      <div
        className={`
          lg:hidden fixed inset-0 z-40 transition-opacity duration-300
          ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
      >
        {/* Backdrop with subtle gradient (like looking into dark water) */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-[#0B1521]/95 via-[#0B1521]/98 to-[#101A31]/95 backdrop-blur-sm"
          onClick={closeMenu}
        />

        {/* Menu Panel - Slides in like a ship's hatch */}
        <nav
          className={`
            absolute top-16 left-0 bottom-0 w-[280px] 
            bg-[#0B1521] border-r border-white/5
            overflow-y-auto
            transform transition-transform duration-300 ease-out
            ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
          style={{
            boxShadow: '8px 0 24px rgba(0,0,0,0.4)'
          }}
        >
          {/* Brand Switcher */}
          <div className="px-4 py-4 border-b border-white/5">
            <BrandSwitcher />
          </div>

          {/* Favorites Section */}
          <div className="px-4 pt-6 pb-3">
            <div className="text-xs text-softgray/40 uppercase tracking-wider mb-3 px-3 font-body">
              Favorites
            </div>
            
            {favorites.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={closeMenu}
                  className={`
                    flex items-center gap-3 px-3 py-3 rounded-lg mb-1
                    transition-all duration-200 cursor-pointer
                    ${isActive 
                      ? 'text-white pl-[10px] bg-white/5' 
                      : 'text-softgray/60 hover:text-white hover:bg-white/5 active:bg-white/10'
                    }
                  `}
                  style={isActive ? {
                    borderLeft: `2px solid ${accentColor}`
                  } : {}}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
                  <span className="text-sm font-body">{item.name}</span>
                </Link>
              )
            })}
          </div>

          {/* Intelligence Section */}
          <div className="px-4 py-3 border-t border-white/5">
            <div className="text-xs text-softgray/40 uppercase tracking-wider mb-3 px-3 font-body">
              Intelligence
            </div>
            
            {intelligence.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={closeMenu}
                  className={`
                    flex items-center gap-3 px-3 py-3 rounded-lg mb-1
                    transition-all duration-200 cursor-pointer
                    ${isActive 
                      ? 'text-white pl-[10px] bg-white/5' 
                      : 'text-softgray/60 hover:text-white hover:bg-white/5 active:bg-white/10'
                    }
                  `}
                  style={isActive ? {
                    borderLeft: `2px solid ${accentColor}`
                  } : {}}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
                  <span className="text-sm font-body">{item.name}</span>
                </Link>
              )
            })}
          </div>

          {/* Control Center */}
          <div className="px-4 py-3 border-t border-white/5">
            <Link
              href="/dashboard/settings"
              onClick={closeMenu}
              className={`
                flex items-center gap-3 px-3 py-3 rounded-lg
                transition-all duration-200 cursor-pointer
                ${pathname === '/dashboard/settings'
                  ? 'text-white pl-[10px] bg-white/5'
                  : 'text-softgray/60 hover:text-white hover:bg-white/5 active:bg-white/10'
                }
              `}
              style={pathname === '/dashboard/settings' ? {
                borderLeft: `2px solid ${accentColor}`
              } : {}}
            >
              <Settings className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
              <span className="text-sm font-body">Control Center</span>
            </Link>
          </div>

          {/* Bottom accent line - subtle wave effect */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </nav>
      </div>
    </>
  )
}
