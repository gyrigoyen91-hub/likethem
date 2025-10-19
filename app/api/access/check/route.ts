import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { hasAccess } from '@/lib/access-check';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    
    const userHasAccess = await hasAccess(userId);
    
    return NextResponse.json({ hasAccess: userHasAccess });

  } catch (error) {
    console.error('[api/access/check] Error:', error);
    return NextResponse.json({ hasAccess: false });
  }
}
