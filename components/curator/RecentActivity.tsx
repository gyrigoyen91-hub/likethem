export function RecentActivity({ items }: {
  items: { 
    type: "order"|"favorite"|"review"; 
    title: string; 
    meta: string; 
    timeago: string; 
  }[];
}) {
  return (
    <div className="rounded-2xl border bg-card">
      <div className="px-5 py-4 font-medium">Recent Activity</div>
      <ul className="divide-y">
        {items.map((it, i) => (
          <li key={i} className="px-5 py-4 flex items-start gap-3">
            <span className="mt-0.5 inline-block h-2.5 w-2.5 rounded-full bg-foreground/60" />
            <div className="flex-1">
              <div className="text-sm">{it.title}</div>
              <div className="text-xs text-muted-foreground">{it.meta}</div>
            </div>
            <div className="text-xs text-muted-foreground">{it.timeago}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
