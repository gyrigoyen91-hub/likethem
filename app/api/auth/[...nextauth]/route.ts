import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest } from "next/server";

// IMPORTANT: NextAuth requires Node.js runtime
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const handler = NextAuth(authOptions);

// Generate correlation ID for request tracking
function getCorrelationId(): string {
  return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Wrap handlers to add debug logging and error handling
export async function GET(req: NextRequest, ctx: { params: Promise<{ nextauth: string[] }> }) {
  const correlationId = getCorrelationId();
  const url = req.url;
  const pathname = req.nextUrl.pathname;
  const searchParams = Object.fromEntries(req.nextUrl.searchParams);
  
  console.log(`[AUTH][GET][${correlationId}]`, {
    url,
    pathname,
    searchParams,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    hasSecret: !!process.env.NEXTAUTH_SECRET,
    hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
    hasGoogleSecret: !!process.env.GOOGLE_CLIENT_SECRET,
  });
  
  try {
    const response = await handler(req, ctx);
    
    // Log successful OAuth callback
    if (pathname.includes('callback') && searchParams.code) {
      console.log(`[AUTH][GET][${correlationId}][SUCCESS]`, {
        provider: searchParams.provider || 'unknown',
        hasCode: !!searchParams.code,
        hasError: !!searchParams.error,
      });
    }
    
    return response;
  } catch (error) {
    console.error(`[AUTH][GET][${correlationId}][ERROR]`, {
      url,
      pathname,
      searchParams,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      errorName: error instanceof Error ? error.name : undefined,
    });
    
    // Don't expose internal errors to client, but log them
    throw error;
  }
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ nextauth: string[] }> }) {
  const correlationId = getCorrelationId();
  const url = req.url;
  const pathname = req.nextUrl.pathname;
  const searchParams = Object.fromEntries(req.nextUrl.searchParams);
  
  console.log(`[AUTH][POST][${correlationId}]`, {
    url,
    pathname,
    searchParams,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    hasSecret: !!process.env.NEXTAUTH_SECRET,
  });
  
  try {
    const response = await handler(req, ctx);
    return response;
  } catch (error) {
    console.error(`[AUTH][POST][${correlationId}][ERROR]`, {
      url,
      pathname,
      searchParams,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      errorName: error instanceof Error ? error.name : undefined,
    });
    throw error;
  }
} 