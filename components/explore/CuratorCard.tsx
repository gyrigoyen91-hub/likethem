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

export function CuratorCard(props: Props) {
  const [imgOk, setImgOk] = useState(true);
  const followersFmt =
    props.followers ? Intl.NumberFormat("en", { notation: "compact" }).format(props.followers) : null;

  return (
    <div className="rounded-2xl border border-zinc-200/60 overflow-hidden hover:shadow-md transition-all bg-white">
      <div className="relative h-72 w-full">
        <Link href={`/curator/${props.slug}`} aria-label={`Open ${props.name}'s closet`}>
          {props.hero && imgOk ? (
            <Image
              src={safeSrc(props.hero)}
              alt={`${props.name} — closet preview`}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              onError={() => setImgOk(false)}
              priority={false}
            />
          ) : (
            <div className="h-full w-full bg-zinc-100" />
          )}
        </Link>
        
        {/* Editor's Pick badge */}
        {props.isEditorsPick && (
          <span className="absolute top-3 left-3 bg-white/90 text-xs font-medium px-3 py-1 rounded-full shadow-sm">
            Editor's Pick
          </span>
        )}
      </div>
      
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 overflow-hidden rounded-full ring-1 ring-zinc-200/70 bg-zinc-100">
            {props.avatar ? (
              <Image 
                src={safeSrc(props.avatar)} 
                alt={`${props.name} avatar`} 
                width={36} 
                height={36} 
                className="h-9 w-9 object-cover" 
              />
            ) : null}
          </div>
          <div>
            <div className="font-medium text-sm">{props.name}</div>
            {followersFmt && (
              <div className="text-xs text-zinc-500">
                {followersFmt} followers
              </div>
            )}
          </div>
        </div>
        <Link
          href={`/curator/${props.slug}`}
          className="rounded-full bg-black text-white px-3 py-1.5 text-sm hover:bg-zinc-800 transition-colors"
        >
          View Closet
        </Link>
      </div>
    </div>
  );
}
