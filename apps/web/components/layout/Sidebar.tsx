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
  LogOut
} from 'lucide-react'

const navigation = [
  { name: 'Overview', href: '/dashboard/overview', icon: LayoutDashboard },
  { name: 'Shopping Visibility', href: '/dashboard/shopping', icon: ShoppingBag },
  { name: 'Brand Visibility', href: '/dashboard/brand', icon: TrendingUp },
  { name: 'Conversation Volumes', href: '/dashboard/conversations', icon: MessageSquare },
  { name: 'Website Analytics', href: '/dashboard/website', icon: Globe },
]

const bottomNav = [
  { name: 'Control Center', href: '/dashboard/settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="sidebar-container w-60 bg-navy flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <h1 className="text-xl font-heading font-bold text-white">
          Harbor
        </h1>
        <p className="text-sm text-softgray/60 mt-1 font-body">
          Intelligence Platform
        </p>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <div className="text-xs uppercase text-softgray/40 font-body font-medium mb-3 px-3">
          Intelligence
        </div>
        
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon className="nav-icon" />
              <span className="text-sm font-body">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="p-4 border-t border-white/10 space-y-1">
        {bottomNav.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon className="nav-icon" />
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
          <LogOut className="nav-icon" />
          <span className="text-sm font-body">Logout</span>
        </button>
      </div>
    </aside>
  )
}