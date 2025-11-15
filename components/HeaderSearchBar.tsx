"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

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
      className="hidden md:flex items-center gap-2 rounded-full border px-3 h-9 text-sm bg-white group"
      role="search"
      aria-label="Search"
    >
      <Search className="size-4 text-gray-700 group-hover:text-black transition-colors" strokeWidth={1.5} />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search"
        className="outline-none bg-transparent w-40"
      />
    </form>
  );
}
