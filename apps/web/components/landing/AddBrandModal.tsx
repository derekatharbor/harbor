// apps/web/components/landing/AddBrandModal.tsx
'use client'

import { useState } from 'react'
import { X, Loader2, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface AddBrandModalProps {
  isOpen: boolean
  onClose: () => void
  initialBrandName: string
}

export default function AddBrandModal({ isOpen, onClose, initialBrandName }: AddBrandModalProps) {
  const router = useRouter()
  const [domain, setDomain] = useState('')
  const [email, setEmail] = useState('')
  const [honeypot, setHoneypot] = useState('') // Bot trap
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState<'idle' | 'creating' | 'success'>('idle')

  // Helper to clean domain for display
  const cleanDomainForDisplay = (input: string) => {
    return input
      .toLowerCase()
      .replace(/^(https?:\/\/)?(www\.)?/, '')
      .split('/')[0]
      .trim()
  }

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Honeypot check - if filled, it's a bot
    if (honeypot) {
      // Pretend success but do nothing
      setStatus('success')
      setTimeout(() => onClose(), 2000)
      return
    }

    // Basic validation
    if (!domain.trim()) {
      setError('Please enter your domain')
      return
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email')
      return
    }

    setError('')
    setLoading(true)
    setStatus('creating')

    try {
      const res = await fetch('/api/brands/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: domain.trim(),
          email: email.trim(),
          brandName: initialBrandName,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create profile')
      }

      setStatus('success')
      
      // Redirect to the new profile
      setTimeout(() => {
        router.push(`/brands/${data.slug}`)
      }, 1000)

    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
      setStatus('idle')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-[#0C1422] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 md:p-8">
          {status === 'success' ? (
            // Success state
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Profile Created!</h3>
              <p className="text-white/60 text-sm">Redirecting to your brand page...</p>
            </div>
          ) : status === 'creating' ? (
            // Creating state
            <div className="text-center py-8">
              <Loader2 className="w-12 h-12 mx-auto mb-4 text-[#FF6B4A] animate-spin" />
              <h3 className="text-xl font-semibold text-white mb-2">Creating Your Profile</h3>
              <p className="text-white/60 text-sm">Analyzing {domain || 'your website'}...</p>
            </div>
          ) : (
            // Form state
            <>
              <h2 className="text-2xl font-bold text-white mb-2">
                Add {initialBrandName || 'Your Brand'}
              </h2>
              <p className="text-white/60 text-sm mb-6">
                We'll create your AI visibility profile in seconds.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Domain */}
                <div>
                  <label className="block text-sm text-white/70 mb-2">
                    Your website
                  </label>
                  <input
                    type="text"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="example.com"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors"
                    disabled={loading}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm text-white/70 mb-2">
                    Your work email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@yourcompany.com"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors"
                    disabled={loading}
                  />
                  {domain && (
                    <p className="mt-2 text-xs text-white/40">
                      Use your @{cleanDomainForDisplay(domain)} email to verify ownership
                    </p>
                  )}
                </div>

                {/* Honeypot - hidden from humans */}
                <input
                  type="text"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  className="absolute -left-[9999px] opacity-0"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                />

                {/* Error */}
                {error && (
                  <p className="text-red-400 text-sm">{error}</p>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-white text-[#101A31] font-semibold rounded-lg hover:bg-white/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Create Profile
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <p className="text-center text-white/40 text-xs mt-4">
                  We'll analyze your site and show you how AI sees your brand.
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}