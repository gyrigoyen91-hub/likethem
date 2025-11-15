// app/api/search/route.ts
import { NextResponse } from "next/server";
import { searchCurators } from "@/lib/searchCurators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").slice(0, 80);
  const limit = Number(searchParams.get("limit") || 6);

  if (!q) return NextResponse.json({ results: [] });

  const results = await searchCurators(q, Math.min(Math.max(limit, 1), 10));
  return NextResponse.json({ results });
} 