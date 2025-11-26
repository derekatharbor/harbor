// apps/web/app/onboarding/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'

export default function OnboardingPage() {
  const [brandName, setBrandName] = useState('')
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [checking, setChecking] = useState(true)

  const router = useRouter()
  const supabase = createClientComponentClient()

  // Check if user is logged in
  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/auth/login')
        return
      }

      setChecking(false)
    }

    checkAuth()
  }, [supabase, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Use API route to create dashboard (bypasses RLS)
      const response = await fetch('/api/onboarding/create-dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName: brandName.trim(),
          domain: domain.trim()
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create dashboard')
      }

      // If dashboard already existed, just redirect
      if (data.existing) {
        router.push('/dashboard')
        router.refresh()
        return
      }

      // If scan was created, trigger the process
      if (data.scanId) {
        fetch('/api/scan/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scanId: data.scanId })
        }).catch(err => console.error('Scan process trigger failed:', err))
      }

      // Redirect to dashboard
      router.push('/dashboard')
      router.refresh()
      
    } catch (err: any) {
      console.error('Onboarding error:', err)
      setError(err.message || 'Failed to create dashboard')
    } finally {
      setLoading(false)
    }
  }

  // Show loading while checking onboarding status
  if (checking) {
    return (
      <div className="min-h-screen bg-[#101A31] flex items-center justify-center">
        <div className="text-white/50 font-mono text-sm">
          Loading...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#101A31] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 font-heading">
            Claim your brand
          </h1>
          <p className="text-white/60 font-mono text-sm">
            We'll start scanning how AI sees you immediately.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-400 font-mono">
                {error}
              </p>
            </div>
          )}

          {/* Brand Name */}
          <div>
            <label 
              htmlFor="brandName" 
              className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider font-mono"
            >
              Brand Name
            </label>
            <input
              id="brandName"
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              required
              autoFocus
              className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-white/30 font-mono"
              placeholder="Acme Inc"
            />
          </div>

          {/* Domain */}
          <div>
            <label 
              htmlFor="domain" 
              className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider font-mono"
            >
              Website
            </label>
            <input
              id="domain"
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              required
              className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-white/30 font-mono"
              placeholder="acme.com"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !brandName.trim() || !domain.trim()}
            className="w-full py-3.5 px-4 bg-white text-[#101A31] rounded-lg font-semibold hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#101A31] focus:ring-white disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2 font-mono"
          >
            {loading ? (
              'Setting up...'
            ) : (
              <>
                Start scanning
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Helper text */}
          <p className="text-center text-xs text-white/40 font-mono">
            You can add more details in Brand Settings later.
          </p>
        </form>

      </div>
    </div>
  )
}