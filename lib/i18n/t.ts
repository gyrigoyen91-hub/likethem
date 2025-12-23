import type { Locale } from './getLocale'
import esTranslations from '@/locales/es/common.json'
import enTranslations from '@/locales/en/common.json'

type TranslationKey = keyof typeof esTranslations

const translations = {
  es: esTranslations,
  en: enTranslations,
} as const

/**
 * Server-safe translation function.
 * Use in server components and API routes.
 * 
 * @param locale - The locale to use ('es' | 'en')
 * @param key - Translation key (e.g., 'nav.dress')
 * @param params - Optional parameters for string interpolation
 * @returns Translated string or the key if translation is missing
 */
export function t(
  locale: Locale,
  key: TranslationKey,
  params?: Record<string, string | number>
): string {
  const localeTranslations = translations[locale] || translations.es
  let translation = localeTranslations[key] || key

  // Simple parameter interpolation: {name} -> params.name
  if (params) {
    Object.entries(params).forEach(([paramKey, value]) => {
      translation = translation.replace(
        new RegExp(`\\{${paramKey}\\}`, 'g'),
        String(value)
      )
    })
  }

  // In development, log missing keys
  if (process.env.NODE_ENV === 'development' && !localeTranslations[key]) {
    console.warn(`[i18n] Missing translation key: ${key} for locale: ${locale}`)
  }

  return translation
}

/**
 * Get all translations for a locale (useful for client-side hydration)
 */
export function getTranslations(locale: Locale) {
  return translations[locale] || translations.es
}
