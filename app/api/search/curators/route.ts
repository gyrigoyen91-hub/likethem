// app/api/search/curators/route.ts
import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { mockCurators } from "@/lib/mock-data";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const limit = Math.min(parseInt(searchParams.get("limit") || "8", 10), 12);

  // Early return if empty query (avoid noisy DB trips)
  if (!q) return NextResponse.json({ items: [] });

  try {
    const supabase = getSupabaseServer();

    // Simple ilike search across name/slug/bio/city; ordered EditorsPick -> followers -> name
    // If you have an "unaccent" or trigram index, upgrade this later.
    const { data, error } = await supabase
      .from("curator_profiles")
      .select("id, slug, storeName, city, bannerImage, isEditorsPick, followersCount")
      .eq("isPublic", true)
      .or(
        `"storeName".ilike.%${q}%,slug.ilike.%${q}%,bio.ilike.%${q}%,city.ilike.%${q}%`
      )
      .order("isEditorsPick", { ascending: false })
      .order("followersCount", { ascending: false, nullsFirst: false })
      .order("storeName", { ascending: true })
      .limit(limit);

    if (error) {
      console.error("autocomplete error:", error);
      // Fall back to mock data
      return NextResponse.json({
        items: getMockAutocompleteResults(q, limit)
      });
    }

    return NextResponse.json({
      items: (data ?? []).map((r) => ({
        id: r.id,
        slug: r.slug,
        title: r.storeName,
        subtitle: r.city,
        bannerImage: r.bannerImage,
        followersCount: r.followersCount,
        isEditorsPick: r.isEditorsPick,
      })),
    });
  } catch (error) {
    console.error("autocomplete error:", error);
    // Fall back to mock data
    return NextResponse.json({
      items: getMockAutocompleteResults(q, limit)
    });
  }
}

function getMockAutocompleteResults(query: string, limit: number) {
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
      title: curator.storeName,
      subtitle: null, // Mock data doesn't have city
      bannerImage: curator.bannerImage,
      followersCount: Math.floor(Math.random() * 3000000) + 100000, // Random followers for demo
      isEditorsPick: curator.isEditorsPick,
    }));

  return results;
}
