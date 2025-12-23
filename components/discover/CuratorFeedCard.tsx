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

export default function CuratorFeedCard(props: Props) {
  const t = useT();
  const followersFmt =
    props.followers ? Intl.NumberFormat("en", { notation: "compact" }).format(props.followers) : null;

  return (
    <article className="mb-4 break-inside-avoid rounded-2xl border border-zinc-200/60 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="relative w-full overflow-hidden rounded-t-2xl">
        <Link href={`/curator/${props.slug}`} aria-label={`Open ${props.name}'s closet`}>
          <CuratorImageWithFallback
            src={props.hero}
            alt={`${props.name} — closet preview`}
            size="banner"
            width={800}
            height={1000}
            className="h-auto w-full object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={false}
          />
        </Link>

        {/* subtle gradient top for text legibility if we ever add badges */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/10 to-transparent" />
        
        {/* Editor's Pick badge */}
        {props.isEditorsPick && (
          <div className="absolute top-3 left-3 rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-zinc-900 shadow-sm">
            {t('explore.editorsPick')}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 px-4 py-3">
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
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/curator/${props.slug}`}
              className="truncate text-sm font-medium text-zinc-900 hover:underline"
              title={props.name}
            >
              {props.name}
            </Link>
            {props.isEditorsPick && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                Editor's Pick
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {followersFmt && (
              <span className="text-xs text-zinc-500">{followersFmt} {t('common.followers')}</span>
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

        <div className="flex items-center gap-2">
          {props.postUrl ? (
            <a
              href={props.postUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-700 hover:bg-zinc-50"
            >
              View Post
            </a>
          ) : null}
          <Link
            href={`/curator/${props.slug}`}
            className="rounded-full bg-black px-3 py-1 text-xs text-white hover:bg-zinc-900"
          >
            {t('explore.viewCloset')}
          </Link>
        </div>
      </div>
    </article>
  );
}
