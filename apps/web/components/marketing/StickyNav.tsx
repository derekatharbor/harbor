'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export default function StickyNav() {
  const [isVisible, setIsVisible] = useState(false)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky nav after scrolling past 100px
      setIsVisible(window.scrollY > 100)
      
      // Check if we're over the dark section
      // The dark section starts after the hero (~100vh or when we hit the dark bg)
      const darkSection = document.getElementById('dark-section')
      if (darkSection) {
        const rect = darkSection.getBoundingClientRect()
        // Switch to dark mode when the dark section is near the top of viewport
        setIsDark(rect.top < 80)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 -translate-y-4 pointer-events-none'
      }`}
    >
      <div className={`flex items-center justify-between gap-8 h-14 px-6 rounded-xl shadow-[0px_4px_4px_1px_rgba(120,120,120,0.25)] transition-colors duration-300 ${
        isDark ? 'bg-[#111111]' : 'bg-[#FBFAF8]'
      }`}>
        {/* Logo Mark */}
        <Link href="/" className="flex items-center">
          <Image
            src={isDark ? '/images/harbor-logo-white.png' : '/images/harbor-logo-dark-solo.svg'}
            alt="Harbor"
            width={25}
            height={25}
            className="transition-opacity duration-300"
          />
        </Link>

        {/* Nav Buttons */}
        <div className="flex items-center gap-2">
          <Link 
            href="/login"
            className={`h-9 px-5 rounded-md border text-[13px] font-medium font-space tracking-[0.61px] transition-colors flex items-center ${
              isDark 
                ? 'border-[#333] text-white hover:bg-white/10' 
                : 'border-[#B1B0AF] text-black hover:bg-black/5'
            }`}
          >
            Login
          </Link>
          <Link 
            href="/signup"
            className={`h-9 px-5 rounded-md text-[13px] font-medium font-space tracking-[0.61px] flex items-center transition-colors ${
              isDark
                ? 'bg-white text-black hover:bg-gray-200'
                : 'btn-black'
            }`}
          >
            Get started
          </Link>
        </div>
      </div>
    </div>
  )
}