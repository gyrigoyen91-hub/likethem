// app/explore/page.tsx
import { searchCurators } from "@/lib/searchCurators";
import Link from "next/link";
import Image from "next/image";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function ExplorePage({ searchParams }: { searchParams: { q?: string } }) {
  const q = (searchParams.q || "").trim();
  const results = q ? await searchCurators(q, 60) : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-serif text-4xl md:text-5xl tracking-tight">Discover Curators</h1>
      <p className="mt-2 text-neutral-500">Explore curated stores by the content creators you admire</p>

      {/* Search bar mirrors header, but submits via querystring */}
      <form
        action="/explore"
        className="mt-6"
      >
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by curator, city, or style…"
          className="w-full rounded-xl border border-neutral-300 bg-white/70 px-4 py-2 text-sm outline-none placeholder:text-neutral-400 focus:border-black md:max-w-[520px]"
        />
      </form>

      {/* Results */}
      {q ? (
        <div className="mt-8">
          <p className="text-sm text-neutral-500">Results for "{q}"</p>
          {results.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-neutral-300 p-8 text-center text-neutral-500">
              No matches. Try another name, city, or keyword.
            </div>
          ) : (
            <ul className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((c) => (
                <li key={c.id} className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white">
                  <Link href={`/curator/${c.slug}`}>
                    <div className="relative h-48 w-full bg-neutral-100">
                      {c.bannerImage && (
                        <Image
                          src={c.bannerImage}
                          alt={c.storeName}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        />
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-neutral-900">{c.storeName}</h3>
                        {c.isEditorsPick && (
                          <span className="rounded-full border px-2 py-0.5 text-[11px] text-neutral-600">Editor's Pick</span>
                        )}
                      </div>
                      {c.city && <p className="mt-1 text-sm text-neutral-500">{c.city}</p>}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div className="mt-8 text-neutral-500 text-sm">
          Start typing to search curators by name, city, or keywords.
        </div>
      )}
    </div>
  );
} 