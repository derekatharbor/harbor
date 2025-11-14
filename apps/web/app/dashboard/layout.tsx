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

  useEffect(() => {
    // Show loader on route change
    setIsTransitioning(true)
    
    // Hide loader after a short delay (allows page to start rendering)
    const timer = setTimeout(() => {
      setIsTransitioning(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [pathname])

  // Note: Sidebar margin is now handled by CSS (ml-60 or ml-16 based on sidebar width)
  // We use a fixed class here and let the sidebar handle its own width transition

  return (
    <BrandProvider>
      <div className="flex min-h-screen bg-primary">
        <Sidebar />
        <main className="flex-1 ml-60 p-8 relative transition-all duration-300">
          {/* Route transition overlay */}
          {isTransitioning && (
            <div className="absolute inset-0 bg-primary z-50 flex items-start justify-start pt-8">
              <div className="animate-pulse space-y-8 w-full">
                {/* Header skeleton */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-border rounded-lg"></div>
                    <div className="h-10 w-64 bg-border rounded"></div>
                  </div>
                  <div className="h-10 w-40 bg-border rounded-lg"></div>
                </div>

                {/* Cards skeleton */}
                <div className="grid grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-card rounded-lg p-6 border border-border h-32"></div>
                  ))}
                </div>

                {/* Chart skeleton */}
                <div className="bg-card rounded-lg p-6 border border-border h-64"></div>
              </div>
            </div>
          )}
          
          {/* Actual page content */}
          <div className={isTransitioning ? 'opacity-0' : 'opacity-100 transition-opacity duration-200'}>
            {children}
          </div>
        </main>
      </div>
    </BrandProvider>
  )
}