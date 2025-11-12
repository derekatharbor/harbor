'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  ShoppingBag, 
  MessageSquare, 
  Globe, 
  Settings,
  Star,
  FileText,
  Video,
  BookOpen
} from 'lucide-react'

const favorites = [
  { name: 'Quick Start Guide', icon: FileText, href: '/guide' },
  { name: 'Video Tutorials', icon: Video, href: '/tutorials' },
  { name: 'Documentation', icon: BookOpen, href: '/docs' },
]

const mainMenu = [
  { name: 'Overview', icon: Home, href: '/dashboard' },
  { name: 'Shopping Visibility', icon: ShoppingBag, href: '/dashboard/shopping' },
  { name: 'Brand Visibility', icon: Star, href: '/dashboard/brand' },
  { name: 'Conversation Volumes', icon: MessageSquare, href: '/dashboard/conversations' },
  { name: 'Website Analytics', icon: Globe, href: '/dashboard/website' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 bg-navy h-screen fixed left-0 top-0 flex flex-col border-r border-harbor">
      {/* Brand header */}
      <div className="p-6 border-b border-harbor">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-teal rounded-lg flex items-center justify-center">
            <span className="text-white font-heading font-bold text-sm">H</span>
          </div>
          <div>
            <h2 className="font-heading font-semibold text-white text-sm">Harbor</h2>
            <p className="text-softgray text-xs opacity-75">Demo Brand</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-3">
        {/* Favorites section */}
        <div className="mb-8">
          <div className="px-3 mb-3">
            <span className="text-softgray text-xs uppercase tracking-wider opacity-60 font-body">
              Favorites
            </span>
          </div>
          <div className="space-y-1">
            {favorites.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg transition-harbor cursor-pointer
                    ${isActive 
                      ? 'bg-navy-lighter text-white' 
                      : 'text-softgray hover:bg-navy-light hover:text-white'
                    }
                  `}
                >
                  <Icon size={18} strokeWidth={1.5} />
                  <span className="text-sm font-body">{item.name}</span>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-harbor mb-8 mx-3" />

        {/* Main Menu section */}
        <div>
          <div className="px-3 mb-3">
            <span className="text-softgray text-xs uppercase tracking-wider opacity-60 font-body">
              Intelligence
            </span>
          </div>
          <div className="space-y-1">
            {mainMenu.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg transition-harbor cursor-pointer relative
                    ${isActive 
                      ? 'bg-navy-lighter text-white' 
                      : 'text-softgray hover:bg-navy-light hover:text-white'
                    }
                  `}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-teal rounded-r" />
                  )}
                  <Icon size={18} strokeWidth={1.5} />
                  <span className="text-sm font-body">{item.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Settings footer */}
      <div className="p-3 border-t border-harbor">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-softgray hover:bg-navy-light hover:text-white transition-harbor cursor-pointer"
        >
          <Settings size={18} strokeWidth={1.5} />
          <span className="text-sm font-body">Control Center</span>
        </Link>
      </div>
    </aside>
  )
}