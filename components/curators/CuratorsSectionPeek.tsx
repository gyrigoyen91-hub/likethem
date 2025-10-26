"use client";

import Link from "next/link";
import { useMemo, useRef, useEffect, useState } from "react";
import { coverImageFor, Curator } from "@/lib/curators/fetchFeaturedWithFallback";
import { cn } from "@/lib/utils";
import { CuratorCardMasonry } from "@/components/curators/CuratorCardMasonry";
import { MasonryColumns } from "@/components/curators/MasonryColumns";
import { isTallByIndex } from "@/lib/masonry";


type Props = {
  title?: string;
  subtitle?: string;
  curators: Curator[];
  // max visible height for the section before the peeked part starts
  maxVisiblePx?: number; // e.g., 780
  ctaHref?: string;
  ctaLabel?: string;
};

export default function CuratorsSectionPeek({
  title,
  subtitle,
  curators,
  maxVisiblePx = 780,
  ctaHref = "/explore",
  ctaLabel = "View all curators",
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>(maxVisiblePx);
  const [showOverlay, setShowOverlay] = useState(true);

  // We constrain the container height and overlay a blur+gradient on the overflow
  useEffect(() => {
    // safeguard: if the content is shorter than maxVisiblePx, just fit content (no blur)
    const el = containerRef.current;
    if (!el) return;
    
    const ro = new ResizeObserver(() => {
      if (el.scrollHeight <= maxVisiblePx + 60) {
        setHeight(el.scrollHeight);
        setShowOverlay(false);
      } else {
        setHeight(maxVisiblePx);
        setShowOverlay(true);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [maxVisiblePx]);

  return (
    <section className="w-full bg-white py-20">
      {title && (
        <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6 text-center mb-10">
          <h2 className="text-4xl font-semibold text-zinc-900">{title}</h2>
          {subtitle && (
            <p className="mt-3 text-zinc-600">{subtitle}</p>
          )}
        </div>
      )}

      <div className="relative mx-auto w-full max-w-[1200px] px-4 md:px-6">
        <div
          ref={containerRef}
          className="relative overflow-hidden transition-[max-height] duration-300"
          style={{ maxHeight: height }}
        >
          {/* Masonry grid — using shared components */}
          <MasonryColumns>
            {curators.map((c, i) => (
              <CuratorCardMasonry
                key={c.id}
                curator={{
                  id: c.id,
                  username: c.slug,
                  name: c.storeName || "Unknown Curator",
                  avatar: c.avatar,
                  followers: c.followersCount,
                  coverImage: coverImageFor(c),
                  isEditorsPick: c.isEditorsPick ?? false,
                }}
                variant={isTallByIndex(i) ? "tall" : "normal"}
              />
            ))}
          </MasonryColumns>

          {/* Peek overlay (blur + gradient) only if content overflows */}
          {showOverlay && (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-28 sm:h-32 z-10
                         bg-gradient-to-b from-transparent via-white/60 to-white
                         [backdrop-filter:blur(4px)]"
            />
          )}

          {/* CTA sits on the boundary */}
          <div 
            className="absolute left-1/2 -translate-x-1/2 z-20"
            style={{
              bottom: showOverlay ? "1.25rem" : "-2.25rem"
            }}
          >
            <Link
              href={ctaHref}
              className="inline-flex items-center rounded-full border border-zinc-300 bg-white/95 px-6 py-3 text-sm font-medium text-zinc-800 shadow-lg hover:bg-white hover:shadow-xl transition-all duration-200
                         [backdrop-filter:blur(6px)] focus:outline-none focus:ring-2 focus:ring-black/10"
            >
              {ctaLabel}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
