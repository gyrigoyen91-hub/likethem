"use client";
import CuratorAutocomplete from "@/components/search/CuratorAutocomplete";

export default function HeaderSearch() {
  return (
    <div className="w-full max-w-[380px]">
      <CuratorAutocomplete
        placeholder="Search curators, city, or style…"
        submitTo="/explore"
        queryParam="q"
        className=""
      />
    </div>
  );
}
