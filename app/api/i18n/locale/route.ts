import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { LOCALE_COOKIE_NAME, DEFAULT_LOCALE } from '@/lib/i18n/getLocale'
import type { Locale } from '@/lib/i18n/getLocale'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { locale } = body

    if (locale !== 'en' && locale !== 'es') {
      return NextResponse.json(
        { error: 'Invalid locale. Must be "en" or "es".' },
        { status: 400 }
      )
    }

    const cookieStore = await cookies()
    cookieStore.set(LOCALE_COOKIE_NAME, locale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: 'lax',
      httpOnly: false, // Allow client-side access
    })

    return NextResponse.json({ ok: true, locale })
  } catch (error) {
    console.error('[i18n] Error setting locale:', error)
    return NextResponse.json(
      { error: 'Failed to set locale' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies()
    const localeCookie = cookieStore.get(LOCALE_COOKIE_NAME)
    const locale = (localeCookie?.value === 'en' || localeCookie?.value === 'es')
      ? localeCookie.value as Locale
      : DEFAULT_LOCALE

    return NextResponse.json({ locale })
  } catch (error) {
    return NextResponse.json({ locale: DEFAULT_LOCALE })
  }
}
