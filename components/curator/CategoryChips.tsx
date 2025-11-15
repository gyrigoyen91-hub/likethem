// components/curator/CategoryChips.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";

export type Category = { name: string; count: number };

export default function CategoryChips({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const active = params.get("category") || "all";

  const setCategory = (value: string) => {
    const url = new URL(window.location.href);
    if (value === "all") url.searchParams.delete("category");
    else url.searchParams.set("category", value);
    router.push(`${url.pathname}?${url.searchParams.toString()}`);
  };

  const Chip = ({ name, count, value }: { name: string; count: number; value: string }) => {
    const selected = active === value;
    return (
      <button
        onClick={() => setCategory(value)}
        className={`whitespace-nowrap rounded-2xl border px-3 py-1.5 text-sm transition ${
          selected
            ? "border-black bg-black text-white"
            : "border-gray-300 bg-white text-gray-800 hover:bg-gray-50"
        }`}
      >
        {name} <span className={selected ? "text-white/80" : "text-gray-500"}>· {count}</span>
      </button>
    );
  };

  return (
    <div className="no-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 py-1">
      <Chip name="All" count={categories.reduce((a, c) => a + c.count, 0)} value="all" />
      {categories.map((c) => (
        <Chip key={c.name} name={c.name} count={c.count} value={c.name} />
      ))}
    </div>
  );
}
