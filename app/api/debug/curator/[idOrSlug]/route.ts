export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server'; // the service-role client you added

export async function GET(
  _req: Request,
  { params }: { params: { idOrSlug: string } }
) {
  const idOrSlug = params?.idOrSlug ?? '';
  console.log('[debug/curator] route loaded, idOrSlug =', idOrSlug);

  const supabase = getSupabaseServer();

  // 1) Try by slug ONLY (no isPublic filter yet)
  const bySlug = await supabase
    .from('curator_profiles')
    .select('id, slug, "isPublic"')
    .eq('slug', idOrSlug)
    .maybeSingle();

  console.log('[debug/curator] bySlug', bySlug);

  // 2) If not found, try by id
  let row = bySlug.data ?? null;
  if (!row) {
    const byId = await supabase
      .from('curator_profiles')
      .select('id, slug, "isPublic"')
      .eq('id', idOrSlug)
      .maybeSingle();
    console.log('[debug/curator] byId', byId);
    row = byId.data ?? null;
  }

  if (!row) {
    console.log('[debug/curator] not found');
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Return raw row (we can re-add isPublic enforcement later)
  console.log('[debug/curator] FOUND', row);
  return NextResponse.json({ found: true, data: row });
}