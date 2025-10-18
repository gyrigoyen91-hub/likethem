import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(_req: Request, { params }: { params: { idOrSlug: string } }) {
  const s = getSupabaseServer();
  const { data: cur } = await s.from('curator_profiles')
    .select('id, slug, "isPublic"')
    .or(`slug.eq.${params.idOrSlug},id.eq.${params.idOrSlug}`)
    .single();

  if (!cur) return NextResponse.json({ found: false });

  const { data: prods } = await s.from('products')
    .select('id, title, price, "isActive", "createdAt"')
    .eq('curatorId', (cur as any).id)
    .eq('isActive', true)
    .order('createdAt', { ascending: false });

  return NextResponse.json({ found: true, count: (prods ?? []).length, products: prods ?? [] });
}
