import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.role !== "CURATOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Replace mocks with real queries (Prisma/SQL) once connected
    const data = {
      storeVisits: 2847,
      itemsSold: 23,
      earnings: 1247,     // USD
      favorites: 156,
      deltas: { visits: 12, items: 8, earnings: 15, favorites: 23 }, // % vs last month
      recentActivity: [
        { type: "order",   title: "New order received",    meta: 'Order #1234 for "Vintage Leather Jacket"', timeago: "2 hours ago" },
        { type: "favorite",title: "Product favorited",     meta: '"Minimalist Watch" was added to favorites', timeago: "4 hours ago" },
        { type: "review",  title: "New review",            meta: '5-star review for "Classic Denim Jacket"',  timeago: "1 day ago" },
      ],
    };

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching curator stats:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
