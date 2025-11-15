import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest } from "next/server";

// IMPORTANT: NextAuth requires Node.js runtime
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const handler = NextAuth(authOptions);

// Wrap handlers to add debug logging and error handling
export async function GET(req: NextRequest, ctx: { params: Promise<{ nextauth: string[] }> }) {
  const url = req.url;
  const pathname = req.nextUrl.pathname;
  
  console.log("[AUTH][GET]", {
    url,
    pathname,
    searchParams: Object.fromEntries(req.nextUrl.searchParams),
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  });
  
  try {
    return await handler(req, ctx);
  } catch (error) {
    console.error("[AUTH][GET][ERROR]", {
      url,
      pathname,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ nextauth: string[] }> }) {
  const url = req.url;
  const pathname = req.nextUrl.pathname;
  
  console.log("[AUTH][POST]", {
    url,
    pathname,
    searchParams: Object.fromEntries(req.nextUrl.searchParams),
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  });
  
  try {
    return await handler(req, ctx);
  } catch (error) {
    console.error("[AUTH][POST][ERROR]", {
      url,
      pathname,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
} 