// apps/web/components/landing/FullscreenMenu.tsx
'use client'

import { useEffect } from 'react'
import { X, User } from 'lucide-react'
import Image from 'next/image'

interface FullscreenMenuProps {
  isOpen?: boolean
  onClose?: () => void
  user?: any
  onLogout?: () => void
}

export default function FullscreenMenu({ isOpen = false, onClose, user, onLogout }: FullscreenMenuProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-[100] bg-[#101A31] overflow-y-auto"
      style={{
        animation: 'fadeIn 300ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Header - Sticky */}
      <div className="sticky top-0 bg-[#101A31] border-b border-white/10 z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-6 flex items-center justify-between">
          <a href="/" className="flex items-center space-x-3">
            <Image 
              src="/logo-icon.png" 
              alt="Harbor" 
              width={32} 
              height={32}
              className="w-8 h-8"
            />
            <span className="text-xl font-bold text-white">Harbor</span>
          </a>
          
          {/* User indicator in mobile menu */}
          {user && (
            <div className="flex items-center gap-3 text-white/60 text-sm">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">{user.email}</span>
            </div>
          )}
          
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors duration-200"
            aria-label="Close menu"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      {/* Content - 4 Column Grid */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 lg:gap-16">
          
          {/* Column 1 - Main Navigation */}
          <div>
            <h3 className="text-xs uppercase tracking-wider text-white/40 mb-6 font-mono">Navigation</h3>
            <nav className="space-y-4">
              <a
                href="/"
                onClick={onClose}
                className="block text-2xl font-bold text-white hover:text-white/70 transition-colors duration-200"
              >
                Home
              </a>
              <a
                href="/#how-it-works"
                onClick={onClose}
                className="block text-2xl font-bold text-white hover:text-white/70 transition-colors duration-200"
              >
                How It Works
              </a>
              <a
                href="/pricing"
                onClick={onClose}
                className="block text-2xl font-bold text-white hover:text-white/70 transition-colors duration-200"
              >
                Pricing
              </a>
              
              {/* Auth-aware navigation */}
              {user ? (
                <button
                  onClick={() => {
                    onLogout?.()
                    onClose?.()
                  }}
                  className="block text-2xl font-bold text-white hover:text-white/70 transition-colors duration-200 text-left"
                >
                  Log out
                </button>
              ) : (
                <a
                  href="/login"
                  onClick={onClose}
                  className="block text-2xl font-bold text-white hover:text-white/70 transition-colors duration-200"
                >
                  Log in
                </a>
              )}
            </nav>
          </div>

          {/* Column 2 - Harbor Index (Featured) */}
          <div>
            <h3 className="text-xs uppercase tracking-wider text-white/40 mb-6 font-mono">Featured</h3>
            
            <a 
              href="/brands" 
              onClick={onClose}
              className="block group"
            >
              {/* Image placeholder - you can add Harbor Index graphic here */}
              <div className="w-full h-32 bg-white/5 rounded-lg mb-4 overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-[#6B7CFF]/20 to-transparent" />
              </div>
              
              <h4 className="text-xl font-bold text-white mb-3 group-hover:text-white/70 transition-colors">
                Harbor Index
              </h4>
              
              <p className="text-sm text-white/60 leading-relaxed">
                Browse thousands of brand profiles and see how AI models understand your industry. Claim your brand's profile to control your AI presence.
              </p>
            </a>
          </div>

          {/* Column 3 - Company */}
          <div>
            <h3 className="text-xs uppercase tracking-wider text-white/40 mb-6 font-mono">Company</h3>
            <nav className="space-y-4">
              <a
                href="/about"
                onClick={onClose}
                className="block text-xl font-bold text-white hover:text-white/70 transition-colors duration-200"
              >
                About
              </a>
              <a
                href="/contact"
                onClick={onClose}
                className="block text-xl font-bold text-white hover:text-white/70 transition-colors duration-200"
              >
                Contact
              </a>
            </nav>
          </div>

          {/* Column 4 - Legal */}
          <div>
            <h3 className="text-xs uppercase tracking-wider text-white/40 mb-6 font-mono">Legal</h3>
            <nav className="space-y-4">
              <a
                href="/privacy"
                onClick={onClose}
                className="block text-xl font-bold text-white hover:text-white/70 transition-colors duration-200"
              >
                Privacy Policy
              </a>
              <a
                href="/terms"
                onClick={onClose}
                className="block text-xl font-bold text-white hover:text-white/70 transition-colors duration-200"
              >
                Terms of Service
              </a>
            </nav>
          </div>
        </div>
      </div>

      {/* Footer - CTA + Social */}
      <div className="border-t border-white/10 mt-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8 pb-safe flex flex-col lg:flex-row items-center justify-between gap-4">
          {user ? (
            <a
              href="/dashboard"
              onClick={onClose}
              className="inline-flex items-center px-8 py-3.5 rounded-lg bg-white text-black text-base font-medium hover:bg-white/90 transition-all duration-200"
            >
              Go to Dashboard
            </a>
          ) : (
            <a
              href="/auth/signup"
              onClick={onClose}
              className="inline-flex items-center px-8 py-3.5 rounded-lg bg-white text-black text-base font-medium hover:bg-white/90 transition-all duration-200"
            >
              Get started free
            </a>
          )}
          
          <div className="text-sm text-white/50">
            © {new Date().getFullYear()} Harbor
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}