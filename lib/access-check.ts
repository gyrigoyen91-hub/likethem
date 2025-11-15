import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { getSupabaseServer } from './supabase-server';

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'fallback-secret');

export interface AccessGrant {
  grantId: string;
  code: string;
  curatorId: string;
  timestamp: number;
}

export async function getAccessGrant(userId?: string): Promise<AccessGrant | null> {
  try {
    // First try to get from cookie
    const cookieStore = cookies();
    const accessCookie = cookieStore.get('lt_access');
    
    if (accessCookie?.value) {
      try {
        const { payload } = await jwtVerify(accessCookie.value, JWT_SECRET);
        const grant: AccessGrant = {
          grantId: payload.g as string,
          code: payload.c as string,
          curatorId: payload.cid as string,
          timestamp: payload.t as number
        };
        
        // Verify the grant still exists in the database
        const supabase = getSupabaseServer();
        const { data: dbGrant } = await supabase
          .from('user_access_grants')
          .select('id, code, curatorId')
          .eq('id', grant.grantId)
          .single();
          
        if (dbGrant) {
          console.log('[access-check] Valid grant from cookie:', { grantId: grant.grantId, curatorId: grant.curatorId });
          return grant;
        }
      } catch (error) {
        console.log('[access-check] Invalid or expired cookie:', error);
      }
    }

    // If no valid cookie and user is signed in, check database
    if (userId) {
      const supabase = getSupabaseServer();
      const { data: grant } = await supabase
        .from('user_access_grants')
        .select('id, code, curatorId, grantedAt')
        .eq('userId', userId)
        .order('grantedAt', { ascending: false })
        .limit(1)
        .single();
        
      if (grant) {
        console.log('[access-check] Valid grant from database:', { grantId: (grant as any).id, curatorId: (grant as any).curatorId });
        return {
          grantId: (grant as any).id,
          code: (grant as any).code,
          curatorId: (grant as any).curatorId,
          timestamp: new Date((grant as any).grantedAt).getTime()
        };
      }
    }

    console.log('[access-check] No valid access grant found');
    return null;

  } catch (error) {
    console.error('[access-check] Error checking access grant:', error);
    return null;
  }
}

export async function hasAccess(userId?: string): Promise<boolean> {
  const grant = await getAccessGrant(userId);
  return grant !== null;
}
