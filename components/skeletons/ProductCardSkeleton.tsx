export default function ProductCardSkeleton() {
  return (
    <div className="group block overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm animate-pulse">
      {/* Image skeleton */}
      <div className="aspect-[4/3] w-full bg-gray-200" />
      
      {/* Content skeleton */}
      <div className="p-4 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  )
}

export function ProductCardSkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}
