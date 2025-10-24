import { NextResponse, type NextRequest } from 'next/server';

// Never run middleware on these (static, images, favicon, healthcheck, OG, etc.)
export const config = {
  matcher: [
    // Run on everything *except* the paths below
    '/((?!_next/static|_next/image|favicon.ico|images|public|api/health|robots.txt|sitemap.xml).*)',
  ],
};

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Early-allow list of *public* pages (home, explore/discover, curator/slug, product detail, access, sell apply, etc.)
  const PUBLIC_PREFIXES = [
    '/', '/discover', '/curator', '/product', '/access', '/sell', '/apply', '/api/access',
  ];
  if (PUBLIC_PREFIXES.some(p => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next();
  }

  // Health & static were already excluded by matcher, but double-guard:
  if (pathname.startsWith('/api/health')) {
    return NextResponse.next();
  }

  // ===== Your real protection starts here =====
  // Example: only guard checkout/order/cart APIs
  const PROTECTED_PREFIXES = ['/checkout', '/api/cart', '/api/orders'];
  if (PROTECTED_PREFIXES.some(p => pathname.startsWith(p + '/'))) {
    // Place your existing session/invite-code check here.
    // If unauthorized, return NextResponse.redirect(...) or NextResponse.json(..., { status: 401 })
    return NextResponse.next();
  }

  // Default allow
  return NextResponse.next();
} 