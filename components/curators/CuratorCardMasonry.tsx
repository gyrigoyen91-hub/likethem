"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { safeSrc } from "@/lib/img";
import { useT } from "@/hooks/useT";

type Props = {
  curator: {
    id: string;
    username: string;
    name: string;
    avatar?: string | null;
    followers?: number | null;
    coverImage?: string | null;
    isEditorsPick?: boolean;
    city?: string | null;
    country?: string | null;
    styleTags?: string[] | null;
  };
  variant?: "normal" | "tall";
};

export function CuratorCardMasonry({ curator, variant = "normal" }: Props) {
  const t = useT();
  const [imgOk, setImgOk] = useState(true);
  const followersFmt =
    curator.followers ? Intl.NumberFormat("en", { notation: "compact" }).format(curator.followers) : null;

  // Image container height based on variant
  const imgClass =
    variant === "tall"
      ? "relative w-full h-[520px] md:h-[620px]"
      : "relative w-full h-72 md:h-80";

  return (
    <article
      data-card-source="curator-card-masonry"
      className="mb-6 break-inside-avoid rounded-2xl border border-zinc-200/60 bg-white shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="overflow-hidden rounded-t-2xl">
        <Link href={`/curator/${curator.username}`} aria-label={`Open ${curator.name}'s closet`}>
          <div className={imgClass}>
            {curator.coverImage && imgOk ? (
              <Image
                src={safeSrc(curator.coverImage)}
                alt={`${curator.name} — closet preview`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                onError={() => setImgOk(false)}
                priority={false}
              />
            ) : (
              <div className="h-full w-full bg-zinc-100" />
            )}
          </div>
        </Link>

        {/* subtle gradient top for text legibility if we ever add badges */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/10 to-transparent" />
        
        {/* Editor's Pick badge */}
        {curator.isEditorsPick && (
          <div className="absolute top-3 left-3 rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-zinc-900 shadow-sm">
            {t('explore.editorsPick')}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 overflow-hidden rounded-full ring-1 ring-zinc-200/70 bg-zinc-100">
            {curator.avatar ? (
              <Image src={safeSrc(curator.avatar)} alt={`${curator.name} avatar`} width={36} height={36} className="h-9 w-9 object-cover" />
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-sm truncate">{curator.name}</div>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              {followersFmt && (
                <span className="text-xs text-zinc-500">
                  {followersFmt} {t('common.followers')}
                </span>
              )}
              {(curator.city || curator.country) && (
                <>
                  {followersFmt && <span className="text-xs text-zinc-400">•</span>}
                  <span className="text-xs text-zinc-500">
                    {curator.city && curator.country
                      ? `${curator.city}, ${curator.country}`
                      : curator.city || curator.country
                    }
                  </span>
                </>
              )}
            </div>
            {/* Style tags - show up to 2 */}
            {curator.styleTags && curator.styleTags.length > 0 && (
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                {curator.styleTags.slice(0, 2).map(tag => (
                  <span
                    key={tag}
                    className="px-1.5 py-0.5 rounded text-xs bg-zinc-100 text-zinc-600"
                  >
                    {t(`explore.filter.tags.${tag}` as any) || tag}
                  </span>
                ))}
                {curator.styleTags.length > 2 && (
                  <span className="text-xs text-zinc-400">
                    +{curator.styleTags.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        <Link
          href={`/curator/${curator.username}`}
          className="rounded-full bg-black text-white px-3 py-1.5 text-sm hover:bg-zinc-800 transition-colors"
        >
          {t('explore.viewCloset')}
        </Link>
      </div>
    </article>
  );
}
