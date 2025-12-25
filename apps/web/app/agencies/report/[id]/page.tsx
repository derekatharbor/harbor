// DESTINATION: ~/Claude Harbor/apps/web/app/agencies/report/[id]/page.tsx
// The "Golden Ticket" - Comprehensive agency audit report

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { 
  ArrowRight, 
  Share2, 
  Check, 
  X, 
  AlertTriangle,
  AlertCircle,
  Mail,
  Loader2,
  Copy,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Minus,
  Code,
  Globe,
  Download
} from 'lucide-react'

// ============================================================================
// TYPES
// ============================================================================

interface ModelResult {
  model: string
  mentioned: boolean
  share_of_voice: number
  position: number | null
  sentiment: 'positive' | 'neutral' | 'negative'
}

interface Competitor {
  name: string
  count: number
  avgPosition: number
  sentiment: string
}

interface Hallucination {
  claim: string
  model: string
  severity: 'high' | 'medium' | 'low'
  category: string
}

interface SchemaHealth {
  hasSchema: boolean
  schemaTypes: string[]
  issues: string[]
}

interface AuditData {
  id: string
  url: string
  domain: string
  brand_name: string
  category: string
  logo_url: string | null
  visibility_score: number
  share_of_voice: number
  model_results: ModelResult[]
  competitors: Competitor[]
  hallucinations: Hallucination[]
  schema_health: SchemaHealth
  created_at: string
}

// ============================================================================
// MODEL CONFIG
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
// COMPONENTS
// ============================================================================

function ScoreRing({ score, size = 120, color, label }: { score: number; size?: number; color?: string; label?: string }) {
  const radius = (size - 12) / 2
  const circumference = 2 * Math.PI * radius
  const progress = (score / 100) * circumference
  
  const ringColor = color || (score >= 60 ? '#34D399' : score >= 30 ? '#FBBF24' : '#F87171')
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="8"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-3xl font-semibold text-white font-['Space_Grotesk']">{label || `${score}%`}</span>
      </div>
    </div>
  )
}

