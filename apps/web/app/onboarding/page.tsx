'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

const CATEGORIES = [
  'E-commerce',
  'SaaS',
  'Financial Services',
  'Healthcare',
  'Education',
  'Real Estate',
  'Travel & Hospitality',
  'Food & Beverage',
  'Fashion & Apparel',
  'Technology',
  'Automotive',
  'Media & Entertainment',
  'Professional Services',
  'Other',
]

export default function OnboardingPage() {
  const [brandName, setBrandName] = useState('')
  const [domain, setDomain] = useState('')
  const [category, setCategory] = useState('')
  const [products, setProducts] = useState<string[]>([''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClientComponentClient()

  const addProduct = () => {
    setProducts([...products, ''])
  }

  const removeProduct = (index: number) => {
    setProducts(products.filter((_, i) => i !== index))
  }

  const updateProduct = (index: number, value: string) => {
    const newProducts = [...products]
    newProducts[index] = value
    setProducts(newProducts)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      // Get user's org
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('org_id')
        .eq('user_id', user.id)
        .single()

      if (!userRole?.org_id) throw new Error('No organization found')

      // Filter out empty products
      const filteredProducts = products.filter(p => p.trim() !== '')

      // Create dashboard with metadata
      const { error: dashboardError } = await supabase
        .from('dashboards')
        .insert({
          org_id: userRole.org_id,
          brand_name: brandName,
          domain: domain,
          plan: 'solo',
          metadata: {
            category: category,
            products: filteredProducts,
          }
        })

      if (dashboardError) throw dashboardError

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Failed to create dashboard')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#101A31] flex items-center justify-center p-8">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="mb-12 text-center">
          <Image
            src="/images/harbor-logo-white.svg"
            alt="Harbor"
            width={120}
            height={40}
            className="h-10 w-auto mx-auto mb-8"
          />
          <h1 
            className="text-4xl font-bold text-white mb-3" 
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Set up your brand
          </h1>
          <p 
            className="text-[#F4F6F8] opacity-75"
            style={{ fontFamily: 'Source Code Pro, monospace' }}
          >
            Tell us about your brand so we can start tracking your AI visibility
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#141E38] rounded-xl p-8 border border-white/5">
          {error && (
            <div className="mb-6 p-4 bg-[#FF6B4A]/10 border border-[#FF6B4A]/20 rounded-lg">
              <p className="text-sm text-[#FF6B4A]" style={{ fontFamily: 'Source Code Pro, monospace' }}>
                {error}
              </p>
            </div>
          )}

          {/* Brand Name */}
          <div className="mb-6">
            <label 
              htmlFor="brandName" 
              className="block text-sm font-medium text-white mb-2 uppercase tracking-wide"
              style={{ fontFamily: 'Source Code Pro, monospace', fontSize: '12px' }}
            >
              Brand Name
            </label>
            <input
              id="brandName"
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              required
              className="w-full px-4 py-3 bg-[#101A31] border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B4A] focus:border-transparent text-white placeholder-white/40"
              style={{ fontFamily: 'Source Code Pro, monospace' }}
              placeholder="Acme Inc"
            />
          </div>

          {/* Domain */}
          <div className="mb-6">
            <label 
              htmlFor="domain" 
              className="block text-sm font-medium text-white mb-2 uppercase tracking-wide"
              style={{ fontFamily: 'Source Code Pro, monospace', fontSize: '12px' }}
            >
              Website Domain
            </label>
            <input
              id="domain"
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              required
              className="w-full px-4 py-3 bg-[#101A31] border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B4A] focus:border-transparent text-white placeholder-white/40"
              style={{ fontFamily: 'Source Code Pro, monospace' }}
              placeholder="acme.com"
            />
            <p className="mt-1 text-xs text-white/50" style={{ fontFamily: 'Source Code Pro, monospace' }}>
              Don't include https:// or www
            </p>
          </div>

          {/* Category */}
          <div className="mb-6">
            <label 
              htmlFor="category" 
              className="block text-sm font-medium text-white mb-2 uppercase tracking-wide"
              style={{ fontFamily: 'Source Code Pro, monospace', fontSize: '12px' }}
            >
              Industry Category
            </label>
            <div className="relative">
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#101A31] border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B4A] focus:border-transparent text-white appearance-none"
                style={{ 
                  fontFamily: 'Source Code Pro, monospace',
                  backgroundImage: 'linear-gradient(to bottom, transparent 0%, transparent calc(100% - 20px), rgba(255, 107, 74, 0.05) 100%)'
                }}
              >
                <option value="">Select a category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {/* Dropdown arrow */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1.5L6 6.5L11 1.5" stroke="white" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="mb-8">
            <label 
              className="block text-sm font-medium text-white mb-2 uppercase tracking-wide"
              style={{ fontFamily: 'Source Code Pro, monospace', fontSize: '12px' }}
            >
              Key Products or Services (as customers would search them)
            </label>
            <p className="text-xs text-white/50 mb-3" style={{ fontFamily: 'Source Code Pro, monospace' }}>
              Add 2–5 key products or services you want tracked in AI search results (e.g., "Business Checking Account", "Analytics Platform", "CRM Software")
            </p>
            
            <div className="space-y-3">
              {products.map((product, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={product}
                    onChange={(e) => updateProduct(index, e.target.value)}
                    className="flex-1 px-4 py-3 bg-[#101A31] border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B4A] focus:border-transparent text-white placeholder-white/40"
                    style={{ fontFamily: 'Source Code Pro, monospace' }}
                    placeholder={index === 0 ? "e.g., Business Credit Card" : `Product ${index + 1}`}
                  />
                  {products.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeProduct(index)}
                      className="px-4 py-3 bg-[#101A31] border border-white/10 rounded-lg text-white/50 hover:text-white hover:border-white/20 transition-colors"
                      style={{ fontFamily: 'Source Code Pro, monospace' }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            {products.length < 5 && (
              <button
                type="button"
                onClick={addProduct}
                className="mt-3 text-sm text-[#FF6B4A] hover:text-[#E55A3A] transition-colors"
                style={{ fontFamily: 'Source Code Pro, monospace' }}
              >
                + Add another product
              </button>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-[#FF6B4A] text-white rounded-lg font-medium hover:bg-[#E55A3A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF6B4A] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            style={{ fontFamily: 'Source Code Pro, monospace' }}
          >
            {loading ? 'Setting up your dashboard...' : 'Complete setup'}
          </button>
        </form>
      </div>
    </div>
  )
}