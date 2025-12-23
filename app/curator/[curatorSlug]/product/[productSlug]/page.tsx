import type { Metadata } from "next";
import { ProductImageWithFallback, CuratorImageWithFallback } from "@/components/ImageWithFallback";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AddToCartButton from "@/components/cart/AddToCartButton";
import CollapsibleSection from "@/components/ui/CollapsibleSection";
import WishlistButton from "@/components/product/WishlistButton";
import { CheckCircle2 } from "lucide-react";
import { getLocale } from "@/lib/i18n/getLocale";
import { t } from "@/lib/i18n/t";
import ProductUnavailable from "@/components/product/ProductUnavailable";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = {
  params: { curatorSlug: string; productSlug: string };
  searchParams: Record<string, string | string[] | undefined>;
};

type FetchResult = 
  | { error: 'product_not_found' | 'curator_slug_mismatch' | 'server_error'; correlationId: string }
  | { error: 'product_inactive'; correlationId: string; curator: { slug: string; storeName: string; bannerImage: string | null } }
  | { 
      id: string;
      slug: string;
      title: string;
      description: string | null;
      price: number;
      isActive: boolean;
      stockQuantity: number;
      sizes: string[];
      colors: string[];
      curator: {
        id: string;
        slug: string;
        storeName: string;
        bannerImage: string | null;
        isPublic: boolean;
        avatar: string | null;
      };
      images: Array<{ id: string; url: string; order: number }>;
    }

