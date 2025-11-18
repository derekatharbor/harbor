'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import FullscreenMenu from './FullscreenMenu'
import Image from 'next/image'

export default function FrostedNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div 
          className="backdrop-blur-xl bg-[#2A3B54]/80"
          style={{ backdropFilter: 'blur(12px)' }}
        >
          <div className="max-w-[90rem] mx-auto px-6 lg:px-12">
            <div className="flex items-center justify-between h-20">
              {/* Logo */}
              <a href="/" className="flex items-center space-x-3">
                <Image 
                  src="/logo-icon.png" 
                  alt="Harbor" 
                  width={32} 
                  height={32}
                  className="w-8 h-8"
                />
                <span className="text-2xl font-bold text-white font-heading">Harbor</span>
              </a>

              {/* Right side - Log in + Get started + Menu */}
              <div className="flex items-center space-x-6">
                <a 
                  href="/login" 
                  className="text-white text-base hover:text-white/80 transition-colors duration-200"
                >
                  Log in
                </a>
                
                <a
                  href="#early-access"
                  className="inline-flex items-center px-6 py-3 rounded-lg bg-white text-black text-base font-medium hover:bg-white/90 transition-all duration-200"
                >
                  Get started
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

      {/* Spacer */}
      <div className="h-20" />

      {/* Fullscreen Menu */}
      <FullscreenMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  )
}