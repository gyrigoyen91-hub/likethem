import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Simple ping endpoint to verify /api/debug/* routes are being built
export async function GET() {
  return NextResponse.json({ 
    ok: true,
    timestamp: new Date().toISOString(),
    path: '/api/debug/ping',
  });
}
