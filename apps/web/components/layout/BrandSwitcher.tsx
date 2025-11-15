// apps/web/components/layout/BrandSwitcher.tsx

'use client'

import { useState } from 'react'
import { ChevronDown, Building2, Plus } from 'lucide-react'
import { useBrand } from '@/contexts/BrandContext'
import AddBrandModal from '@/components/modals/AddBrandModal'

export default function BrandSwitcher() {
  const { currentDashboard, dashboards, switchDashboard, canAddBrand, isLoading } = useBrand()
  const [isOpen, setIsOpen] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-white/5 rounded-lg"></div>
      </div>
    )
  }

  if (!currentDashboard) {
    return (
      <div className="bg-[#0B1521] border border-white/5 rounded-lg p-3">
        <p className="text-sm text-softgray/60 mb-2">No brands yet</p>
        <button
          onClick={() => setShowAddModal(true)}
          className="text-xs text-coral hover:text-coral/80 transition-colors"
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

  return (
    <>
      {/* Inline Accordion */}
      <div className="bg-[#0B1521] rounded-lg overflow-hidden">
        {/* Current Brand Header - Always Visible */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-3 hover:bg-white/3 transition-colors"
        >
          <div className="flex items-center gap-3">
            {/* Brand Logo */}
            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {currentDashboard.logo_url ? (
                <img 
                  src={currentDashboard.logo_url} 
                  alt={`${currentDashboard.brand_name} logo`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Building2 className="w-5 h-5 text-softgray/50" strokeWidth={1.5} />
              )}
            </div>
            
            {/* Brand Info */}
            <div className="flex-1 text-left min-w-0">
              <h3 className="text-sm font-heading font-semibold text-white truncate">
                {currentDashboard.brand_name}
              </h3>
              <p className="text-xs text-softgray/50 truncate">
                {currentDashboard.domain}
              </p>
            </div>

            {/* Dropdown Arrow */}
            <ChevronDown
              className={`w-4 h-4 text-softgray/50 transition-transform flex-shrink-0 ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </div>
        </button>

        {/* Dropdown Content - Only when open */}
        {isOpen && (
          <div className="border-t border-white/5 bg-[#0B1521]">
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
                      className="w-full px-3 py-2.5 flex items-center gap-3 text-softgray/60 hover:text-white hover:bg-white/3 transition-colors"
                    >
                      {/* Brand Logo */}
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {dashboard.logo_url ? (
                          <img 
                            src={dashboard.logo_url} 
                            alt={`${dashboard.brand_name} logo`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Building2 className="w-4 h-4 text-softgray/40" strokeWidth={1.5} />
                        )}
                      </div>
                      
                      {/* Brand Info */}
                      <div className="flex-1 text-left min-w-0">
                        <div className="text-sm font-medium truncate">
                          {dashboard.brand_name}
                        </div>
                        <div className="text-xs text-softgray/50 truncate">
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
                {dashboards.length > 1 && <div className="h-px bg-white/5 mx-3" />}
                <button
                  onClick={() => {
                    setShowAddModal(true)
                    setIsOpen(false)
                  }}
                  className="w-full px-3 py-2.5 flex items-center gap-3 text-coral hover:text-coral/80 hover:bg-white/3 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg border border-coral/30 flex items-center justify-center flex-shrink-0">
                    <Plus className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <span className="text-sm font-medium">Add Brand</span>
                </button>
              </>
            )}

            {/* Plan Limit Reached Message */}
            {!canAddBrand && dashboards.length >= 1 && (
              <>
                <div className="h-px bg-white/5 mx-3" />
                <div className="px-3 py-2 text-xs text-softgray/40 italic">
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