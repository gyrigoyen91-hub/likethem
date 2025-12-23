'use client';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { CATEGORY_META, FALLBACK_CATEGORY } from '@/lib/categories';

type Item = { category: string; count: number };

export default function CategoryScroller({
  items, 
  tier, 
  totalCount,
}: { 
  items: Item[]; 
  tier: 'PUBLIC'|'INNER'|'DROP'; 
  totalCount: number; 
}) {
  const sp = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const current = sp.get('cat') ?? 'all';

  function setCat(cat: string | null) {
    const params = new URLSearchParams(sp.toString());
    params.set('t', tier.toLowerCase());
    if (!cat || cat === 'all') params.delete('cat');
    else params.set('cat', cat);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  const chips = [
    { key: 'all', label: 'All', count: totalCount, image: null as any },
    ...items.map(({ category, count }) => {
      const meta = CATEGORY_META[category] ?? FALLBACK_CATEGORY;
      return { key: category, label: meta.label, count, image: meta.image };
    }),
  ].filter(c => c.count > 0);

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex gap-3 py-3 snap-x snap-mandatory">
        {chips.map(chip => {
          const active = current === chip.key || (current === 'all' && chip.key === 'all');
          return (
            <button
              key={chip.key}
              onClick={() => setCat(chip.key)}
              className={[
                'shrink-0 flex items-center gap-3 rounded-xl border px-4 py-2 transition-colors min-h-[40px]',
                'focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2',
                active ? 'border-black bg-black text-white' : 'border-zinc-200 bg-white hover:bg-zinc-50'
              ].join(' ')}
              aria-pressed={active}
              aria-label={`${chip.label}, ${chip.count} items`}
              data-analytics="category-click"
              data-tier={tier.toLowerCase()}
              data-category={chip.key}
            >
              {chip.image ? (
                <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-md bg-zinc-100 overflow-hidden">
                  <Image
                    src={chip.image}
                    alt=""
                    width={32}
                    height={32}
                    sizes="32px"
                    className="object-contain"
                    loading="lazy"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                  />
                </span>
              ) : (
                <span className="h-8 w-8 rounded-md bg-zinc-100 flex items-center justify-center">
                  <span className="text-xs font-medium text-zinc-500">All</span>
                </span>
              )}
              <span className="whitespace-nowrap font-medium">{chip.label}</span>
              <span className={`text-sm ${active ? 'opacity-90' : 'text-zinc-500'}`}>
                {chip.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
