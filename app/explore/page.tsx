import { CuratorCard } from "@/components/explore/CuratorCard";
import Feed from "./Feed";
import { Suspense } from "react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function FeedSkeleton() {
  return (
    <div className="mt-8">
      <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6">
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [column-fill:_balance]">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="mb-4 break-inside-avoid h-[400px] w-full animate-pulse rounded-2xl bg-zinc-100" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default async function ExplorePage() {
  return (
    <main className="min-h-screen">
      <section className="mx-auto w-full max-w-[1200px] px-4 md:px-6 pt-10 pb-4">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-zinc-900">Discover Curators</h1>
        <p className="mt-2 text-zinc-600">
          Explore closets by the creators you admire. Fresh posts, curated daily.
        </p>

        {/* Search */}
        <form className="mt-6" action="/explore" method="get">
          <input
            type="search"
            name="q"
            placeholder="Search curators, city, or keywords…"
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-[15px] outline-none ring-0 placeholder:text-zinc-400 focus:border-zinc-300"
          />
        </form>
      </section>

      <Suspense fallback={<FeedSkeleton />}>
        {/* Client feed with infinite scroll */}
        <Feed />
      </Suspense>
    </main>
  );
} 