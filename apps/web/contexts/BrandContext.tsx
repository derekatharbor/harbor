// apps/web/contexts/BrandContext.tsx

'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export interface Dashboard {
  id: string
  brand_name: string
  domain: string
  plan: 'solo' | 'agency' | 'enterprise'
  org_id: string
  last_fresh_scan_at: string | null
  created_at: string
}

interface BrandContextType {
  currentDashboard: Dashboard | null
  dashboards: Dashboard[]
  isLoading: boolean
  switchDashboard: (dashboardId: string) => void
  refreshDashboards: () => Promise<void>
  canAddBrand: boolean
}

const BrandContext = createContext<BrandContextType | undefined>(undefined)

export function BrandProvider({ children }: { children: ReactNode }) {
  const [currentDashboard, setCurrentDashboard] = useState<Dashboard | null>(null)
  const [dashboards, setDashboards] = useState<Dashboard[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Fetch all dashboards user has access to
  const fetchDashboards = async () => {
    try {
      const res = await fetch('/api/dashboards')
      if (!res.ok) throw new Error('Failed to fetch dashboards')
      
      const data = await res.json()
      setDashboards(data.dashboards)

      // Determine which dashboard to select
      const brandParam = searchParams.get('brand')
      
      if (brandParam) {
        // Use brand from URL if exists
        const dashboard = data.dashboards.find((d: Dashboard) => d.id === brandParam)
        if (dashboard) {
          setCurrentDashboard(dashboard)
          return
        }
      }

      // Fall back to first dashboard
      if (data.dashboards.length > 0) {
        setCurrentDashboard(data.dashboards[0])
      }
    } catch (error) {
      console.error('Error fetching dashboards:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboards()
  }, []) // Only run on mount

  // Switch to a different dashboard
  const switchDashboard = (dashboardId: string) => {
    const dashboard = dashboards.find(d => d.id === dashboardId)
    if (!dashboard) return

    setCurrentDashboard(dashboard)
    
    // Update URL with brand parameter
    const currentPath = window.location.pathname
    router.push(`${currentPath}?brand=${dashboardId}`)
  }

  // Refresh dashboard list (after creating new one)
  const refreshDashboards = async () => {
    await fetchDashboards()
  }

  // Check if user can add more brands based on plan
  const canAddBrand = (() => {
    if (!currentDashboard) return false
    
    const plan = currentDashboard.plan
    const count = dashboards.length

    if (plan === 'solo') return count < 1
    if (plan === 'agency') return count < 5
    if (plan === 'enterprise') return true

    return false
  })()

  return (
    <BrandContext.Provider
      value={{
        currentDashboard,
        dashboards,
        isLoading,
        switchDashboard,
        refreshDashboards,
        canAddBrand,
      }}
    >
      {children}
    </BrandContext.Provider>
  )
}

// Hook to use brand context
export function useBrand() {
  const context = useContext(BrandContext)
  if (context === undefined) {
    throw new Error('useBrand must be used within a BrandProvider')
  }
  return context
}
