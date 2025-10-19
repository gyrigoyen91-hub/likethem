import { NextResponse } from 'next/server';
import { verifyInviteCode } from '@/lib/invite-code';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, code } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { ok: false, reason: 'invalid' },
        { status: 400 }
      );
    }

    // Add small delay to prevent brute force
    await new Promise(resolve => setTimeout(resolve, 150));

    const result = await verifyInviteCode(code, email);

    console.log('[api/access/verify] Result:', { 
      code: code.trim().toUpperCase(), 
      email, 
      ok: result.ok,
      reason: result.ok ? 'success' : result.reason 
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error('[api/access/verify] Error:', error);
    return NextResponse.json(
      { ok: false, reason: 'server_error' },
      { status: 500 }
    );
  }
}
