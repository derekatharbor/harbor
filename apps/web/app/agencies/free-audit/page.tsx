// app/agencies/free-audit/page.tsx
// Entry point for free AI visibility audit - simple hero with URL input

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import StickyNav from '@/components/marketing/StickyNav'
import MainNav from '@/components/marketing/MainNav'

export default function FreeAuditPage() {
  const router = useRouter()
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    
    let cleanUrl = url.trim()
    
    // Add https:// if missing
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl
    }
    
    // Validate URL
    try {
      new URL(cleanUrl)
    } catch {
      setError('Please enter a valid website URL')
      return
    }
    
    setIsSubmitting(true)
    router.push(`/agencies/audit?url=${encodeURIComponent(cleanUrl)}`)
  }

  return (
    <div className="min-h-screen bg-[#F6F5F3]">
      <StickyNav />
      <MainNav isDark={false} />

      {/* Hero */}
      <section className="relative pt-20 sm:pt-32 pb-32 sm:pb-48">
        <div className="max-w-3xl mx-auto px-6 text-center">
          
          <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-bold text-black leading-[1.1] mb-6 font-source-sans">
            Free AI Visibility Audit
          </h1>
          
          <p className="text-lg text-[#6C6C6B] mb-10 max-w-xl mx-auto font-source-sans">
            See how any brand appears across ChatGPT, Claude, and Perplexity.
          </p>

          {/* URL Input Form */}
          <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter a domain (e.g. acme.com)"
                className="flex-1 px-5 py-4 rounded-xl bg-white border border-[#E0E0E0] text-black placeholder:text-[#A0A0A0] focus:outline-none focus:border-black text-base transition-colors font-source-sans"
                required
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-4 rounded-xl bg-black text-white font-semibold text-base hover:bg-black/80 transition-all flex items-center justify-center gap-2 disabled:opacity-50 font-source-sans whitespace-nowrap"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Run Audit
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
            {error && (
              <p className="text-red-500 text-sm mt-3 font-source-sans">{error}</p>
            )}
          </form>

          <p className="text-sm text-[#A0A0A0] mt-6 font-source-sans">
            No signup required
          </p>
        </div>
      </section>
    </div>
  )
}
