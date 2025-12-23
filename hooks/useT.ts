'use client'

import { useLocale } from '@/components/i18n/I18nProvider'
import { getTranslations } from '@/lib/i18n/t'
import type { Locale } from '@/lib/i18n/getLocale'

type TranslationKey = keyof ReturnType<typeof getTranslations>

/**
 * Client-side translation hook.
 * Use in client components.
 * 
 * @example
 * const t = useT()
 * <h1>{t('nav.dress')}</h1>
 */
export function useT() {
  const locale = useLocale()

  return function t(
    key: TranslationKey,
    params?: Record<string, string | number>
  ): string {
    const translations = getTranslations(locale)
    let translation = translations[key] || key

    // Simple parameter interpolation
    if (params) {
      Object.entries(params).forEach(([paramKey, value]) => {
        translation = translation.replace(
          new RegExp(`\\{${paramKey}\\}`, 'g'),
          String(value)
        )
      })
    }

    // In development, log missing keys
    if (process.env.NODE_ENV === 'development' && !translations[key]) {
      console.warn(`[i18n] Missing translation key: ${key} for locale: ${locale}`)
    }

    return translation
  }
}
