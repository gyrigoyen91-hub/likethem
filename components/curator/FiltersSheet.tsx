// components/curator/FiltersSheet.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function FiltersSheet() {
  const router = useRouter();
  const params = useSearchParams();

  const [min, setMin] = useState(params.get("min") ?? "");
  const [max, setMax] = useState(params.get("max") ?? "");
  const [sort, setSort] = useState(params.get("sort") ?? "new");

  const apply = () => {
    const url = new URL(window.location.href);
    min ? url.searchParams.set("min", min) : url.searchParams.delete("min");
    max ? url.searchParams.set("max", max) : url.searchParams.delete("max");
    sort ? url.searchParams.set("sort", sort) : url.searchParams.delete("sort");
    router.push(`${url.pathname}?${url.searchParams.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <div className="hidden md:flex items-center gap-2">
        <input
          type="number"
          placeholder="Min $"
          className="w-24 rounded-md border px-2 py-1 text-sm"
          value={min}
          onChange={(e) => setMin(e.target.value)}
        />
        <input
          type="number"
          placeholder="Max $"
          className="w-24 rounded-md border px-2 py-1 text-sm"
          value={max}
          onChange={(e) => setMax(e.target.value)}
        />
        <select
          className="rounded-md border px-2 py-1 text-sm"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="new">Newest</option>
          <option value="price-asc">Price ↑</option>
          <option value="price-desc">Price ↓</option>
        </select>
      </div>
      <button
        onClick={apply}
        className="rounded-md bg-black px-3 py-1.5 text-sm text-white hover:bg-black/90"
      >
        Apply
      </button>
    </div>
  );
}
