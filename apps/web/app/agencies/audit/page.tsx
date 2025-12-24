// DESTINATION: ~/Claude Harbor/apps/web/app/agencies/audit/page.tsx
// Audit analyzing page - orbital animation while scanning AI models

'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Loader2, Check, AlertCircle } from 'lucide-react'

// ============================================================================
// MODEL CONFIG
// ============================================================================

const MODELS = [
  { 
    id: 'chatgpt', 
    name: 'ChatGPT', 
    logo: '/models/chatgpt-logo.png',
    angle: 270
  },
  { 
    id: 'claude', 
    name: 'Claude', 
    logo: '/models/claude-logo.png',
    angle: 30
  },
  { 
    id: 'perplexity', 
    name: 'Perplexity', 
    logo: '/models/perplexity-logo.png',
    angle: 150
  }
]

// ============================================================================
// AUDIT CONTENT
// ============================================================================

function AuditContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const url = searchParams.get('url') || ''
  
  const [phase, setPhase] = useState<'init' | 'fetching' | 'analyzing' | 'scanning' | 'calculating' | 'complete' | 'error'>('init')
  const [brandName, setBrandName] = useState('')
  const [domain, setDomain] = useState('')
  const [step, setStep] = useState('')
  const [logo, setLogo] = useState<string | null>(null)
  const [modelStatus, setModelStatus] = useState<Record<string, 'pending' | 'running' | 'complete'>>({
    chatgpt: 'pending',
    claude: 'pending',
    perplexity: 'pending'
  })
  const [rotation, setRotation] = useState(0)
  const [error, setError] = useState('')
  const [auditId, setAuditId] = useState<string | null>(null)

  // Extract domain from URL
  useEffect(() => {
    if (!url) {
      router.push('/agencies')
      return
    }
    
    try {
      const parsed = new URL(url)
      setDomain(parsed.hostname.replace('www.', ''))
      setBrandName(parsed.hostname.replace('www.', '').split('.')[0])
    } catch {
      setError('Invalid URL')
      setPhase('error')
    }
  }, [url, router])

  // Rotation animation
  useEffect(() => {
    if (phase === 'complete' || phase === 'error') return
    
    const interval = setInterval(() => {
      setRotation(prev => (prev + 0.3) % 360)
    }, 50)
    return () => clearInterval(interval)
  }, [phase])

  // Run the audit
  useEffect(() => {
    if (!domain || phase !== 'init') return
    
    async function runAudit() {
      setPhase('fetching')
      
      try {
        // Call the audit API
        const res = await fetch('/api/agencies/audit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url, domain })
        })
        
        if (!res.ok) {
          throw new Error('Audit failed')
        }
        
        // Stream progress updates
        const reader = res.body?.getReader()
        const decoder = new TextDecoder()
        
        if (!reader) {
          throw new Error('No response stream')
        }
        
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          const text = decoder.decode(value)
          const lines = text.split('\n').filter(line => line.startsWith('data: '))
          
          for (const line of lines) {
            try {
              const data = JSON.parse(line.replace('data: ', ''))
              
              if (data.phase) {
                setPhase(data.phase)
              }
              
              if (data.step) {
                setStep(data.step)
              }
              
              if (data.brand_name) {
                setBrandName(data.brand_name)
              }
              
              if (data.logo) {
                setLogo(data.logo)
              }
              
              if (data.model_status) {
                setModelStatus(data.model_status)
              }
              
              if (data.audit_id) {
                setAuditId(data.audit_id)
              }
              
              if (data.error) {
                setError(data.error)
                setPhase('error')
              }
            } catch {
              // Skip malformed lines
            }
          }
        }
        
      } catch (err) {
        console.error('Audit error:', err)
        setError('Failed to complete audit. Please try again.')
        setPhase('error')
      }
    }
    
    runAudit()
  }, [domain, url, phase])

  // Redirect to results when complete
  useEffect(() => {
    if (phase === 'complete' && auditId) {
      setTimeout(() => {
        router.push(`/agencies/report/${auditId}`)
      }, 1500)
    }
  }, [phase, auditId, router])

  // Calculate position on orbit
  const getOrbitPosition = (baseAngle: number, orbitRadius: number) => {
    const angle = ((baseAngle + rotation) * Math.PI) / 180
    return {
      x: Math.cos(angle) * orbitRadius,
      y: Math.sin(angle) * orbitRadius
    }
  }

  const isComplete = phase === 'complete'
  const isError = phase === 'error'
  const completedModels = Object.values(modelStatus).filter(s => s === 'complete').length

  return (
    <div className="min-h-screen bg-[#0B0B0C] flex flex-col">
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
      </nav>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        
        {/* Orbit visualization */}
        <div className="relative w-80 h-80 mb-8">
          {/* Orbit rings */}
          <div className="absolute inset-6 rounded-full border border-white/[0.03]" />
          <div className="absolute inset-12 rounded-full border border-white/[0.05]" />
          
          {/* Center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 ${
              isComplete ? 'bg-emerald-500/10 border border-emerald-500/30' :
              isError ? 'bg-red-500/10 border border-red-500/30' :
              'bg-white/5'
            }`}>
              {isComplete ? (
                <Check className="w-8 h-8 text-emerald-400" />
              ) : isError ? (
                <AlertCircle className="w-8 h-8 text-red-400" />
              ) : (
                <Loader2 className="w-8 h-8 text-white/30 animate-spin" />
              )}
            </div>
          </div>

          {/* Orbiting model logos */}
          {MODELS.map((model) => {
            const status = modelStatus[model.id]
            const pos = getOrbitPosition(model.angle, 110)
            const isRunning = status === 'running'
            const isDone = status === 'complete'
            
            return (
              <div
                key={model.id}
                className="absolute left-1/2 top-1/2 transition-all duration-75"
                style={{
                  transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`
                }}
              >
                {/* Logo container */}
                <div className={`
                  relative w-12 h-12 rounded-xl overflow-hidden
                  transition-all duration-300
                  ${isRunning ? 'ring-2 ring-white/30 ring-offset-2 ring-offset-[#0B0B0C]' : ''}
                  ${isDone ? 'ring-2 ring-emerald-500/50 ring-offset-2 ring-offset-[#0B0B0C]' : ''}
                  ${!isDone && !isRunning ? 'ring-1 ring-white/10' : ''}
                `}>
                  <Image
                    src={model.logo}
                    alt={model.name}
                    width={48}
                    height={48}
                    className={`w-full h-full object-cover transition-opacity ${
                      isDone || isRunning ? 'opacity-100' : 'opacity-50'
                    }`}
                  />
                </div>
                
                {/* Status indicator */}
                {isDone && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                )}
                
                {/* Running indicator */}
                {isRunning && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Status text */}
        <div className="text-center mb-6">
          {phase === 'init' ? (
            <>
              <h2 className="text-xl font-semibold text-white mb-2 font-['Space_Grotesk']">
                Starting audit...
              </h2>
            </>
          ) : phase === 'fetching' ? (
            <>
              <h2 className="text-xl font-semibold text-white mb-2 font-['Space_Grotesk']">
                Analyzing {brandName || domain}
              </h2>
              <p className="text-white/40 text-sm font-['Source_Code_Pro']">
                {step || 'Fetching brand assets...'}
              </p>
            </>
          ) : phase === 'analyzing' ? (
            <>
              <h2 className="text-xl font-semibold text-white mb-2 font-['Space_Grotesk']">
                Analyzing {brandName || domain}
              </h2>
              <p className="text-white/40 text-sm font-['Source_Code_Pro']">
                {step || 'Detecting category...'}
              </p>
            </>
          ) : phase === 'scanning' ? (
            <>
              <h2 className="text-xl font-semibold text-white mb-2 font-['Space_Grotesk']">
                Scanning AI models
              </h2>
              <p className="text-white/40 text-sm font-['Source_Code_Pro']">
                Checking {brandName || domain} across ChatGPT, Claude, and Perplexity
              </p>
            </>
          ) : phase === 'calculating' ? (
            <>
              <h2 className="text-xl font-semibold text-white mb-2 font-['Space_Grotesk']">
                Building your report
              </h2>
              <p className="text-white/40 text-sm font-['Source_Code_Pro']">
                {step || 'Calculating final metrics...'}
              </p>
            </>
          ) : isComplete ? (
            <>
              <h2 className="text-xl font-semibold text-white mb-2 font-['Space_Grotesk']">
                Audit complete
              </h2>
              <p className="text-white/50 text-sm font-['Source_Code_Pro']">
                Preparing your report...
              </p>
            </>
          ) : isError ? (
            <>
              <h2 className="text-xl font-semibold text-white mb-2 font-['Space_Grotesk']">
                Audit failed
              </h2>
              <p className="text-red-400/70 text-sm font-['Source_Code_Pro'] max-w-md">
                {error}
              </p>
            </>
          ) : null}
        </div>

        {/* Progress bar */}
        {!isError && (
          <div className="w-64 mb-8">
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ease-out ${
                  isComplete ? 'bg-emerald-500/60' : 'bg-white/40'
                }`}
                style={{ 
                  width: `${
                    phase === 'init' ? 5 :
                    phase === 'fetching' ? 15 :
                    phase === 'analyzing' ? 25 :
                    phase === 'scanning' ? 25 + (completedModels / 3) * 50 :
                    phase === 'calculating' ? 90 :
                    100
                  }%` 
                }}
              />
            </div>
            {!isComplete && (
              <p className="text-center text-xs text-white/30 mt-2 font-['Source_Code_Pro']">
                {phase === 'scanning' ? `${completedModels} of 3 models complete` : ''}
              </p>
            )}
          </div>
        )}

        {/* Error retry button */}
        {isError && (
          <button
            onClick={() => router.push('/agencies')}
            className="px-6 py-2.5 bg-white/10 text-white rounded-lg font-medium text-sm font-['Space_Grotesk'] hover:bg-white/15 transition-all"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// EXPORT WITH SUSPENSE
// ============================================================================

export default function AuditPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0B0B0C] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-white/50 animate-spin" />
      </div>
    }>
      <AuditContent />
    </Suspense>
  )
}