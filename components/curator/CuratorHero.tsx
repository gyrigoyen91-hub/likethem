// components/curator/CuratorHero.tsx
import Link from "next/link";

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
  return (
    <section className="relative mb-8 overflow-hidden rounded-3xl border border-gray-200">
      {/* Cover */}
      <div className="h-40 w-full bg-gradient-to-r from-gray-100 to-gray-50 md:h-56">
        {curator.bannerImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={curator.bannerImage}
            alt={`${curator.storeName ?? "Curator"} banner`}
            className="h-full w-full object-cover"
          />
        )}
      </div>

      {/* Header content */}
      <div className="relative -mt-12 px-5 pb-6 md:-mt-16 md:px-8">
        <div className="flex items-end gap-4">
          <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-gray-100 md:h-28 md:w-28">
            {curator.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={curator.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                Image not available
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold md:text-3xl">
                {curator.storeName ?? "Curator's Closet"}
              </h1>
              {curator.isEditorsPick ? (
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
                  Editor's Pick
                </span>
              ) : null}
            </div>
            <p className="mt-2 max-w-3xl text-sm text-gray-600">{curator.bio}</p>

            <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
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
            <button className="rounded-full border px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">
              Share
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
