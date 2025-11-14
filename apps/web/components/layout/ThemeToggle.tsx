// apps/web/components/layout/ThemeToggle.tsx

'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    // Check localStorage or system preference on mount
    const savedTheme = localStorage.getItem('harbor-theme') as 'light' | 'dark' | null
    const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    
    const initialTheme = savedTheme || systemPreference
    setTheme(initialTheme)
    
    if (initialTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark')
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('harbor-theme', newTheme)
    
    if (newTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
  }

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-text/60 hover:text-sidebar-text hover:bg-white/5 transition-colors cursor-pointer w-full"
      title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {theme === 'light' ? (
        <>
          <Moon className="w-5 h-5" strokeWidth={1.5} />
          <span className="text-sm font-body">Dark Mode</span>
        </>
      ) : (
        <>
          <Sun className="w-5 h-5" strokeWidth={1.5} />
          <span className="text-sm font-body">Light Mode</span>
        </>
      )}
    </button>
  )
}
