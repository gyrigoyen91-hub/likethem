import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Never run middleware on these (static, images, favicon, healthcheck, OG, etc.)
export const config = {
  matcher: [
    // Run on everything *except* the paths below
    '/((?!_next/static|_next/image|favicon.ico|images|public|api/health|robots.txt|sitemap.xml).*)',
  ],
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Early-allow list of *public* pages (home, explore/discover, curator/slug, product detail, access, sell apply, etc.)
  const PUBLIC_PREFIXES = [
    '/', '/discover', '/curator', '/product', '/access', '/sell', '/apply', '/api/access', '/api/health',
  ];
  if (PUBLIC_PREFIXES.some(p => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next();
  }

  // Health & static were already excluded by matcher, but double-guard:
  if (pathname.startsWith('/api/health')) {
    return NextResponse.next();
  }

  // ===== Protected routes that require authentication =====
  const PROTECTED_PREFIXES = ['/dashboard', '/account', '/checkout', '/orders', '/api/cart', '/api/orders', '/api/curator'];
  
  if (PROTECTED_PREFIXES.some(p => pathname.startsWith(p + '/'))) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token) {
      return NextResponse.redirect(new URL('/auth/signin', req.url));
    }

    // Check for CURATOR role on dashboard routes
    if (pathname.startsWith('/dashboard/curator') && token.role !== 'CURATOR') {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    // Check for ADMIN role on admin routes
    if (pathname.startsWith('/dashboard/admin') && token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    return NextResponse.next();
  }

  // Default allow
  return NextResponse.next();
} 