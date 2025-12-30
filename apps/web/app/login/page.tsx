// app/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

// AI Model logos for marquee
const AI_MODELS = [
  { name: 'ChatGPT', logo: 'https://cdn.brandfetch.io/openai.com?c=1id1Fyz-h7an5-5KR_y' },
  { name: 'Claude', logo: 'https://cdn.brandfetch.io/anthropic.com?c=1id1Fyz-h7an5-5KR_y' },
  { name: 'Gemini', logo: 'https://cdn.brandfetch.io/google.com?c=1id1Fyz-h7an5-5KR_y' },
  { name: 'Perplexity', logo: 'https://cdn.brandfetch.io/perplexity.ai?c=1id1Fyz-h7an5-5KR_y' },
]

const PROMPT_ROWS = [
  [
    { model: 0, text: 'How does HubSpot usability differ on desktop versus mobile?' },
    { model: 1, text: 'How easy is it to set up a CRM for the first time?' },
    { model: 3, text: 'What training or tutorials are included with Attio?' },
    { model: 2, text: 'How do CRMs handle multi-currency transactions?' },
    { model: 0, text: 'What reporting dashboards come built-in?' },
    { model: 1, text: 'Which CRM has the best mobile app experience?' },
  ],
  [
    { model: 2, text: 'Best CRM for sales pipeline tracking?' },
    { model: 0, text: 'What core features should a CRM include?' },
    { model: 1, text: 'How do CRMs handle customer service or support workflows?' },
    { model: 3, text: 'What integrations are available with popular tools?' },
    { model: 2, text: 'Which CRM offers the best automation features?' },
    { model: 0, text: 'How does Salesforce compare to HubSpot?' },
  ],
  [
    { model: 3, text: 'Do CRMs provide API access for custom integrations?' },
    { model: 1, text: 'How easy is CRM data migration from another system?' },
    { model: 0, text: 'What security certifications do CRMs typically have?' },
    { model: 2, text: 'How do CRMs handle GDPR compliance?' },
    { model: 3, text: 'What is the best CRM for startups?' },
    { model: 1, text: 'Which CRM has the best lead scoring?' },
  ],
]

function PromptPill({ model, text }: { model: number; text: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-white/[0.03] backdrop-blur-sm rounded-full border border-white/[0.08] whitespace-nowrap">
      <div className="w-6 h-6 rounded-md flex-shrink-0 overflow-hidden">
        <img
          src={AI_MODELS[model].logo}
          alt={AI_MODELS[model].name}
          className="w-full h-full object-cover"
        />
      </div>
      <span className="text-white/70 text-sm">{text}</span>
    </div>
  )
}

function MarqueeRow({ prompts, direction = 'left', speed = 30 }: { 
  prompts: typeof PROMPT_ROWS[0]
  direction?: 'left' | 'right'
  speed?: number 
}) {
  const doubledPrompts = [...prompts, ...prompts]
  
  return (
    <div className="relative overflow-hidden py-2">
      <div 
        className={`flex gap-4 ${direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right'}`}
        style={{ animationDuration: `${speed}s` }}
      >
        {doubledPrompts.map((prompt, idx) => (
          <PromptPill key={idx} model={prompt.model} text={prompt.text} />
        ))}
      </div>
    </div>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next')
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const supabase = createClientComponentClient()
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (authError) throw authError
      router.push(next || '/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Desktop Layout - White */}
      <div className="hidden lg:flex min-h-screen bg-white">
        {/* Left side - Form */}
        <div className="w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Logo */}
            <div className="mb-8">
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/images/harbor-dark-solo.svg"
                  alt="Harbor"
                  width={32}
                  height={32}
                  className="h-8 w-auto"
                />
                <span className="text-xl font-semibold text-black font-space">Harbor</span>
              </Link>
            </div>

            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-black mb-2 font-source-sans">Welcome back</h1>
              <p className="text-black/60 font-source-code">Sign in to your account to continue</p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-1.5 font-source-sans">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full px-4 py-3 bg-black/5 border border-black/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/20 text-black placeholder-black/30 font-source-code"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-black font-source-sans">
                    Password
                  </label>
                  <Link 
                    href="/forgot-password" 
                    className="text-sm text-black/40 hover:text-black transition-colors font-source-code"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-black/5 border border-black/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/20 text-black placeholder-black/30 pr-10 font-source-code"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-sm text-red-600 font-source-code">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-black text-white rounded-lg font-medium hover:bg-black/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 font-source-sans"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>

            {/* Sign up link */}
            <p className="text-center text-sm text-black/40 mt-6 font-source-code">
              Don't have an account?{' '}
              <Link href="/signup" className="text-black font-medium hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Right side - Image with padding and text overlay */}
        <div className="w-1/2 p-4">
          <div className="relative w-full h-full rounded-2xl overflow-hidden">
            <Image
              src="/images/auth-side-image.png"
              alt=""
              fill
              className="object-cover"
              priority
            />
            {/* Text overlay at bottom */}
            <div className="absolute bottom-8 left-8 right-8">
              <h2 className="text-3xl font-bold text-black mb-2 font-source-sans">
                AI is talking about you
              </h2>
              <p className="text-lg text-black/70 font-source-code">
                Find out what it's saying
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout - Dark with Marquee */}
      <div className="lg:hidden min-h-screen bg-[#0a0a0a] flex flex-col">
        {/* Form Section */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            {/* Logo */}
            <div className="mb-8 flex justify-center">
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/images/Harbor_White_Logo.png"
                  alt="Harbor"
                  width={32}
                  height={32}
                  className="h-8 w-auto"
                />
                <span className="text-xl font-semibold text-white font-space">Harbor</span>
              </Link>
            </div>

            {/* Header */}
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-semibold text-white mb-2 font-source-sans">Welcome back</h1>
              <p className="text-white/60 font-source-code">Sign in to your account to continue</p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-1.5 font-source-sans">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 text-white placeholder-white/30 font-source-code"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-white font-source-sans">
                    Password
                  </label>
                  <Link 
                    href="/forgot-password" 
                    className="text-sm text-white/40 hover:text-white transition-colors font-source-code"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 text-white placeholder-white/30 pr-10 font-source-code"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-sm text-red-400 font-source-code">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-white text-black rounded-lg font-medium hover:bg-white/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 font-source-sans"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>

            {/* Sign up link */}
            <p className="text-center text-sm text-white/40 mt-6 font-source-code">
              Don't have an account?{' '}
              <Link href="/signup" className="text-white font-medium hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Marquee Section */}
        <div className="relative py-8 overflow-hidden flex-shrink-0">
          {/* Left fade */}
          <div 
            className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to right, #0a0a0a 0%, transparent 100%)' }}
          />
          
          {/* Right fade */}
          <div 
            className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to left, #0a0a0a 0%, transparent 100%)' }}
          />

          <div className="space-y-3">
            <MarqueeRow prompts={PROMPT_ROWS[0]} direction="left" speed={35} />
            <MarqueeRow prompts={PROMPT_ROWS[1]} direction="right" speed={40} />
            <MarqueeRow prompts={PROMPT_ROWS[2]} direction="left" speed={32} />
          </div>
        </div>
      </div>

      {/* Marquee Animation Styles */}
      <style jsx>{`
        @keyframes marquee-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        
        @keyframes marquee-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        
        :global(.animate-marquee-left) {
          animation: marquee-left linear infinite;
        }
        
        :global(.animate-marquee-right) {
          animation: marquee-right linear infinite;
        }
      `}</style>
    </>
  )
}