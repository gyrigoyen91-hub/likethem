"use client";
import React from "react";

type MasonryProps = {
  children: React.ReactNode;
  className?: string;
};

export function CuratorMasonry({ children, className }: MasonryProps) {
  // CSS masonry via columns; keeps layout light
  return (
    <div data-grid-source="shared-curator-masonry" className="mx-auto w-full max-w-[1200px] px-4 md:px-6">
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
