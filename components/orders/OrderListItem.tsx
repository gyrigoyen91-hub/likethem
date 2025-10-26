import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { safeSrc } from "@/lib/img";

export function OrderListItem({ order }: { order: any }) {
  const date = new Date(order.createdAt).toLocaleDateString();
  const total = Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(order.totalAmount ?? 0);
  const thumbs = order.items?.slice(0, 4) ?? [];

  return (
    <Link href={`/orders/${order.id}`}>
      <Card className="rounded-2xl hover:shadow-md transition-shadow">
        <CardContent className="p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {thumbs.map((it: any, i: number) => (
                <div key={i} className="h-10 w-10 rounded-md overflow-hidden border bg-muted">
                  {it.product?.images?.[0]?.url && (
                    <Image 
                      src={safeSrc(it.product.images[0].url)} 
                      alt={it.product.images[0].altText || it.product.title || "Product"} 
                      width={40} 
                      height={40} 
                      className="object-cover"
                    />
                  )}
                </div>
              ))}
            </div>
            <div>
              <div className="font-medium">Order #{order.id.slice(-8)}</div>
              <div className="text-sm text-muted-foreground">{date} · {order.items?.length ?? 0} items</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <OrderStatusBadge status={order.status} />
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Total</div>
              <div className="font-semibold">{total}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
