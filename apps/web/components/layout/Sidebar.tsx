// apps/web/components/layout/Sidebar.tsx

'use client'

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
  BookOpen
} from 'lucide-react'

export default function Sidebar() {
  const pathname = usePathname()

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
    <aside className="fixed left-0 top-0 h-screen w-60 bg-[#0B1521] border-r border-white/5 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-coral rounded-lg flex items-center justify-center">
            <span className="text-white font-heading font-bold text-xl">H</span>
          </div>
          <div>
            <h1 className="text-lg font-heading font-bold text-white">
              Harbor
            </h1>
            <p className="text-xs text-softgray/50">
              Demo Brand
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-hidden">
        {/* Favorites Section */}
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
                <Icon className="w-5 h-5" strokeWidth={1.5} />
                <span className="text-sm font-body">{item.name}</span>
              </Link>
            )
          })}
        </div>

        {/* Intelligence Section */}
        <div className="px-4 py-3">
          <div className="text-xs text-softgray/40 uppercase tracking-wider mb-3 px-3">
            Intelligence
          </div>
          
          {intelligence.map((item) => {
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
                <Icon className="w-5 h-5" strokeWidth={1.5} />
                <span className="text-sm font-body">{item.name}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Control Center - Bottom */}
      <div className="p-4 border-t border-white/5">
        <Link
          href="/dashboard/settings"
          className={`
            flex items-center gap-3 px-3 py-2.5 rounded-lg
            transition-colors cursor-pointer
            ${pathname === '/dashboard/settings'
              ? 'text-white pl-[10px]'
              : 'text-softgray/60 hover:text-white hover:bg-white/5'
            }
          `}
          style={pathname === '/dashboard/settings' ? {
            borderLeft: `2px solid ${accentColor}`
          } : {}}
        >
          <Settings className="w-5 h-5" strokeWidth={1.5} />
          <span className="text-sm font-body">Control Center</span>
        </Link>
      </div>
    </aside>
  )
}