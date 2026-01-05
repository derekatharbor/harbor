// components/marketing/StickyNav.tsx

'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

export default function StickyNav() {
  const [isVisible, setIsVisible] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 100)
      
      const darkSection = document.getElementById('dark-section')
      const lightSection = document.getElementById('light-section')
      
      if (darkSection && lightSection) {
        const darkRect = darkSection.getBoundingClientRect()
        const lightRect = lightSection.getBoundingClientRect()
        const overDark = darkRect.top < 80 && lightRect.top > 80
        setIsDark(overDark)
      } else if (darkSection) {
        const darkRect = darkSection.getBoundingClientRect()
        setIsDark(darkRect.top < 80 && darkRect.bottom > 80)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <div
        className={`fixed left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
          isVisible 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
        style={{ top: 'calc(16px + env(safe-area-inset-top, 0px))' }}
      >
        {/* Desktop Nav */}
        <div className={`hidden lg:flex items-center justify-between w-[620px] h-14 px-5 rounded-xl transition-all duration-300 backdrop-blur-md ${
          isDark 
            ? 'bg-[#111111]/80 shadow-[0px_4px_12px_2px_rgba(0,0,0,0.5)] border border-white/10' 
            : 'bg-[#FBFAF8]/80 shadow-[0px_4px_4px_1px_rgba(120,120,120,0.25)] border border-black/5'
        }`}>
          {/* Left: Logo + Nav Links */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 mr-2">
              <Image
                src={isDark ? "/white-logo.png" : "/logo.png"}
                alt="Scout"
                width={28}
                height={28}
                className="w-7 h-7 transition-all duration-300"
              />
              <span 
                className={`text-xl font-semibold transition-colors duration-300 ${
                  isDark ? 'text-white' : 'text-[#111827]'
                }`}
                style={{ fontFamily: 'var(--font-bricolage), sans-serif' }}
              >
                scout
              </span>
            </Link>

            <Link
              href="#how-it-works"
              className={`px-3 py-1.5 text-[13px] font-medium rounded-md transition-colors ${
                isDark 
                  ? 'text-white/70 hover:text-white hover:bg-white/10' 
                  : 'text-black/70 hover:text-black hover:bg-black/5'
              }`}
              style={{ fontFamily: 'var(--font-libre), sans-serif' }}
            >
              How it works
            </Link>
            <Link
              href="/pricing"
              className={`px-3 py-1.5 text-[13px] font-medium rounded-md transition-colors ${
                isDark 
                  ? 'text-white/70 hover:text-white hover:bg-white/10' 
                  : 'text-black/70 hover:text-black hover:bg-black/5'
              }`}
              style={{ fontFamily: 'var(--font-libre), sans-serif' }}
            >
              Pricing
            </Link>
          </div>

          {/* Right: Buttons */}
          <div className="flex items-center gap-2">
            <Link 
              href="/login"
              className={`h-9 px-5 rounded-md border text-[13px] font-medium transition-colors flex items-center ${
                isDark 
                  ? 'border-[#333] text-white hover:bg-white/10' 
                  : 'border-[#B1B0AF] text-black hover:bg-black/5'
              }`}
              style={{ fontFamily: 'var(--font-libre), sans-serif' }}
            >
              Login
            </Link>
            <Link 
              href="/signup"
              className={`h-9 px-5 rounded-md text-[13px] font-medium flex items-center transition-colors ${
                isDark
                  ? 'bg-white text-black hover:bg-gray-200'
                  : 'bg-black text-white hover:bg-black/80'
              }`}
              style={{ fontFamily: 'var(--font-libre), sans-serif' }}
            >
              Start free trial
            </Link>
          </div>
        </div>

        {/* Mobile Nav */}
        <div className={`lg:hidden flex items-center justify-between w-[calc(100vw-32px)] max-w-[400px] h-12 px-4 rounded-xl transition-all duration-300 backdrop-blur-md ${
          isDark 
            ? 'bg-[#111111]/80 shadow-[0px_4px_12px_2px_rgba(0,0,0,0.5)] border border-white/10' 
            : 'bg-[#FBFAF8]/80 shadow-[0px_4px_4px_1px_rgba(120,120,120,0.25)] border border-black/5'
        }`}>
          <Link href="/" className="flex items-center gap-2">
            <Image
              src={isDark ? "/white-logo.png" : "/logo.png"}
              alt="Scout"
              width={24}
              height={24}
              className="w-6 h-6 transition-all duration-300"
            />
            <span 
              className={`text-lg font-semibold transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-[#111827]'
              }`}
              style={{ fontFamily: 'var(--font-bricolage), sans-serif' }}
            >
              scout
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <Link 
              href="/signup"
              className={`h-8 px-4 rounded-md text-[12px] font-medium flex items-center transition-colors ${
                isDark
                  ? 'bg-white text-black hover:bg-gray-200'
                  : 'bg-black text-white hover:bg-black/80'
              }`}
              style={{ fontFamily: 'var(--font-libre), sans-serif' }}
            >
              Start free trial
            </Link>
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className={`p-1.5 rounded-lg transition-colors ${
                isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'
              }`}
            >
              <Menu className={`w-5 h-5 ${isDark ? 'text-white' : 'text-black'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute top-0 right-0 w-[280px] h-full bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-[#E5E7EB]">
              <span 
                className="text-lg font-semibold text-[#111827]"
                style={{ fontFamily: 'var(--font-bricolage), sans-serif' }}
              >
                Menu
              </span>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 -mr-2 rounded-lg hover:bg-black/5"
              >
                <X className="w-5 h-5 text-[#111827]" />
              </button>
            </div>
            <div className="p-4 space-y-2">
              <Link
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 rounded-lg text-[15px] font-medium text-[#111827] hover:bg-[#F3F4F6]"
                style={{ fontFamily: 'var(--font-libre), sans-serif' }}
              >
                How it works
              </Link>
              <Link
                href="/pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 rounded-lg text-[15px] font-medium text-[#111827] hover:bg-[#F3F4F6]"
                style={{ fontFamily: 'var(--font-libre), sans-serif' }}
              >
                Pricing
              </Link>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#E5E7EB] space-y-2">
              <Link 
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full h-11 rounded-lg border border-[#E5E7EB] text-[14px] font-medium text-[#111827] flex items-center justify-center hover:bg-black/5"
                style={{ fontFamily: 'var(--font-libre), sans-serif' }}
              >
                Login
              </Link>
              <Link 
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full h-11 rounded-lg bg-[#111827] text-[14px] font-medium text-white flex items-center justify-center hover:bg-[#111827]/90"
                style={{ fontFamily: 'var(--font-libre), sans-serif' }}
              >
                Start free trial
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}