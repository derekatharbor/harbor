// apps/web/components/modals/AddBrandModal.tsx

'use client'

import { useState } from 'react'
import { X, Building2 } from 'lucide-react'
import { useBrand } from '@/contexts/BrandContext'

interface AddBrandModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AddBrandModal({ isOpen, onClose }: AddBrandModalProps) {
  const { refreshDashboards, switchDashboard } = useBrand()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    brand_name: '',
    domain: '',
    category: '',
  })

  const categories = [
    'E-commerce',
    'SaaS',
    'Agency',
    'B2B Services',
    'Consumer Products',
    'Financial Services',
    'Healthcare',
    'Education',
    'Real Estate',
    'Other',
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/dashboards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create brand')
      }

      const data = await res.json()
      
      // Refresh dashboard list
      await refreshDashboards()
      
      // Switch to new dashboard
      switchDashboard(data.dashboard.id)
      
      // Reset form and close
      setFormData({ brand_name: '', domain: '', category: '' })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create brand')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-navy/85 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-[#141E38] border border-white/8 rounded-xl shadow-2xl w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-coral/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-coral" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-lg font-heading font-semibold text-white">
                  Add Brand
                </h2>
                <p className="text-xs text-softgray/60">
                  Create a new brand dashboard
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-softgray/60 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Brand Name */}
            <div>
              <label className="block text-xs font-medium text-softgray/70 mb-2 uppercase tracking-wider">
                Brand Name
              </label>
              <input
                type="text"
                value={formData.brand_name}
                onChange={(e) =>
                  setFormData({ ...formData, brand_name: e.target.value })
                }
                placeholder="e.g. Acme Corp"
                required
                className="w-full px-4 py-2.5 bg-navy border border-white/8 rounded-lg text-white placeholder:text-softgray/40 focus:outline-none focus:border-coral/50 focus:ring-1 focus:ring-coral/20 transition-colors"
              />
            </div>

            {/* Domain */}
            <div>
              <label className="block text-xs font-medium text-softgray/70 mb-2 uppercase tracking-wider">
                Domain
              </label>
              <input
                type="text"
                value={formData.domain}
                onChange={(e) =>
                  setFormData({ ...formData, domain: e.target.value })
                }
                placeholder="e.g. acme.com"
                required
                className="w-full px-4 py-2.5 bg-navy border border-white/8 rounded-lg text-white placeholder:text-softgray/40 focus:outline-none focus:border-coral/50 focus:ring-1 focus:ring-coral/20 transition-colors"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-medium text-softgray/70 mb-2 uppercase tracking-wider">
                Category (Optional)
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-navy border border-white/8 rounded-lg text-white focus:outline-none focus:border-coral/50 focus:ring-1 focus:ring-coral/20 transition-colors"
              >
                <option value="">Select a category...</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-coral/10 border border-coral/20 rounded-lg">
                <p className="text-sm text-coral">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-white/8 rounded-lg text-softgray/70 hover:text-white hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 bg-coral rounded-lg text-white font-medium hover:bg-coral/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Creating...' : 'Create Brand'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
