// apps/web/components/layout/Sidebar.tsx

'use client'

import { useState, useEffect } from 'react'
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
  ChevronRight,
  Moon,
  Sun,
  User
} from 'lucide-react'
import BrandSwitcher from './BrandSwitcher'

export default function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Check localStorage on mount
    if (typeof window !== 'undefined') {
      return localStorage.getItem('harbor-sidebar-collapsed') === 'true'
    }
    return false
  })

  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    // Check localStorage or system preference on mount
    const savedTheme = localStorage.getItem('harbor-theme') as 'light' | 'dark' | null
    const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    
    const initialTheme = savedTheme || systemPreference
    setTheme(initialTheme)
    
    if (initialTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark')
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('harbor-theme', newTheme)
    
    if (newTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
  }

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

  const brandSettings = [
    { name: 'Brand Dashboard', href: '/dashboard/brand-settings', icon: User },
  ]

  // Get current page accent color
  const getAccentColor = () => {
    if (pathname === '/dashboard/overview') return '#2979FF' // Cerulean
    if (pathname === '/dashboard/brand-settings') return '#FF6B4A' // Coral
    if (pathname === '/dashboard/shopping') return '#00C6B7' // Aqua
    if (pathname === '/dashboard/brand') return '#4EE4FF' // Periwinkle
    if (pathname === '/dashboard/conversations') return '#FFB84D' // Amber/Gold
    if (pathname === '/dashboard/website') return '#E879F9' // Magenta/Pink
    return '#FF6B4A' // Coral fallback
  }

  const accentColor = getAccentColor()

  return (
    <aside 
      className={`hidden lg:flex fixed left-0 top-0 h-screen bg-[#0B1521] border-r border-white/5 flex-col transition-all duration-300 z-[100] ${
        isCollapsed ? 'w-20' : 'w-60'
      }`}
    >
      {/* Header with collapse button */}
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <img 
                src="/images/Harbor_White_Logo.png" 
                alt="Harbor Logo" 
                className="w-10 h-10 object-contain"
              />
            </div>
            <h1 className="text-lg font-heading font-bold text-white">
              Harbor
            </h1>
          </div>
        )}
        {isCollapsed && (
          <button
            onClick={toggleCollapse}
            className="w-10 h-10 flex items-center justify-center mx-auto group relative cursor-pointer transition-all"
            title="Expand sidebar"
          >
            <img 
              src="/images/Harbor_White_Logo.png" 
              alt="Harbor Logo" 
              className="w-10 h-10 object-contain group-hover:opacity-0 transition-opacity"
            />
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
        
        {/* Favorites Section - Collapsed view with icons only */}
        {isCollapsed && (
          <div className="px-4 pt-6 pb-3">
            {favorites.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  title={item.name}
                  className={`
                    flex items-center rounded-lg mb-1 py-3 justify-center
                    transition-colors cursor-pointer relative
                    ${isActive 
                      ? 'text-white' 
                      : 'text-softgray/60 hover:text-white hover:bg-white/5'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
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
              <Link
                key={item.name}
                href={item.href}
                title={isCollapsed ? item.name : undefined}
                className={`
                  flex items-center rounded-lg mb-1
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
              </Link>
            )
          })}
        </div>

        {/* Brand Settings Section - Below Intelligence with subtle divider */}
        <div className="px-4 py-3 border-t border-white/[0.03]">
          {brandSettings.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.name}
                href={item.href}
                title={isCollapsed ? item.name : undefined}
                className={`
                  flex items-center rounded-lg mb-1
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
              </Link>
            )
          })}
        </div>

        {/* Theme Toggle - scrolls with content */}
        <div className="px-4 py-3 border-t border-white/5">
          <div
            onClick={toggleTheme}
            role="button"
            tabIndex={0}
            title={isCollapsed ? (theme === 'light' ? 'Dark Mode' : 'Light Mode') : undefined}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                toggleTheme()
              }
            }}
            className={`
              flex items-center rounded-lg
              transition-colors cursor-pointer
              ${isCollapsed ? 'py-3 justify-center' : 'gap-3 py-2.5 px-3'}
              text-softgray/60 hover:text-white hover:bg-white/5
            `}
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
            ) : (
              <Sun className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
            )}
            {!isCollapsed && (
              <span className="text-sm font-body">
                {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
              </span>
            )}
          </div>
        </div>

        {/* Control Center - scrolls with content */}
        <div className="px-4 py-3 border-t border-white/5">
          <Link
            href="/dashboard/settings"
            title={isCollapsed ? 'Control Center' : undefined}
            className={`
              flex items-center rounded-lg
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
          </Link>
        </div>
      </nav>
    </aside>
  )
}