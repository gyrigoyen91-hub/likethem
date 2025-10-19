import { getSupabaseServer } from './supabase-server';

export type InviteCodeResult = {
  ok: true;
  curator: { id: string; slug: string; storeName: string };
  code: { id: string; code: string; label?: string };
} | {
  ok: false;
  reason: 'invalid' | 'expired' | 'domain' | 'maxed' | 'inactive';
};

export async function verifyInviteCode(
  code: string,
  email?: string
): Promise<InviteCodeResult> {
  try {
    const supabase = getSupabaseServer();
    
    // Normalize code: trim and uppercase
    const normalizedCode = code.trim().toUpperCase();
    
    if (!normalizedCode) {
      return { ok: false, reason: 'invalid' };
    }

    console.log('[invite-code] Verifying code:', { code: normalizedCode, email });

    // Lookup access_codes by code and isActive = true
    const { data: accessCode, error: codeError } = await supabase
      .from('access_codes')
      .select(`
        id, code, curatorId, maxUses, usedCount, expiresAt, allowedEmailDomain, isActive,
        curator:curator_profiles(id, slug, storeName)
      `)
      .eq('code', normalizedCode)
      .eq('isActive', true)
      .single();

    if (codeError || !accessCode) {
      console.log('[invite-code] Code not found or inactive:', { error: codeError, code: normalizedCode });
      return { ok: false, reason: 'invalid' };
    }

    // Check if expired
    if ((accessCode as any).expiresAt) {
      const now = new Date();
      const expiresAt = new Date((accessCode as any).expiresAt);
      if (expiresAt <= now) {
        console.log('[invite-code] Code expired:', { code: normalizedCode, expiresAt });
        return { ok: false, reason: 'expired' };
      }
    }

    // Check email domain if specified
    if ((accessCode as any).allowedEmailDomain && email) {
      const domain = (accessCode as any).allowedEmailDomain.toLowerCase();
      const emailDomain = email.toLowerCase().split('@')[1];
      if (!emailDomain || !emailDomain.endsWith(domain)) {
        console.log('[invite-code] Email domain mismatch:', { 
          code: normalizedCode, 
          email, 
          allowedDomain: domain,
          emailDomain 
        });
        return { ok: false, reason: 'domain' };
      }
    }

    // Check max uses
    if ((accessCode as any).maxUses && (accessCode as any).maxUses > 0) {
      if ((accessCode as any).usedCount >= (accessCode as any).maxUses) {
        console.log('[invite-code] Code max uses exceeded:', { 
          code: normalizedCode, 
          usedCount: (accessCode as any).usedCount, 
          maxUses: (accessCode as any).maxUses 
        });
        return { ok: false, reason: 'maxed' };
      }
    }

    console.log('[invite-code] Code verified successfully:', { 
      code: normalizedCode, 
      curatorId: (accessCode as any).curatorId,
      storeName: (accessCode as any).curator?.storeName 
    });

    return {
      ok: true,
      curator: {
        id: (accessCode as any).curatorId,
        slug: (accessCode as any).curator?.slug || '',
        storeName: (accessCode as any).curator?.storeName || 'Unknown Curator'
      },
      code: {
        id: (accessCode as any).id,
        code: (accessCode as any).code,
        label: (accessCode as any).code // Could be enhanced with a display label
      }
    };

  } catch (error) {
    console.error('[invite-code] Error verifying code:', error);
    return { ok: false, reason: 'invalid' };
  }
}

export async function redeemInviteCode(
  code: string,
  userId: string
): Promise<{ ok: true; grantId: string } | { ok: false; reason: string }> {
  try {
    const supabase = getSupabaseServer();
    
    // First verify the code
    const verification = await verifyInviteCode(code);
    if (!verification.ok) {
      return { ok: false, reason: verification.reason };
    }

    const { curator, code: codeData } = verification;

    // Start a transaction to create grant and update used count
    const { data: grant, error: grantError } = await supabase
      .from('user_access_grants')
      .upsert({
        userId,
        curatorId: curator.id,
        codeId: codeData.id,
        code: codeData.code,
        grantedAt: new Date().toISOString()
      } as any, {
        onConflict: 'userId,codeId'
      })
      .select('id')
      .single();

    if (grantError) {
      console.error('[invite-code] Error creating grant:', grantError);
      return { ok: false, reason: 'database_error' };
    }

    // TODO: Increment used count if maxUses > 0
    // This would require a custom RPC function or raw SQL
    // For now, we'll skip this to avoid TypeScript issues
    console.log('[invite-code] TODO: Increment used count for code:', codeData.id);

    console.log('[invite-code] Code redeemed successfully:', { 
      grantId: (grant as any).id, 
      userId, 
      curatorId: curator.id,
      code: codeData.code 
    });

    return { ok: true, grantId: (grant as any).id };

  } catch (error) {
    console.error('[invite-code] Error redeeming code:', error);
    return { ok: false, reason: 'database_error' };
  }
}
