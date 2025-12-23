import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public allowlist - these routes don't require authentication
  const publicPaths = [
    "/",
    "/explore",
    "/api/health",
    "/api/auth", // CRITICAL: NextAuth routes must be public
    "/api/curator/decision", // Public endpoint for email links
    "/auth/signin", // CRITICAL: allow sign-in page to avoid redirect loops
    "/_next",
    "/favicon.ico",
    "/images",
    "/curator",
    "/product",
    "/access",
    "/apply",
    "/auth",
    "/favorites",
    "/search",
    "/api/access",
    "/api/curators",
    "/api/products",
    "/api/search"
  ];
  
  if (publicPaths.some(p => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  // Auth-required paths (generic)
  const authPaths = ["/orders", "/sell", "/account", "/checkout", "/api/cart", "/api/orders", "/api/curator/apply"];
  if (authPaths.some(p => pathname === p || pathname.startsWith(p + "/"))) {
    return getToken({ req, secret: process.env.NEXTAUTH_SECRET })
      .then(token => {
        if (!token) {
          return NextResponse.redirect(new URL("/auth/signin", req.url));
        }
        return NextResponse.next();
      })
      .catch(() => NextResponse.redirect(new URL("/auth/signin", req.url)));
  }

  // Admin-only paths
  if (pathname.startsWith("/admin")) {
    return getToken({ req, secret: process.env.NEXTAUTH_SECRET })
      .then(token => {
        // Debug logging (no secrets)
        if (process.env.NODE_ENV !== 'production') {
          console.log('[MIDDLEWARE][ADMIN]', {
            path: pathname,
            hasToken: !!token,
            userId: token?.sub ? 'present' : 'missing',
            role: token?.role || 'missing',
          });
        }

        if (!token) {
          return NextResponse.redirect(new URL("/auth/signin", req.url));
        }
        if (token.role !== 'ADMIN') {
          console.warn('[MIDDLEWARE][ADMIN][ACCESS_DENIED]', {
            path: pathname,
            userId: token.sub,
            role: token.role,
            expectedRole: 'ADMIN',
          });
          return NextResponse.redirect(new URL("/unauthorized", req.url));
        }
        return NextResponse.next();
      })
      .catch((error) => {
        console.error('[MIDDLEWARE][ADMIN][ERROR]', {
          path: pathname,
          error: error instanceof Error ? error.message : String(error),
        });
        return NextResponse.redirect(new URL("/auth/signin", req.url));
      });
  }

  // Curator-only paths
  if (pathname === "/dashboard/curator" || pathname.startsWith("/dashboard/curator")) {
    return getToken({ req, secret: process.env.NEXTAUTH_SECRET })
      .then(token => {
        if (!token) {
          return NextResponse.redirect(new URL("/auth/signin", req.url));
        }
        if (token.role !== 'CURATOR') {
          return NextResponse.redirect(new URL("/unauthorized", req.url));
        }
        return NextResponse.next();
      })
      .catch(() => NextResponse.redirect(new URL("/auth/signin", req.url)));
  }

  return NextResponse.next();
}

export const config = {
  // CRITICAL: Only match specific protected routes, NOT /api/auth/*
  // The negative lookahead ensures /api/auth is NEVER matched
  // Also exclude /api/debug to allow debug endpoints
  matcher: [
    "/((?!api/auth|api/debug|_next/static|_next/image|favicon.ico|images|api/health).*)",
  ],
}; 