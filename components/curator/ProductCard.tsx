// components/curator/ProductCard.tsx
import Link from "next/link";

export type ProductCardData = {
  id: string;
  title: string;
  price: number;
  slug: string | null;
  imageUrl: string | null;
};

export default function ProductCard({ product }: { product: ProductCardData }) {
  const href = product.slug ? `/product/${product.slug}` : "#";
  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="aspect-[4/3] w-full overflow-hidden bg-gray-50">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-400">
            Image not available
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="line-clamp-1 text-sm font-medium text-gray-900">{product.title}</div>
        <div className="mt-1 text-sm font-semibold">${product.price.toFixed(2)}</div>
      </div>
    </Link>
  );
}
