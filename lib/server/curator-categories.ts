import { getSupabaseServer } from '@/lib/supabase-server';
import { 
  getMockProductsByCurator, 
  getMockActiveDrop 
} from '@/lib/mock-data';

export type Tier = 'PUBLIC' | 'INNER' | 'DROP';

export type CategoryCount = {
  category: string;
  count: number;
};

export async function getCategoryCountsByTier(params: {
  curatorId: string;
  tier: Tier;
  activeDropId?: string | null;
  useMockData?: boolean;
}): Promise<CategoryCount[]> {
  const { curatorId, tier, activeDropId, useMockData = false } = params;

  if (useMockData) {
    // Use mock data for development
    const allProducts = getMockProductsByCurator(curatorId);
    let filteredProducts = allProducts;

    if (tier === 'DROP') {
      filteredProducts = allProducts.filter(p => p.visibility === 'drop' && p.dropId === activeDropId);
    } else if (tier === 'PUBLIC') {
      filteredProducts = allProducts.filter(p => p.visibility === 'general');
    } else if (tier === 'INNER') {
      filteredProducts = allProducts.filter(p => p.visibility === 'inner');
    }

    const map = new Map<string, number>();
    for (const product of filteredProducts) {
      const key = product.category || 'Other';
      map.set(key, (map.get(key) ?? 0) + 1);
    }

    return Array.from(map.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => a.category.localeCompare(b.category));
  }

  // Use Supabase when available
  try {
    const sb = getSupabaseServer();

    let q = sb
      .from('products')
      .select('category', { count: 'exact', head: false })
      .eq('isActive', true)
      .eq('curatorId', curatorId);

    if (tier === 'DROP') {
      q = q.eq('visibility', 'DROP').eq('dropId', activeDropId ?? '');
    } else if (tier === 'PUBLIC') {
      q = q.eq('visibility', 'PUBLIC');
    } else {
      q = q.eq('visibility', 'INNER');
    }

    const { data, error } = await q;
    if (error) throw error;

    const map = new Map<string, number>();
    for (const row of data ?? []) {
      const key = (row as any).category ?? 'Other';
      map.set(key, (map.get(key) ?? 0) + 1);
    }

    return Array.from(map.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => a.category.localeCompare(b.category));
  } catch (error) {
    console.error('[getCategoryCountsByTier] Supabase error, using mock data:', error);
    // Fallback to mock data
    return getCategoryCountsByTier({ ...params, useMockData: true });
  }
}
