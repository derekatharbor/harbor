'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Check if user has completed onboarding
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('org_id')
        .eq('user_id', data.user.id)
        .single()

      if (userRoles?.org_id) {
        router.push('/dashboard')
      } else {
        router.push('/onboarding')
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-white p-8 py-12">
        <div className="w-full max-w-md">
          {/* Logo - Replace /images/harbor-logo.svg with your logo path */}
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
              Welcome back
            </h1>
            <p className="text-[#6B7280]" style={{ fontFamily: 'Source Code Pro, monospace' }}>
              Sign in to your Harbor account
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
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
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-[#FF6B4A] border-gray-300 rounded focus:ring-[#FF6B4A]"
                />
                <span className="ml-2 text-sm text-[#6B7280]" style={{ fontFamily: 'Source Code Pro, monospace' }}>
                  Remember me
                </span>
              </label>
              <Link 
                href="/auth/forgot-password"
                className="text-sm text-[#FF6B4A] hover:text-[#E55A3A] transition-colors"
                style={{ fontFamily: 'Source Code Pro, monospace' }}
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#FF6B4A] text-white rounded-lg font-medium hover:bg-[#E55A3A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF6B4A] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              style={{ fontFamily: 'Source Code Pro, monospace' }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 lg:mt-8 text-center text-sm text-[#6B7280]" style={{ fontFamily: 'Source Code Pro, monospace' }}>
            Don't have an account?{' '}
            <Link 
              href="/auth/signup"
              className="text-[#FF6B4A] hover:text-[#E55A3A] font-medium transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Topographic Map Background */}
      <div className="hidden lg:flex flex-1 relative bg-[#101A31]">
        {/* Replace /images/topo-map.png with your topographic map image path */}
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