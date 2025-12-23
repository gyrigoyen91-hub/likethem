import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import Image from "next/image";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { safeSrc } from "@/lib/img";

const prisma = new PrismaClient();

export default async function OrderDetail({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/signin");

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { 
      items: { 
        include: { 
          product: {
            include: {
              images: {
                select: { url: true, altText: true },
                take: 1,
                orderBy: { order: 'asc' }
              }
            }
          } 
        } 
      },
      shippingAddress: true,
      curator: {
        select: {
          id: true,
          storeName: true,
          user: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          }
        }
      }
    },
  });

  await prisma.$disconnect();

  if (!order || order.buyerId !== user.id) notFound();

  const date = new Date(order.createdAt).toLocaleString();
  const total = Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(order.totalAmount ?? 0);

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <h1 className="text-3xl font-semibold tracking-tight">Order #{order.id.slice(-8)}</h1>
      <p className="mt-1 text-muted-foreground">{date}</p>

      <div className="mt-6 flex items-center gap-3">
        <OrderStatusBadge status={order.status} />
        <div className="text-sm text-muted-foreground">Total</div>
        <div className="font-medium">{total}</div>
      </div>

      {order.curator && (
        <div className="mt-4 p-4 rounded-2xl border bg-muted/30">
          <div className="text-sm text-muted-foreground">Ordered from</div>
          <div className="font-medium">{order.curator.storeName}</div>
        </div>
      )}

      <div className="mt-6 grid gap-4">
        {order.items.map((it: any) => (
          <Card key={it.id} className="rounded-2xl">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-16 w-16 overflow-hidden rounded-md border bg-muted">
                {it.product?.images?.[0]?.url && (
                  <Image 
                    src={safeSrc(it.product.images[0].url)} 
                    alt={it.product.images[0].altText || it.product.title || "Product"} 
                    width={64} 
                    height={64}
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium">{it.product?.title ?? "Product"}</div>
                <div className="text-sm text-muted-foreground">Qty: {it.quantity}</div>
                {it.size && (
                  <div className="text-sm text-muted-foreground">Size: {it.size}</div>
                )}
                {it.color && (
                  <div className="text-sm text-muted-foreground">Color: {it.color}</div>
                )}
              </div>
              <div className="font-medium">
                {Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(it.price * it.quantity)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {order.shippingAddress && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-3">Shipping Address</h3>
          <Card className="rounded-2xl">
            <CardContent className="p-5">
              <div className="space-y-1">
                <div className="font-medium">{order.shippingAddress.fullName}</div>
                <div>{order.shippingAddress.address}</div>
                <div>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</div>
                <div>{order.shippingAddress.country}</div>
                {order.shippingAddress.phone && (
                  <div className="text-sm text-muted-foreground">Phone: {order.shippingAddress.phone}</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
