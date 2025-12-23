import { getSupabaseServer } from "@/lib/supabase-server";
import { mockCurators } from "@/lib/mock-data";

export type Curator = {
  id: string;
  slug: string;
  storeName: string | null;
  avatar: string | null;
  banner: string | null;
  feedImageUrl: string | null;   // IG cover if present
  feedPostUrl: string | null;
  city: string | null;
  followersCount: number | null;
  isEditorsPick?: boolean | null;
};

export const coverImageFor = (c: Curator) =>
  c.feedImageUrl || c.banner || c.avatar || "/images/curators/default-cover.jpg";

export async function fetchFeaturedWithFallback(minCount = 12): Promise<Curator[]> {
  try {
    const supabase = getSupabaseServer();

    // 1) Featured (public) first
    const { data: featured = [], error: featuredError } = await supabase
      .from("curator_profiles")
      .select("id, slug, storeName, bannerImage, isEditorsPick, createdAt")
      .eq("isPublic", true)
      .eq("isEditorsPick", true)
      .order("createdAt", { ascending: false })
      .limit(48);

    if (featuredError) {
      console.error("Featured curators error:", featuredError);
      throw featuredError;
    }

    const byId = new Map<string, Curator>();
    
    // Transform featured data
    (featured as any[])?.forEach((c) => {
      byId.set(c.id, {
        id: c.id,
        slug: c.slug,
        storeName: c.storeName,
        avatar: null,
        banner: c.bannerImage,
        feedImageUrl: null,
        feedPostUrl: null,
        city: null,
        followersCount: null,
        isEditorsPick: c.isEditorsPick,
      });
    });

    // 2) If not enough, pad with public (top followers), excluding what we have
    if (byId.size < minCount) {
      const exclude = Array.from(byId.keys());
      const { data: fallback = [], error: fallbackError } = await supabase
        .from("curator_profiles")
        .select("id, slug, storeName, bannerImage, isEditorsPick, createdAt")
        .eq("isPublic", true)
        .order("createdAt", { ascending: false })
        .limit(48);

      if (fallbackError) {
        console.error("Fallback curators error:", fallbackError);
        throw fallbackError;
      }

      for (const c of (fallback as any[]) || []) {
        if (byId.size >= minCount) break;
        if (!byId.has(c.id)) {
          byId.set(c.id, {
            id: c.id,
            slug: c.slug,
            storeName: c.storeName,
            avatar: null,
            banner: c.bannerImage,
            feedImageUrl: null,
            feedPostUrl: null,
            city: null,
            followersCount: null,
            isEditorsPick: c.isEditorsPick,
          });
        }
      }
    }

    const result = Array.from(byId.values()).slice(0, minCount);
    
    // If we still don't have enough, fall back to mock data
    if (result.length < minCount) {
      console.log("Not enough real curators, using mock data");
      let mockData = mockCurators.filter(c => c.isEditorsPick);
      if (mockData.length < minCount) {
        const additionalCurators = mockCurators.filter(c => !c.isEditorsPick);
        mockData = [...mockData, ...additionalCurators];
      }
      
      const mockResult = mockData.slice(0, minCount).map(curator => ({
        id: curator.id,
        slug: curator.slug,
        storeName: curator.storeName,
        avatar: curator.user?.image || null,
        banner: curator.bannerImage,
        feedImageUrl: null,
        feedPostUrl: null,
        city: null,
        followersCount: Math.floor(Math.random() * 3000000) + 100000,
        isEditorsPick: curator.isEditorsPick,
      }));
      
      return mockResult;
    }

    return result;
  } catch (error) {
    console.error("fetchFeaturedWithFallback error:", error);
    // Fall back to mock data
    let mockData = mockCurators.filter(c => c.isEditorsPick);
    if (mockData.length < minCount) {
      const additionalCurators = mockCurators.filter(c => !c.isEditorsPick);
      mockData = [...mockData, ...additionalCurators];
    }
    
    return mockData.slice(0, minCount).map(curator => ({
      id: curator.id,
      slug: curator.slug,
      storeName: curator.storeName,
      avatar: curator.user?.image || null,
      banner: curator.bannerImage,
      feedImageUrl: null,
      feedPostUrl: null,
      city: null,
      followersCount: Math.floor(Math.random() * 3000000) + 100000,
      isEditorsPick: curator.isEditorsPick,
    }));
  }
}
