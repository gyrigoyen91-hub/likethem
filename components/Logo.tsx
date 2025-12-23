"use client";
import Link from "next/link";
import clsx from "clsx";

export default function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="LikeThem — Home"
      className={clsx(
        // Use the same serif heading font used on page titles
        "font-serif text-[22px] leading-none tracking-[0.18em] uppercase",
        // ensure crisp rendering and consistent height with header
        "select-none whitespace-nowrap",
        className
      )}
    >
      LIKETHEM
    </Link>
  );
} 