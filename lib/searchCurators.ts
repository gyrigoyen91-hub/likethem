// lib/searchCurators.ts
import { getSupabaseServer } from "@/lib/supabase-server";
import { mockCurators } from "@/lib/mock-data";

export type CuratorCard = {
  id: string;
  slug: string;
  storeName: string;
  city: string | null;
  bannerImage: string | null;
  isEditorsPick: boolean;
  followersCount: number | null;
  gender: "male" | "female" | "unisex" | null;
};

type SearchResult = {
  id: string;
  slug: string;
  storeName: string;
  city?: string | null;
  bannerImage?: string | null;
  isEditorsPick: boolean;
};

type Filters = {
  genders?: string[];   // ['female','male','unisex']
  fol?: string[];       // ['micro','macro','mega']
};

function followersRangeSQL(fol: string): [number | null, number | null] {
  switch (fol) {
    case "micro": return [0, 500_000];         // 0–500k
    case "macro": return [500_000, 2_000_000]; // 500k–2M
    case "mega":  return [2_000_000, null];    // 2M+
    default: return [null, null];
  }
}

/**
 * Default listing (no q & no filters): editors pick first, then followers desc, limited & paginated.
 */
export async function listCuratorsDefault(limit = 24, from = 0): Promise<CuratorCard[]> {
  try {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("curator_profiles")
      .select("id, slug, storeName, city, bannerImage, isEditorsPick, followersCount, gender")
      .eq("isPublic", true)
      .order("isEditorsPick", { ascending: false })
      .order("followersCount", { ascending: false, nullsFirst: false })
      .order("storeName", { ascending: true })
      .range(from, from + limit - 1);

    if (error) {
      console.error("listCuratorsDefault error:", error);
      return listMockCuratorsDefault(limit, from);
    }
    return (data ?? []) as CuratorCard[];
  } catch (error) {
    console.error("listCuratorsDefault error:", error);
    return listMockCuratorsDefault(limit, from);
  }
}

/**
 * Filtered & searched listing.
 * If q is provided, combine with ilike across name/slug/bio/city.
 * Apply gender & followers ranges when provided.
 */
export async function searchCuratorsAdvanced(
  q: string | null,
  filters: Filters,
  limit = 24,
  from = 0
): Promise<CuratorCard[]> {
  try {
    const supabase = getSupabaseServer();
    let query = supabase
      .from("curator_profiles")
      .select("id, slug, storeName, city, bannerImage, isEditorsPick, followersCount, gender")
      .eq("isPublic", true);

    if (q && q.trim()) {
      const term = q.trim();
      // Use unaccent view if you created it; otherwise plain ilike across fields
      query = query.or(
        `"storeName".ilike.%${term}%,slug.ilike.%${term}%,bio.ilike.%${term}%,city.ilike.%${term}%`
      );
    }

    // Gender filter (multi)
    if (filters.genders && filters.genders.length > 0) {
      query = query.in("gender", filters.genders);
    }

    // Followers ranges (multi) — build OR across ranges
    if (filters.fol && filters.fol.length > 0) {
      // Supabase doesn't support grouped OR easily in one call,
      // so we fetch broader and filter in JS if needed for multi ranges.
      // For decent perf, compute an overall min/max envelope:
      let min = Number.POSITIVE_INFINITY;
      let max = Number.NEGATIVE_INFINITY;
      let hasOpenMax = false;

      for (const tag of filters.fol) {
        const [lo, hi] = followersRangeSQL(tag);
        if (lo !== null) min = Math.min(min, lo);
        if (hi === null) hasOpenMax = true; else max = Math.max(max, hi);
      }

      if (min !== Number.POSITIVE_INFINITY) query = query.gte("followersCount", min);
      if (!hasOpenMax && max !== Number.NEGATIVE_INFINITY) query = query.lte("followersCount", max);

      // We'll still refine in JS below in case multiple buckets are chosen.
    }

    query = query
      .order("isEditorsPick", { ascending: false })
      .order("followersCount", { ascending: false, nullsFirst: false })
      .order("storeName", { ascending: true })
      .range(from, from + limit - 1);

    const { data, error } = await query;
    if (error) {
      console.error("searchCuratorsAdvanced error:", error);
      return searchMockCuratorsAdvanced(q, filters, limit, from);
    }

    let rows = (data ?? []) as CuratorCard[];

    // If multiple follower buckets selected, finalize by exact bucket match
    if (filters.fol && filters.fol.length > 0) {
      rows = rows.filter((r) => {
        const fc = r.followersCount ?? 0;
        return filters.fol!.some((tag) => {
          const [lo, hi] = followersRangeSQL(tag);
          if (lo !== null && fc < lo) return false;
          if (hi !== null && fc >= hi) return false;
          return true;
        });
      });
    }
    return rows;
  } catch (error) {
    console.error("searchCuratorsAdvanced error:", error);
    return searchMockCuratorsAdvanced(q, filters, limit, from);
  }
}

