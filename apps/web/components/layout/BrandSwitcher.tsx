// apps/web/components/layout/BrandSwitcher.tsx

'use client'

import { useState } from 'react'
import { ChevronDown, Plus } from 'lucide-react'
import { useBrand } from '@/contexts/BrandContext'
import AddBrandModal from '@/components/modals/AddBrandModal'

export default function BrandSwitcher() {
  const { currentDashboard, dashboards, switchDashboard, canAddBrand, isLoading } = useBrand()
  const [isOpen, setIsOpen] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-sidebar-hover rounded-lg"></div>
      </div>
    )
  }

  if (!currentDashboard) {
    return (
      <div className="bg-sidebar border border-border rounded-lg p-3">
        <p className="text-sm text-sidebar-muted mb-2">No brands yet</p>
        <button
          onClick={() => setShowAddModal(true)}
          className="text-xs text-chart-2 hover:text-chart-2/80 transition-colors"
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
      <div className="bg-sidebar-hover rounded-lg overflow-hidden">
        {/* Current Brand Header - Always Visible */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            {/* Brand Logo */}
            <div className="w-10 h-10 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center flex-shrink-0 overflow-hidden">
              <img 
                src={getBrandLogo(currentDashboard.domain)} 
                alt={`${currentDashboard.brand_name} logo`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  target.parentElement!.innerHTML = `<span class="text-sidebar-muted font-medium text-sm">${currentDashboard.brand_name.charAt(0)}</span>`
                }}
              />
            </div>
            
            {/* Brand Info */}
            <div className="flex-1 text-left min-w-0">
              <h3 className="text-sm font-heading font-semibold text-sidebar-foreground truncate">
                {currentDashboard.brand_name}
              </h3>
              <p className="text-xs text-sidebar-muted truncate">
                {currentDashboard.domain}
              </p>
            </div>

            {/* Dropdown Arrow */}
            <ChevronDown
              className={`w-4 h-4 text-sidebar-muted transition-transform flex-shrink-0 ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </div>
        </button>

        {/* Dropdown Content - Only when open */}
        {isOpen && (
          <div className="border-t border-border bg-sidebar">
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
                      className="w-full px-3 py-2.5 flex items-center gap-3 text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-hover transition-colors"
                    >
                      {/* Brand Logo */}
                      <div className="w-8 h-8 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        <img 
                          src={getBrandLogo(dashboard.domain)} 
                          alt={`${dashboard.brand_name} logo`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            target.parentElement!.innerHTML = `<span class="text-sidebar-muted font-medium text-xs">${dashboard.brand_name.charAt(0)}</span>`
                          }}
                        />
                      </div>
                      
                      {/* Brand Info */}
                      <div className="flex-1 text-left min-w-0">
                        <div className="text-sm font-medium truncate">
                          {dashboard.brand_name}
                        </div>
                        <div className="text-xs text-sidebar-muted truncate">
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
                {dashboards.length > 1 && <div className="h-px bg-border mx-3" />}
                <button
                  onClick={() => {
                    setShowAddModal(true)
                    setIsOpen(false)
                  }}
                  className="w-full px-3 py-2.5 flex items-center gap-3 text-chart-2 hover:text-chart-2/80 hover:bg-sidebar-hover transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg border border-chart-2/30 flex items-center justify-center flex-shrink-0">
                    <Plus className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <span className="text-sm font-medium">Add Brand</span>
                </button>
              </>
            )}

            {/* Plan Limit Reached Message */}
            {!canAddBrand && dashboards.length >= 1 && (
              <>
                <div className="h-px bg-border mx-3" />
                <div className="px-3 py-2 text-xs text-sidebar-muted italic">
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