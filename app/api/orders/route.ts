import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

// IMPORTANT: Prisma requires Node.js runtime
export const runtime = 'nodejs';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") ?? "1");
    const limit = Number(searchParams.get("limit") ?? "10");
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

    return NextResponse.json({
      page, 
      limit, 
      total, 
      pages: Math.ceil(total / limit),
      orders
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}