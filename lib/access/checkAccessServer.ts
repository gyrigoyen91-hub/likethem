import { headers } from 'next/headers';
import { getSupabaseServer } from '../supabase-server';

export async function checkAccessServer(curatorId?: string): Promise<boolean> {
  try {
    const supabase = getSupabaseServer();
    
    // Get the access cookie from headers
    const headersList = headers();
    const cookieHeader = headersList.get('cookie');
    
    if (!cookieHeader) {
      return false;
    }

    // Parse the lt_access cookie
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    const accessToken = cookies['lt_access'];
    if (!accessToken) {
      return false;
    }

    // Verify the JWT token
    const { jwtVerify } = await import('jose');
    const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'fallback-secret');
    
    try {
      const { payload } = await jwtVerify(accessToken, JWT_SECRET);
      const grant: any = {
        grantId: payload.g,
        code: payload.c,
        curatorId: payload.cid,
        timestamp: payload.t
      };

      // Verify the grant still exists in the database
      const { data: dbGrant } = await supabase
        .from('user_access_grants')
        .select('id, curatorId')
        .eq('id', grant.grantId)
        .single();

      if (dbGrant && (!curatorId || dbGrant.curatorId === curatorId)) {
        console.log('[access-check-server] Valid grant found:', { grantId: grant.grantId, curatorId: dbGrant.curatorId });
        return true;
      }
    } catch (error) {
      console.log('[access-check-server] Invalid or expired cookie:', error);
    }

    return false;

  } catch (error) {
    console.error('[access-check-server] Error checking access:', error);
    return false;
  }
}
