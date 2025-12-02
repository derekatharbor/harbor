// apps/web/app/dashboard/layout.tsx

'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { BrandProvider } from '@/contexts/BrandContext'
import Sidebar from '@/components/layout/Sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Listen for sidebar toggle events
  useEffect(() => {
    const checkSidebarState = () => {
      const collapsed = localStorage.getItem('harbor-sidebar-collapsed') === 'true'
      setSidebarCollapsed(collapsed)
    }

    checkSidebarState()

    window.addEventListener('sidebar-toggle', checkSidebarState)
    return () => window.removeEventListener('sidebar-toggle', checkSidebarState)
  }, [])

  useEffect(() => {
    setIsTransitioning(true)
    
    const timer = setTimeout(() => {
      setIsTransitioning(false)
    }, 200) // Reduced from 300ms for snappier feel

    return () => clearTimeout(timer)
  }, [pathname])

  return (
    <BrandProvider>
      {/* 
        Dashboard container uses CSS variables for theming.
        The bg-primary class pulls from --bg-primary which changes with data-theme.
      */}
      <div 
        className="flex min-h-screen"
        style={{ backgroundColor: 'var(--bg-primary)' }}
      >
        <Sidebar />
        
        <main 
          className={`
            flex-1 relative 
            transition-[margin] duration-300 
            ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-60'}
          `}
          style={{ backgroundColor: 'var(--bg-primary)' }}
        >
          {/* Route transition overlay - uses same background */}
          {isTransitioning && (
            <div 
              className="absolute inset-0 z-50 flex items-start justify-start pt-8"
              style={{ backgroundColor: 'var(--bg-primary)' }}
            >
              <div className="animate-pulse space-y-8 w-full">
                {/* Header skeleton */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-lg"
                      style={{ backgroundColor: 'var(--bg-card)' }}
                    />
                    <div 
                      className="h-10 w-64 rounded"
                      style={{ backgroundColor: 'var(--bg-card)' }}
                    />
                  </div>
                  <div 
                    className="h-10 w-40 rounded-lg hidden lg:block"
                    style={{ backgroundColor: 'var(--bg-card)' }}
                  />
                </div>

                {/* Cards skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div 
                      key={i} 
                      className="rounded-lg p-6 h-32"
                      style={{ 
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border)'
                      }}
                    />
                  ))}
                </div>

                {/* Chart skeleton */}
                <div 
                  className="rounded-lg p-6 h-64"
                  style={{ 
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)'
                  }}
                />
              </div>
            </div>
          )}
          
          {/* Actual page content */}
          <div className={`
            transition-opacity duration-150
            ${isTransitioning ? 'opacity-0' : 'opacity-100'}
          `}>
            {children}
          </div>
        </main>
      </div>
    </BrandProvider>
  )
}