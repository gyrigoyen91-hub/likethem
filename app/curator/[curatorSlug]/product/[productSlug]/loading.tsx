export default function Loading() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-10 md:grid-cols-2">
        <div className="aspect-[4/5] animate-pulse rounded-2xl bg-neutral-100" />
        <div className="space-y-4">
          <div className="h-7 w-2/3 animate-pulse rounded bg-neutral-100" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-neutral-100" />
          <div className="h-6 w-24 animate-pulse rounded bg-neutral-100" />
          <div className="h-24 w-full animate-pulse rounded bg-neutral-100" />
          <div className="h-10 w-40 animate-pulse rounded bg-neutral-100" />
        </div>
      </div>
    </main>
  );
}
