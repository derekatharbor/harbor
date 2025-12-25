// DESTINATION: ~/Claude Harbor/apps/web/app/agencies/signup/page.tsx
// Agency signup flow

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createBrowserClient } from '@supabase/ssr'
import { 
  ArrowRight, 
  Check, 
  Loader2,
  Building2,
  Users,
  BarChart3,
  FileText
} from 'lucide-react'

export default function AgencySignupPage() {
  const router = useRouter()
  const [step, setStep] = useState<'info' | 'account'>('info')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Form state
  const [agencyName, setAgencyName] = useState('')
  const [website, setWebsite] = useState('')
  const [size, setSize] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleGoogleSignup = async () => {
    setLoading(true)
    setError('')
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/agencies/onboarding&agency=true&name=${encodeURIComponent(agencyName)}&website=${encodeURIComponent(website)}&size=${encodeURIComponent(size)}`,
        },
      })
      
      if (error) throw error
    } catch (err: any) {
      setError(err.message || 'Failed to sign up with Google')
      setLoading(false)
    }
  }

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            is_agency: true,
            agency_name: agencyName,
            agency_website: website,
            agency_size: size,
          },
        },
      })
      
      if (authError) throw authError
      
      // Redirect to onboarding
      router.push('/agencies/onboarding')
      
    } catch (err: any) {
      setError(err.message || 'Failed to create account')
      setLoading(false)
    }
  }

  const benefits = [
    { icon: Building2, text: 'Manage unlimited client brands' },
    { icon: BarChart3, text: 'Run unlimited AI visibility audits' },
    { icon: FileText, text: 'White-label PDF reports' },
    { icon: Users, text: 'Pitch Workspace to track prospects' },
  ]

  return (
    <div className="min-h-screen bg-[#0B0B0C] flex">
      {/* Left side - Benefits */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 border-r border-white/5">
        <div>
          <Link href="/" className="flex items-center gap-2 mb-16">
            <Image
              src="/images/Harbor_White_Logo.png"
              alt="Harbor"
              width={32}
              height={32}
              className="h-8 w-auto"
            />
            <span className="text-xl font-semibold text-white font-['Space_Grotesk']">Harbor</span>
          </Link>
          
          <h1 className="text-3xl font-semibold text-white mb-4 font-['Space_Grotesk']">
            Win more clients with AI visibility intelligence
          </h1>
          <p className="text-white/50 text-lg font-['Source_Code_Pro'] mb-12">
            Show prospects their AI gaps. Deliver results. Bill the difference.
          </p>
          
          <div className="space-y-6">
            {benefits.map((benefit, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                  <benefit.icon className="w-5 h-5 text-white/50" />
                </div>
                <span className="text-white/70 font-['Source_Code_Pro']">{benefit.text}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5">
            <p className="text-white/70 font-['Source_Code_Pro'] text-sm mb-4">
              "Harbor lets us show clients exactly where they're losing to competitors in AI search. Closes deals faster than any other tool we've used."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/10" />
              <div>
                <p className="text-white text-sm font-['Space_Grotesk']">Agency Partner</p>
                <p className="text-white/40 text-xs font-['Source_Code_Pro']">Digital Marketing Agency</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side - Form */}
      <div className="flex-1 flex flex-col justify-center p-8 lg:p-12">
        <div className="max-w-md mx-auto w-full">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
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
          </div>
          
          {step === 'info' ? (
            <>
              <h2 className="text-2xl font-semibold text-white mb-2 font-['Space_Grotesk']">
                Create your agency account
              </h2>
              <p className="text-white/40 text-sm font-['Source_Code_Pro'] mb-8">
                Tell us about your agency to get started
              </p>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs text-white/40 mb-2 font-['Source_Code_Pro']">
                    Agency name
                  </label>
                  <input
                    type="text"
                    value={agencyName}
                    onChange={(e) => setAgencyName(e.target.value)}
                    placeholder="Acme Digital"
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-lg text-white placeholder-white/20 font-['Source_Code_Pro'] text-sm focus:outline-none focus:border-white/20 transition-colors"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-white/40 mb-2 font-['Source_Code_Pro']">
                    Website
                  </label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://acmedigital.com"
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-lg text-white placeholder-white/20 font-['Source_Code_Pro'] text-sm focus:outline-none focus:border-white/20 transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-white/40 mb-2 font-['Source_Code_Pro']">
                    Team size
                  </label>
                  <select
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-lg text-white font-['Source_Code_Pro'] text-sm focus:outline-none focus:border-white/20 transition-colors appearance-none"
                  >
                    <option value="" className="bg-[#0B0B0C]">Select size</option>
                    <option value="1-5" className="bg-[#0B0B0C]">1-5 people</option>
                    <option value="6-20" className="bg-[#0B0B0C]">6-20 people</option>
                    <option value="21-50" className="bg-[#0B0B0C]">21-50 people</option>
                    <option value="50+" className="bg-[#0B0B0C]">50+ people</option>
                  </select>
                </div>
              </div>
              
              <button
                onClick={() => setStep('account')}
                disabled={!agencyName}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white text-[#0B0B0C] rounded-lg font-medium text-sm font-['Space_Grotesk'] hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setStep('info')}
                className="text-white/40 text-sm font-['Source_Code_Pro'] mb-6 hover:text-white/60 transition-colors"
              >
                ← Back
              </button>
              
              <h2 className="text-2xl font-semibold text-white mb-2 font-['Space_Grotesk']">
                Create your account
              </h2>
              <p className="text-white/40 text-sm font-['Source_Code_Pro'] mb-8">
                Setting up <span className="text-white/60">{agencyName}</span>
              </p>
              
              {error && (
                <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-400 text-sm font-['Source_Code_Pro']">{error}</p>
                </div>
              )}
              
              {/* Google signup */}
              <button
                onClick={handleGoogleSignup}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white text-[#0B0B0C] rounded-lg font-medium text-sm font-['Space_Grotesk'] hover:bg-white/90 transition-all disabled:opacity-50 mb-6"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </>
                )}
              </button>
              
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-4 bg-[#0B0B0C] text-white/30 font-['Source_Code_Pro']">or</span>
                </div>
              </div>
              
              {/* Email signup */}
              <form onSubmit={handleEmailSignup} className="space-y-4">
                <div>
                  <label className="block text-xs text-white/40 mb-2 font-['Source_Code_Pro']">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@agency.com"
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-lg text-white placeholder-white/20 font-['Source_Code_Pro'] text-sm focus:outline-none focus:border-white/20 transition-colors"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-white/40 mb-2 font-['Source_Code_Pro']">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-lg text-white placeholder-white/20 font-['Source_Code_Pro'] text-sm focus:outline-none focus:border-white/20 transition-colors"
                    required
                    minLength={8}
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading || !email || !password}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white rounded-lg font-medium text-sm font-['Space_Grotesk'] hover:bg-white/15 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Create Account'
                  )}
                </button>
              </form>
            </>
          )}
          
          <p className="mt-8 text-center text-xs text-white/30 font-['Source_Code_Pro']">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-white/50 hover:text-white/70 transition-colors">
              Sign in
            </Link>
          </p>
          
          <p className="mt-4 text-center text-xs text-white/20 font-['Source_Code_Pro']">
            By creating an account, you agree to our{' '}
            <Link href="/terms" className="underline hover:text-white/30">Terms</Link>
            {' '}and{' '}
            <Link href="/privacy" className="underline hover:text-white/30">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
