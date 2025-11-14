// apps/web/components/layout/BrandSwitcher.tsx

'use client'

import { useState } from 'react'
import { ChevronDown, Building2, Check, Plus } from 'lucide-react'
import { useBrand } from '@/contexts/BrandContext'
import AddBrandModal from '@/components/modals/AddBrandModal'

export default function BrandSwitcher() {
  const { currentDashboard, dashboards, switchDashboard, canAddBrand, isLoading } = useBrand()
  const [isOpen, setIsOpen] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-white/10 rounded w-24 mb-2"></div>
        <div className="h-3 bg-white/5 rounded w-32"></div>
      </div>
    )
  }

  if (!currentDashboard) {
    return (
      <div>
        <p className="text-sm text-softgray/60">No brands yet</p>
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
      <div className="relative">
        {/* Current Brand Display */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full text-left group"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-heading font-semibold text-white truncate group-hover:text-white/90 transition-colors">
                {currentDashboard.brand_name}
              </h2>
              <p className="text-xs text-softgray/50 truncate">
                {currentDashboard.domain}
              </p>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-softgray/50 mt-0.5 transition-transform flex-shrink-0 ml-2 ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </div>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-[#141E38] border border-white/8 rounded-lg shadow-xl overflow-hidden">
              {/* Brand List */}
              <div className="py-1">
                {dashboards.map((dashboard) => {
                  const isActive = dashboard.id === currentDashboard.id

                  return (
                    <button
                      key={dashboard.id}
                      onClick={() => {
                        switchDashboard(dashboard.id)
                        setIsOpen(false)
                      }}
                      className={`
                        w-full px-3 py-2.5 flex items-center gap-3 transition-colors
                        ${isActive
                          ? 'bg-white/5 text-white'
                          : 'text-softgray/60 hover:text-white hover:bg-white/3'
                        }
                      `}
                    >
                      <Building2 className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
                      <div className="flex-1 text-left min-w-0">
                        <div className="text-sm font-medium truncate">
                          {dashboard.brand_name}
                        </div>
                        <div className="text-xs text-softgray/50 truncate">
                          {dashboard.domain}
                        </div>
                      </div>
                      {isActive && (
                        <Check className="w-4 h-4 text-coral flex-shrink-0" strokeWidth={2} />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Add Brand Button */}
              {canAddBrand && (
                <>
                  <div className="h-px bg-white/5" />
                  <button
                    onClick={() => {
                      setShowAddModal(true)
                      setIsOpen(false)
                    }}
                    className="w-full px-3 py-2.5 flex items-center gap-3 text-softgray/60 hover:text-white hover:bg-white/3 transition-colors"
                  >
                    <Plus className="w-4 h-4" strokeWidth={1.5} />
                    <span className="text-sm font-medium">Add Brand</span>
                  </button>
                </>
              )}

              {/* Plan Limit Info (if at limit) */}
              {!canAddBrand && dashboards.length > 0 && (
                <>
                  <div className="h-px bg-white/5" />
                  <div className="px-3 py-2 text-xs text-softgray/40">
                    Brand limit reached ({dashboards.length}/{currentDashboard.plan === 'solo' ? '1' : '5'})
                  </div>
                </>
              )}
            </div>
          </>
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
