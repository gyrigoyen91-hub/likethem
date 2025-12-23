export type Locale = 'es' | 'en'

const DEFAULT_LOCALE: Locale = 'es'
const LOCALE_COOKIE_NAME = 'likethem_locale'

/**
 * Get the current locale from cookies.
 * Defaults to 'es' (Spanish) if no cookie is set.
 * Works in server components and API routes.
 * 
 * NOTE: This must be imported only in server components.
 * For client components, use I18nProvider/useLocale hook.
 */
export async function getLocale(): Promise<Locale> {
  // Dynamic import to avoid bundling next/headers in client code
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  const localeCookie = cookieStore.get(LOCALE_COOKIE_NAME)
  
  if (localeCookie?.value === 'en' || localeCookie?.value === 'es') {
    return localeCookie.value as Locale
  }
  
  return DEFAULT_LOCALE
}

/**
 * Get locale from request headers (for API routes).
 */
export function getLocaleFromHeaders(headers: Headers): Locale {
  const cookieHeader = headers.get('cookie')
  if (!cookieHeader) return DEFAULT_LOCALE
  
  const match = cookieHeader.match(new RegExp(`${LOCALE_COOKIE_NAME}=([^;]+)`))
  if (match && (match[1] === 'en' || match[1] === 'es')) {
    return match[1] as Locale
  }
  
  return DEFAULT_LOCALE
}

/**
 * Client-side function to read locale from cookie.
 * Use this in client components.
 */
export function getLocaleFromCookie(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE
  
  const cookieValue = document.cookie
    .split('; ')
    .find(row => row.startsWith(`${LOCALE_COOKIE_NAME}=`))
    ?.split('=')[1]
  
  if (cookieValue === 'en' || cookieValue === 'es') {
    return cookieValue as Locale
  }
  
  return DEFAULT_LOCALE
}

export { LOCALE_COOKIE_NAME, DEFAULT_LOCALE }
