// apps/web/components/auth/CompleteSignupModal.tsx
// Modal that appears after successful claim verification to complete signup

'use client'

import { useState } from 'react'
import { X, Eye, EyeOff, AlertCircle, Check } from 'lucide-react'

interface CompleteSignupModalProps {
  isOpen: boolean
  email: string
  brandSlug: string
  onSuccess: () => void
  onClose: () => void
}

export default function CompleteSignupModal({
  isOpen,
  email,
  brandSlug,
  onSuccess,
  onClose
}: CompleteSignupModalProps) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Password validation
  const isPasswordValid = password.length >= 8
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate password
    if (!isPasswordValid) {
      setError('Password must be at least 8 characters')
      return
    }

    if (!passwordsMatch) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/complete-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          brandSlug
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create account')
      }

      // Success! Call onSuccess callback which will navigate to manage page
      onSuccess()
    } catch (err: any) {
      setError(err.message)
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
            Create Your Account
          </h2>
          <p 
            className="text-[#6B7280] text-sm"
            style={{ fontFamily: 'Source Code Pro, monospace' }}
          >
            Set a password to complete your account setup and manage your brand profile.
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

          {/* Email (pre-filled, disabled) */}
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
              disabled
              className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-[#101A31] cursor-not-allowed opacity-75"
              style={{ fontFamily: 'Source Code Pro, monospace' }}
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
                placeholder="Min. 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {password.length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                {isPasswordValid ? (
                  <Check size={14} className="text-green-600" />
                ) : (
                  <AlertCircle size={14} className="text-gray-400" />
                )}
                <span 
                  className={`text-xs ${isPasswordValid ? 'text-green-600' : 'text-gray-500'}`}
                  style={{ fontFamily: 'Source Code Pro, monospace' }}
                >
                  At least 8 characters
                </span>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label 
              htmlFor="confirmPassword" 
              className="block text-xs font-medium text-[#101A31] mb-2 uppercase tracking-wide"
              style={{ fontFamily: 'Source Code Pro, monospace' }}
            >
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 pr-10 bg-[#F4F6F8] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B4A] focus:border-transparent text-[#101A31]"
                style={{ fontFamily: 'Source Code Pro, monospace' }}
                placeholder="Re-enter password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {confirmPassword.length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                {passwordsMatch ? (
                  <Check size={14} className="text-green-600" />
                ) : (
                  <AlertCircle size={14} className="text-gray-400" />
                )}
                <span 
                  className={`text-xs ${passwordsMatch ? 'text-green-600' : 'text-gray-500'}`}
                  style={{ fontFamily: 'Source Code Pro, monospace' }}
                >
                  Passwords match
                </span>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !isPasswordValid || !passwordsMatch}
            className="w-full py-3 px-4 bg-[#FF6B4A] text-white rounded-lg font-medium hover:bg-[#E55A3A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF6B4A] disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed transition-all"
            style={{ fontFamily: 'Source Code Pro, monospace' }}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 pt-5 border-t border-gray-200">
          <p 
            className="text-xs text-center text-[#6B7280]"
            style={{ fontFamily: 'Source Code Pro, monospace' }}
          >
            Already have an account?{' '}
            <a 
              href="/auth/login" 
              className="text-[#FF6B4A] hover:text-[#E55A3A] font-medium"
            >
              Log in
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}