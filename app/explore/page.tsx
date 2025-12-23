import Feed from "./Feed";
import { Suspense } from "react";
import { getLocale } from "@/lib/i18n/getLocale";
import { t } from "@/lib/i18n/t";
import { CuratorCardSkeleton } from "@/components/skeletons/CuratorCardSkeleton";
import Filters from "@/components/explore/Filters";

export const dynamic = "force-dynamic";
export const revalidate = 60;

function FeedSkeleton() {
  return (
    <div className="mt-8">
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <CuratorCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export default async function ExplorePage() {
  const locale = await getLocale();
  
  return (
    <main className="min-h-screen">
      <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6 pt-10 pb-4">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-zinc-900">{t(locale, 'explore.title')}</h1>
        <p className="mt-2 text-zinc-600">
          {t(locale, 'explore.subtitle')}
        </p>

        {/* Search */}
        <form className="mt-6" action="/explore" method="get">
          <input
            type="search"
            name="q"
            placeholder={t(locale, 'explore.searchPlaceholder')}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-[15px] outline-none ring-0 placeholder:text-zinc-400 focus:border-zinc-300"
          />
        </form>

        {/* Filters */}
        <Filters />

        <Suspense fallback={<FeedSkeleton />}>
          {/* Client feed with infinite scroll */}
          <Feed />
        </Suspense>
      </div>
    </main>
  );
} 