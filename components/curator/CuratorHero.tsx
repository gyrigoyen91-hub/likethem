'use client';

import Link from "next/link";
import Image from "next/image";
import ShareButton from "../ShareButton";
import { useImageLuminance } from "@/lib/hooks/useImageLuminance";
import clsx from "clsx";

type Curator = {
  id: string;
  storeName: string | null;
  bio: string | null;
  bannerImage: string | null;
  isEditorsPick: boolean | null;
  slug: string | null;
  avatarUrl?: string | null; // optional (users.image or null)
};

export default function CuratorHero({ curator }: { curator: Curator }) {
  const isDark = useImageLuminance(curator.bannerImage ?? undefined);

  // Text theme: default to light until we know (better legibility on load)
  const textClass = clsx(
    'transition-colors duration-200',
    isDark === false ? 'text-zinc-900' : 'text-white'
  );

  const subtitleClass = clsx(
    'transition-colors duration-200',
    isDark === false ? 'text-zinc-700' : 'text-white/80'
  );

  const statsClass = clsx(
    'transition-colors duration-200',
    isDark === false ? 'text-zinc-600' : 'text-white/70'
  );

  return (
    <section className="relative mb-8 overflow-hidden rounded-3xl border border-gray-200">
      {/* Cover */}
      <div className="relative h-40 w-full bg-gradient-to-r from-gray-100 to-gray-50 md:h-56">
        {curator.bannerImage ? (
          <Image
            src={curator.bannerImage}
            alt={`${curator.storeName ?? "Curator"} banner`}
            fill
            priority={false}
            className="object-cover"
            sizes="100vw"
          />
        ) : null}

        {/* Scrim: guarantees contrast during SSR + when hook is null */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/15 to-transparent" />
      </div>

      {/* Header content */}
      <div className="relative -mt-12 px-5 pb-6 md:-mt-16 md:px-8">
        <div className="flex items-end gap-4">
          <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-gray-100 md:h-28 md:w-28">
            {curator.avatarUrl ? (
              <Image
                src={curator.avatarUrl}
                alt="Avatar"
                width={112}
                height={112}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                Image not available
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className={clsx(
                'truncate text-2xl font-semibold tracking-tight md:text-3xl [text-shadow:0_1px_1px_rgba(0,0,0,0.25)]',
                textClass
              )}>
                {curator.storeName ?? "Curator's Closet"}
              </h1>
              {curator.isEditorsPick ? (
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
                  Editor's Pick
                </span>
              ) : null}
            </div>
            <p className={clsx('mt-2 max-w-3xl text-sm', subtitleClass)}>
              {curator.bio}
            </p>

            <div className={clsx('mt-3 flex items-center gap-4 text-xs', statsClass)}>
              {/* Placeholder stats; wire later if you add fields */}
              <span>2.4M followers</span>
              <span>•</span>
              <span>Paris</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/their-closets"
              className="rounded-full border px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              ← Back to Their Closets
            </Link>
            <ShareButton />
          </div>
        </div>
      </div>
    </section>
  );
}
