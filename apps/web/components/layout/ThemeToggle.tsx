// apps/web/components/layout/ThemeToggle.tsx

'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

interface ThemeToggleProps {
  isCollapsed?: boolean
}

export default function ThemeToggle({ isCollapsed = false }: ThemeToggleProps) {
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
    <div className="relative">
      <button
        onClick={toggleTheme}
        className={`
          flex items-center rounded-lg group transition-colors cursor-pointer relative
          ${isCollapsed ? 'py-3 justify-center' : 'gap-3 py-2.5 px-3 w-full'}
          text-softgray/60 hover:text-white hover:bg-white/5
        `}
        aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      >
        {theme === 'light' ? (
          <>
            <Moon className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
            {!isCollapsed && <span className="text-sm font-body">Dark Mode</span>}
          </>
        ) : (
          <>
            <Sun className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
            {!isCollapsed && <span className="text-sm font-body">Light Mode</span>}
          </>
        )}
        
        {/* Tooltip - only show when collapsed */}
        {isCollapsed && (
          <div
            className="
              absolute left-full ml-3 top-1/2 -translate-y-1/2
              px-3 py-2 rounded-md whitespace-nowrap
              bg-[#0B1521] shadow-lg
              opacity-0 invisible group-hover:opacity-100 group-hover:visible
              transition-all duration-150 ease-in pointer-events-none
            "
            style={{ 
              zIndex: 9999
            }}
          >
            <span className="text-white/90 font-body text-sm">
              {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
            </span>
          </div>
        )}
      </button>
    </div>
  )
}