// Legacy function for header search
export async function searchCurators(q: string, limit = 12): Promise<SearchResult[]> {
  const term = q.trim();
  if (!term) return [];

  // Normalize for diacritics (client-side) so 'Sofia' matches 'Sofía'
  const clientKey = term.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  try {
    const supabase = getSupabaseServer();
    
    // Build a loose OR across key fields, limited by isPublic
    const { data, error } = await supabase
      .from("curator_profiles")
      .select("id, slug, storeName, city, bannerImage, isEditorsPick")
      .or(`storeName.ilike.%${clientKey}%,slug.ilike.%${clientKey}%,bio.ilike.%${clientKey}%,city.ilike.%${clientKey}%`)
      .eq("isPublic", true)
      .limit(limit);

    if (error) {
      console.error("search error:", error);
      // Fall back to mock data
      return searchMockCurators(clientKey, limit);
    }

    return (data ?? []) as SearchResult[];
  } catch (error) {
    console.error("search error:", error);
    // Fall back to mock data
    return searchMockCurators(clientKey, limit);
  }
}

// Mock data functions
function listMockCuratorsDefault(limit: number, from: number): CuratorCard[] {
  return mockCurators
    .slice(from, from + limit)
    .map(curator => ({
      id: curator.id,
      slug: curator.slug,
      storeName: curator.storeName,
      city: null, // Mock data doesn't have city
      bannerImage: curator.bannerImage,
      isEditorsPick: curator.isEditorsPick,
      followersCount: Math.floor(Math.random() * 3000000) + 100000, // Random followers for demo
      gender: ['male', 'female', 'unisex'][Math.floor(Math.random() * 3)] as 'male' | 'female' | 'unisex',
    }));
}

function searchMockCuratorsAdvanced(
  q: string | null,
  filters: Filters,
  limit: number,
  from: number
): CuratorCard[] {
  let results = mockCurators.map(curator => ({
    id: curator.id,
    slug: curator.slug,
    storeName: curator.storeName,
    city: null,
    bannerImage: curator.bannerImage,
    isEditorsPick: curator.isEditorsPick,
    followersCount: Math.floor(Math.random() * 3000000) + 100000,
    gender: ['male', 'female', 'unisex'][Math.floor(Math.random() * 3)] as 'male' | 'female' | 'unisex',
  }));

  // Apply search query
  if (q && q.trim()) {
    const term = q.trim().toLowerCase();
    results = results.filter(curator => {
      const searchableText = [
        curator.storeName,
        curator.slug,
        // Add bio if available in mock data
      ].join(' ').toLowerCase();
      
      return searchableText.includes(term);
    });
  }

  // Apply gender filter
  if (filters.genders && filters.genders.length > 0) {
    results = results.filter(curator => 
      curator.gender && filters.genders!.includes(curator.gender)
    );
  }

  // Apply followers filter
  if (filters.fol && filters.fol.length > 0) {
    results = results.filter(curator => {
      const fc = curator.followersCount ?? 0;
      return filters.fol!.some((tag) => {
        const [lo, hi] = followersRangeSQL(tag);
        if (lo !== null && fc < lo) return false;
        if (hi !== null && fc >= hi) return false;
        return true;
      });
    });
  }

  // Sort: editors pick first, then followers desc, then name asc
  results.sort((a, b) => {
    if (a.isEditorsPick !== b.isEditorsPick) {
      return a.isEditorsPick ? -1 : 1;
    }
    if ((a.followersCount ?? 0) !== (b.followersCount ?? 0)) {
      return (b.followersCount ?? 0) - (a.followersCount ?? 0);
    }
    return a.storeName.localeCompare(b.storeName);
  });

  return results.slice(from, from + limit);
}

function searchMockCurators(query: string, limit: number): SearchResult[] {
  const results = mockCurators
    .filter(curator => {
      const searchableText = [
        curator.storeName,
        curator.slug,
        curator.bio,
        // Add city if available in mock data
      ].join(' ').toLowerCase();
      
      return searchableText.includes(query.toLowerCase());
    })
    .slice(0, limit)
    .map(curator => ({
      id: curator.id,
      slug: curator.slug,
      storeName: curator.storeName,
      city: null, // Mock data doesn't have city
      bannerImage: curator.bannerImage,
      isEditorsPick: curator.isEditorsPick,
    }));

  return results;
}
