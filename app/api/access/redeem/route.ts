import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redeemInviteCode } from '@/lib/invite-code';
import { cookies } from 'next/headers';
import { SignJWT } from 'jose';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'fallback-secret');

async function createAccessCookie(grantId: string, code: string, curatorId: string) {
  const token = await new SignJWT({
    g: grantId,
    c: code,
    cid: curatorId,
    t: Date.now()
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('180d')
    .sign(JWT_SECRET);

  return token;
}

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { ok: false, reason: 'unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { code } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { ok: false, reason: 'invalid' },
        { status: 400 }
      );
    }

    // Add small delay to prevent brute force
    await new Promise(resolve => setTimeout(resolve, 150));

    const result = await redeemInviteCode(code, session.user.id);

    if (!result.ok) {
      console.log('[api/access/redeem] Redemption failed:', { 
        userId: session.user.id, 
        code: code.trim().toUpperCase(), 
        reason: result.reason 
      });
      return NextResponse.json(result);
    }

    // Get the grant details for the cookie
    const { getSupabaseServer } = await import('@/lib/supabase-server');
    const supabase = getSupabaseServer();
    
    const { data: grant } = await supabase
      .from('user_access_grants')
      .select('code, curatorId')
      .eq('id', result.grantId)
      .single();

    if (!grant) {
      console.error('[api/access/redeem] Grant not found after creation');
      return NextResponse.json(
        { ok: false, reason: 'database_error' },
        { status: 500 }
      );
    }

    // Create and set the access cookie
    const cookieValue = await createAccessCookie(
      result.grantId,
      (grant as any).code,
      (grant as any).curatorId
    );

    const cookieStore = cookies();
    cookieStore.set('lt_access', cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 180 * 24 * 60 * 60, // 180 days
      path: '/'
    });

    console.log('[api/access/redeem] Access granted:', { 
      userId: session.user.id, 
      grantId: result.grantId,
      curatorId: (grant as any).curatorId,
      code: (grant as any).code 
    });

    return NextResponse.json({
      ok: true,
      redirect: '/explore?access=granted'
    });

  } catch (error) {
    console.error('[api/access/redeem] Error:', error);
    return NextResponse.json(
      { ok: false, reason: 'server_error' },
      { status: 500 }
    );
  }
}
