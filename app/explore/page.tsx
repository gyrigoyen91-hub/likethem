import Image from "next/image";
import Link from "next/link";
import Filters from "@/components/explore/Filters";
import CuratorAutocomplete from "@/components/search/CuratorAutocomplete";
import { listCuratorsDefault, searchCuratorsAdvanced, CuratorCard } from "@/lib/searchCurators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function Card({ c }: { c: CuratorCard }) {
  return (
    <li className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white">
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
          <p className="mt-1 text-sm text-neutral-500">
            {c.city ?? ""}{c.city && c.followersCount ? " • " : ""}
            {c.followersCount ? Intl.NumberFormat("en", { notation: "compact" }).format(c.followersCount) + " followers" : ""}
          </p>
        </div>
      </Link>
    </li>
  );
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: { q?: string; gender?: string | string[]; fol?: string | string[] };
}) {
  const q = (searchParams.q ?? "").trim() || null;
  const genders = Array.isArray(searchParams.gender)
    ? (searchParams.gender as string[])
    : searchParams.gender ? [searchParams.gender] : [];
  const fol = Array.isArray(searchParams.fol)
    ? (searchParams.fol as string[])
    : searchParams.fol ? [searchParams.fol] : [];

  let results: CuratorCard[] = [];
  const hasFilters = genders.length > 0 || fol.length > 0;
  if (q || hasFilters) {
    results = await searchCuratorsAdvanced(q, { genders, fol }, 36, 0);
  } else {
    // default: show curated list
    results = await listCuratorsDefault(36, 0);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-serif text-4xl md:text-5xl tracking-tight">Discover Curators</h1>
      <p className="mt-2 text-neutral-500">Explore curated stores by the content creators you admire</p>

      {/* Search form */}
      <div className="mt-6 md:max-w-[520px]">
        <CuratorAutocomplete
          defaultValue={q ?? ""}
          submitTo="/explore"
          queryParam="q"
          placeholder="Search by curator, city, or style…"
        />
      </div>

      <div className="mt-8 flex">
        {/* Left filters */}
        <Filters />

        {/* Results */}
        <section className="flex-1">
          {(q || hasFilters) && (
            <p className="mb-4 text-sm text-neutral-500">
              Showing results{q ? <> for "{q}"</> : null}{hasFilters ? " with filters applied" : ""}
            </p>
          )}

          {results.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-300 p-10 text-center text-neutral-500">
              No curators found. Try adjusting your search or filters.
            </div>
          ) : (
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((c) => <Card key={c.id} c={c} />)}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
} 