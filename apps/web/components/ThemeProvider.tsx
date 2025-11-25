// apps/web/components/ThemeProvider.tsx
'use client'

import { useEffect } from 'react'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('harbor-theme') as 'light' | 'dark' | null
    
    if (savedTheme) {
      // Use saved preference
      if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark')
      } else {
        document.documentElement.removeAttribute('data-theme')
      }
    } else {
      // Default to dark mode for dashboard (no saved preference)
      document.documentElement.setAttribute('data-theme', 'dark')
      localStorage.setItem('harbor-theme', 'dark')
    }
  }, [])

  return <>{children}</>
}