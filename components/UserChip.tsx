"use client";

import Image from "next/image";

function initialFromName(name?: string) {
  if (!name) return "•";
  const trimmed = name.trim();
  if (!trimmed) return "•";
  return trimmed.charAt(0).toUpperCase();
}

export default function UserChip({
  name,
  image,
  className = "",
}: {
  name?: string | null;
  image?: string | null;
  className?: string;
}) {
  const firstName = (name ?? "").split(" ")[0] || "";

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {image ? (
        <Image
          src={image}
          alt={name ?? "User"}
          width={28}
          height={28}
          className="rounded-full object-cover"
        />
      ) : (
        <div
          aria-hidden="true"
          className="grid h-7 w-7 place-items-center rounded-full bg-gray-200 text-[12px] font-medium text-gray-700"
          title={name ?? "User"}
        >
          {initialFromName(name ?? undefined)}
        </div>
      )}

      {/* No wrapping; truncate gracefully */}
      <span className="max-w-[120px] truncate text-sm font-medium leading-none">
        {firstName}
      </span>
    </div>
  );
}
