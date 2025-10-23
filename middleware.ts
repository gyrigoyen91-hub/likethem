import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Public routes (never require auth)
const PUBLIC_ROUTES = [
  '/',                    // Home
  '/discover',            // Discover Curators
  '/curator',             // Curator closets (list + detail)
  '/products',            // Product detail pages
  '/access',              // Request/verify access
  '/apply',               // Apply to Sell
  '/api/access',          // Invite code endpoints
  '/api/public',          // any public APIs you have
  '/_next', '/favicon.ico', '/images', '/public'
]

// Private routes (require auth)
const PRIVATE_PREFIXES = [
  '/dashboard',
  '/account',
  '/orders',
  '/api/admin',
  '/api/private'
]

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow all obvious static/public assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/public') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  // Allow known public routes (prefix match)
  if (PUBLIC_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'))) {
    return NextResponse.next()
  }

  // For private prefixes, enforce auth
  if (PRIVATE_PREFIXES.some(pref => pathname.startsWith(pref))) {
    const token = await getToken({ req })
    if (!token) {
      const url = req.nextUrl.clone()
      url.pathname = '/sign-in' // or your sign-in page
      url.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

// Only run middleware on routes we actually need
export const config = {
  matcher: [
    // NOTE: do NOT match the whole site; limit to app paths
    '/((?!_next|images|public|favicon.ico).*)',
  ],
} 