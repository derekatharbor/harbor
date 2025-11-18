'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import FullscreenMenu from './FullscreenMenu'

export default function FrostedNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/8">
        <div 
          className="backdrop-blur-xl bg-harbor-navy/80"
          style={{ backdropFilter: 'blur(12px)' }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 sm:h-20">
              {/* Logo */}
              <div className="flex-shrink-0">
                <a href="/" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-teal-600 rounded-lg" />
                  <span className="text-xl font-bold text-white font-display">Harbor</span>
                </a>
              </div>

              {/* Desktop Nav Links */}
              <div className="hidden md:flex items-center space-x-8">
                <a 
                  href="#how-it-works" 
                  className="text-sm text-white/75 hover:text-white transition-colors duration-200"
                >
                  How It Works
                </a>
                <a 
                  href="#pricing" 
                  className="text-sm text-white/75 hover:text-white transition-colors duration-200"
                >
                  Pricing
                </a>
                <a 
                  href="/login" 
                  className="text-sm text-white/75 hover:text-white transition-colors duration-200"
                >
                  Login
                </a>
              </div>

              {/* CTA + Menu Button */}
              <div className="flex items-center space-x-4">
                <a
                  href="#early-access"
                  className="hidden sm:inline-flex items-center px-4 py-2 rounded-lg bg-coral text-white text-sm font-medium hover:bg-coral/90 transition-all duration-200"
                >
                  Request Early Access
                </a>
                
                <button
                  onClick={() => setIsMenuOpen(true)}
                  className="p-2 rounded-lg hover:bg-white/5 transition-colors duration-200"
                  aria-label="Open menu"
                >
                  <Menu className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer to prevent content from hiding under fixed nav */}
      <div className="h-16 sm:h-20" />

      {/* Fullscreen Menu */}
      <FullscreenMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  )
}
