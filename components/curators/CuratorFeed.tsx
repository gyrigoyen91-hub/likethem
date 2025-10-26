"use client";

import React from "react";
import MasonryGrid from "@/components/discover/MasonryGrid";
import { CuratorCard } from "./CuratorCard";

type CuratorFeedProps = {
  curators: Array<{
    id: string;
    slug: string;
    name: string;
    avatar?: string | null;
    city?: string | null;
    followers?: number | null;
    hero?: string | null;
    postUrl?: string | null;
    isEditorsPick?: boolean;
  }>;
  className?: string;
};

export function CuratorFeed({ curators, className }: CuratorFeedProps) {
  return (
    <div className={className}>
      <MasonryGrid>
        {curators.map((curator) => (
          <CuratorCard
            key={curator.id}
            slug={curator.slug}
            name={curator.name}
            avatar={curator.avatar}
            city={curator.city}
            followers={curator.followers}
            hero={curator.hero}
            postUrl={curator.postUrl}
            isEditorsPick={curator.isEditorsPick}
          />
        ))}
      </MasonryGrid>
    </div>
  );
}
