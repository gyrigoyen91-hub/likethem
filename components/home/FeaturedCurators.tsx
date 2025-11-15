import { CuratorCardMasonry } from "@/components/curators/CuratorCardMasonry";
import { MasonryColumns } from "@/components/curators/MasonryColumns";
import { isTallByIndex } from "@/lib/masonry";
import Link from "next/link";
import { getSupabaseServer } from "@/lib/supabase-server";
import { mockCurators } from "@/lib/mock-data";

export default async function FeaturedCurators() {
  let curators: any[] = [];

  try {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("curator_profiles")
      .select("id, slug, storeName, bannerImage, isEditorsPick, createdAt")
      .eq("isPublic", true)
      .eq("isEditorsPick", true)
      .limit(12);

    if (error) {
      console.error("Featured curators error:", error);
      // Fall back to mock data - use editors pick curators first, then all curators
      let mockData = mockCurators.filter(c => c.isEditorsPick);
      if (mockData.length < 8) {
        // If we don't have enough editors pick, add more curators
        const additionalCurators = mockCurators.filter(c => !c.isEditorsPick);
        mockData = [...mockData, ...additionalCurators];
      }
      curators = mockData.slice(0, 8).map(curator => ({
        id: curator.id,
        slug: curator.slug,
        name: curator.storeName,
        avatar: curator.user?.image || null,
        city: null,
        followers: Math.floor(Math.random() * 3000000) + 100000,
        hero: curator.bannerImage,
        postUrl: null,
        createdAt: new Date().toISOString(),
        isEditorsPick: curator.isEditorsPick,
      }));
    } else {
      // Transform Supabase data to match our card format
      let supabaseData = ((data as any[]) || []).map(c => ({
        id: c.id,
        slug: c.slug,
        name: c.storeName,
        avatar: null, // Will be populated from user table if needed
        city: null,
        followers: null,
        hero: c.bannerImage,
        postUrl: null,
        createdAt: c.createdAt,
        isEditorsPick: c.isEditorsPick,
      }));

      // If we don't have enough featured curators, fall back to mock data
      if (supabaseData.length < 8) {
        console.log("Not enough featured curators, using mock data");
        let mockData = mockCurators.filter(c => c.isEditorsPick);
        if (mockData.length < 8) {
          const additionalCurators = mockCurators.filter(c => !c.isEditorsPick);
          mockData = [...mockData, ...additionalCurators];
        }
        curators = mockData.slice(0, 8).map(curator => ({
          id: curator.id,
          slug: curator.slug,
          name: curator.storeName,
          avatar: curator.user?.image || null,
          city: null,
          followers: Math.floor(Math.random() * 3000000) + 100000,
          hero: curator.bannerImage,
          postUrl: null,
          createdAt: new Date().toISOString(),
          isEditorsPick: curator.isEditorsPick,
        }));
      } else {
        curators = supabaseData;
      }
    }
  } catch (error) {
    console.error("Featured curators error:", error);
    // Fall back to mock data
    let mockData = mockCurators.filter(c => c.isEditorsPick);
    if (mockData.length < 8) {
      const additionalCurators = mockCurators.filter(c => !c.isEditorsPick);
      mockData = [...mockData, ...additionalCurators];
    }
    curators = mockData.slice(0, 8).map(curator => ({
      id: curator.id,
      slug: curator.slug,
      name: curator.storeName,
      avatar: curator.user?.image || null,
      city: null,
      followers: Math.floor(Math.random() * 3000000) + 100000,
      hero: curator.bannerImage,
      postUrl: null,
      createdAt: new Date().toISOString(),
      isEditorsPick: curator.isEditorsPick,
    }));
  }

  // Ensure we have at least 8 curators for the peeked effect
  if (curators.length < 8) {
    console.log("Not enough curators for peeked effect, duplicating some");
    const needed = 8 - curators.length;
    const duplicates = curators.slice(0, needed).map((curator, index) => ({
      ...curator,
      id: `${curator.id}-dup-${index}`,
    }));
    curators = [...curators, ...duplicates];
  }

  // Split into first and second rows
  const firstRow = curators.slice(0, 4);
  const secondRow = curators.slice(4, 8);

  return (
    <section className="w-full bg-white py-20">
      <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6 text-center">
        <h2 className="text-4xl font-semibold text-zinc-900">Featured Curators</h2>
        <p className="mt-3 text-zinc-600">
          Discover the most influential style curators in fashion.
        </p>
      </div>

      {/* ---- TOP ROW (crisp) ---- */}
      <div className="relative mx-auto mt-10 w-full max-w-[1200px] px-4 md:px-6">
        <MasonryColumns>
          {firstRow.map((c, i) => (
            <CuratorCardMasonry
              key={c.id}
              curator={{
                id: c.id,
                username: c.slug,
                name: c.name,
                avatar: c.avatar,
                followers: c.followers,
                coverImage: c.hero,
                isEditorsPick: c.isEditorsPick,
              }}
              variant={isTallByIndex(i) ? "tall" : "normal"}
            />
          ))}
        </MasonryColumns>

        {/* ---- CTA sits ON the boundary with padding ---- */}
        <div className="pointer-events-auto absolute left-1/2 top-[100%] z-30 -translate-x-1/2 -translate-y-1/2 px-4 py-2">
          <Link
            href="/explore"
            className="rounded-full border border-zinc-300 bg-white/95 px-6 py-3 text-sm font-medium text-zinc-800 shadow-lg backdrop-blur-sm hover:bg-white hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-black/10 transition-all duration-200"
          >
            View all curators
          </Link>
        </div>

        {/* ---- SECOND ROW PREVIEW (blurred + faded) ---- */}
        {!!secondRow.length && (
          <div
            className="
              relative z-20 mt-4
              hidden sm:block
              overflow-hidden
              max-h-[150px] md:max-h-[180px] lg:max-h-[200px]
            "
          >
            {/* Fallback overlay for browsers that don't support mask-image */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white z-10 pointer-events-none" />
            
            {/* Main content with mask */}
            <div
              className="
                relative z-0
                [mask-image:linear-gradient(to_bottom,rgba(0,0,0,0.85),rgba(0,0,0,0.45)60%,transparent)]
                [mask-size:100%_100%] [mask-repeat:no-repeat]
                [mask-composite:intersect]
              "
            >
              <div
                className="
                  pointer-events-none select-none
                  opacity-65
                  [filter:blur(2px)] md:[filter:blur(3px)]
                  translate-y-[-8px]
                "
              >
                <MasonryColumns>
                  {secondRow.map((c, i) => (
                    <CuratorCardMasonry
                      key={c.id}
                      curator={{
                        id: c.id,
                        username: c.slug,
                        name: c.name,
                        avatar: c.avatar,
                        followers: c.followers,
                        coverImage: c.hero,
                        isEditorsPick: c.isEditorsPick,
                      }}
                      variant={isTallByIndex(i + 4) ? "tall" : "normal"}
                    />
                  ))}
                </MasonryColumns>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
