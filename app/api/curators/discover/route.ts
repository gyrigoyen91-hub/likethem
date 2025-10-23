import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { mockCurators } from "@/lib/mock-data";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const cursor = searchParams.get("cursor"); // ISO date or numeric id
  const limit = Math.min(Number(searchParams.get("limit") || 24), 48);

  const supabase = getSupabaseServer();

  // Base query: public curators only
  let curators = supabase
    .from("curator_profiles")
    .select("id, slug, storeName, bannerImage, isEditorsPick, createdAt")
    .eq("isPublic", true)
    .order("isEditorsPick", { ascending: false })
    .order("createdAt", { ascending: false })
    .limit(limit);

  if (q) {
    // Match name, city, or style keywords if you store them
    curators = curators.or(
      `storeName.ilike.%${q}%,slug.ilike.%${q}%,bio.ilike.%${q}%`
    );
  }
  if (cursor) {
    curators = curators.lt("createdAt", cursor);
  }

  const { data: rows, error } = await curators;
  if (error) {
    console.error("discover error:", error);
    // Fall back to mock data
    return NextResponse.json({ 
      items: getMockDiscoverResults(q, limit, cursor),
      nextCursor: null 
    });
  }

  // For each curator, find best hero image (latest product image > banner)
  const result = [];
  for (const c of rows || []) {
    let hero = c.bannerImage ?? null;

    if (!hero) {
      const { data: p } = await supabase
        .from("products")
        .select("id")
        .eq("curatorId", c.id)
        .eq("isActive", true)
        .order("createdAt", { ascending: false })
        .limit(1)
        .single();

      if (p?.id) {
        const { data: img } = await supabase
          .from("product_images")
          .select("url")
          .eq("productId", p.id)
          .order("order", { ascending: true })
          .limit(1)
          .single();
        hero = img?.url ?? null;
      }
    }

    result.push({
      id: c.id,
      slug: c.slug,
      name: c.storeName,
      avatar: null, // Will use user avatar if available
      city: null, // Not in current schema
      followers: null, // Not in current schema
      hero: hero,
      postUrl: null, // Not in current schema
      createdAt: c.createdAt,
      isEditorsPick: c.isEditorsPick,
    });
  }

  const nextCursor = rows?.length === limit ? rows[rows.length - 1].createdAt : null;
  return NextResponse.json({ items: result, nextCursor });
}

function getMockDiscoverResults(query: string, limit: number, cursor?: string | null) {
  let results = mockCurators.filter(curator => {
    if (!query) return true;
    const searchableText = [
      curator.storeName,
      curator.slug,
      curator.bio,
    ].join(' ').toLowerCase();
    
    return searchableText.includes(query.toLowerCase());
  });

  // Sort by editors pick first, then by name
  results.sort((a, b) => {
    if (a.isEditorsPick !== b.isEditorsPick) {
      return a.isEditorsPick ? -1 : 1;
    }
    return a.storeName.localeCompare(b.storeName);
  });

  // Apply cursor-based pagination (simplified for mock data)
  if (cursor) {
    const cursorIndex = results.findIndex(r => r.id === cursor);
    if (cursorIndex >= 0) {
      results = results.slice(cursorIndex + 1);
    }
  }

  // Limit results
  results = results.slice(0, limit);

  return results.map(curator => ({
    id: curator.id,
    slug: curator.slug,
    name: curator.storeName,
    avatar: curator.user?.image || null,
    city: null,
    followers: Math.floor(Math.random() * 3000000) + 100000, // Random followers for demo
    hero: curator.bannerImage,
    postUrl: null,
    createdAt: new Date().toISOString(),
    isEditorsPick: curator.isEditorsPick,
  }));
}
