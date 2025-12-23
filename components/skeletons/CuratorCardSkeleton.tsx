export function CuratorCardSkeleton() {
  return (
    <article className="mb-4 break-inside-avoid rounded-2xl border border-zinc-200/60 bg-white shadow-sm animate-pulse">
      {/* Hero image skeleton */}
      <div className="aspect-[4/5] w-full bg-zinc-200" />
      
      {/* Content skeleton */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Avatar skeleton */}
        <div className="h-9 w-9 rounded-full bg-zinc-200" />
        
        {/* Text skeleton */}
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-4 bg-zinc-200 rounded w-2/3" />
          <div className="h-3 bg-zinc-200 rounded w-1/2" />
        </div>
        
        {/* Button skeleton */}
        <div className="h-7 w-20 bg-zinc-200 rounded-full" />
      </div>
    </article>
  )
}

export function CuratorCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <CuratorCardSkeleton key={i} />
      ))}
    </div>
  )
}
