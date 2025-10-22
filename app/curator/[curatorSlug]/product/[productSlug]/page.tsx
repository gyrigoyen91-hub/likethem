import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase-server";
import AccessModalTrigger from "@/components/access/AccessModalTrigger";
import AddToCartButton from "@/components/cart/AddToCartButton";
import { hasAccessServer } from "@/lib/access/hasAccessServer";
import { formatCurrency } from "@/lib/format";
import { mockProducts } from "@/lib/mock-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = {
  params: { curatorSlug: string; productSlug: string };
  searchParams: Record<string, string | string[] | undefined>;
};

async function fetchData(curatorSlug: string, productSlug: string) {
  try {
    const supabase = getSupabaseServer();

    const { data, error } = await supabase
      .from("products")
      .select(`
        id,
        slug,
        title,
        description,
        price,
        currency,
        visibility,
        "isActive",
        "stockQuantity",
        sizes,
        colors,
        "dropEndsAt",
        "createdAt",
        curator:curator_profiles!products_curatorId_fkey(
          id, slug, "storeName", avatar, city, "isPublic"
        ),
        images:product_images(id, url, "sortOrder")
      `)
      .eq("slug", productSlug)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Product fetch error:", error);
      // Fall back to mock data
      return getMockProductData(curatorSlug, productSlug);
    }

    if (!data || !data.curator || data.curator.slug !== curatorSlug) {
      return getMockProductData(curatorSlug, productSlug);
    }

    // normalize arrays if stored as text
    const sizes =
      Array.isArray(data.sizes)
        ? data.sizes
        : typeof data.sizes === "string" && data.sizes.trim()
        ? data.sizes.split(",").map((s: string) => s.trim())
        : [];
    const colors =
      Array.isArray(data.colors)
        ? data.colors
        : typeof data.colors === "string" && data.colors.trim()
        ? data.colors.split(",").map((s: string) => s.trim())
        : [];

    const images = (data.images ?? []).sort(
      (a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
    );

    return { ...data, sizes, colors, images };
  } catch (error) {
    console.error("Product fetch error:", error);
    return getMockProductData(curatorSlug, productSlug);
  }
}

function getMockProductData(curatorSlug: string, productSlug: string) {
  const product = mockProducts.find(p => p.slug === productSlug);
  if (!product) return null;

  // Mock curator data
  const curator = {
    id: product.curatorId,
    slug: curatorSlug,
    storeName: "Mock Curator",
    avatar: null,
    city: "Mock City",
    isPublic: true,
  };

  // Mock images
  const images = product.imageUrl ? [{ id: "1", url: product.imageUrl, sortOrder: 0 }] : [];

  return {
    ...product,
    curator,
    images,
    sizes: product.sizes ? product.sizes.split(",").map(s => s.trim()) : [],
    colors: product.colors ? product.colors.split(",").map(s => s.trim()) : [],
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const supabase = getSupabaseServer();
    const { data } = await supabase
      .from("products")
      .select("title, description, slug, curator:curator_profiles(slug)")
      .eq("slug", params.productSlug)
      .limit(1)
      .maybeSingle();

    if (!data) {
      // Fall back to mock data
      const mockProduct = mockProducts.find(p => p.slug === params.productSlug);
      if (!mockProduct) return { title: "Product Not Found — LikeThem" };

      const title = `${mockProduct.title} — LikeThem`;
      const description = mockProduct.description ?? "Curated fashion by top influencers.";
      const url = `https://likethem.io/curator/${params.curatorSlug}/product/${mockProduct.slug}`;

      return {
        title,
        description,
        openGraph: { title, description, url },
        alternates: { canonical: url },
      };
    }

    const title = `${data.title} — LikeThem`;
    const description = data.description ?? "Curated fashion by top influencers.";
    const url = `https://likethem.io/curator/${data.curator?.slug ?? "shop"}/product/${data.slug}`;

    return {
      title,
      description,
      openGraph: { title, description, url },
      alternates: { canonical: url },
    };
  } catch (error) {
    console.error("Metadata error:", error);
    return { title: "Product — LikeThem" };
  }
}

