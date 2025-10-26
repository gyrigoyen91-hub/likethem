"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CuratorCardMasonry } from "@/components/curators/CuratorCardMasonry";
import { MasonryColumns } from "@/components/curators/MasonryColumns";
import { isTallByIndex } from "@/lib/masonry";
import { useSearchParams } from "next/navigation";

type Item = {
  id: string;
  slug: string;
  name: string;
  avatar?: string | null;
  city?: string | null;
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
  const sp = useSearchParams();
  const q = (sp.get("q") || "").trim();
  
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

  // Initial load and search changes
  useEffect(() => {
    setData([]);
    fetchPage();
  }, [q]);

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
        Error: {error}
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
            }}
            variant={isTallByIndex(i) ? "tall" : "normal"}
          />
        ))}
      </MasonryColumns>

      {/* sentinel for infinite scroll */}
      <div ref={sentinel} className="h-12" />
      
      {loading && (
        <div className="pb-12 text-center text-sm text-zinc-500">
          Loading…
        </div>
      )}
      
      {!loading && items.length === 0 && (
        <div className="pb-24 text-center text-sm text-zinc-500">
          No results. Try a different search.
        </div>
      )}
    </>
  );
}
