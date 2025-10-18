import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import { getSupabaseServer } from '@/lib/supabase-server';

// Ensure Node runtime (not Edge) so server env vars are available
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

console.log('[debug/curator] route loaded');

export async function GET(
  _req: Request,
  ctx: { params: { idOrSlug: string } }
) {
  const { idOrSlug } = ctx.params;

  try {
    // Gate: Only allow in development or for admin users
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    if (!isDevelopment) {
      const session = await getServerSession(authOptions)
      const isAdmin = session?.user?.role === 'ADMIN'
      
      if (!isAdmin) {
        return NextResponse.json({ 
          error: 'Not found' 
        }, { status: 404 })
      }
    }

    console.log('[debug/curator] idOrSlug =', idOrSlug);
    console.log('[debug/curator] url =', process.env.NEXT_PUBLIC_SUPABASE_URL);

    const supabaseServer = getSupabaseServer();

    // Add temporary probes to debug the query
    const { data: probeSlug } = await supabaseServer
      .from('curator_profiles')
      .select('id, slug, "isPublic"')
      .eq('slug', idOrSlug)
      .limit(1);
    console.log('[probe slug]', probeSlug);

    const { data: probeAll } = await supabaseServer
      .from('curator_profiles')
      .select('id, slug, "isPublic"')
      .limit(3);
    console.log('[probe all]', probeAll);

    // Try slug or id in one shot. Use maybeSingle() to avoid throwing on 0 rows.
    let { data, error } = await supabaseServer
      .from('curator_profiles')
      .select('id, slug, "isPublic", "createdAt", "updatedAt"')
      .or(`slug.eq.${idOrSlug},id.eq.${idOrSlug}`)
      .maybeSingle();

    // If the .or(...) didn't match because of quoting nuances, fall back to explicit attempts:
    if ((!data || error) && !idOrSlug.includes('-')) {
      const bySlug = await supabaseServer
        .from('curator_profiles')
        .select('id, slug, "isPublic", "createdAt", "updatedAt"')
        .eq('slug', idOrSlug)
        .maybeSingle();
      if (bySlug.data) {
        data = bySlug.data;
        error = null;
      }
    }
    if (!data && idOrSlug.includes('-')) {
      const byId = await supabaseServer
        .from('curator_profiles')
        .select('id, slug, "isPublic", "createdAt", "updatedAt"')
        .eq('id', idOrSlug)
        .maybeSingle();
      if (byId.data) {
        data = byId.data;
        error = null;
      }
    }

    console.log('[debug/curator] result:', { data, error });
    console.log('[debug/curator] returning response', { idOrSlug, data, error });

    if (!data) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ found: true, data }, { status: 200 });
  } catch (e: any) {
    console.error('[debug/curator] unexpected error', e);
    return NextResponse.json({ error: 'Server error', detail: String(e?.message || e) }, { status: 500 });
  }
}
