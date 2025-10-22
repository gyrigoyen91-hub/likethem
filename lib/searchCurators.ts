// lib/searchCurators.ts
import { getSupabaseServer } from "@/lib/supabase-server";
import { mockCurators } from "@/lib/mock-data";

type SearchResult = {
  id: string;
  slug: string;
  storeName: string;
  city?: string | null;
  bannerImage?: string | null;
  isEditorsPick: boolean;
};

export async function searchCurators(q: string, limit = 12): Promise<SearchResult[]> {
  const term = q.trim();
  if (!term) return [];

  // Normalize for diacritics (client-side) so 'Sofia' matches 'Sofía'
  const clientKey = term.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

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
