"use client";
import React from "react";

type MasonryGridProps = {
  children: React.ReactNode;
  className?: string;
};

export default function MasonryGrid({ children, className }: MasonryGridProps) {
  // CSS masonry via columns; keeps layout light
  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6">
      <div
        className={[
          "columns-1 gap-4 sm:columns-2 lg:columns-3 [column-fill:_balance]",
          className ?? "",
        ].join(" ")}
      >
        {children}
      </div>
    </div>
  );
}
