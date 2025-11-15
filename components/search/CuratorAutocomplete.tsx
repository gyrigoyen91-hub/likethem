"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Item = {
  id: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  bannerImage?: string | null;
  followersCount?: number | null;
  isEditorsPick?: boolean | null;
};

type Props = {
  /** Placeholder shown in the input */
  placeholder?: string;
  /** Initial query value (if any) */
  defaultValue?: string;
  /** Where to navigate on submit when user presses Enter with no highlight */
  submitTo?: string; // e.g. "/explore"
  /** Name of the query param for final submit (default "q") */
  queryParam?: string;
  /** Class names to fit container (header vs explore page) */
  className?: string;
};

export default function CuratorAutocomplete({
  placeholder = "Search curators, city, or style…",
  defaultValue = "",
  submitTo = "/explore",
  queryParam = "q",
  className = "",
}: Props) {
  const router = useRouter();
  const [q, setQ] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [highlight, setHighlight] = useState<number>(-1);
  const abortRef = useRef<AbortController | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce
  useEffect(() => {
    if (!q?.trim()) {
      setItems([]);
      setOpen(false);
      return;
    }
    setBusy(true);
    const ctl = new AbortController();
    abortRef.current?.abort();
    abortRef.current = ctl;

    const id = setTimeout(async () => {
      try {
        const url = `/api/search/curators?q=${encodeURIComponent(q)}&limit=8`;
        const res = await fetch(url, { signal: ctl.signal, cache: "no-store" });
        if (!res.ok) throw new Error("network");
        const json = await res.json();
        setItems(json.items || []);
        setOpen(true);
        setHighlight(json.items?.length ? 0 : -1);
      } catch (_) {
        // ignore
      } finally {
        setBusy(false);
      }
    }, 200);

    return () => {
      clearTimeout(id);
      ctl.abort();
    };
  }, [q]);

  // Close when clicking outside
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function submitSearch() {
    const url = new URL(submitTo, window.location.origin);
    if (q?.trim()) url.searchParams.set(queryParam, q.trim());
    router.push(url.pathname + "?" + url.searchParams.toString());
    setOpen(false);
  }

  function openItem(i: number) {
    const it = items[i];
    if (!it) return;
    router.push(`/curator/${it.slug}`);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => (items.length ? (h + 1) % items.length : -1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => (items.length ? (h - 1 + items.length) % items.length : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlight >= 0 && items[highlight]) openItem(highlight);
      else submitSearch();
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={boxRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => items.length && setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="w-full rounded-xl border border-neutral-300 bg-white/70 px-4 py-2 text-sm outline-none placeholder:text-neutral-400 focus:border-black"
          role="combobox"
          aria-expanded={open}
          aria-controls="ac-listbox"
          aria-autocomplete="list"
        />
        {busy && (
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
            <span className="inline-block animate-spin">⏳</span>
          </div>
        )}
      </div>

      {open && items.length > 0 && (
        <ul
          id="ac-listbox"
          role="listbox"
          className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-lg"
        >
          {items.map((it, i) => {
            const active = i === highlight;
            return (
              <li
                key={it.id}
                role="option"
                aria-selected={active}
                onMouseEnter={() => setHighlight(i)}
                onMouseDown={(e) => {
                  // Prevent input blur before navigation
                  e.preventDefault();
                  openItem(i);
                }}
                className={`flex cursor-pointer items-center gap-3 px-3 py-2 ${
                  active ? "bg-neutral-50" : "bg-white"
                }`}
              >
                <div className="relative h-9 w-12 shrink-0 overflow-hidden rounded-md bg-neutral-100">
                  {it.bannerImage && (
                    <Image src={it.bannerImage} alt={it.title} fill className="object-cover" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm text-neutral-900">{it.title}</div>
                  <div className="truncate text-xs text-neutral-500">
                    {it.subtitle ?? ""}{" "}
                    {it.subtitle ? " • " : ""}
                    {typeof it.followersCount === "number"
                      ? Intl.NumberFormat("en", { notation: "compact" }).format(it.followersCount) + " followers"
                      : ""}
                  </div>
                </div>
                {it.isEditorsPick ? (
                  <span className="ml-auto rounded-full border px-2 py-0.5 text-[10px] text-neutral-600">
                    Editor's Pick
                  </span>
                ) : null}
              </li>
            );
          })}
          {/* Footer row: "See all results" */}
          <li
            className="cursor-pointer border-t border-neutral-200 px-3 py-2 text-center text-xs text-neutral-600 hover:bg-neutral-50"
            onMouseDown={(e) => {
              e.preventDefault();
              submitSearch();
            }}
          >
            See all results for "{q}"
          </li>
        </ul>
      )}
    </div>
  );
}
