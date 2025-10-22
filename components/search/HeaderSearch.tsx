"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Item = { id: string; slug: string; storeName: string; city?: string | null; isEditorsPick: boolean };

export default function HeaderSearch() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // debounce
  useEffect(() => {
    if (!q.trim()) { setItems([]); setOpen(false); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=6`, { cache: "no-store" });
        const json = await r.json();
        setItems(json.results ?? []);
        setOpen(true);
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => clearTimeout(t);
  }, [q]);

  // close on outside click
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  function submitToExplore() {
    router.push(`/explore?q=${encodeURIComponent(q.trim())}`);
    setOpen(false);
  }

  return (
    <div ref={boxRef} className="relative w-full max-w-[380px]">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") { e.preventDefault(); submitToExplore(); }
          if (e.key === "ArrowDown") setActive((v) => Math.min(v + 1, Math.max(items.length - 1, 0)));
          if (e.key === "ArrowUp")   setActive((v) => Math.max(v - 1, 0));
          if (e.key === "Escape")    setOpen(false);
        }}
        placeholder="Search curators, city, or style…"
        className="w-full rounded-full border border-neutral-300 bg-white/70 px-4 py-2 text-sm outline-none placeholder:text-neutral-400 focus:border-black"
        aria-autocomplete="list"
        aria-expanded={open}
      />
      {open && (
        <div className="absolute left-0 right-0 z-30 mt-2 rounded-2xl border border-neutral-200 bg-white/95 backdrop-blur-sm shadow-lg ring-1 ring-black/5">
          {loading && <div className="px-4 py-3 text-sm text-neutral-500">Searching…</div>}
          {!loading && items.length === 0 && (
            <div className="px-4 py-3 text-sm text-neutral-500">No matches. Press Enter to search all results.</div>
          )}
          <ul role="listbox" className="max-h-80 overflow-auto">
            {items.map((it, i) => (
              <li key={it.id} role="option" aria-selected={i === active}>
                <Link
                  href={`/curator/${it.slug}`}
                  className={`flex items-center justify-between px-4 py-3 text-sm hover:bg-neutral-50 ${i === active ? "bg-neutral-50" : ""}`}
                  onClick={() => setOpen(false)}
                >
                  <div className="truncate">
                    <span className="text-neutral-900">{it.storeName}</span>
                    {it.city && <span className="text-neutral-400"> · {it.city}</span>}
                  </div>
                  {it.isEditorsPick && <span className="rounded-full border px-2 py-0.5 text-[11px] text-neutral-600">Editor's Pick</span>}
                </Link>
              </li>
            ))}
          </ul>
          <button
            onClick={submitToExplore}
            className="m-2 w-[calc(100%-1rem)] rounded-xl border border-neutral-300 px-3 py-2 text-center text-sm hover:border-neutral-800"
          >
            See all results for "{q.trim()}"
          </button>
        </div>
      )}
    </div>
  );
}
