'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { Locale } from '@/lib/i18n/getLocale'
import { DEFAULT_LOCALE, LOCALE_COOKIE_NAME, getLocaleFromCookie } from '@/lib/i18n/getLocale'

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
}

const I18nContext = createContext<I18nContextType>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
})

export function useLocale() {
  const context = useContext(I18nContext)
  return context.locale
}

export function useSetLocale() {
  const context = useContext(I18nContext)
  return context.setLocale
}

interface I18nProviderProps {
  children: ReactNode
  initialLocale?: Locale
}

export function I18nProvider({ children, initialLocale }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale || DEFAULT_LOCALE)

  useEffect(() => {
    // Read locale from cookie on mount
    const cookieLocale = getLocaleFromCookie()
    if (cookieLocale !== locale) {
      setLocaleState(cookieLocale)
    }
  }, [])

  const setLocale = async (newLocale: Locale) => {
    setLocaleState(newLocale)
    
    // Update cookie
    if (typeof window !== 'undefined') {
      document.cookie = `${LOCALE_COOKIE_NAME}=${newLocale}; path=/; max-age=31536000; SameSite=Lax`
    }

    // Call API to set locale (for server-side consistency)
    try {
      await fetch('/api/i18n/locale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale: newLocale }),
        credentials: 'include',
      })
    } catch (error) {
      console.error('[i18n] Failed to update locale cookie:', error)
    }
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale }}>
      {children}
    </I18nContext.Provider>
  )
}
