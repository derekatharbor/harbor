// apps/web/components/ThemeProvider.tsx
'use client'

import { useEffect } from 'react'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('harbor-theme') as 'light' | 'dark' | null
    const theme = savedTheme || 'dark'
    
    // Always set explicit data-theme attribute
    document.documentElement.setAttribute('data-theme', theme)
    
    // Save default if not set
    if (!savedTheme) {
      localStorage.setItem('harbor-theme', 'dark')
    }
  }, [])

  return <>{children}</>
}