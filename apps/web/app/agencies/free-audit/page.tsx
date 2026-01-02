// app/agencies/free-audit/page.tsx
// Free AI Visibility Audit - Amplemarket-inspired structure

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, BarChart3, Users, FileText } from 'lucide-react'
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
    
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl
    }
    
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
    <div className="min-h-screen">
      <StickyNav />
      
      {/* Hero Section */}
      <section className="bg-[#F6F5F3]">
        <MainNav isDark={false} />

        <div className="max-w-4xl mx-auto px-6 pt-16 sm:pt-24 pb-20 sm:pb-32 text-center relative z-0">
          <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-bold text-black leading-[1.1] mb-6 font-source-sans">
            Free AI Visibility Audit
          </h1>
          
          <p className="text-lg sm:text-xl text-[#6C6C6B] mb-10 max-w-2xl mx-auto font-source-sans">
            See how any brand appears across ChatGPT, Claude, and Perplexity. Get a detailed report in under 60 seconds.
          </p>

          {/* URL Input Form */}
          <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center gap-3 p-2 bg-white rounded-xl border border-[#E0E0E0] shadow-sm">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter a domain (e.g. acme.com)"
                className="flex-1 w-full px-4 py-3 bg-transparent text-black placeholder:text-[#A0A0A0] focus:outline-none text-base font-source-sans"
                required
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-3 rounded-lg bg-black text-white font-semibold text-base hover:bg-black/80 transition-all flex items-center justify-center gap-2 disabled:opacity-50 font-source-sans whitespace-nowrap"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Run Audit
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
            {error && (
              <p className="text-red-500 text-sm mt-3 font-source-sans">{error}</p>
            )}
          </form>

          <p className="text-sm text-[#A0A0A0] mt-6 font-source-sans">
            No signup required. Results in under 60 seconds.
          </p>
        </div>
      </section>

      {/* What You Get Section */}
      <section className="bg-white py-20 sm:py-28">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-black mb-4 font-source-sans">
              What you get
            </h2>
            <p className="text-[#6C6C6B] text-lg max-w-xl mx-auto font-source-sans">
              A complete breakdown of how AI models see and describe any brand.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-xl border border-[#EFEEED] bg-white hover:border-[#D0D0D0] transition-colors">
              <div className="w-12 h-12 rounded-lg bg-[#F6F5F3] flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-lg font-semibold text-black mb-2 font-source-sans">Visibility Score</h3>
              <p className="text-[#6C6C6B] text-sm font-source-sans">
                How often the brand gets mentioned across ChatGPT, Claude, and Perplexity.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-[#EFEEED] bg-white hover:border-[#D0D0D0] transition-colors">
              <div className="w-12 h-12 rounded-lg bg-[#F6F5F3] flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-lg font-semibold text-black mb-2 font-source-sans">Competitor Analysis</h3>
              <p className="text-[#6C6C6B] text-sm font-source-sans">
                Which competitors AI recommends instead and their share of voice.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-[#EFEEED] bg-white hover:border-[#D0D0D0] transition-colors">
              <div className="w-12 h-12 rounded-lg bg-[#F6F5F3] flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                  <line x1="9" y1="9" x2="9.01" y2="9" />
                  <line x1="15" y1="9" x2="15.01" y2="9" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-black mb-2 font-source-sans">Sentiment Analysis</h3>
              <p className="text-[#6C6C6B] text-sm font-source-sans">
                Whether AI describes the brand positively, neutrally, or negatively.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-[#EFEEED] bg-white hover:border-[#D0D0D0] transition-colors">
              <div className="w-12 h-12 rounded-lg bg-[#F6F5F3] flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-lg font-semibold text-black mb-2 font-source-sans">PDF Report</h3>
              <p className="text-[#6C6C6B] text-sm font-source-sans">
                Download a shareable report to send to clients or stakeholders.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-[#111111] py-20 sm:py-28">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 font-source-sans">
              How it works
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-5xl font-bold text-white/10 mb-3 font-source-sans">01</div>
              <h3 className="text-lg font-semibold text-white mb-2 font-source-sans">Enter a domain</h3>
              <p className="text-white/50 text-sm font-source-sans">
                Type any website URL to analyze.
              </p>
            </div>

            <div className="text-center">
              <div className="text-5xl font-bold text-white/10 mb-3 font-source-sans">02</div>
              <h3 className="text-lg font-semibold text-white mb-2 font-source-sans">We scan AI models</h3>
              <p className="text-white/50 text-sm font-source-sans">
                Harbor queries ChatGPT, Claude, and Perplexity in real-time.
              </p>
            </div>

            <div className="text-center">
              <div className="text-5xl font-bold text-white/10 mb-3 font-source-sans">03</div>
              <h3 className="text-lg font-semibold text-white mb-2 font-source-sans">Get your report</h3>
              <p className="text-white/50 text-sm font-source-sans">
                View results instantly and download a PDF.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* For Agencies CTA */}
      <section className="bg-[#F6F5F3] py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-black mb-4 font-source-sans">
            Running audits for clients?
          </h2>
          <p className="text-[#6C6C6B] text-lg mb-8 max-w-xl mx-auto font-source-sans">
            Pitch Workspace lets agencies run unlimited audits, white-label reports, and manage multiple prospects in one place.
          </p>
          <Link
            href="/agencies"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-black text-white font-semibold text-base hover:bg-black/80 transition-all font-source-sans"
          >
            Learn about Pitch Workspace
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#111111] py-12 border-t border-[#222]">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image
              src="/images/Harbor_White_Logo.png"
              alt="Harbor"
              width={28}
              height={28}
              className="h-7 w-7"
            />
            <span className="text-white/60 text-sm font-source-sans">Harbor</span>
          </div>
          <p className="text-white/40 text-sm font-source-sans">
            © {new Date().getFullYear()} Harbor. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}