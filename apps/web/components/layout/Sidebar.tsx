// apps/web/components/layout/Sidebar.tsx

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home,
  ShoppingBag, 
  Star,
  MessageSquare, 
  Globe,
  Settings,
  FileText,
  Video,
  BookOpen,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import BrandSwitcher from './BrandSwitcher'
import ThemeToggle from './ThemeToggle'

export default function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Check localStorage on mount
    if (typeof window !== 'undefined') {
      return localStorage.getItem('harbor-sidebar-collapsed') === 'true'
    }
    return false
  })

  // Update localStorage when collapsed state changes
  const toggleCollapse = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem('harbor-sidebar-collapsed', String(newState))
    // Dispatch custom event so layout can listen
    window.dispatchEvent(new Event('sidebar-toggle'))
  }

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
    if (pathname === '/dashboard/overview') return '#2979FF' // Cerulean
    if (pathname === '/dashboard/shopping') return '#00C6B7' // Aqua
    if (pathname === '/dashboard/brand') return '#4EE4FF' // Periwinkle
    if (pathname === '/dashboard/conversations') return '#FFB84D' // Amber/Gold
    if (pathname === '/dashboard/website') return '#E879F9' // Magenta/Pink
    return '#FF6B4A' // Coral fallback
  }

  const accentColor = getAccentColor()

  return (
    <aside 
      className={`fixed left-0 top-0 h-screen bg-[#0B1521] border-r border-white/5 flex flex-col transition-all duration-300 z-[100] ${
        isCollapsed ? 'w-20' : 'w-60'
      }`}
    >
      {/* Header with collapse button */}
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-coral rounded-lg flex items-center justify-center">
              <span className="text-white font-heading font-bold text-xl">H</span>
            </div>
            <h1 className="text-lg font-heading font-bold text-white">
              Harbor
            </h1>
          </div>
        )}
        {isCollapsed && (
          <button
            onClick={toggleCollapse}
            className="w-10 h-10 bg-coral rounded-lg flex items-center justify-center mx-auto group relative cursor-pointer transition-all"
            title="Expand sidebar"
          >
            <span className="text-white font-heading font-bold text-xl group-hover:opacity-0 transition-opacity">H</span>
            <ChevronRight className="w-5 h-5 text-white absolute opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={2} />
          </button>
        )}
        {!isCollapsed && (
          <button
            onClick={toggleCollapse}
            className="p-1.5 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
            title="Collapse sidebar"
          >
            <ChevronLeft className="w-5 h-5 text-softgray/60" strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* Brand Switcher - hide when collapsed */}
      {!isCollapsed && (
        <div className="px-4 py-4 border-b border-white/5">
          <BrandSwitcher />
        </div>
      )}

      {/* Scrollable Navigation - Everything in one scroll area */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden">
        {/* Favorites Section */}
        {!isCollapsed && (
          <div className="px-4 pt-6 pb-3">
            <div className="text-xs text-softgray/40 uppercase tracking-wider mb-3 px-3">
              Favorites
            </div>
            
            {favorites.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1
                    transition-colors cursor-pointer
                    ${isActive 
                      ? 'text-white pl-[10px]' 
                      : 'text-softgray/60 hover:text-white hover:bg-white/5'
                    }
                  `}
                  style={isActive ? {
                    borderLeft: `2px solid ${accentColor}`
                  } : {}}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
                  <span className="text-sm font-body truncate">{item.name}</span>
                </Link>
              )
            })}
          </div>
        )}

        {/* Intelligence Section */}
        <div className="px-4 py-3">
          {!isCollapsed && (
            <div className="text-xs text-softgray/40 uppercase tracking-wider mb-3 px-3">
              Intelligence
            </div>
          )}
          
          {intelligence.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <div key={item.name} className="relative">
                <Link
                  href={item.href}
                  className={`
                    flex items-center rounded-lg mb-1 group
                    transition-colors cursor-pointer relative
                    ${isCollapsed ? 'py-3 justify-center' : 'gap-3 py-2.5 px-3'}
                    ${isActive 
                      ? 'text-white' 
                      : 'text-softgray/60 hover:text-white hover:bg-white/5'
                    }
                    ${isActive && !isCollapsed ? 'pl-[10px]' : ''}
                  `}
                  style={isActive && !isCollapsed ? {
                    borderLeft: `2px solid ${accentColor}`
                  } : {}}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
                  {!isCollapsed && <span className="text-sm font-body truncate">{item.name}</span>}
                  
                  {/* Tooltip - only show when collapsed */}
                  {isCollapsed && (
                    <div
                      className="
                        absolute left-full ml-3 top-1/2 -translate-y-1/2
                        px-3 py-2 rounded-md whitespace-nowrap
                        bg-[#0B1521] shadow-lg
                        opacity-0 invisible group-hover:opacity-100 group-hover:visible
                        transition-all duration-150 ease-in pointer-events-none
                      "
                      style={{ 
                        zIndex: 9999
                      }}
                    >
                      <span className="text-white/90 font-body text-sm">
                        {item.name}
                      </span>
                    </div>
                  )}
                </Link>
              </div>
            )
          })}
        </div>

        {/* Theme Toggle - scrolls with content */}
        <div className="px-4 py-3 border-t border-white/5">
          <ThemeToggle isCollapsed={isCollapsed} />
        </div>

        {/* Control Center - scrolls with content */}
        <div className="px-4 py-3 border-t border-white/5">
          <div className="relative">
            <Link
              href="/dashboard/settings"
              className={`
                flex items-center rounded-lg group
                transition-colors cursor-pointer relative
                ${isCollapsed ? 'py-3 justify-center' : 'gap-3 py-2.5 px-3'}
                ${pathname === '/dashboard/settings'
                  ? 'text-white'
                  : 'text-softgray/60 hover:text-white hover:bg-white/5'
                }
                ${pathname === '/dashboard/settings' && !isCollapsed ? 'pl-[10px]' : ''}
              `}
              style={pathname === '/dashboard/settings' && !isCollapsed ? {
                borderLeft: `2px solid ${accentColor}`
              } : {}}
            >
              <Settings className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
              {!isCollapsed && <span className="text-sm font-body">Control Center</span>}
              
              {/* Tooltip - only show when collapsed */}
              {isCollapsed && (
                <div
                  className="
                    absolute left-full ml-3 top-1/2 -translate-y-1/2
                    px-3 py-2 rounded-md whitespace-nowrap
                    bg-[#0B1521] shadow-lg
                    opacity-0 invisible group-hover:opacity-100 group-hover:visible
                    transition-all duration-150 ease-in pointer-events-none
                  "
                  style={{ 
                    zIndex: 9999
                  }}
                >
                  <span className="text-white/90 font-body text-sm">
                    Control Center
                  </span>
                </div>
              )}
            </Link>
          </div>
        </div>
      </nav>
    </aside>
  )
}