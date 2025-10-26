"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { safeSrc } from "@/lib/img";

type Props = {
  slug: string;
  name: string;
  avatar?: string | null;
  city?: string | null;
  followers?: number | null;
  hero?: string | null;
  postUrl?: string | null;
  isEditorsPick?: boolean;
};

export default function CuratorFeedCard(props: Props) {
  const [imgOk, setImgOk] = useState(true);
  const followersFmt =
    props.followers ? Intl.NumberFormat("en", { notation: "compact" }).format(props.followers) : null;

  return (
    <article className="mb-4 break-inside-avoid rounded-2xl border border-zinc-200/60 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="relative w-full overflow-hidden rounded-t-2xl">
        <Link href={`/curator/${props.slug}`} aria-label={`Open ${props.name}'s closet`}>
          {props.hero && imgOk ? (
            <Image
              src={safeSrc(props.hero)}
              alt={`${props.name} — closet preview`}
              width={800}
              height={1000}
              className="h-auto w-full object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              onError={() => setImgOk(false)}
              priority={false}
            />
          ) : (
            <div className="aspect-[4/5] w-full bg-zinc-100" />
          )}
        </Link>

        {/* subtle gradient top for text legibility if we ever add badges */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/10 to-transparent" />
        
        {/* Editor's Pick badge */}
        {props.isEditorsPick && (
          <div className="absolute top-3 left-3 rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-zinc-900 shadow-sm">
            Editor's Pick
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 px-4 py-3">
        <div className="h-9 w-9 overflow-hidden rounded-full ring-1 ring-zinc-200/70 bg-zinc-100">
          {props.avatar ? (
            <Image src={safeSrc(props.avatar)} alt={`${props.name} avatar`} width={36} height={36} className="h-9 w-9 object-cover" />
          ) : null}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Link
              href={`/curator/${props.slug}`}
              className="truncate text-sm font-medium text-zinc-900 hover:underline"
              title={props.name}
            >
              {props.name}
            </Link>
            {followersFmt ? <span className="truncate text-xs text-zinc-500">{followersFmt} followers</span> : null}
          </div>
          {props.city ? <div className="truncate text-xs text-zinc-500">{props.city}</div> : null}
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
            View Closet
          </Link>
        </div>
      </div>
    </article>
  );
}
