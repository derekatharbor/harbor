// apps/web/components/layout/Sidebar.tsx

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  Home,
  ShoppingBag, 
  Star,
  MessageSquare, 
  Globe,
  Settings,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  TrendingUp,
  Layers,
  LogOut,
  Users
} from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import BrandSwitcher from './BrandSwitcher'

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Check localStorage on mount
    if (typeof window !== 'undefined') {
      return localStorage.getItem('harbor-sidebar-collapsed') === 'true'
    }
    return false
  })

  const [theme, setTheme] = useState<'light' | 'dark'>('dark')

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  useEffect(() => {
    // Check localStorage or default to dark
    const savedTheme = localStorage.getItem('harbor-theme') as 'light' | 'dark' | null
    const initialTheme = savedTheme || 'dark'
    
    setTheme(initialTheme)
    
    // Always set the attribute explicitly
    document.documentElement.setAttribute('data-theme', initialTheme)
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    console.log('🎨 Toggle theme:', theme, '→', newTheme)
    setTheme(newTheme)
    localStorage.setItem('harbor-theme', newTheme)
    
    // Always set the attribute explicitly
    document.documentElement.setAttribute('data-theme', newTheme)
    console.log('✅ Applied data-theme:', document.documentElement.getAttribute('data-theme'))
    
    // Force a small reflow to ensure CSS updates
    document.body.offsetHeight
  }

  // Update localStorage when collapsed state changes
  const toggleCollapse = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem('harbor-sidebar-collapsed', String(newState))
    // Dispatch custom event so layout can listen
    window.dispatchEvent(new Event('sidebar-toggle'))
  }

  // Analytics section - understanding how AI sees you
  const analytics = [
    { name: 'Overview', href: '/dashboard/overview', icon: Home },
    { name: 'Prompts', href: '/dashboard/prompts', icon: MessageSquare },
    { name: 'Shopping', href: '/dashboard/shopping', icon: ShoppingBag },
    { name: 'Brand', href: '/dashboard/brand', icon: Star },
    { name: 'Website', href: '/dashboard/website', icon: Globe },
  ]

  // Action section - things to do
  const actions = [
    { name: 'Opportunities', href: '/dashboard/opportunities', icon: TrendingUp },
  ]

  // Manage section - brand data and settings
  const manage = [
    { name: 'Brand Hub', href: '/dashboard/brand-hub', icon: Layers },
    { name: 'Competitors', href: '/dashboard/competitors/manage', icon: Users },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ]

  // Get current page accent color (updated for new palette)
  const getAccentColor = () => {
    if (pathname === '/dashboard/overview') return '#3B82F6' // Blue
    if (pathname === '/dashboard/prompts') return '#F59E0B' // Amber (Prompts)
    if (pathname === '/dashboard/shopping') return '#10B981' // Green
    if (pathname === '/dashboard/brand') return '#06B6D4' // Cyan
    if (pathname === '/dashboard/website') return '#8B5CF6' // Purple
    if (pathname === '/dashboard/opportunities') return '#F97316' // Orange
    if (pathname === '/dashboard/brand-hub') return '#3B82F6' // Blue
    if (pathname === '/dashboard/competitors/manage') return '#A855F7' // Purple
    if (pathname === '/dashboard/settings') return '#6B7280' // Gray
    return '#3B82F6' // Default blue
  }

  const accentColor = getAccentColor()

  return (
    <aside 
      className={`
        hidden lg:flex fixed left-0 top-0 h-screen 
        border-r border-border flex-col transition-all duration-300 z-[100] 
        bg-sidebar
        ${isCollapsed ? 'w-20' : 'w-60 overflow-hidden'}
      `}
    >
      {/* Header with collapse button */}
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <img 
                src="/images/Harbor_White_Logo.png" 
                alt="Harbor Logo" 
                className="w-10 h-10 object-contain dark:invert-0 invert"
              />
            </div>
            <h1 className="text-lg font-heading font-bold text-sidebar-foreground">
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
              className="w-10 h-10 object-contain group-hover:opacity-0 transition-opacity dark:invert-0 invert"
            />
            <ChevronRight className="w-5 h-5 text-sidebar-foreground absolute opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={2} />
          </button>
        )}
        {!isCollapsed && (
          <button
            onClick={toggleCollapse}
            className="p-1.5 hover:bg-sidebar-hover rounded-lg transition-colors cursor-pointer"
            title="Collapse sidebar"
          >
            <ChevronLeft className="w-5 h-5 text-sidebar-muted" strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* Brand Switcher - hide when collapsed */}
      {!isCollapsed && (
        <div className="px-4 py-4 border-b border-border">
          <BrandSwitcher />
        </div>
      )}

      {/* Scrollable Navigation - Everything in one scroll area */}
      {/* When collapsed, no overflow needed (allows tooltips to show) */}
      <nav className={`flex-1 ${isCollapsed ? '' : 'overflow-y-auto overflow-x-hidden'}`}>
        
        {/* Analytics Section */}
        <div className="px-4 pt-6 pb-3">
          {!isCollapsed && (
            <div className="text-xs text-sidebar-muted uppercase tracking-wider mb-3 px-3">
              Analytics
            </div>
          )}
          
          {analytics.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center rounded-lg mb-1
                  transition-colors cursor-pointer relative group
                  ${isCollapsed ? 'py-3 justify-center' : 'gap-3 py-2.5 px-3'}
                  ${isActive 
                    ? 'text-sidebar-foreground' 
                    : 'text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-hover'
                  }
                  ${isActive && !isCollapsed ? 'pl-[10px]' : ''}
                `}
                style={isActive && !isCollapsed ? {
                  borderLeft: `2px solid ${accentColor}`
                } : {}}
              >
                <Icon className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
                {!isCollapsed && <span className="text-sm font-body truncate">{item.name}</span>}
                
                {/* Tooltip - only shows when collapsed */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-3 py-1.5 bg-sidebar text-sidebar-foreground text-xs font-medium rounded whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-[200] border border-border shadow-lg">
                    {item.name}
                  </div>
                )}
              </Link>
            )
          })}
        </div>

        {/* Action Section */}
        <div className="px-4 py-3">
          {!isCollapsed && (
            <div className="text-xs text-sidebar-muted uppercase tracking-wider mb-3 px-3">
              Action
            </div>
          )}
          
          {actions.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center rounded-lg mb-1
                  transition-colors cursor-pointer relative group
                  ${isCollapsed ? 'py-3 justify-center' : 'gap-3 py-2.5 px-3'}
                  ${isActive 
                    ? 'text-sidebar-foreground' 
                    : 'text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-hover'
                  }
                  ${isActive && !isCollapsed ? 'pl-[10px]' : ''}
                `}
                style={isActive && !isCollapsed ? {
                  borderLeft: `2px solid ${accentColor}`
                } : {}}
              >
                <Icon className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
                {!isCollapsed && <span className="text-sm font-body truncate">{item.name}</span>}
                
                {/* Tooltip - only shows when collapsed */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-3 py-1.5 bg-sidebar text-sidebar-foreground text-xs font-medium rounded whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-[200] border border-border shadow-lg">
                    {item.name}
                  </div>
                )}
              </Link>
            )
          })}
        </div>

        {/* Manage Section */}
        <div className="px-4 py-3 border-t border-border">
          {!isCollapsed && (
            <div className="text-xs text-sidebar-muted uppercase tracking-wider mb-3 px-3">
              Manage
            </div>
          )}
          
          {manage.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center rounded-lg mb-1
                  transition-colors cursor-pointer relative group
                  ${isCollapsed ? 'py-3 justify-center' : 'gap-3 py-2.5 px-3'}
                  ${isActive 
                    ? 'text-sidebar-foreground' 
                    : 'text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-hover'
                  }
                  ${isActive && !isCollapsed ? 'pl-[10px]' : ''}
                `}
                style={isActive && !isCollapsed ? {
                  borderLeft: `2px solid ${accentColor}`
                } : {}}
              >
                <Icon className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
                {!isCollapsed && <span className="text-sm font-body truncate">{item.name}</span>}
                
                {/* Tooltip - only shows when collapsed */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-3 py-1.5 bg-sidebar text-sidebar-foreground text-xs font-medium rounded whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-[200] border border-border shadow-lg">
                    {item.name}
                  </div>
                )}
              </Link>
            )
          })}
        </div>

        {/* Theme Toggle - scrolls with content */}
        <div className="px-4 py-3 border-t border-border">
          <div
            onClick={toggleTheme}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                toggleTheme()
              }
            }}
            className={`
              flex items-center rounded-lg
              transition-colors cursor-pointer relative group
              ${isCollapsed ? 'py-3 justify-center' : 'gap-3 py-2.5 px-3'}
              text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-hover
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
            
            {/* Tooltip - only shows when collapsed */}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-3 py-1.5 bg-sidebar text-sidebar-foreground text-xs font-medium rounded whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-[200] border border-border shadow-lg">
                {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
              </div>
            )}
          </div>
        </div>

        {/* Sign Out */}
        <div className="px-4 py-3 border-t border-border">
          <button
            onClick={handleSignOut}
            className={`
              w-full flex items-center rounded-lg
              transition-colors cursor-pointer relative group
              ${isCollapsed ? 'py-3 justify-center' : 'gap-3 py-2.5 px-3'}
              text-sidebar-muted hover:text-red-400 hover:bg-red-500/10
            `}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
            {!isCollapsed && <span className="text-sm font-body">Sign Out</span>}
            
            {/* Tooltip - only shows when collapsed */}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-3 py-1.5 bg-sidebar text-sidebar-foreground text-xs font-medium rounded whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-[200] border border-border shadow-lg">
                Sign Out
              </div>
            )}
          </button>
        </div>
      </nav>
    </aside>
  )
}