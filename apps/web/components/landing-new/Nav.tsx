// components/landing-new/Nav.tsx
// Simplified for launch - focus on brand claiming

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setIsLoggedIn(!!session)
    }
    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/images/harbor-logo-white.svg"
              alt="Harbor"
              width={120}
              height={32}
              className="h-7 w-auto"
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {/* Brand Index */}
            <Link href="/brands" className="px-4 py-2 text-white/70 hover:text-white text-sm font-medium transition-colors">
              Brand Index
            </Link>

            {/* Pricing */}
            <Link href="/pricing" className="px-4 py-2 text-white/70 hover:text-white text-sm font-medium transition-colors">
              Pricing
            </Link>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <Link 
                href="/dashboard/overview" 
                className="px-5 py-2 bg-white text-black font-semibold text-sm rounded-full hover:bg-white/90 transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/auth/login" className="px-4 py-2 text-white/70 hover:text-white text-sm font-medium transition-colors">
                  Log in
                </Link>
                <Link 
                  href="/brands" 
                  className="px-5 py-2 bg-white text-black font-semibold text-sm rounded-full hover:bg-white/90 transition-colors"
                >
                  Claim Your Brand
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-white/70 hover:text-white transition-colors"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0a0a0a] border-t border-white/10">
          <div className="px-6 py-4 space-y-1">
            <Link href="/brands" className="block py-2 text-white/70 hover:text-white">Brand Index</Link>
            <Link href="/pricing" className="block py-2 text-white/70 hover:text-white">Pricing</Link>
            
            <div className="pt-4 border-t border-white/10 space-y-3 mt-4">
              {isLoggedIn ? (
                <Link href="/dashboard/overview" className="block py-3 bg-white text-black text-center font-semibold rounded-lg">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/auth/login" className="block py-2 text-white/70 hover:text-white">Log in</Link>
                  <Link href="/brands" className="block py-3 bg-white text-black text-center font-semibold rounded-lg">
                    Claim Your Brand
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}