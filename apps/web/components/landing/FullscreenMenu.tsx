'use client'

import { useEffect } from 'react'
import { X, Linkedin, Twitter } from 'lucide-react'

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
      className="fixed inset-0 z-[100] bg-harbor-navy"
      style={{
        animation: 'fadeIn 300ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <div className="absolute inset-0 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-teal-600 rounded-lg" />
            <span className="text-xl font-bold text-white font-display">Harbor</span>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors duration-200"
            aria-label="Close menu"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Main Nav Links */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 space-y-8">
          <a
            href="/"
            onClick={onClose}
            className="text-4xl sm:text-5xl lg:text-6xl font-display font-medium text-white hover:text-teal-400 transition-colors duration-300"
          >
            Home
          </a>
          <a
            href="#how-it-works"
            onClick={onClose}
            className="text-4xl sm:text-5xl lg:text-6xl font-display font-medium text-white hover:text-teal-400 transition-colors duration-300"
          >
            How It Works
          </a>
          <a
            href="#pricing"
            onClick={onClose}
            className="text-4xl sm:text-5xl lg:text-6xl font-display font-medium text-white hover:text-teal-400 transition-colors duration-300"
          >
            Pricing
          </a>
          <a
            href="/login"
            onClick={onClose}
            className="text-4xl sm:text-5xl lg:text-6xl font-display font-medium text-white hover:text-teal-400 transition-colors duration-300"
          >
            Login
          </a>
          
          <div className="pt-8">
            <a
              href="#early-access"
              onClick={onClose}
              className="inline-flex items-center px-8 py-4 rounded-lg bg-coral text-white text-lg font-medium hover:bg-coral/90 transition-all duration-200"
            >
              Request Early Access
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 sm:px-8 py-6">
          <div className="flex items-center justify-between border-t border-white/8 pt-6">
            <div className="text-sm text-white/50">
              © 2024 Harbor
            </div>
            
            <div className="flex items-center space-x-4">
              <a
                href="https://linkedin.com/company/harbor"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-white/5 transition-colors duration-200"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5 text-white/75 hover:text-white transition-colors" />
              </a>
              <a
                href="https://x.com/harbor"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-white/5 transition-colors duration-200"
                aria-label="X (Twitter)"
              >
                <Twitter className="w-5 h-5 text-white/75 hover:text-white transition-colors" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.96);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  )
}
