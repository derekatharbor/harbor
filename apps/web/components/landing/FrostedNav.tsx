// apps/web/components/landing/FrostedNav.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { Menu, User } from 'lucide-react'
import FullscreenMenu from './FullscreenMenu'
import Image from 'next/image'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function FrostedNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isDarkMode, setIsDarkMode] = useState(true) // true = white text, false = dark text
  const navRef = useRef<HTMLElement>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    // Get current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Intersection Observer to detect white sections
  useEffect(() => {
    const whiteSections = document.querySelectorAll('[data-nav-theme="light"]')
    
    if (whiteSections.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        // Check if nav is currently over any white section
        const navRect = navRef.current?.getBoundingClientRect()
        if (!navRect) return

        const navCenter = navRect.top + navRect.height / 2

        let isOverWhite = false
        whiteSections.forEach((section) => {
          const rect = section.getBoundingClientRect()
          if (navCenter >= rect.top && navCenter <= rect.bottom) {
            isOverWhite = true
          }
        })

        setIsDarkMode(!isOverWhite)
      },
      {
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
        rootMargin: '-80px 0px 0px 0px' // Account for nav height
      }
    )

    whiteSections.forEach((section) => observer.observe(section))

    // Also check on scroll for more accurate detection
    const handleScroll = () => {
      const navRect = navRef.current?.getBoundingClientRect()
      if (!navRect) return

      const navCenter = navRect.top + navRect.height / 2

      let isOverWhite = false
      whiteSections.forEach((section) => {
        const rect = section.getBoundingClientRect()
        if (navCenter >= rect.top && navCenter <= rect.bottom) {
          isOverWhite = true
        }
      })

      setIsDarkMode(!isOverWhite)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <>
      <nav 
        ref={navRef}
        className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-3rem)] max-w-[1400px]"
      >
        <div 
          className={`backdrop-blur-xl rounded-2xl shadow-2xl border transition-colors duration-300 ${
            isDarkMode 
              ? 'bg-[#101A31]/80 border-white/10' 
              : 'bg-white/80 border-gray-200'
          }`}
          style={{ backdropFilter: 'blur(12px)' }}
        >
          <div className="px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <a href="/" className="flex items-center space-x-3">
                <Image 
                  src={isDarkMode ? "/logo-icon.png" : "/images/harbor-dark-solo.svg"}
                  alt="Harbor" 
                  width={32} 
                  height={32}
                  className="w-8 h-8"
                />
                <span className={`text-xl font-bold font-heading transition-colors duration-300 ${
                  isDarkMode ? 'text-white' : 'text-[#101A31]'
                }`}>
                  Harbor
                </span>
              </a>

              {/* Right side - Auth-aware */}
              <div className="flex items-center space-x-4">
                {user ? (
                  /* Logged in - just show email */
                  <div className={`hidden md:flex items-center gap-2 text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-white/70' : 'text-[#101A31]/70'
                  }`}>
                    <User className="w-4 h-4" />
                    <span>{user.email}</span>
                  </div>
                ) : (
                  /* Logged out - clean, no buttons */
                  null
                )}
                
                {/* Hamburger menu (always visible) */}
                <button
                  onClick={() => setIsMenuOpen(true)}
                  className={`p-2 rounded-lg transition-colors duration-200 ${
                    isDarkMode ? 'hover:bg-white/5' : 'hover:bg-black/5'
                  }`}
                  aria-label="Open menu"
                >
                  <Menu className={`w-6 h-6 transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-[#101A31]'
                  }`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Fullscreen Menu */}
      <FullscreenMenu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)}
        user={user}
        onLogout={handleLogout}
      />
    </>
  )
}