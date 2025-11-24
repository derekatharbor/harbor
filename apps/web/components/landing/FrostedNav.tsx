'use client'

import { useState, useEffect } from 'react'
import { Menu, User } from 'lucide-react'
import FullscreenMenu from './FullscreenMenu'
import Image from 'next/image'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function FrostedNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
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

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

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

              {/* Right side - Auth-aware */}
              <div className="flex items-center space-x-4">
                {user ? (
                  /* Logged in - just show email */
                  <div className="hidden md:flex items-center gap-2 text-white/70 text-sm">
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
      <div className="h-24" />

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