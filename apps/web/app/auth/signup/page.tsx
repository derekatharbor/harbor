// apps/web/app/auth/signup/page.tsx
'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    // Validate password strength
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      setLoading(false)
      return
    }

    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (authError) throw authError

      if (authData.user) {
        // Check if email confirmation is required
        if (authData.session) {
          // User is auto-logged in (email confirmation disabled)
          // Call API to create org and user role (uses service role to bypass RLS)
          const setupResponse = await fetch('/api/auth/setup-account', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          })

          if (!setupResponse.ok) {
            const errorData = await setupResponse.json()
            throw new Error(errorData.error || 'Failed to set up account')
          }

          // Redirect to onboarding
          router.push('/onboarding')
        } else {
          // Email confirmation required - show message
          setError('Please check your email to confirm your account, then log in.')
        }
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Sign Up Form */}
      <div className="flex-1 flex items-center justify-center bg-white p-8 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8 lg:mb-12">
            <Image
              src="/images/harbor-logo.svg"
              alt="Harbor"
              width={120}
              height={40}
              className="h-10 w-auto"
            />
          </div>

          <div className="mb-6 lg:mb-8">
            <h1 className="text-3xl font-bold text-[#101A31] mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Get started with Harbor
            </h1>
            <p className="text-[#6B7280]" style={{ fontFamily: 'Source Code Pro, monospace' }}>
              Create your account to optimize your brand's AI visibility
            </p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-5">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800" style={{ fontFamily: 'Source Code Pro, monospace' }}>
                  {error}
                </p>
              </div>
            )}

            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-[#101A31] mb-2 uppercase tracking-wide"
                style={{ fontFamily: 'Source Code Pro, monospace', fontSize: '12px' }}
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#F4F6F8] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B4A] focus:border-transparent text-[#101A31]"
                style={{ fontFamily: 'Source Code Pro, monospace' }}
                placeholder="you@company.com"
              />
            </div>

            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-medium text-[#101A31] mb-2 uppercase tracking-wide"
                style={{ fontFamily: 'Source Code Pro, monospace', fontSize: '12px' }}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#F4F6F8] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B4A] focus:border-transparent text-[#101A31]"
                style={{ fontFamily: 'Source Code Pro, monospace' }}
                placeholder="••••••••"
              />
              <p className="mt-1 text-xs text-[#6B7280]" style={{ fontFamily: 'Source Code Pro, monospace' }}>
                Must be at least 8 characters
              </p>
            </div>

            <div>
              <label 
                htmlFor="confirmPassword" 
                className="block text-sm font-medium text-[#101A31] mb-2 uppercase tracking-wide"
                style={{ fontFamily: 'Source Code Pro, monospace', fontSize: '12px' }}
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#F4F6F8] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B4A] focus:border-transparent text-[#101A31]"
                style={{ fontFamily: 'Source Code Pro, monospace' }}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#101A31] text-white rounded-lg font-medium hover:bg-[#1a2a4a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#101A31] disabled:opacity-50 transition-all cursor-pointer"
              style={{ fontFamily: 'Source Code Pro, monospace' }}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>

            <p className="text-xs text-[#6B7280] text-center" style={{ fontFamily: 'Source Code Pro, monospace' }}>
              By creating an account, you agree to Harbor's Terms of Service and Privacy Policy
            </p>
          </form>

          <p className="mt-6 lg:mt-8 text-center text-sm text-[#6B7280]" style={{ fontFamily: 'Source Code Pro, monospace' }}>
            Already have an account?{' '}
            <Link 
              href="/auth/login"
              className="text-[#101A31] hover:text-[#1a2a4a] font-medium transition-colors underline underline-offset-2"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Topographic Map Background */}
      <div className="hidden lg:flex flex-1 relative bg-[#101A31]">
        <Image
          src="/images/topo-map.png"
          alt=""
          fill
          className="object-cover opacity-80"
          priority
        />
      </div>
    </div>
  )
}