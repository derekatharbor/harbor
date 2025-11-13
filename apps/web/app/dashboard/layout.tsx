'use client'

import { usePathname } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  // Map routes to page names for accent system
  const getPageName = (path: string): string => {
    if (path === '/dashboard' || path === '/dashboard/overview') return 'overview'
    if (path === '/dashboard/shopping') return 'shopping'
    if (path === '/dashboard/brand') return 'brand'
    if (path === '/dashboard/conversations') return 'conversations'
    if (path === '/dashboard/website') return 'website'
    return 'overview' // fallback
  }

  const pageName = getPageName(pathname)

  return (
    <div className="flex min-h-screen bg-navy" data-page={pageName}>
      <Sidebar />
      <main className="flex-1 page-container">
        <div className="max-w-7xl mx-auto px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}