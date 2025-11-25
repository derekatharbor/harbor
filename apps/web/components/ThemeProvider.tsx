// apps/web/components/ThemeProvider.tsx
'use client'

import { useEffect } from 'react'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Check for saved theme preference or default to light
    const savedTheme = localStorage.getItem('harbor-theme') as 'light' | 'dark' | null
    
    if (savedTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      // Default to dark mode for dashboard, but allow light mode toggle
      document.documentElement.setAttribute('data-theme', 'dark')
    }
  }, [])

  return <>{children}</>
}
