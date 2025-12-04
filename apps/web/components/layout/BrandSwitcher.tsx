// apps/web/components/layout/BrandSwitcher.tsx

'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, Plus } from 'lucide-react'
import { useBrand } from '@/contexts/BrandContext'
import AddBrandModal from '@/components/modals/AddBrandModal'

export default function BrandSwitcher() {
  const { currentDashboard, dashboards, switchDashboard, canAddBrand, isLoading } = useBrand()
  const [isOpen, setIsOpen] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')

  useEffect(() => {
    // Check initial theme
    const savedTheme = localStorage.getItem('harbor-theme') as 'light' | 'dark' | null
    setTheme(savedTheme || 'dark')
    
    // Listen for theme changes
    const handleThemeChange = () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') as 'light' | 'dark'
      setTheme(currentTheme || 'dark')
    }
    
    // Create observer for data-theme attribute changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
          handleThemeChange()
        }
      })
    })
    
    observer.observe(document.documentElement, { attributes: true })
    
    return () => observer.disconnect()
  }, [])

  const isDark = theme === 'dark'

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div 
          className="h-10 rounded-lg"
          style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6' }}
        />
      </div>
    )
  }

  if (!currentDashboard) {
    return (
      <div 
        className="rounded-lg p-3"
        style={{ 
          backgroundColor: isDark ? '#0B1521' : '#F3F4F6',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : '#E5E7EB'}`
        }}
      >
        <p 
          className="text-sm mb-2"
          style={{ color: isDark ? 'rgba(244,246,248,0.6)' : '#6B7280' }}
        >
          No brands yet
        </p>
        <button
          onClick={() => setShowAddModal(true)}
          className="text-xs text-chart-2 hover:opacity-80 transition-colors"
        >
          + Create your first brand
        </button>
        <AddBrandModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
        />
      </div>
    )
  }

  // Derive logo URL from domain via Brandfetch CDN
  const getBrandLogo = (domain: string) => `https://cdn.brandfetch.io/${domain}`

  return (
    <>
      {/* Inline Accordion */}
      <div 
        className="rounded-lg overflow-hidden"
        style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F3F4F6' }}
      >
        {/* Current Brand Header - Always Visible */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-3 transition-colors"
          style={{ 
            backgroundColor: 'transparent',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <div className="flex items-center gap-3">
            {/* Brand Logo */}
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden"
              style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
            >
              <img 
                src={getBrandLogo(currentDashboard.domain)} 
                alt={`${currentDashboard.brand_name} logo`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  target.parentElement!.innerHTML = `<span style="color: ${isDark ? 'rgba(244,246,248,0.5)' : '#6B7280'}" class="font-medium text-sm">${currentDashboard.brand_name.charAt(0)}</span>`
                }}
              />
            </div>
            
            {/* Brand Info */}
            <div className="flex-1 text-left min-w-0">
              <h3 
                className="text-sm font-heading font-semibold truncate"
                style={{ color: isDark ? '#FFFFFF' : '#111827' }}
              >
                {currentDashboard.brand_name}
              </h3>
              <p 
                className="text-xs truncate"
                style={{ color: isDark ? 'rgba(244,246,248,0.5)' : '#6B7280' }}
              >
                {currentDashboard.domain}
              </p>
            </div>

            {/* Dropdown Arrow */}
            <ChevronDown
              className={`w-4 h-4 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
              style={{ color: isDark ? 'rgba(244,246,248,0.5)' : '#6B7280' }}
            />
          </div>
        </button>

        {/* Dropdown Content - Only when open */}
        {isOpen && (
          <div 
            style={{ 
              borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : '#E5E7EB'}`,
              backgroundColor: isDark ? '#0B1521' : '#FFFFFF'
            }}
          >
            {/* Other Brands */}
            {dashboards.length > 1 && (
              <div className="py-1">
                {dashboards
                  .filter(d => d.id !== currentDashboard.id)
                  .map((dashboard) => (
                    <button
                      key={dashboard.id}
                      onClick={() => {
                        switchDashboard(dashboard.id)
                        setIsOpen(false)
                      }}
                      className="w-full px-3 py-2.5 flex items-center gap-3 transition-colors"
                      style={{ color: isDark ? 'rgba(244,246,248,0.6)' : '#6B7280' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6'
                        e.currentTarget.style.color = isDark ? '#FFFFFF' : '#111827'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent'
                        e.currentTarget.style.color = isDark ? 'rgba(244,246,248,0.6)' : '#6B7280'
                      }}
                    >
                      {/* Brand Logo */}
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden"
                        style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
                      >
                        <img 
                          src={getBrandLogo(dashboard.domain)} 
                          alt={`${dashboard.brand_name} logo`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            target.parentElement!.innerHTML = `<span style="color: ${isDark ? 'rgba(244,246,248,0.4)' : '#9CA3AF'}" class="font-medium text-xs">${dashboard.brand_name.charAt(0)}</span>`
                          }}
                        />
                      </div>
                      
                      {/* Brand Info */}
                      <div className="flex-1 text-left min-w-0">
                        <div className="text-sm font-medium truncate">
                          {dashboard.brand_name}
                        </div>
                        <div 
                          className="text-xs truncate"
                          style={{ color: isDark ? 'rgba(244,246,248,0.5)' : '#9CA3AF' }}
                        >
                          {dashboard.domain}
                        </div>
                      </div>
                    </button>
                  ))}
              </div>
            )}

            {/* Add Brand Button - Only for Agency/Enterprise */}
            {canAddBrand && (
              <>
                {dashboards.length > 1 && (
                  <div 
                    className="h-px mx-3" 
                    style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#E5E7EB' }}
                  />
                )}
                <button
                  onClick={() => {
                    setShowAddModal(true)
                    setIsOpen(false)
                  }}
                  className="w-full px-3 py-2.5 flex items-center gap-3 text-chart-2 hover:opacity-80 transition-colors"
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div 
                    className="w-8 h-8 rounded-lg border border-chart-2/30 flex items-center justify-center flex-shrink-0"
                  >
                    <Plus className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <span className="text-sm font-medium">Add Brand</span>
                </button>
              </>
            )}

            {/* Plan Limit Reached Message */}
            {!canAddBrand && dashboards.length >= 1 && (
              <>
                <div 
                  className="h-px mx-3" 
                  style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#E5E7EB' }}
                />
                <div 
                  className="px-3 py-2 text-xs italic"
                  style={{ color: isDark ? 'rgba(244,246,248,0.4)' : '#9CA3AF' }}
                >
                  Brand limit reached · Upgrade to add more
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Add Brand Modal */}
      <AddBrandModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </>
  )
}