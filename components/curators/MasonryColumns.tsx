"use client";
import React from "react";

type MasonryColumnsProps = {
  children: React.ReactNode;
  className?: string;
};

export function MasonryColumns({ children, className }: MasonryColumnsProps) {
  return (
    <div
      data-grid-source="masonry-columns"
      className={[
        "columns-1 sm:columns-2 lg:columns-3 gap-6 mt-8",
        className ?? "",
      ].join(" ")}
    >
      {children}
    </div>
  );
}
