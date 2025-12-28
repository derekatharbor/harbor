'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export default function StickyNav() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky nav after scrolling past 100px (roughly past the main nav)
      setIsVisible(window.scrollY > 100)
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
      <div className="flex items-center justify-between gap-8 h-14 px-6 bg-[#FBFAF8] rounded-xl shadow-[0px_4px_4px_1px_rgba(120,120,120,0.25)]">
        {/* Logo Mark */}
        <Link href="/" className="flex items-center">
          <Image
            src="/images/harbor-logo-dark-solo.svg"
            alt="Harbor"
            width={25}
            height={25}
          />
        </Link>

        {/* Nav Buttons */}
        <div className="flex items-center gap-2">
          <Link 
            href="/login"
            className="h-9 px-5 rounded-md border border-[#B1B0AF] text-[13px] font-medium font-space tracking-[0.61px] text-black hover:bg-black/5 transition-colors flex items-center"
          >
            Login
          </Link>
          <Link 
            href="/signup"
            className="btn-black h-9 px-5 rounded-md text-[13px] font-medium font-space tracking-[0.61px] flex items-center"
          >
            Get started
          </Link>
        </div>
      </div>
    </div>
  )
}
