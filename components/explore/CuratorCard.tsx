"use client";

import Image from "next/image";
import Link from "next/link";
import { CuratorImageWithFallback } from "@/components/ImageWithFallback";
import { safeSrc } from "@/lib/img";
import { useT } from "@/hooks/useT";

type Props = {
  slug: string;
  name: string;
  avatar?: string | null;
  city?: string | null;
  country?: string | null;
  styleTags?: string[] | null;
  followers?: number | null;
  hero?: string | null;
  postUrl?: string | null;
  isEditorsPick?: boolean;
};

export function CuratorCard(props: Props) {
  const t = useT();
  const followersFmt =
    props.followers ? Intl.NumberFormat("en", { notation: "compact" }).format(props.followers) : null;

  return (
    <div className="rounded-2xl border border-zinc-200/60 overflow-hidden hover:shadow-md transition-all bg-white">
      <div className="relative h-72 w-full">
        <Link href={`/curator/${props.slug}`} aria-label={`Open ${props.name}'s closet`}>
          <CuratorImageWithFallback
            src={props.hero}
            alt={`${props.name} — closet preview`}
            size="banner"
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            priority={false}
          />
        </Link>
        
        {/* Editor's Pick badge */}
        {props.isEditorsPick && (
          <span className="absolute top-3 left-3 bg-white/90 text-xs font-medium px-3 py-1 rounded-full shadow-sm">
            {t('explore.editorsPick')}
          </span>
        )}
      </div>
      
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 overflow-hidden rounded-full ring-1 ring-zinc-200/70 bg-zinc-100 relative">
            <CuratorImageWithFallback
              src={props.avatar}
              alt={`${props.name} avatar`}
              size="avatar"
              width={36}
              height={36}
              className="h-9 w-9 object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-sm truncate">{props.name}</div>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              {followersFmt && (
                <span className="text-xs text-zinc-500">
                  {followersFmt} {t('common.followers')}
                </span>
              )}
              {(props.city || props.country) && (
                <>
                  {followersFmt && <span className="text-xs text-zinc-400">•</span>}
                  <span className="text-xs text-zinc-500">
                    {props.city && props.country
                      ? `${props.city}, ${props.country}`
                      : props.city || props.country
                    }
                  </span>
                </>
              )}
            </div>
            {/* Style tags - show up to 2 */}
            {props.styleTags && props.styleTags.length > 0 && (
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                {props.styleTags.slice(0, 2).map(tag => (
                  <span
                    key={tag}
                    className="px-1.5 py-0.5 rounded text-xs bg-zinc-100 text-zinc-600"
                  >
                    {t(`explore.filter.tags.${tag}` as any) || tag}
                  </span>
                ))}
                {props.styleTags.length > 2 && (
                  <span className="text-xs text-zinc-400">
                    +{props.styleTags.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        <Link
          href={`/curator/${props.slug}`}
          className="rounded-full bg-black text-white px-3 py-1.5 text-sm hover:bg-zinc-800 transition-colors"
        >
          {t('explore.viewCloset')}
        </Link>
      </div>
    </div>
  );
}
