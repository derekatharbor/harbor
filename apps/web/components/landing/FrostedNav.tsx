'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import FullscreenMenu from './FullscreenMenu'
import Image from 'next/image'

export default function FrostedNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <>
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-3rem)] max-w-[1400px]">
        <div 
          className="backdrop-blur-xl bg-white/15 rounded-2xl shadow-2xl border border-white/10"
          style={{ backdropFilter: 'blur(12px)' }}
        >
          <div className="px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
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

              {/* Right side - Log in + Get started + Menu */}
              <div className="flex items-center space-x-4">
                <a 
                  href="/login" 
                  className="hidden md:block text-white text-base hover:text-white/80 transition-colors duration-200"
                >
                  Log in
                </a>
                
                <a
                  href="#early-access"
                  className="hidden md:inline-flex items-center px-5 py-2.5 rounded-lg bg-white text-black text-base font-medium hover:bg-white/90 transition-all duration-200"
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

      {/* Spacer - smaller since nav is floating */}
      <div className="h-24" />

      {/* Fullscreen Menu */}
      <FullscreenMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  )
}