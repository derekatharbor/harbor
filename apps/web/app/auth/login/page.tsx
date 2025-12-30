// app/auth/login/page.tsx
// Split-screen login - white desktop, dark mobile with marquee

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

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      const supabase = createClientComponentClient()
      const redirectTo = next 
        ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
        : `${window.location.origin}/auth/callback`
      
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo }
      })
    } catch (err) {
      setError('Failed to sign in with Google')
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
                <span className="text-xl font-semibold text-black">Harbor</span>
              </Link>
            </div>

            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-black mb-2">Welcome back</h1>
              <p className="text-black/60">Sign in to your account to continue</p>
            </div>

            {/* Google Sign In */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-black/5 border border-black/10 rounded-lg hover:bg-black/10 transition-colors mb-6"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-black font-medium">Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-black/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-black/40">or continue with email</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full px-4 py-3 bg-black/5 border border-black/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/20 text-black placeholder-black/30"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-black">
                    Password
                  </label>
                  <Link 
                    href="/forgot-password" 
                    className="text-sm text-black/40 hover:text-black transition-colors"
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
                    className="w-full px-4 py-3 bg-black/5 border border-black/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/20 text-black placeholder-black/30 pr-10"
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
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-black text-white rounded-lg font-medium hover:bg-black/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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
            <p className="text-center text-sm text-black/40 mt-6">
              Don't have an account?{' '}
              <Link 
                href={next ? `/signup?next=${encodeURIComponent(next)}` : '/signup'} 
                className="text-black font-medium hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Right side - Image with padding */}
        <div className="w-1/2 p-4">
          <div className="relative w-full h-full rounded-2xl overflow-hidden">
            <Image
              src="/images/auth-side-image.png"
              alt=""
              fill
              className="object-cover"
              priority
            />
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
                <span className="text-xl font-semibold text-white">Harbor</span>
              </Link>
            </div>

            {/* Header */}
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-semibold text-white mb-2">Welcome back</h1>
              <p className="text-white/60">Sign in to your account to continue</p>
            </div>

            {/* Google Sign In */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors mb-6"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-white font-medium">Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-[#0a0a0a] text-white/40">or continue with email</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 text-white placeholder-white/30"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-white">
                    Password
                  </label>
                  <Link 
                    href="/forgot-password" 
                    className="text-sm text-white/40 hover:text-white transition-colors"
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
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 text-white placeholder-white/30 pr-10"
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
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-white text-black rounded-lg font-medium hover:bg-white/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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
            <p className="text-center text-sm text-white/40 mt-6">
              Don't have an account?{' '}
              <Link 
                href={next ? `/signup?next=${encodeURIComponent(next)}` : '/signup'} 
                className="text-white font-medium hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Marquee Section */}
        <div className="relative py-8 overflow-hidden">
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