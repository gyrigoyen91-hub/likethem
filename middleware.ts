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
        if (!token) {
          return NextResponse.redirect(new URL("/auth/signin", req.url));
        }
        if (token.role !== 'ADMIN') {
          return NextResponse.redirect(new URL("/unauthorized", req.url));
        }
        return NextResponse.next();
      })
      .catch(() => NextResponse.redirect(new URL("/auth/signin", req.url)));
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
  // Exclude /api/auth entirely from matching
  matcher: [
    "/((?!api/auth|api/health|_next/static|_next/image|favicon.ico|images).*)",
    "/sell/:path*",
    "/orders/:path*",
    "/dashboard/curator/:path*",
    "/admin/:path*",
    "/api/curator/apply",
    "/account/:path*",
    "/checkout/:path*",
    "/api/cart/:path*",
    "/api/orders/:path*",
  ],
}; 