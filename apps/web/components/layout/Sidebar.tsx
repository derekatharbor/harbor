// apps/web/components/layout/Sidebar.tsx

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  ShoppingBag, 
  MessageSquare, 
  Globe, 
  TrendingUp,
  Settings,
  LogOut,
  Star
} from 'lucide-react'

const favorites = [
  { name: 'Overview', href: '/dashboard/overview', icon: LayoutDashboard },
]

const intelligence = [
  { name: 'Shopping Visibility', href: '/dashboard/shopping', icon: ShoppingBag },
  { name: 'Brand Visibility', href: '/dashboard/brand', icon: TrendingUp },
  { name: 'Conversation Volumes', href: '/dashboard/conversations', icon: MessageSquare },
  { name: 'Website Analytics', href: '/dashboard/website', icon: Globe },
]

const control = [
  { name: 'Control Center', href: '/dashboard/settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="sidebar-container w-60 bg-navy flex flex-col">
      {/* Header - Static, Grounded */}
      <div className="p-6 border-b border-white/10">
        <h1 className="text-xl font-heading font-bold text-white tracking-wide">
          Harbor
        </h1>
        <p className="text-xs text-softgray/50 mt-1 font-body uppercase tracking-wider">
          Intelligence Platform
        </p>
      </div>

      {/* Navigation - Fixed, Non-scrolling */}
      <nav className="flex-1 overflow-hidden">
        {/* Favorites Section */}
        <div className="sidebar-section-header">
          Favorites
        </div>
        
        {favorites.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon className="nav-icon" strokeWidth={1.5} />
              <span className="text-sm font-body">{item.name}</span>
            </Link>
          )
        })}

        {/* Intelligence Section */}
        <div className="sidebar-section-header">
          Intelligence
        </div>
        
        {intelligence.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon className="nav-icon" strokeWidth={1.5} />
              <span className="text-sm font-body">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Control Section - Bottom */}
      <div className="p-4 border-t border-white/10">
        <div className="sidebar-section-header" style={{ marginTop: 0, paddingTop: 0 }}>
          Control
        </div>
        
        {control.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon className="nav-icon" strokeWidth={1.5} />
              <span className="text-sm font-body">{item.name}</span>
            </Link>
          )
        })}
        
        <button
          className="nav-item w-full"
          onClick={() => {
            // Add logout logic here
            console.log('Logout clicked')
          }}
        >
          <LogOut className="nav-icon" strokeWidth={1.5} />
          <span className="text-sm font-body">Logout</span>
        </button>
      </div>
    </aside>
  )
}