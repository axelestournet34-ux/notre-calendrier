'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { Theme } from '@/types/app.types'

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'clair' | 'sombre'
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('systeme')
  const [resolvedTheme, setResolvedTheme] = useState<'clair' | 'sombre'>('clair')

  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme | null
    if (stored) setThemeState(stored)
  }, [])

  useEffect(() => {
    const applyTheme = (t: Theme) => {
      const isDark =
        t === 'sombre' ||
        (t === 'systeme' && window.matchMedia('(prefers-color-scheme: dark)').matches)

      document.documentElement.classList.toggle('dark', isDark)
      setResolvedTheme(isDark ? 'sombre' : 'clair')
    }

    applyTheme(theme)
    localStorage.setItem('theme', theme)

    if (theme === 'systeme') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = () => applyTheme('systeme')
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    }
  }, [theme])

  const setTheme = (t: Theme) => setThemeState(t)

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme doit être utilisé dans ThemeProvider')
  return ctx
}
