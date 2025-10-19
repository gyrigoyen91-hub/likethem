"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function HeaderSearchBar() {
  const router = useRouter();
  const [q, setQ] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!q.trim()) return;
        router.push(`/search?q=${encodeURIComponent(q.trim())}`);
      }}
      className="hidden md:flex items-center gap-2 rounded-full border px-3 h-9 text-sm bg-white"
      role="search"
      aria-label="Search"
    >
      <span aria-hidden>🔍</span>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search"
        className="outline-none bg-transparent w-40"
      />
    </form>
  );
}
