'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale, useSetLocale } from './I18nProvider'
import { Globe } from 'lucide-react'
import type { Locale } from '@/lib/i18n/getLocale'

export default function LanguageSwitcher() {
  const locale = useLocale()
  const setLocale = useSetLocale()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const handleLocaleChange = async (newLocale: Locale) => {
    setLocale(newLocale)
    setIsOpen(false)
    // Refresh server components to pick up new locale
    router.refresh()
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2 py-1.5 text-sm text-neutral-700 hover:text-black transition-colors rounded-md hover:bg-black/5"
        aria-label="Change language"
        aria-expanded={isOpen}
      >
        <Globe className="h-4 w-4" />
        <span className="uppercase font-medium">{locale}</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
            <button
              onClick={() => handleLocaleChange('es')}
              className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                locale === 'es'
                  ? 'bg-gray-100 text-black font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="uppercase">ES</span>
              <span className="ml-2 text-xs text-gray-500">Español</span>
            </button>
            <button
              onClick={() => handleLocaleChange('en')}
              className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                locale === 'en'
                  ? 'bg-gray-100 text-black font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="uppercase">EN</span>
              <span className="ml-2 text-xs text-gray-500">English</span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}