async function fetchData(curatorSlug: string, productSlug: string): Promise<FetchResult> {
  const correlationId = `product-detail-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    console.log(`[PRODUCT_DETAIL][${correlationId}][FETCH]`, {
      curatorSlug,
      productSlug,
    });

    // Fetch product with curator relation using Prisma
    const product = await prisma.product.findUnique({
      where: { slug: productSlug },
      include: {
        curator: {
          select: {
            id: true,
            slug: true,
            storeName: true,
            bannerImage: true,
            isPublic: true,
            user: {
              select: {
                avatar: true,
              },
            },
          },
        },
        images: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!product) {
      console.log(`[PRODUCT_DETAIL][${correlationId}][NOT_FOUND]`, {
        productSlug,
        curatorSlug,
        reason: 'NOT_FOUND',
      });
      return { error: 'product_not_found', correlationId };
    }

    // Verify curator slug matches
    if (product.curator.slug !== curatorSlug) {
      console.log(`[PRODUCT_DETAIL][${correlationId}][MISMATCH]`, {
        productSlug,
        expectedCuratorSlug: curatorSlug,
        actualCuratorSlug: product.curator.slug,
        reason: 'MISMATCH',
      });
      return { error: 'curator_slug_mismatch', correlationId };
    }

    // Check if product is inactive (sold/hidden/flagged)
    if (!product.isActive) {
      console.log(`[PRODUCT_DETAIL][${correlationId}][INACTIVE]`, {
        productId: product.id,
        productSlug,
        curatorSlug,
        reason: 'INACTIVE',
      });
      return {
        error: 'product_inactive',
        correlationId,
        curator: {
          slug: product.curator.slug,
          storeName: product.curator.storeName,
          bannerImage: product.curator.bannerImage,
        },
      };
    }

    // Check if curator is public
    if (!product.curator.isPublic) {
      console.log(`[PRODUCT_DETAIL][${correlationId}][NOT_FOUND]`, {
        productId: product.id,
        curatorId: product.curator.id,
        curatorSlug: product.curator.slug,
        reason: 'NOT_FOUND', // Treat as not found for UX
      });
      return { error: 'product_not_found', correlationId };
    }

    // Normalize sizes and colors from string to array
    const sizes =
      typeof product.sizes === "string" && product.sizes.trim()
        ? product.sizes.split(",").map((s: string) => s.trim())
        : [];
    const colors =
      typeof product.colors === "string" && product.colors.trim()
        ? product.colors.split(",").map((s: string) => s.trim())
        : [];

    console.log(`[PRODUCT_DETAIL][${correlationId}][SUCCESS]`, {
      productId: product.id,
      productSlug: product.slug,
      title: product.title,
      isActive: product.isActive,
      curatorSlug: product.curator.slug,
      curatorIsPublic: product.curator.isPublic,
      imageCount: product.images.length,
    });

    return {
      id: product.id,
      slug: product.slug,
      title: product.title,
      description: product.description,
      price: product.price,
      isActive: product.isActive,
      stockQuantity: product.stockQuantity,
      sizes,
      colors,
      curator: {
        id: product.curator.id,
        slug: product.curator.slug,
        storeName: product.curator.storeName,
        bannerImage: product.curator.bannerImage,
        isPublic: product.curator.isPublic,
        avatar: product.curator.user?.avatar || product.curator.bannerImage || null,
      },
      images: product.images.map(img => ({
        id: img.id,
        url: img.url,
        order: img.order,
      })),
    };
  } catch (error) {
    console.error(`[PRODUCT_DETAIL][${correlationId}][ERROR]`, {
      error: error instanceof Error ? error.message : String(error),
      curatorSlug,
      productSlug,
      reason: 'server_error',
    });
    return { error: 'server_error', correlationId };
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: params.productSlug },
      include: {
        curator: {
          select: {
            slug: true,
          },
        },
      },
    });

    if (!product || product.curator.slug !== params.curatorSlug) {
      return { title: "Product Not Found — LikeThem" };
    }

    const title = `${product.title} — LikeThem`;
    const description = product.description ?? "Curated fashion by top influencers.";
    const url = `https://likethem.io/curator/${product.curator.slug}/product/${product.slug}`;

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
  const locale = await getLocale();
  const result = await fetchData(params.curatorSlug, params.productSlug);
  
  // Handle explicit error states with trust-building UX
  if ('error' in result) {
    switch (result.error) {
      case 'product_not_found':
      case 'curator_slug_mismatch':
        // For mismatch, log it but show same UX as not found (don't expose technical details)
        if (result.error === 'curator_slug_mismatch') {
          console.log(`[PRODUCT_DETAIL][MISMATCH_UX]`, {
            productSlug: params.productSlug,
            curatorSlug: params.curatorSlug,
            correlationId: result.correlationId,
          });
        }
        // Try to fetch curator info for context
        let curatorInfo: { name?: string; slug?: string; banner?: string | null } = {}
        try {
          const curator = await prisma.curatorProfile.findUnique({
            where: { slug: params.curatorSlug },
            select: {
              storeName: true,
              slug: true,
              bannerImage: true,
            },
          })
          if (curator) {
            curatorInfo = {
              name: curator.storeName,
              slug: curator.slug,
              banner: curator.bannerImage,
            }
          }
        } catch {
          // Ignore errors fetching curator
        }
        
        return (
          <ProductUnavailable
            reason="not_found"
            curatorName={curatorInfo.name}
            curatorSlug={curatorInfo.slug}
            curatorBanner={curatorInfo.banner}
          />
        )
      
      case 'product_inactive':
        return (
          <ProductUnavailable
            reason="inactive"
            curatorName={result.curator.storeName}
            curatorSlug={result.curator.slug}
            curatorBanner={result.curator.bannerImage}
          />
        )
      
      case 'server_error':
      default:
        // For server errors, show not found UX (better than crashing)
        return (
          <ProductUnavailable
            reason="not_found"
            curatorName={undefined}
            curatorSlug={params.curatorSlug}
            curatorBanner={null}
          />
        )
    }
  }

  const product = result;

  // Note: Prisma schema doesn't have visibility field
  // For now, we'll assume all products in Prisma are "general" (public) unless marked otherwise
  // If you need Inner/Drop visibility, you'll need to add a visibility field to the schema
  // For now, we'll check access only if there's a way to determine it's Inner
  // Since visibility doesn't exist in Prisma, we'll skip Inner access check for now
  // TODO: Add visibility field to Prisma schema if needed
  const unlocked = true; // All products are accessible for now (no visibility field in Prisma)

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
            <ProductImageWithFallback
              src={product.images?.[0]?.url}
              alt={product.title}
              size="large"
              fill
              className="object-cover"
              priority
              showBadge={!product.images?.[0]?.url}
            />
            {/* Inner access overlay removed - handled by locked cards in list view */}
          </div>
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {product.images.slice(1, 5).map((img: any) => (
                <div key={img.id} className="relative aspect-square overflow-hidden rounded-xl bg-neutral-100">
                  <ProductImageWithFallback
                    src={img.url}
                    alt={product.title}
                    size="thumbnail"
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
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
                <CuratorImageWithFallback
                  src={product.curator.avatar}
                  alt={product.curator.storeName}
                  size="avatar"
                  width={24}
                  height={24}
                  className="h-6 w-6 object-cover"
                />
              </div>
              {product.curator.storeName}
            </Link>
          </div>

          {/* Price */}
          <div className="flex items-center gap-4">
            <div className="text-xl text-neutral-900">
              ${product.price.toFixed(2)}
            </div>
          </div>

          {/* Description (short) */}
          <p className="text-sm leading-6 text-neutral-600">{product.description}</p>

          {/* Product Metadata (Size, Color, Condition - Informational Only) */}
          <div className="space-y-3">
            {product.sizes?.length > 0 && (
              <div>
                <div className="text-sm font-medium text-neutral-700 mb-1">{t(locale, 'product.size')}</div>
                <div className="text-sm text-neutral-600">
                  {product.sizes.join(', ')}
                </div>
              </div>
            )}
            {product.colors?.length > 0 && (
              <div>
                <div className="text-sm font-medium text-neutral-700 mb-1">{t(locale, 'product.color')}</div>
                <div className="text-sm text-neutral-600">
                  {product.colors.join(', ')}
                </div>
              </div>
            )}
            {/* Condition - gracefully hide if missing */}
            {(product as any).condition && (
              <div>
                <div className="text-sm font-medium text-neutral-700 mb-1">{t(locale, 'product.condition')}</div>
                <div className="text-sm text-neutral-600 capitalize">
                  {t(locale, `product.condition.${(product as any).condition.toLowerCase().replace(/\s+/g, '')}` as any) || (product as any).condition}
                </div>
              </div>
            )}
            
            {/* Product Clarity Note */}
            <div className="pt-2 border-t border-neutral-200">
              <p className="text-xs text-neutral-600 leading-relaxed">
                {t(locale, 'product.oneOfAKind')}
                <span className="text-neutral-500"> {t(locale, 'product.onlyOneAvailable')}</span>
              </p>
            </div>
          </div>

          {/* Purchase */}
          <div className="space-y-4">
            {/* Authenticity Badge */}
            <div className="flex items-center gap-2 text-xs text-neutral-600">
              <CheckCircle2 className="h-4 w-4 text-neutral-500" />
              <span>{t(locale, 'product.verified')}</span>
            </div>

            <div className="flex items-center gap-3">
              <AddToCartButton
                productId={product.id}
                productTitle={product.title}
                productPrice={product.price}
                productImage={product.images[0]?.url || ''}
                curatorName={product.curator.storeName}
                size={product.sizes?.length > 0 ? product.sizes[0] : undefined}
                color={product.colors?.length > 0 ? product.colors[0] : undefined}
                disabled={!product.isActive || product.stockQuantity <= 0}
                className="flex-1 rounded-xl bg-black px-5 py-3 text-sm text-white hover:bg-neutral-900 disabled:cursor-not-allowed disabled:bg-neutral-200"
              >
                {product.stockQuantity > 0 ? t(locale, 'product.addToCart') : t(locale, 'product.outOfStock')}
              </AddToCartButton>
              <WishlistButton
                productSlug={product.slug}
                curatorSlug={product.curator.slug}
                variant="icon-only"
              />
            </div>

            {/* Shipping & Returns - Collapsible */}
            <CollapsibleSection title={t(locale, 'product.shippingReturns')}>
              <div className="space-y-3">
                <div>
                  <p className="font-medium text-neutral-900 mb-1">{t(locale, 'product.shipping')}</p>
                  <p className="text-neutral-600">
                    {t(locale, 'product.shippingDesc')}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-neutral-900 mb-1">{t(locale, 'product.returns')}</p>
                  <p className="text-neutral-600">
                    {t(locale, 'product.returnsDesc')}
                  </p>
                </div>
              </div>
            </CollapsibleSection>
          </div>

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



async function RelatedProducts({ curatorId, currentProductId }: { curatorId: string; currentProductId: string }) {
  try {
    const products = await prisma.product.findMany({
      where: {
        curatorId,
        isActive: true,
        id: { not: currentProductId },
      },
      include: {
        images: {
          orderBy: { order: 'asc' },
          take: 1,
        },
        curator: {
          select: {
            slug: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 4,
    });

    if (products.length === 0) {
      return null;
    }

    return (
      <section className="mt-12">
        <h2 className="mb-4 text-base font-medium text-neutral-900">More from this curator</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => {
            const img = p.images[0]?.url;
            return (
              <Link
                key={p.id}
                href={`/curator/${p.curator.slug}/product/${p.slug}`}
                className="group block"
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-neutral-100">
                  <ProductImageWithFallback
                    src={img}
                    alt={p.title}
                    size="medium"
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="mt-2 text-sm text-neutral-900">{p.title}</div>
                <div className="text-xs text-neutral-500">
                  ${p.price.toFixed(2)}
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
