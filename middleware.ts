import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

    // Define role hierarchy
    const roleHierarchy: Record<string, number> = {
      'BUYER': 1,
      'CURATOR': 2,
      'ADMIN': 3
    }

    function hasRole(userRole: string, requiredRole: string): boolean {
      return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
    }

    // Protect curator dashboard routes
    if (pathname.startsWith('/dashboard/curator')) {
      if (!token || !hasRole(token.role as string, 'CURATOR')) {
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }
    }

    // Protect admin routes
    if (pathname.startsWith('/admin')) {
      if (!token || !hasRole(token.role as string, 'ADMIN')) {
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }
    }

    // Protect /sell route (requires authentication)
    if (pathname === '/sell') {
      if (!token) {
        return NextResponse.redirect(new URL('/auth/signin?redirect=/sell', req.url))
      }
    }

    // Protect account routes (requires authentication)
    if (pathname.startsWith('/account') || pathname.startsWith('/orders') || pathname.startsWith('/favorites')) {
      if (!token) {
        return NextResponse.redirect(new URL('/auth/signin', req.url))
      }
    }

    // Redirect authenticated users away from auth pages
    if (token && (pathname.startsWith('/auth/signin') || pathname.startsWith('/auth/signup'))) {
      if (hasRole(token.role as string, 'CURATOR')) {
        return NextResponse.redirect(new URL('/dashboard/curator', req.url))
      } else if (hasRole(token.role as string, 'ADMIN')) {
        return NextResponse.redirect(new URL('/admin', req.url))
      } else {
        // Check if there's a redirect parameter
        const redirectTo = req.nextUrl.searchParams.get('redirect')
        if (redirectTo) {
          return NextResponse.redirect(new URL(redirectTo, req.url))
        }
        return NextResponse.redirect(new URL('/', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to auth pages without authentication
        if (req.nextUrl.pathname.startsWith('/auth/')) {
          return true
        }
        // Allow access to public pages without authentication
        if (req.nextUrl.pathname === '/' || 
            req.nextUrl.pathname.startsWith('/explore') ||
            req.nextUrl.pathname.startsWith('/product/') ||
            req.nextUrl.pathname.startsWith('/curator/') ||
            req.nextUrl.pathname === '/unauthorized') {
          return true
        }
        // Require authentication for protected routes
        return !!token
      }
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/auth/:path*',
    '/sell',
    '/account/:path*',
    '/orders/:path*',
    '/favorites/:path*',
    '/api/protected/:path*'
  ]
} 