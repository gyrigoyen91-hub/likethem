// components/curator/EmptyState.tsx
export default function EmptyState({ name }: { name: string }) {
  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-dashed p-10 text-center">
      <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-gray-100" />
      <h3 className="text-lg font-semibold">This curator hasn't added any items yet</h3>
      <p className="mt-1 text-sm text-gray-600">
        {name}'s closet is carefully curating their collection. Check back soon!
      </p>
    </div>
  );
}