export default async function ProductPage({ params }: Props) {
  const product = await fetchData(params.curatorSlug, params.productSlug);
  if (!product || !product.isActive || !product.curator?.isPublic) {
    notFound();
  }

  const now = new Date();
  const dropActive =
    product.visibility === "drop" &&
    product.dropEndsAt &&
    new Date(product.dropEndsAt) > now;

  // Access gate for INNER
  const unlocked =
    product.visibility !== "inner" ? true : await hasAccessServer({ curatorId: product.curator.id });

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      {/* Breadcrumbs */}
      <nav className="mb-6 text-sm text-neutral-500">
        <Link href="/" className="hover:text-neutral-900">Home</Link>
        <span className="mx-2">/</span>
        <Link href={`/curator/${product.curator.slug}`} className="hover:text-neutral-900">
          {product.curator.storeName}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-neutral-900">{product.title}</span>
      </nav>

      <div className="grid gap-10 md:grid-cols-2">
        {/* Gallery */}
        <section className="space-y-4">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-neutral-100">
            {product.images?.[0]?.url && (
              <Image 
                src={product.images[0].url} 
                alt={product.title} 
                fill 
                className="object-cover" 
                priority 
              />
            )}
            {!unlocked && product.visibility === "inner" && (
              <div className="absolute inset-0 backdrop-blur-[2px] bg-black/30" />
            )}
          </div>
          <div className="grid grid-cols-4 gap-3">
            {product.images?.slice(1, 5).map((img: any) => (
              <div key={img.id} className="relative aspect-square overflow-hidden rounded-xl bg-neutral-100">
                <Image src={img.url} alt={product.title} fill className="object-cover" />
              </div>
            ))}
          </div>
        </section>

        {/* Info */}
        <section className="space-y-5">
          <div>
            <h1 className="text-2xl font-medium tracking-tight text-neutral-900">{product.title}</h1>
            <Link
              href={`/curator/${product.curator.slug}`}
              className="mt-1 inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900"
            >
              <div className="relative h-6 w-6 overflow-hidden rounded-full bg-neutral-200">
                {product.curator.avatar && (
                  <Image src={product.curator.avatar} alt={product.curator.storeName} fill className="object-cover" />
                )}
              </div>
              {product.curator.storeName}
              {product.curator.city ? <span className="text-neutral-400">• {product.curator.city}</span> : null}
            </Link>
          </div>

          {/* Price / countdown */}
          <div className="flex items-center gap-4">
            <div className="text-xl text-neutral-900">
              {formatCurrency(product.price, product.currency ?? "USD")}
            </div>
            {product.visibility === "drop" && (
              <DropCountdown endsAt={product.dropEndsAt} active={dropActive} />
            )}
          </div>

          {/* Description (short) */}
          <p className="text-sm leading-6 text-neutral-600">{product.description}</p>

          {/* Options (sizes/colors) */}
          <div className="space-y-4">
            {product.sizes?.length > 0 && (
              <OptionPills label="Size" options={product.sizes} name="size" />
            )}
            {product.colors?.length > 0 && (
              <OptionPills label="Color" options={product.colors} name="color" />
            )}
          </div>

          {/* Purchase / gate */}
          {product.visibility === "inner" && !unlocked ? (
            <div className="rounded-2xl border border-neutral-200 p-4">
              <p className="mb-3 text-sm text-neutral-700">
                This item is part of the creator's <b>Inner Closet</b>. Unlock with your invite code.
              </p>
              <AccessModalTrigger 
                variant="primary" 
                label="Unlock with code" 
                curatorId={product.curator.id}
                curatorName={product.curator.storeName}
              />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <AddToCartButton
                productId={product.id}
                disabled={!product.isActive || product.stockQuantity <= 0 || (product.visibility === "drop" && !dropActive)}
                className="rounded-xl bg-black px-5 py-3 text-sm text-white hover:bg-neutral-900 disabled:cursor-not-allowed disabled:bg-neutral-200"
              >
                {product.stockQuantity > 0 ? "Add to cart" : "Out of stock"}
              </AddToCartButton>
              <span className="text-xs text-neutral-500">
                Ships worldwide • Free returns
              </span>
            </div>
          )}

          {/* Subtle meta */}
          <div className="pt-4 text-xs text-neutral-400">
            SKU: {product.slug.toUpperCase()} • Curated by {product.curator.storeName}
          </div>
        </section>
      </div>

      {/* (Optional) Related products */}
      <RelatedProducts curatorId={product.curator.id} currentProductId={product.id} />
    </main>
  );
}

