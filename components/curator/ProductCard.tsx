// components/curator/ProductCard.tsx
import Link from "next/link";
import ProductImageWithFallback from "@/components/ImageWithFallback";

export type ProductCardData = {
  id: string;
  title: string;
  price: number;
  slug: string | null;
  imageUrl: string | null;
  isFeatured?: boolean;
  createdAt?: string;
  category?: string | null;
  curatorSlug?: string; // Add curator slug for canonical routing
};

export default function ProductCard({ product }: { product: ProductCardData }) {
  // Use canonical route if curator slug is available, otherwise fall back to short route
  const href = product.slug 
    ? (product.curatorSlug 
        ? `/curator/${product.curatorSlug}/product/${product.slug}` 
        : `/product/${product.slug}`)
    : "#";
    
  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="aspect-[4/3] w-full overflow-hidden bg-gray-50 relative">
        <ProductImageWithFallback
          src={product.imageUrl}
          alt={product.title}
          size="medium"
          fill
          className="transition duration-300 group-hover:scale-[1.02]"
          showBadge={!product.imageUrl}
        />
      </div>
      <div className="p-4">
        <div className="line-clamp-1 text-sm font-medium text-gray-900">{product.title}</div>
        <div className="mt-1 text-sm font-semibold">${product.price.toFixed(2)}</div>
      </div>
    </Link>
  );
}
