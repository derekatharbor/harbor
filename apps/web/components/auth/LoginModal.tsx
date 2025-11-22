// apps/web/components/auth/LoginModal.tsx
// Modal for logging in from brand profile pages

'use client'

import { useState } from 'react'
import { X, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

interface LoginModalProps {
  isOpen: boolean
  brandSlug: string
  onClose: () => void
}

export default function LoginModal({
  isOpen,
  brandSlug,
  onClose
}: LoginModalProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (!data.user) {
        throw new Error('Login failed')
      }

      // Success - redirect to manage page
      router.push(`/brands/${brandSlug}/manage`)
      router.refresh()
      
    } catch (err: any) {
      setError(err.message || 'Invalid email or password')
      setLoading(false)
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 
            className="text-2xl font-bold text-[#101A31] mb-2"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Sign In
          </h2>
          <p 
            className="text-[#6B7280] text-sm"
            style={{ fontFamily: 'Source Code Pro, monospace' }}
          >
            Sign in to manage your brand profile
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
              <p 
                className="text-sm text-red-800"
                style={{ fontFamily: 'Source Code Pro, monospace' }}
              >
                {error}
              </p>
            </div>
          )}

          {/* Email */}
          <div>
            <label 
              htmlFor="email" 
              className="block text-xs font-medium text-[#101A31] mb-2 uppercase tracking-wide"
              style={{ fontFamily: 'Source Code Pro, monospace' }}
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

          {/* Password */}
          <div>
            <label 
              htmlFor="password" 
              className="block text-xs font-medium text-[#101A31] mb-2 uppercase tracking-wide"
              style={{ fontFamily: 'Source Code Pro, monospace' }}
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 pr-10 bg-[#F4F6F8] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B4A] focus:border-transparent text-[#101A31]"
                style={{ fontFamily: 'Source Code Pro, monospace' }}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="text-right">
            <a 
              href="/auth/forgot-password"
              className="text-sm text-[#FF6B4A] hover:text-[#E55A3A] transition-colors"
              style={{ fontFamily: 'Source Code Pro, monospace' }}
            >
              Forgot password?
            </a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-[#FF6B4A] text-white rounded-lg font-medium hover:bg-[#E55A3A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF6B4A] disabled:opacity-50 transition-all"
            style={{ fontFamily: 'Source Code Pro, monospace' }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 pt-5 border-t border-gray-200">
          <p 
            className="text-xs text-center text-[#6B7280]"
            style={{ fontFamily: 'Source Code Pro, monospace' }}
          >
            Don't have an account?{' '}
            <button 
              onClick={onClose}
              className="text-[#FF6B4A] hover:text-[#E55A3A] font-medium"
            >
              Claim this profile
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}