/* ======== small components (same file or separate) ======== */

function DropCountdown({ endsAt, active }: { endsAt?: string | null; active: boolean }) {
  if (!endsAt) return null;
  return (
    <span
      className={`rounded-full border px-2 py-1 text-xs ${
        active ? "border-neutral-300 text-neutral-700" : "border-neutral-200 text-neutral-400"
      }`}
      suppressHydrationWarning
    >
      {active ? `Ends ${new Date(endsAt).toLocaleString()}` : "Drop ended"}
    </span>
  );
}

function OptionPills({ label, options, name }: { label: string; options: string[]; name: string }) {
  return (
    <div>
      <div className="mb-2 text-sm text-neutral-700">{label}</div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <label key={opt} className="cursor-pointer">
            <input type="radio" name={name} value={opt} className="peer hidden" />
            <span className="rounded-full border border-neutral-300 px-3 py-1 text-xs text-neutral-700 peer-checked:border-black peer-checked:bg-black peer-checked:text-white">
              {opt}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

async function RelatedProducts({ curatorId, currentProductId }: { curatorId: string; currentProductId: string }) {
  try {
    const supabase = getSupabaseServer();
    const { data } = await supabase
      .from("products")
      .select("id, slug, title, price, currency, images:product_images(url, \"sortOrder\"), curator:curator_profiles(slug)")
      .eq("curatorId", curatorId)
      .eq("isActive", true)
      .neq("id", currentProductId)
      .order("createdAt", { ascending: false })
      .limit(4);

    if (!data || data.length === 0) {
      // Fall back to mock data
      const mockRelated = mockProducts
        .filter(p => p.curatorId === curatorId && p.id !== currentProductId)
        .slice(0, 4);

      if (mockRelated.length === 0) return null;

      return (
        <section className="mt-12">
          <h2 className="mb-4 text-base font-medium text-neutral-900">More from this curator</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {mockRelated.map((p) => (
              <Link
                key={p.id}
                href={`/curator/mock-curator/product/${p.slug}`}
                className="group block"
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-neutral-100">
                  {p.imageUrl && (
                    <Image 
                      src={p.imageUrl} 
                      alt={p.title} 
                      fill 
                      className="object-cover transition-transform duration-300 group-hover:scale-105" 
                    />
                  )}
                </div>
                <div className="mt-2 text-sm text-neutral-900">{p.title}</div>
                <div className="text-xs text-neutral-500">
                  {formatCurrency(p.price, "USD")}
                </div>
              </Link>
            ))}
          </div>
        </section>
      );
    }

    return (
      <section className="mt-12">
        <h2 className="mb-4 text-base font-medium text-neutral-900">More from this curator</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {data.map((p: any) => {
            const img = (p.images ?? []).sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))[0]?.url;
            return (
              <Link
                key={p.id}
                href={`/curator/${p.curator.slug}/product/${p.slug}`}
                className="group block"
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-neutral-100">
                  {img && <Image src={img} alt={p.title} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />}
                </div>
                <div className="mt-2 text-sm text-neutral-900">{p.title}</div>
                <div className="text-xs text-neutral-500">
                  {formatCurrency(p.price, p.currency ?? "USD")}
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    );
  } catch (error) {
    console.error("Related products error:", error);
    return null;
  }
}