function SeverityBadge({ severity }: { severity: string }) {
  const colors = {
    high: 'bg-red-500/20 text-red-400 border-red-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    low: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  }
  
  return (
    <span className={`text-xs px-2 py-0.5 rounded border font-['Source_Code_Pro'] ${colors[severity as keyof typeof colors] || colors.low}`}>
      {severity.toUpperCase()}
    </span>
  )
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
        if (!res.ok) throw new Error('Audit not found')
        const data = await res.json()
        setAudit(data)
      } catch (err) {
        setError('Audit not found')
      } finally {
        setLoading(false)
      }
    }
    
    if (auditId) fetchAudit()
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
        <h1 className="text-xl font-semibold text-white mb-2 font-['Space_Grotesk']">Report not found</h1>
        <p className="text-white/40 text-sm font-['Source_Code_Pro'] mb-6">This audit may have expired or doesn't exist.</p>
        <Link href="/agencies" className="px-6 py-2.5 bg-white text-[#0B0B0C] rounded-lg font-medium text-sm font-['Space_Grotesk']">
          Run New Audit
        </Link>
      </div>
    )
  }

  // Calculate competitor share comparison
  const totalMentions = audit.competitors.reduce((sum, c) => sum + c.count, 0) + (audit.visibility_score > 0 ? 3 : 0)
  const brandShare = totalMentions > 0 ? Math.round(((audit.visibility_score > 0 ? 3 : 0) / totalMentions) * 100) : 0
  const topCompetitorShare = audit.competitors[0] 
    ? Math.round((audit.competitors[0].count / totalMentions) * 100)
    : 0

  return (
    <div className="min-h-screen bg-[#0B0B0C]">
      {/* Nav */}
      <nav className="p-6 flex items-center justify-between border-b border-white/5">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/images/Harbor_White_Logo.png" alt="Harbor" width={28} height={28} className="h-7 w-auto" />
          <span className="text-lg font-semibold text-white font-['Space_Grotesk']">Harbor</span>
        </Link>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 px-3 py-2 text-sm text-white/50 hover:text-white/70 transition-colors font-['Source_Code_Pro'] rounded-lg hover:bg-white/5"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Share'}
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        
        {/* ============ HERO SECTION ============ */}
        <div className="flex items-start gap-6 mb-12">
          {/* Logo */}
          <div className="w-20 h-20 rounded-2xl bg-[#111213] border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
            {audit.logo_url ? (
              <Image src={audit.logo_url} alt={audit.brand_name} width={80} height={80} className="w-full h-full object-contain p-2" />
            ) : (
              <span className="text-3xl font-semibold text-white/30 font-['Space_Grotesk']">
                {audit.brand_name.charAt(0)}
              </span>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/50 font-['Source_Code_Pro']">
                AI Visibility Audit
              </span>
            </div>
            <h1 className="text-3xl font-semibold text-white font-['Space_Grotesk'] mb-1">
              {audit.brand_name}
            </h1>
            <p className="text-white/40 text-sm font-['Source_Code_Pro']">
              {audit.domain} · {audit.category}
            </p>
          </div>
        </div>

        {/* ============ EGO GAP SUMMARY ============ */}
        <div className="bg-[#111213] border border-white/5 rounded-2xl p-8 mb-6">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Share of Voice */}
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <ScoreRing score={audit.share_of_voice} />
              </div>
              <div className="text-xs text-white/40 uppercase tracking-wide font-['Source_Code_Pro'] mb-1">
                Share of Answer
              </div>
              <p className="text-sm text-white/60 font-['Source_Code_Pro']">
                {audit.share_of_voice > 0 
                  ? `You appear in ${audit.share_of_voice}% of recommendations`
                  : 'Not appearing in category recommendations'
                }
              </p>
            </div>
            
            {/* Position Score */}
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <ScoreRing score={audit.visibility_score} />
              </div>
              <div className="text-xs text-white/40 uppercase tracking-wide font-['Source_Code_Pro'] mb-1">
                AI Visibility
              </div>
              <p className="text-sm text-white/60 font-['Source_Code_Pro']">
                Mentioned by {audit.model_results.filter(r => r.mentioned).length} of 3 models
              </p>
            </div>
            
            {/* Competitor Gap */}
            <div className="text-center">
              {audit.competitors[0] ? (
                <>
                  <div className="flex justify-center mb-3">
                    <ScoreRing 
                      score={Math.min(100, Math.max(0, 100 - (topCompetitorShare - brandShare)))} 
                      color={topCompetitorShare > brandShare ? '#F87171' : '#34D399'}
                      label={`${topCompetitorShare - brandShare > 0 ? '+' : ''}${topCompetitorShare - brandShare}%`}
                    />
                  </div>
                  <div className="text-xs text-white/40 uppercase tracking-wide font-['Source_Code_Pro'] mb-1">
                    Competitor Gap
                  </div>
                  <p className="text-sm text-white/60 font-['Source_Code_Pro']">
                    {topCompetitorShare > brandShare 
                      ? `${audit.competitors[0].name} leads by ${topCompetitorShare - brandShare}pts`
                      : `You lead by ${brandShare - topCompetitorShare}pts`
                    }
                  </p>
                </>
              ) : (
                <>
                  <div className="flex justify-center mb-3">
                    <ScoreRing score={100} color="#34D399" />
                  </div>
                  <div className="text-xs text-white/40 uppercase tracking-wide font-['Source_Code_Pro'] mb-1">
                    Competitor Gap
                  </div>
                  <p className="text-sm text-white/60 font-['Source_Code_Pro']">No competitors detected</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ============ COMPETITIVE ANALYSIS ============ */}
        {audit.competitors.length > 0 && (
          <div className="bg-[#111213] border border-white/5 rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4 font-['Space_Grotesk']">
              Who's Winning in AI Results
            </h2>
            
            <div className="space-y-4">
              {/* Your brand */}
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                  {audit.logo_url ? (
                    <Image src={audit.logo_url} alt="" width={20} height={20} className="w-5 h-5 object-contain" />
                  ) : (
                    <span className="text-xs font-medium text-emerald-400">{audit.brand_name.charAt(0)}</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white font-medium font-['Source_Code_Pro']">{audit.brand_name}</span>
                    <span className="text-sm text-emerald-400 font-['Source_Code_Pro']">{brandShare}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${brandShare}%` }} />
                  </div>
                </div>
              </div>
              
              {/* Competitors */}
              {audit.competitors.map((comp, i) => {
                const share = Math.round((comp.count / totalMentions) * 100)
                return (
                  <div key={comp.name} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium text-white/50">{i + 1}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-white/70 font-['Source_Code_Pro']">{comp.name}</span>
                        <span className="text-sm text-white/50 font-['Source_Code_Pro']">{share}%</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-white/30 rounded-full transition-all duration-500" style={{ width: `${share}%` }} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ============ MODEL BREAKDOWN ============ */}
        <div className="bg-[#111213] border border-white/5 rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4 font-['Space_Grotesk']">
            Performance by Model
          </h2>
          
          <div className="grid md:grid-cols-3 gap-4">
            {audit.model_results.map((result) => (
              <div 
                key={result.model} 
                className={`p-4 rounded-xl border ${
                  result.mentioned 
                    ? 'bg-emerald-500/5 border-emerald-500/20' 
                    : 'bg-red-500/5 border-red-500/20'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/5">
                    <Image
                      src={MODEL_LOGOS[result.model]}
                      alt={MODEL_NAMES[result.model]}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white font-['Source_Code_Pro']">
                      {MODEL_NAMES[result.model]}
                    </div>
                    <div className={`text-xs font-['Source_Code_Pro'] ${result.mentioned ? 'text-emerald-400' : 'text-red-400'}`}>
                      {result.mentioned ? 'Mentioned' : 'Not Found'}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 text-xs font-['Source_Code_Pro']">
                  <div className="flex justify-between">
                    <span className="text-white/40">Position</span>
                    <span className="text-white/70">{result.position ? `#${result.position}` : '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Sentiment</span>
                    <span className={`capitalize ${
                      result.sentiment === 'positive' ? 'text-emerald-400' :
                      result.sentiment === 'negative' ? 'text-red-400' : 'text-white/70'
                    }`}>
                      {result.sentiment}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ============ HALLUCINATION ALERTS ============ */}
        {audit.hallucinations.length > 0 && (
          <div className="bg-[#111213] border border-red-500/20 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <h2 className="text-lg font-semibold text-white font-['Space_Grotesk']">
                Potential Hallucinations Detected
              </h2>
            </div>
            
            <p className="text-sm text-white/50 font-['Source_Code_Pro'] mb-4">
              AI models made the following claims that should be verified for accuracy:
            </p>
            
            <div className="space-y-3">
              {audit.hallucinations.map((h, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-red-500/5 rounded-lg border border-red-500/10">
                  <SeverityBadge severity={h.severity} />
                  <div className="flex-1">
                    <p className="text-sm text-white/80 font-['Source_Code_Pro'] mb-1">"{h.claim}"</p>
                    <p className="text-xs text-white/40 font-['Source_Code_Pro']">
                      {MODEL_NAMES[h.model]} · {h.category}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============ TECHNICAL AUDIT ============ */}
        <div className="bg-[#111213] border border-white/5 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Code className="w-5 h-5 text-white/50" />
            <h2 className="text-lg font-semibold text-white font-['Space_Grotesk']">
              Technical AI Health
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            {/* Schema Status */}
            <div className={`p-4 rounded-xl border ${
              audit.schema_health.hasSchema 
                ? 'bg-emerald-500/5 border-emerald-500/20' 
                : 'bg-red-500/5 border-red-500/20'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {audit.schema_health.hasSchema ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <X className="w-4 h-4 text-red-400" />
                )}
                <span className="text-sm font-medium text-white font-['Source_Code_Pro']">
                  Structured Data
                </span>
              </div>
              
              {audit.schema_health.hasSchema ? (
                <p className="text-xs text-white/50 font-['Source_Code_Pro']">
                  Found: {audit.schema_health.schemaTypes.join(', ')}
                </p>
              ) : (
                <p className="text-xs text-red-400/70 font-['Source_Code_Pro']">
                  No JSON-LD detected — AI models can't read your site properly
                </p>
              )}
            </div>
            
            {/* Issues */}
            <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02]">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium text-white font-['Source_Code_Pro']">
                  Issues Found
                </span>
              </div>
              
              {audit.schema_health.issues.length > 0 ? (
                <ul className="space-y-1">
                  {audit.schema_health.issues.slice(0, 3).map((issue, i) => (
                    <li key={i} className="text-xs text-white/50 font-['Source_Code_Pro']">
                      • {issue}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-white/50 font-['Source_Code_Pro']">
                  No critical issues detected
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ============ AGENCY VALUE PROP ============ */}
        <div className="bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/10 rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-white mb-1 font-['Space_Grotesk']">
                Won the deal? Deliver with Harbor.
              </h3>
              <p className="text-sm text-white/50 font-['Source_Code_Pro'] mb-4">
                Use this audit to close the client. Then use Harbor to actually fix their AI visibility — and bill it as a service.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2 text-xs text-white/60 font-['Source_Code_Pro']">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Full visibility dashboard per client</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/60 font-['Source_Code_Pro']">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>White-label monthly reports</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/60 font-['Source_Code_Pro']">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Hallucination alerts & fixes</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/60 font-['Source_Code_Pro']">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Competitor monitoring</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-xs text-white/30 font-['Source_Code_Pro']">Starting at</span>
                <span className="text-lg font-semibold text-white font-['Space_Grotesk']">$99<span className="text-sm font-normal text-white/40">/brand/mo</span></span>
                <span className="text-xs text-white/30 font-['Source_Code_Pro']">· Bill your client $500+</span>
              </div>
            </div>
          </div>
        </div>

        {/* ============ CTAs ============ */}
        <div className="grid md:grid-cols-2 gap-4 mb-12">
          <button
            onClick={() => setShowEmailModal(true)}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-white text-[#0B0B0C] rounded-xl font-medium text-sm font-['Space_Grotesk'] hover:bg-white/90 transition-all"
          >
            <Mail className="w-4 h-4" />
            Get PDF for Pitch Deck
          </button>
          
          <Link
            href="/agencies/signup"
            className="flex items-center justify-center gap-2 px-6 py-4 bg-emerald-500 text-white rounded-xl font-medium text-sm font-['Space_Grotesk'] hover:bg-emerald-500/90 transition-all"
          >
            Create Agency Account
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center border-t border-white/5 pt-8">
          <p className="text-xs text-white/30 font-['Source_Code_Pro'] mb-4">
            Powered by Harbor · AI Visibility Intelligence
          </p>
          <Link href="/agencies" className="text-xs text-white/40 hover:text-white/60 transition-colors font-['Source_Code_Pro']">
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
                  Get your pitch-ready PDF
                </h3>
                <p className="text-sm text-white/40 font-['Source_Code_Pro'] mb-6">
                  Enter your email to download a white-label PDF you can add to your pitch deck.
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
                      {emailSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Report'}
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
                  Your PDF is ready
                </h3>
                <p className="text-sm text-white/40 font-['Source_Code_Pro'] mb-6">
                  Download your white-label audit report below.
                </p>
                <div className="flex flex-col gap-3">
                  <a
                    href={`/api/agencies/audit/${auditId}/pdf`}
                    download
                    className="px-6 py-3 bg-white text-[#0B0B0C] rounded-lg font-medium text-sm font-['Space_Grotesk'] hover:bg-white/90 transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </a>
                  <button
                    onClick={() => setShowEmailModal(false)}
                    className="px-6 py-2.5 text-white/50 hover:text-white/70 text-sm font-['Source_Code_Pro'] transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}