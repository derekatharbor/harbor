// DESTINATION: ~/Claude Harbor/apps/web/app/agencies/page.tsx
// Agency landing page - free audit tool for winning clients

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Zap, Target, TrendingUp, Users, CheckCircle2 } from 'lucide-react'

export default function AgenciesPage() {
  const router = useRouter()
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!url.trim()) {
      setError('Please enter a website URL')
      return
    }

    // Basic URL validation
    let cleanUrl = url.trim()
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl
    }

    try {
      new URL(cleanUrl)
    } catch {
      setError('Please enter a valid URL')
      return
    }

    setIsLoading(true)
    
    // Navigate to audit page with URL param
    router.push(`/agencies/audit?url=${encodeURIComponent(cleanUrl)}`)
  }

  return (
    <div className="min-h-screen bg-[#0B0B0C]">
      {/* Nav */}
      <nav className="p-6 flex items-center justify-between border-b border-white/5">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/Harbor_White_Logo.png"
            alt="Harbor"
            width={28}
            height={28}
            className="h-7 w-auto"
          />
          <span className="text-lg font-semibold text-white font-['Space_Grotesk']">Harbor</span>
        </Link>
        
        <div className="flex items-center gap-4">
          <Link 
            href="/pricing" 
            className="text-sm text-white/50 hover:text-white/70 transition-colors font-['Source_Code_Pro']"
          >
            Pricing
          </Link>
          <Link 
            href="/auth/login" 
            className="text-sm text-white/50 hover:text-white/70 transition-colors font-['Source_Code_Pro']"
          >
            Log in
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-4xl mx-auto px-6 pt-20 pb-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6">
            <Users className="w-3.5 h-3.5 text-white/50" />
            <span className="text-xs text-white/50 font-['Source_Code_Pro']">For Agencies</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-semibold text-white mb-4 font-['Space_Grotesk'] leading-tight">
            Win more clients with<br />AI visibility audits
          </h1>
          
          <p className="text-lg text-white/40 font-['Source_Code_Pro'] max-w-2xl mx-auto">
            Show prospects how they're losing in AI search. Generate a competitive audit in under 5 minutes. Close the deal.
          </p>
        </div>

        {/* URL Input */}
        <form onSubmit={handleSubmit} className="max-w-xl mx-auto mb-8">
          <div className="relative">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter your prospect's website"
              className="w-full px-5 py-4 bg-[#111213] border border-white/10 rounded-xl text-white placeholder-white/30 font-['Source_Code_Pro'] text-sm focus:outline-none focus:border-white/20 transition-colors pr-36"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2.5 bg-white text-[#0B0B0C] rounded-lg font-medium text-sm font-['Space_Grotesk'] hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#0B0B0C]/30 border-t-[#0B0B0C] rounded-full animate-spin" />
                  Analyzing
                </>
              ) : (
                <>
                  Run Audit
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
          {error && (
            <p className="text-red-400 text-xs mt-2 font-['Source_Code_Pro']">{error}</p>
          )}
        </form>

        <p className="text-center text-xs text-white/30 font-['Source_Code_Pro']">
          Free to use. No signup required.
        </p>
      </div>

      {/* How it Works */}
      <div className="border-t border-white/5 py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-semibold text-white mb-12 text-center font-['Space_Grotesk']">
            How it works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                <Target className="w-5 h-5 text-white/50" />
              </div>
              <div className="text-xs text-white/30 font-['Source_Code_Pro'] mb-2">Step 1</div>
              <h3 className="text-base font-medium text-white mb-2 font-['Space_Grotesk']">Enter prospect's URL</h3>
              <p className="text-sm text-white/40 font-['Source_Code_Pro']">
                Paste the website of a brand you're pitching or want to upsell.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-5 h-5 text-white/50" />
              </div>
              <div className="text-xs text-white/30 font-['Source_Code_Pro'] mb-2">Step 2</div>
              <h3 className="text-base font-medium text-white mb-2 font-['Space_Grotesk']">We scan AI models</h3>
              <p className="text-sm text-white/40 font-['Source_Code_Pro']">
                Harbor queries ChatGPT, Claude, and Perplexity to measure visibility.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-5 h-5 text-white/50" />
              </div>
              <div className="text-xs text-white/30 font-['Source_Code_Pro'] mb-2">Step 3</div>
              <h3 className="text-base font-medium text-white mb-2 font-['Space_Grotesk']">Show them the gap</h3>
              <p className="text-sm text-white/40 font-['Source_Code_Pro']">
                Get a shareable report comparing them to competitors. Win the deal.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Value Props */}
      <div className="border-t border-white/5 py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#111213] border border-white/5 rounded-xl p-6">
              <h3 className="text-base font-medium text-white mb-3 font-['Space_Grotesk']">
                For pitching new clients
              </h3>
              <ul className="space-y-2">
                {[
                  'Show prospects their AI visibility gap',
                  'Compare them to competitors they care about',
                  'Demonstrate the problem before selling the solution',
                  'Stand out from agencies that only talk SEO'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/50 font-['Source_Code_Pro']">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500/70 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-[#111213] border border-white/5 rounded-xl p-6">
              <h3 className="text-base font-medium text-white mb-3 font-['Space_Grotesk']">
                For upselling current clients
              </h3>
              <ul className="space-y-2">
                {[
                  'Add AEO as a new service line',
                  'Bill AI Search Monitoring as a line item',
                  'Show clients what competitors are doing',
                  'Create recurring revenue from visibility tracking'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/50 font-['Source_Code_Pro']">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500/70 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="border-t border-white/5 py-20">
        <div className="max-w-xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-semibold text-white mb-4 font-['Space_Grotesk']">
            Ready to close more deals?
          </h2>
          <p className="text-sm text-white/40 font-['Source_Code_Pro'] mb-8">
            Run your first audit free. No signup required.
          </p>
          <button
            onClick={() => document.querySelector('input')?.focus()}
            className="px-8 py-3 bg-white text-[#0B0B0C] rounded-lg font-medium text-sm font-['Space_Grotesk'] hover:bg-white/90 transition-all inline-flex items-center gap-2"
          >
            Start Free Audit
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-between">
          <p className="text-xs text-white/30 font-['Source_Code_Pro']">
            © 2024 Harbor
          </p>
          <div className="flex items-center gap-4">
            <Link href="/pricing" className="text-xs text-white/30 hover:text-white/50 transition-colors font-['Source_Code_Pro']">
              Pricing
            </Link>
            <Link href="/privacy" className="text-xs text-white/30 hover:text-white/50 transition-colors font-['Source_Code_Pro']">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
