'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'
import Image from 'next/image'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClientComponentClient()

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) throw error

      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Reset Form */}
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
              Reset your password
            </h1>
            <p className="text-[#6B7280]" style={{ fontFamily: 'Source Code Pro, monospace' }}>
              Enter your email and we'll send you a reset link
            </p>
          </div>

          {success ? (
            <div className="space-y-6">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800" style={{ fontFamily: 'Source Code Pro, monospace' }}>
                  Check your email for a password reset link
                </p>
              </div>
              <Link
                href="/auth/login"
                className="block w-full py-3 px-4 bg-[#F4F6F8] text-[#101A31] rounded-lg font-medium hover:bg-gray-200 text-center transition-all"
                style={{ fontFamily: 'Source Code Pro, monospace' }}
              >
                Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-6">
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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-[#FF6B4A] text-white rounded-lg font-medium hover:bg-[#E55A3A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF6B4A] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                style={{ fontFamily: 'Source Code Pro, monospace' }}
              >
                {loading ? 'Sending...' : 'Send reset link'}
              </button>

              <Link
                href="/auth/login"
                className="block w-full py-3 px-4 bg-[#F4F6F8] text-[#101A31] rounded-lg font-medium hover:bg-gray-200 text-center transition-all"
                style={{ fontFamily: 'Source Code Pro, monospace' }}
              >
                Back to login
              </Link>
            </form>
          )}
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