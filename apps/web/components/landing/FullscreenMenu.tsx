'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import Image from 'next/image'

interface FullscreenMenuProps {
  isOpen?: boolean
  onClose?: () => void
}

export default function FullscreenMenu({ isOpen = false, onClose }: FullscreenMenuProps) {
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
      className="fixed inset-0 z-[100] bg-[#1A2332]"
      style={{
        animation: 'fadeIn 300ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Header */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-6 flex items-center justify-between">
          <a href="/" className="flex items-center space-x-3">
            <Image 
              src="/logo-icon.png" 
              alt="Harbor" 
              width={32} 
              height={32}
              className="w-8 h-8"
            />
            <span className="text-xl font-bold text-white font-heading">Harbor</span>
          </a>
          
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors duration-200"
            aria-label="Close menu"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      {/* Content - Desktop Grid / Mobile Stack */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
          
          {/* Column 1 - Main Navigation */}
          <div>
            <h3 className="text-sm uppercase tracking-wider text-white/50 mb-6">Navigation</h3>
            <nav className="space-y-4">
              <a
                href="/"
                onClick={onClose}
                className="block text-2xl lg:text-3xl font-heading text-white hover:text-white/70 transition-colors duration-200"
              >
                Home
              </a>
              <a
                href="#how-it-works"
                onClick={onClose}
                className="block text-2xl lg:text-3xl font-heading text-white hover:text-white/70 transition-colors duration-200"
              >
                How It Works
              </a>
              <a
                href="#pricing"
                onClick={onClose}
                className="block text-2xl lg:text-3xl font-heading text-white hover:text-white/70 transition-colors duration-200"
              >
                Pricing
              </a>
              <a
                href="/login"
                onClick={onClose}
                className="block text-2xl lg:text-3xl font-heading text-white hover:text-white/70 transition-colors duration-200"
              >
                Log in
              </a>
            </nav>
          </div>

          {/* Column 2 - Resources (Desktop only for now) */}
          <div className="hidden lg:block">
            <h3 className="text-sm uppercase tracking-wider text-white/50 mb-6">Resources</h3>
            <nav className="space-y-4">
              <a
                href="/blog"
                className="block text-xl font-heading text-white hover:text-white/70 transition-colors duration-200"
              >
                Blog
              </a>
              <a
                href="/docs"
                className="block text-xl font-heading text-white hover:text-white/70 transition-colors duration-200"
              >
                Documentation
              </a>
              <a
                href="/case-studies"
                className="block text-xl font-heading text-white hover:text-white/70 transition-colors duration-200"
              >
                Case Studies
              </a>
            </nav>
          </div>

          {/* Column 3 - Company (Desktop only for now) */}
          <div className="hidden lg:block">
            <h3 className="text-sm uppercase tracking-wider text-white/50 mb-6">Company</h3>
            <nav className="space-y-4">
              <a
                href="/about"
                className="block text-xl font-heading text-white hover:text-white/70 transition-colors duration-200"
              >
                About
              </a>
              <a
                href="/contact"
                className="block text-xl font-heading text-white hover:text-white/70 transition-colors duration-200"
              >
                Contact
              </a>
              <a
                href="/careers"
                className="block text-xl font-heading text-white hover:text-white/70 transition-colors duration-200"
              >
                Careers
              </a>
            </nav>
          </div>
        </div>
      </div>

      {/* Footer - CTA + Social */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8 flex flex-col lg:flex-row items-center justify-between gap-4">
          <a
            href="#early-access"
            onClick={onClose}
            className="inline-flex items-center px-8 py-3.5 rounded-lg bg-white text-black text-base font-medium hover:bg-white/90 transition-all duration-200"
          >
            Get started
          </a>
          
          <div className="text-sm text-white/50">
            © 2024 Harbor
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