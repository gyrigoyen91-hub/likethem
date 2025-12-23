import { Badge } from "@/components/ui/badge";

const MAP: Record<string, string> = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

export function OrderStatusBadge({ status }: { status: string }) {
  const label = MAP[status] ?? status;
  const tone =
    status === "DELIVERED" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
    status === "SHIPPED" ? "bg-blue-50 text-blue-700 border-blue-200" :
    status === "CANCELLED" ? "bg-rose-50 text-rose-700 border-rose-200" :
    status === "REFUNDED" ? "bg-amber-50 text-amber-800 border-amber-200" :
    "bg-zinc-50 text-zinc-700 border-zinc-200";

  return <Badge className={`rounded-full border ${tone}`}>{label}</Badge>;
}
