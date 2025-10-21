"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { useState } from "react";
import AccessModal from "./AccessModal";

export type ProductCardData = {
  id: string;
  title: string;
  price: number;
  slug: string | null;
  imageUrl: string | null;
  isFeatured?: boolean;
  createdAt?: string;
  category?: string | null;
  curatorId: string; // Added for access check
};

export default function ProductCardLocked({ product }: { product: ProductCardData }) {
  const href = product.slug ? `/product/${product.slug}` : "#";
  const [showAccessModal, setShowAccessModal] = useState(false);

  return (
    <>
      <Link
        href={href}
        className="group block overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md relative"
      >
        <div className="aspect-[4/3] w-full overflow-hidden bg-gray-50 relative">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={product.title}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02] blur-sm"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-400">
              Image not available
            </div>
          )}
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <Lock className="size-8 text-white" strokeWidth={1.5} />
          </div>
        </div>
        <div className="p-4">
          <div className="line-clamp-1 text-sm font-medium text-gray-900 flex items-center gap-2">
            <Lock className="size-4 text-gray-400" />
            {product.title}
          </div>
          <div className="mt-1 text-sm font-semibold text-gray-400 blur-sm">
            ${product.price.toFixed(2)}
          </div>
          <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
            <Lock className="size-3" /> Inner Closet
          </div>
        </div>
      </Link>
      <button
        onClick={() => setShowAccessModal(true)}
        className="mt-2 w-full py-2 px-4 rounded-lg font-medium bg-black text-white hover:bg-gray-800 transition-colors text-sm"
      >
        Have a code? Unlock access
      </button>

      <AccessModal
        isOpen={showAccessModal}
        onClose={() => setShowAccessModal(false)}
        onSuccess={() => {
          setShowAccessModal(false);
          window.location.reload(); // Reload page to reflect access
        }}
        curatorId={product.curatorId}
      />
    </>
  );
}