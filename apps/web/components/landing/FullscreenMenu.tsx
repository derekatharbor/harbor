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
              className="block group mb-8"
            >
              {/* Image placeholder - you can add Harbor Index graphic here */}
              <div className="w-full h-32 bg-white/5 rounded-lg mb-4 overflow-hidden">
                <Image 
                  src="/images/harbor-index-preview.png"
                  alt="Harbor Index Preview"
                  width={280}
                  height={128}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <h4 className="text-xl font-bold text-white mb-3 group-hover:text-white/70 transition-colors">
                Harbor Index
              </h4>
              
              <p className="text-sm text-white/60 leading-relaxed">
                Browse thousands of brand profiles and see how AI models understand your industry. Claim your brand's profile to control your AI presence.
              </p>
            </a>

            {/* Shopify Plugin - Coming Soon */}
            <a 
              href="/shopify" 
              onClick={onClose}
              className="block group"
            >
              <div className="w-full h-32 bg-gradient-to-br from-[#95BF47]/20 to-[#95BF47]/5 rounded-lg mb-4 overflow-hidden flex items-center justify-center border border-[#95BF47]/20">
                <div className="flex items-center gap-3">
                  <svg className="w-10 h-10 text-[#95BF47]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M15.337 3.415c-.073-.44-.4-.728-.828-.753-.428-.024-3.056-.238-3.056-.238s-2.035-1.997-2.266-2.218c-.232-.22-.676-.153-.85-.107 0 0-.45.138-1.202.367-.712-2.066-1.97-3.96-4.18-3.96-.06 0-.122.003-.183.007C2.107-.742.677.562.102 2.23c-1.106 3.21-.485 7.761.612 10.312.163.378.592.613 1.053.613.152 0 .31-.027.472-.087.555-.206.914-.717.914-1.302V4.66c0-.187.103-.357.267-.444a.516.516 0 0 1 .517.016l.264.163.018-.025c.35.584.84 1.085 1.433 1.426-.007.076-.012.152-.012.23 0 2.038 1.658 3.695 3.696 3.695.488 0 .956-.096 1.386-.27l.777 4.783c.037.226.177.42.378.532.14.077.294.116.45.116.092 0 .184-.013.274-.04l2.373-.707c.355-.106.615-.4.68-.766l1.87-11.503c.025-.155.007-.313-.05-.458z"/>
                  </svg>
                  <span className="text-2xl font-bold text-[#95BF47]">+</span>
                  <Image 
                    src="/logo-icon.png" 
                    alt="Harbor" 
                    width={40} 
                    height={40}
                    className="w-10 h-10"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2 mb-3">
                <h4 className="text-xl font-bold text-white group-hover:text-white/70 transition-colors">
                  Shopify Plugin
                </h4>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#95BF47] text-white rounded">
                  Coming Soon
                </span>
              </div>
              
              <p className="text-sm text-white/60 leading-relaxed">
                Get your products recommended by ChatGPT, Claude, and Gemini. Auto-inject schema, FAQs, and AI-ready descriptions.
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
              <a
                href="/privacy"
                onClick={onClose}
                className="block text-xl font-bold text-white hover:text-white/70 transition-colors duration-200"
              >
                Privacy
              </a>
              <a
                href="/terms"
                onClick={onClose}
                className="block text-xl font-bold text-white hover:text-white/70 transition-colors duration-200"
              >
                Terms
              </a>
            </nav>
          </div>

          {/* Column 4 - Resources */}
          <div>
            <h3 className="text-xs uppercase tracking-wider text-white/40 mb-6 font-mono">Resources</h3>
            <nav className="space-y-4">
              <a
                href="/resources"
                onClick={onClose}
                className="block text-xl font-bold text-white hover:text-white/70 transition-colors duration-200"
              >
                Resource Center
              </a>
              <a
                href="/blog"
                onClick={onClose}
                className="block text-xl font-bold text-white hover:text-white/70 transition-colors duration-200"
              >
                Blog
              </a>
              <a
                href="/docs"
                onClick={onClose}
                className="block text-xl font-bold text-white hover:text-white/70 transition-colors duration-200"
              >
                Documentation
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