import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { OrderListItem } from "@/components/orders/OrderListItem";
import { EmptyOrders } from "@/components/orders/EmptyOrders";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function getOrders(page = 1) {
  const limit = 10;
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: { buyerId: "temp" }, // Will be replaced with actual user ID
      orderBy: { createdAt: "desc" },
      skip, 
      take: limit,
      include: {
        items: {
          include: { 
            product: { 
              select: { 
                id: true, 
                title: true, 
                images: {
                  select: { url: true, altText: true },
                  take: 1,
                  orderBy: { order: 'asc' }
                }
              } 
            } 
          },
        },
        shippingAddress: true,
      },
    }),
    prisma.order.count({ where: { buyerId: "temp" } }),
  ]);

  await prisma.$disconnect();

  return {
    page, 
    limit, 
    total, 
    pages: Math.ceil(total / limit),
    orders
  };
}

export default async function OrdersPage({ searchParams }: { searchParams: { page?: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/signin");

  const page = Number(searchParams?.page ?? "1");
  
  // Get orders directly from database for this user
  const limit = 10;
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: { buyerId: user.id },
      orderBy: { createdAt: "desc" },
      skip, 
      take: limit,
      include: {
        items: {
          include: { 
            product: { 
              select: { 
                id: true, 
                title: true, 
                images: {
                  select: { url: true, altText: true },
                  take: 1,
                  orderBy: { order: 'asc' }
                }
              } 
            } 
          },
        },
        shippingAddress: true,
      },
    }),
    prisma.order.count({ where: { buyerId: user.id } }),
  ]);

  await prisma.$disconnect();

  const data = {
    page, 
    limit, 
    total, 
    pages: Math.ceil(total / limit),
    orders
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <h1 className="text-3xl font-semibold tracking-tight">Your Orders</h1>
      <p className="mt-1 text-muted-foreground">Track your purchases and view order details.</p>

      <div className="mt-6 grid gap-4">
        {data.orders.length === 0 ? (
          <EmptyOrders />
        ) : (
          data.orders.map((o: any) => <OrderListItem key={o.id} order={o} />)
        )}
      </div>

      {/* Simple pager */}
      {data.pages > 1 && (
        <div className="mt-6 flex items-center justify-between text-sm">
          <a
            href={`/orders?page=${Math.max(1, page - 1)}`}
            className={`rounded-lg border px-3 py-1.5 ${page === 1 ? "pointer-events-none opacity-50" : ""}`}
          >Previous</a>
          <div className="text-muted-foreground">
            Page {page} of {data.pages}
          </div>
          <a
            href={`/orders?page=${Math.min(data.pages, page + 1)}`}
            className={`rounded-lg border px-3 py-1.5 ${page === data.pages ? "pointer-events-none opacity-50" : ""}`}
          >Next</a>
        </div>
      )}
    </div>
  );
}