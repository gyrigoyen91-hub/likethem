'use client';

import Link from "next/link";
import Image from "next/image";
import ShareButton from "../ShareButton";
import { useImageLuminance } from "@/lib/hooks/useImageLuminance";
import clsx from "clsx";
import { safeSrc } from "@/lib/img";
import { CuratorImageWithFallback } from "@/components/ImageWithFallback";
import { useT } from "@/hooks/useT";
import { Instagram, Music2, Youtube, Globe, ExternalLink } from "lucide-react";
import FollowButton from "@/components/curator/FollowButton";

type Curator = {
  id: string;
  storeName: string | null;
  bio: string | null;
  city?: string | null;
  country?: string | null;
  styleTags?: string[] | null;
  instagramUrl?: string | null;
  tiktokUrl?: string | null;
  youtubeUrl?: string | null;
  websiteUrl?: string | null;
  bannerImage: string | null;
  isEditorsPick: boolean | null;
  slug: string | null;
  avatarUrl?: string | null; // optional (users.image or null)
};

export default function CuratorHero({ curator }: { curator: Curator }) {
  const t = useT();
  const isDark = useImageLuminance(curator.bannerImage ?? undefined);

  // Parse style tags if they're a JSON string
  let styleTags: string[] = []
  if (curator.styleTags) {
    if (Array.isArray(curator.styleTags)) {
      styleTags = curator.styleTags
    } else if (typeof curator.styleTags === 'string') {
      try {
        const parsed = JSON.parse(curator.styleTags)
        if (Array.isArray(parsed)) {
          styleTags = parsed
        }
      } catch {
        // Not JSON, ignore
      }
    }
  }

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

  const hasLocation = curator.city || curator.country
  const hasSocials = curator.instagramUrl || curator.tiktokUrl || curator.youtubeUrl || curator.websiteUrl
  const hasTags = styleTags.length > 0

  return (
    <section className="relative mb-8 overflow-hidden rounded-3xl border border-gray-200">
      {/* Cover */}
      <div className="relative h-40 w-full bg-gradient-to-r from-gray-100 to-gray-50 md:h-56" data-build="curator-banner-fallback-v1">
        <CuratorImageWithFallback
          src={curator.bannerImage ?? null}
          alt={`${curator.storeName ?? "Curator"} banner`}
          size="banner"
          fill
          priority={false}
          className="object-cover"
          sizes="100vw"
        />

        {/* Scrim: guarantees contrast during SSR + when hook is null */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/15 to-transparent" />
      </div>

      {/* Header content */}
      <div className="relative -mt-12 px-5 pb-6 md:-mt-16 md:px-8">
        <div className="flex items-end gap-4">
          <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-gray-100 md:h-28 md:w-28 relative" data-build="curator-avatar-fallback-v1">
            <CuratorImageWithFallback
              src={curator.avatarUrl ?? null}
              alt={`${curator.storeName ?? "Curator"} avatar`}
              size="avatar"
              width={112}
              height={112}
              className="h-full w-full object-cover"
            />
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
                  {t('explore.editorsPick')}
                </span>
              ) : null}
            </div>
            
            {/* Bio */}
            {curator.bio && (
              <p className={clsx('mt-2 max-w-3xl text-sm leading-relaxed', subtitleClass)}>
                {curator.bio}
              </p>
            )}

            {/* Meta row: Location + Socials */}
            {(hasLocation || hasSocials) && (
              <div className={clsx('mt-3 flex items-center gap-4 text-xs flex-wrap', statsClass)}>
                {/* Location */}
                {hasLocation && (
                  <>
                    <span>
                      {curator.city && curator.country
                        ? t('curator.location.cityCountry', { city: curator.city, country: curator.country })
                        : curator.city || curator.country
                      }
                    </span>
                    {hasSocials && <span>•</span>}
                  </>
                )}

                {/* Social Links */}
                {hasSocials && (
                  <div className="flex items-center gap-3">
                    {curator.instagramUrl && (
                      <a
                        href={curator.instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:opacity-80 transition-opacity"
                        aria-label={t('curator.social.instagram')}
                      >
                        <Instagram className="h-4 w-4" />
                      </a>
                    )}
                    {curator.tiktokUrl && (
                      <a
                        href={curator.tiktokUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:opacity-80 transition-opacity"
                        aria-label={t('curator.social.tiktok')}
                      >
                        <Music2 className="h-4 w-4" />
                      </a>
                    )}
                    {curator.youtubeUrl && (
                      <a
                        href={curator.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:opacity-80 transition-opacity"
                        aria-label={t('curator.social.youtube')}
                      >
                        <Youtube className="h-4 w-4" />
                      </a>
                    )}
                    {curator.websiteUrl && (
                      <a
                        href={curator.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:opacity-80 transition-opacity"
                        aria-label={t('curator.social.website')}
                      >
                        <Globe className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Style Tags */}
            {hasTags && (
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <span className={clsx('text-xs font-medium', statsClass)}>
                  {t('curator.style')}:
                </span>
                {styleTags.slice(0, 4).map(tag => (
                  <span
                    key={tag}
                    className={clsx(
                      'px-2 py-0.5 rounded-full text-xs border',
                      isDark === false
                        ? 'bg-white/80 text-zinc-700 border-zinc-200'
                        : 'bg-white/10 text-white/90 border-white/20'
                    )}
                  >
                    {t(`explore.filter.tags.${tag}` as any) || tag}
                  </span>
                ))}
                {styleTags.length > 4 && (
                  <span className={clsx('text-xs', statsClass)}>
                    +{styleTags.length - 4}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <FollowButton
              curatorId={curator.id}
              curatorSlug={curator.slug || ''}
            />
            <ShareButton />
          </div>
        </div>
      </div>
    </section>
  );
}
