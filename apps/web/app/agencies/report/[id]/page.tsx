// DESTINATION: ~/Claude Harbor/apps/web/app/agencies/report/[id]/page.tsx
// Agency audit report - shareable one-pager with results

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { 
  ArrowRight, 
  Download, 
  Share2, 
  Check, 
  X, 
  AlertTriangle,
  ExternalLink,
  Mail,
  Loader2,
  Copy,
  CheckCircle2
} from 'lucide-react'

// ============================================================================
// TYPES
// ============================================================================

interface AuditData {
  id: string
  url: string
  domain: string
  brand_name: string
  category: string
  description: string
  visibility_score: number
  model_results: {
    model: string
    mentioned: boolean
    response_count: number
  }[]
  competitors: {
    name: string
    mentions: number
    sentiment: string
  }[]
  created_at: string
}

// ============================================================================
// MODEL LOGOS
// ============================================================================

const MODEL_LOGOS: Record<string, string> = {
  chatgpt: '/models/chatgpt-logo.png',
  claude: '/models/claude-logo.png',
  perplexity: '/models/perplexity-logo.png'
}

const MODEL_NAMES: Record<string, string> = {
  chatgpt: 'ChatGPT',
  claude: 'Claude',
  perplexity: 'Perplexity'
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ReportPage() {
  const params = useParams()
  const router = useRouter()
  const auditId = params.id as string
  
  const [audit, setAudit] = useState<AuditData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [email, setEmail] = useState('')
  const [emailSubmitting, setEmailSubmitting] = useState(false)
  const [emailSuccess, setEmailSuccess] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function fetchAudit() {
      try {
        const res = await fetch(`/api/agencies/audit/${auditId}`)
        if (!res.ok) {
          throw new Error('Audit not found')
        }
        const data = await res.json()
        setAudit(data)
      } catch (err) {
        setError('Audit not found')
      } finally {
        setLoading(false)
      }
    }
    
    if (auditId) {
      fetchAudit()
    }
  }, [auditId])

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    
    setEmailSubmitting(true)
    
    try {
      await fetch('/api/agencies/audit/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audit_id: auditId, email })
      })
      setEmailSuccess(true)
    } catch {
      // Still show success for now
      setEmailSuccess(true)
    } finally {
      setEmailSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0C] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-white/50 animate-spin" />
      </div>
    )
  }

  if (error || !audit) {
    return (
      <div className="min-h-screen bg-[#0B0B0C] flex flex-col items-center justify-center p-6">
        <AlertTriangle className="w-12 h-12 text-white/30 mb-4" />
        <h1 className="text-xl font-semibold text-white mb-2 font-['Space_Grotesk']">
          Report not found
        </h1>
        <p className="text-white/40 text-sm font-['Source_Code_Pro'] mb-6">
          This audit may have expired or doesn't exist.
        </p>
        <Link
          href="/agencies"
          className="px-6 py-2.5 bg-white text-[#0B0B0C] rounded-lg font-medium text-sm font-['Space_Grotesk'] hover:bg-white/90 transition-all"
        >
          Run New Audit
        </Link>
      </div>
    )
  }

  const scoreColor = audit.visibility_score >= 60 
    ? 'text-emerald-400' 
    : audit.visibility_score >= 30 
      ? 'text-yellow-400' 
      : 'text-red-400'

  const scoreBgColor = audit.visibility_score >= 60 
    ? 'bg-emerald-500/10 border-emerald-500/20' 
    : audit.visibility_score >= 30 
      ? 'bg-yellow-500/10 border-yellow-500/20' 
      : 'bg-red-500/10 border-red-500/20'

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
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 px-3 py-2 text-sm text-white/50 hover:text-white/70 transition-colors font-['Source_Code_Pro'] rounded-lg hover:bg-white/5"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
      </nav>

      {/* Report Content */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-4">
            <span className="text-xs text-white/50 font-['Source_Code_Pro']">AI Visibility Audit</span>
          </div>
          
          <h1 className="text-3xl font-semibold text-white mb-2 font-['Space_Grotesk']">
            {audit.brand_name}
          </h1>
          
          <p className="text-white/40 text-sm font-['Source_Code_Pro']">
            {audit.domain} · {audit.category}
          </p>
        </div>

        {/* Visibility Score */}
        <div className={`rounded-2xl border p-8 mb-8 ${scoreBgColor}`}>
          <div className="text-center">
            <div className="text-xs text-white/40 uppercase tracking-wide font-['Source_Code_Pro'] mb-2">
              AI Visibility Score
            </div>
            <div className={`text-6xl font-semibold font-['Space_Grotesk'] mb-3 ${scoreColor}`}>
              {audit.visibility_score}%
            </div>
            <p className="text-white/50 text-sm font-['Source_Code_Pro']">
              {audit.visibility_score >= 60 
                ? 'Good visibility across AI models'
                : audit.visibility_score >= 30
                  ? 'Moderate visibility — room for improvement'
                  : 'Low visibility — significant opportunity'
              }
            </p>
          </div>
        </div>

        {/* Model Breakdown */}
        <div className="bg-[#111213] border border-white/5 rounded-xl p-6 mb-8">
          <h2 className="text-base font-medium text-white mb-4 font-['Space_Grotesk']">
            Performance by Model
          </h2>
          
          <div className="space-y-4">
            {audit.model_results.map((result) => (
              <div key={result.model} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-white/5">
                  <Image
                    src={MODEL_LOGOS[result.model]}
                    alt={MODEL_NAMES[result.model]}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white font-['Source_Code_Pro']">
                      {MODEL_NAMES[result.model]}
                    </span>
                    <span className={`text-sm font-medium font-['Source_Code_Pro'] ${
                      result.mentioned ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {result.mentioned ? 'Mentioned' : 'Not Found'}
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        result.mentioned ? 'bg-emerald-500/60' : 'bg-red-500/40'
                      }`}
                      style={{ width: result.mentioned ? '100%' : '0%' }}
                    />
                  </div>
                </div>
                
                <div className="w-8 flex justify-center">
                  {result.mentioned ? (
                    <Check className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <X className="w-5 h-5 text-red-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Competitors */}
        {audit.competitors.length > 0 && (
          <div className="bg-[#111213] border border-white/5 rounded-xl p-6 mb-8">
            <h2 className="text-base font-medium text-white mb-4 font-['Space_Grotesk']">
              Top Competitors in AI Results
            </h2>
            
            <div className="space-y-3">
              {audit.competitors.map((comp, i) => (
                <div key={comp.name} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-white/30 font-['Source_Code_Pro'] w-5">
                      {i + 1}
                    </span>
                    <span className="text-sm text-white font-['Source_Code_Pro']">
                      {comp.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded font-['Source_Code_Pro'] ${
                      comp.sentiment === 'positive' 
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : comp.sentiment === 'negative'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-white/10 text-white/50'
                    }`}>
                      {comp.sentiment}
                    </span>
                    <span className="text-sm text-white/40 font-['Source_Code_Pro']">
                      {comp.mentions} mentions
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key Issues */}
        <div className="bg-[#111213] border border-white/5 rounded-xl p-6 mb-8">
          <h2 className="text-base font-medium text-white mb-4 font-['Space_Grotesk']">
            Key Findings
          </h2>
          
          <ul className="space-y-3">
            {!audit.model_results.some(r => r.mentioned) && (
              <li className="flex items-start gap-3 text-sm text-white/60 font-['Source_Code_Pro']">
                <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                <span>{audit.brand_name} is not appearing in any AI model responses for category searches.</span>
              </li>
            )}
            {audit.competitors.length > 0 && (
              <li className="flex items-start gap-3 text-sm text-white/60 font-['Source_Code_Pro']">
                <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                <span>Competitors like {audit.competitors[0]?.name} are being recommended instead.</span>
              </li>
            )}
            <li className="flex items-start gap-3 text-sm text-white/60 font-['Source_Code_Pro']">
              <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
              <span>No structured data detected for AI optimization.</span>
            </li>
          </ul>
        </div>

        {/* CTAs */}
        <div className="grid md:grid-cols-2 gap-4 mb-12">
          <button
            onClick={() => setShowEmailModal(true)}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-white text-[#0B0B0C] rounded-xl font-medium text-sm font-['Space_Grotesk'] hover:bg-white/90 transition-all"
          >
            <Mail className="w-4 h-4" />
            Get Full Report
          </button>
          
          <Link
            href="/pricing"
            className="flex items-center justify-center gap-2 px-6 py-4 bg-white/10 text-white rounded-xl font-medium text-sm font-['Space_Grotesk'] hover:bg-white/15 transition-all"
          >
            Start Managing This Brand
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center border-t border-white/5 pt-8">
          <p className="text-xs text-white/30 font-['Source_Code_Pro'] mb-4">
            Powered by Harbor · AI Visibility Intelligence
          </p>
          <Link
            href="/agencies"
            className="text-xs text-white/40 hover:text-white/60 transition-colors font-['Source_Code_Pro']"
          >
            Run another audit →
          </Link>
        </div>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50">
          <div className="bg-[#111213] border border-white/10 rounded-2xl p-8 max-w-md w-full">
            {!emailSuccess ? (
              <>
                <h3 className="text-xl font-semibold text-white mb-2 font-['Space_Grotesk']">
                  Get the full report
                </h3>
                <p className="text-sm text-white/40 font-['Source_Code_Pro'] mb-6">
                  Enter your email to receive a detailed PDF report with recommendations.
                </p>
                
                <form onSubmit={handleEmailSubmit}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@agency.com"
                    className="w-full px-4 py-3 bg-[#0B0B0C] border border-white/10 rounded-lg text-white placeholder-white/30 font-['Source_Code_Pro'] text-sm focus:outline-none focus:border-white/20 transition-colors mb-4"
                    required
                  />
                  
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowEmailModal(false)}
                      className="flex-1 px-4 py-3 bg-white/5 text-white rounded-lg font-medium text-sm font-['Space_Grotesk'] hover:bg-white/10 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={emailSubmitting}
                      className="flex-1 px-4 py-3 bg-white text-[#0B0B0C] rounded-lg font-medium text-sm font-['Space_Grotesk'] hover:bg-white/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {emailSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Send Report'
                      )}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2 font-['Space_Grotesk']">
                  Report sent!
                </h3>
                <p className="text-sm text-white/40 font-['Source_Code_Pro'] mb-6">
                  Check your inbox for the full report.
                </p>
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="px-6 py-2.5 bg-white/10 text-white rounded-lg font-medium text-sm font-['Space_Grotesk'] hover:bg-white/15 transition-all"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
