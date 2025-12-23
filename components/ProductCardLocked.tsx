"use client";

import { Lock } from "lucide-react";
import { useState } from "react";
import AccessModal from "./AccessModal";
import { ProductImageWithFallback } from "@/components/ImageWithFallback";

export type ProductCardData = {
  id: string;
  title: string;
  price: number;
  slug: string | null;
  imageUrl: string | null;
  isFeatured?: boolean;
  createdAt?: string;
  category?: string | null;
};

interface ProductCardLockedProps {
  product: ProductCardData;
  curatorId: string;
  curatorSlug?: string;
}

export default function ProductCardLocked({ product, curatorId, curatorSlug }: ProductCardLockedProps) {
  const [showAccessModal, setShowAccessModal] = useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowAccessModal(true);
  };

  const handleUnlockSuccess = () => {
    // Store unlock state in localStorage keyed by curator slug or ID
    const unlockKey = curatorSlug ? `innerUnlocked:${curatorSlug}` : `innerUnlocked:${curatorId}`;
    localStorage.setItem(unlockKey, "true");
    
    setShowAccessModal(false);
    // Reload page to reflect access
    window.location.reload();
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        className="group block overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md relative cursor-pointer"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setShowAccessModal(true);
          }
        }}
        aria-label={`Unlock access to ${product.title}`}
      >
        <div className="aspect-[4/3] w-full overflow-hidden bg-gray-50 relative">
          <ProductImageWithFallback
            src={product.imageUrl}
            alt={product.title}
            size="medium"
            fill
            className="transition duration-300 group-hover:scale-[1.02] blur-md scale-105"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="text-center text-white">
              <Lock className="size-10 text-white mx-auto mb-2" strokeWidth={1.5} />
              <p className="text-sm font-medium">Have a code? Unlock access</p>
            </div>
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
      </div>

      <AccessModal
        isOpen={showAccessModal}
        onClose={() => setShowAccessModal(false)}
        onSuccess={handleUnlockSuccess}
        curatorSlug={curatorSlug}
        curatorId={curatorId}
      />
    </>
  );
}