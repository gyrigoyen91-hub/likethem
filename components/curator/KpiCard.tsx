import { Card, CardContent } from "@/components/ui/card";

export function KpiCard({
  label,
  value,
  deltaPct,
  icon,
}: { 
  label: string; 
  value: string | number; 
  deltaPct?: number; 
  icon?: React.ReactNode 
}) {
  const positive = (deltaPct ?? 0) >= 0;
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardContent className="p-5 flex items-center justify-between">
        <div>
          <div className="text-sm text-muted-foreground">{label}</div>
          <div className="mt-1 text-2xl font-semibold">{value}</div>
          {deltaPct != null && (
            <div className={`mt-1 text-xs ${positive ? "text-emerald-600" : "text-rose-600"}`}>
              {positive ? "+" : ""}
              {deltaPct}% from last month
            </div>
          )}
        </div>
        {icon && <div className="opacity-60">{icon}</div>}
      </CardContent>
    </Card>
  );
}
