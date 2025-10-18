export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

export async function GET() {
  console.log('[debug/route-ok] alive');
  return NextResponse.json({ ok: true, ts: Date.now() });
}
