import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: { productSlug: string } }
) {
  try {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("products")
      .select("slug, curatorId, curator:curator_profiles!products_curatorId_fkey(slug)")
      .eq("slug", params.productSlug)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Redirect error:", error);
      return NextResponse.redirect(new URL("/", _req.url), 302);
    }

    if (!data || !data.curator?.slug) {
      return NextResponse.redirect(new URL("/", _req.url), 302);
    }

    const dest = `/curator/${data.curator.slug}/product/${params.productSlug}`;
    return NextResponse.redirect(new URL(dest, _req.url), 302);
  } catch (error) {
    console.error("Redirect error:", error);
    return NextResponse.redirect(new URL("/", _req.url), 302);
  }
}
