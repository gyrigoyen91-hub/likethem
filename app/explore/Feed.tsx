"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CuratorCardMasonry } from "@/components/curators/CuratorCardMasonry";
import { MasonryColumns } from "@/components/curators/MasonryColumns";
import { isTallByIndex } from "@/lib/masonry";
import { useSearchParams } from "next/navigation";
import { CuratorCardSkeleton } from "@/components/skeletons/CuratorCardSkeleton";
import { useT } from "@/hooks/useT";

type Item = {
  id: string;
  slug: string;
  name: string;
  avatar?: string | null;
  city?: string | null;
  country?: string | null;
  styleTags?: string[] | null;
  followers?: number | null;
  hero?: string | null;
  postUrl?: string | null;
  createdAt: string;
  isEditorsPick?: boolean;
};

type FeedResponse = {
  items: Item[];
  nextCursor: string | null;
};

export default function Feed() {
  const t = useT();
  const sp = useSearchParams();
  const q = (sp.get("q") || "").trim();
  const style = sp.get("style") || "";
  const city = sp.get("city") || "";
  const country = sp.get("country") || "";
  const priceRange = sp.get("priceRange") || "";
  const sort = sp.get("sort") || "editors-pick";
  
  const [data, setData] = useState<FeedResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const items: Item[] = useMemo(() => data.flatMap(d => d.items), [data]);
  const hasMore = data.length > 0 && data[data.length - 1]?.nextCursor !== null;

  const sentinel = useRef<HTMLDivElement | null>(null);

  const fetchPage = async (cursor?: string) => {
    if (loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      params.set("limit", "24");
      if (q) params.set("q", q);
      if (style) params.set("style", style);
      if (city) params.set("city", city);
      if (country) params.set("country", country);
      if (priceRange) params.set("priceRange", priceRange);
      if (sort) params.set("sort", sort);
      if (cursor) params.set("cursor", cursor);
      
      const response = await fetch(`/api/curators/discover?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: FeedResponse = await response.json();
      
      if (cursor) {
        setData(prev => [...prev, result]);
      } else {
        setData([result]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  // Initial load and filter changes
  useEffect(() => {
    setData([]);
    fetchPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, style, city, country, priceRange, sort]);

  // Note: fetchPage is intentionally not in deps to avoid re-creating on every render
  // Filters are in deps to trigger refetch when they change

  // Infinite scroll
  useEffect(() => {
    if (!sentinel.current || !hasMore || loading) return;
    
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && hasMore && !loading) {
            const lastPage = data[data.length - 1];
            if (lastPage?.nextCursor) {
              fetchPage(lastPage.nextCursor);
            }
          }
        });
      },
      { rootMargin: "1200px 0px 1200px 0px" }
    );
    
    io.observe(sentinel.current);
    return () => io.disconnect();
  }, [hasMore, loading, data]);

  if (error) {
    return (
      <div className="pb-24 text-center text-sm text-red-500">
        {t('common.error')}: {error}
      </div>
    );
  }

  return (
    <>
      <MasonryColumns>
        {items.map((it, i) => (
          <CuratorCardMasonry
            key={it.id}
            curator={{
              id: it.id,
              username: it.slug,
              name: it.name,
              avatar: it.avatar,
              followers: it.followers,
              coverImage: it.hero,
              isEditorsPick: it.isEditorsPick,
              city: it.city,
              country: it.country,
              styleTags: it.styleTags,
            }}
            variant={isTallByIndex(i) ? "tall" : "normal"}
          />
        ))}
      </MasonryColumns>

      {/* sentinel for infinite scroll */}
      <div ref={sentinel} className="h-12" />
      
      {loading && (
        <div className="mt-8">
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <CuratorCardSkeleton key={`loading-${i}`} />
            ))}
          </div>
        </div>
      )}
      
      {!loading && items.length === 0 && (
        <div className="pb-24 text-center text-sm text-zinc-500">
          {style || city || country || priceRange || sort !== 'editors-pick'
            ? t('explore.filter.noMatch')
            : t('explore.noResults')
          }
        </div>
      )}
    </>
  );
}
