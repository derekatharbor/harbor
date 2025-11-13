'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import Sidebar from '@/components/layout/Sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  
  // Map routes to page names for accent system
  const getPageName = (path: string): string => {
    if (path === '/dashboard' || path === '/dashboard/overview') return 'overview'
    if (path === '/dashboard/shopping') return 'shopping'
    if (path === '/dashboard/brand') return 'brand'
    if (path === '/dashboard/conversations') return 'conversations'
    if (path === '/dashboard/website') return 'website'
    return 'overview'
  }

  const pageName = getPageName(pathname)

  return (
    <div className="min-h-screen bg-navy" data-page={pageName}>
      <Sidebar />
      <main className="ml-60 min-h-screen">
        <div className="max-w-7xl mx-auto px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}