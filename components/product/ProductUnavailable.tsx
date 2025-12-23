'use client'

import Link from 'next/link'
import { CuratorImageWithFallback } from '@/components/ImageWithFallback'
import { useT } from '@/hooks/useT'

export type ProductUnavailableReason = 'not_found' | 'inactive' | 'mismatch'

interface ProductUnavailableProps {
  reason: ProductUnavailableReason
  curatorName?: string
  curatorSlug?: string
  curatorBanner?: string | null
}

export default function ProductUnavailable({
  reason,
  curatorName,
  curatorSlug,
  curatorBanner,
}: ProductUnavailableProps) {
  const t = useT()

  // Determine title and description based on reason
  const getContent = () => {
    switch (reason) {
      case 'inactive':
        return {
          title: t('product.unavailable.sold.title'),
          description: t('product.unavailable.sold.description'),
          primaryCta: curatorName && curatorSlug
            ? t('product.unavailable.sold.cta', { curatorName })
            : t('product.unavailable.sold.ctaFallback'),
          primaryHref: curatorSlug ? `/curator/${curatorSlug}` : '/explore',
          showSecondary: false,
        }
      case 'not_found':
      case 'mismatch':
      default:
        return {
          title: t('product.unavailable.notFound.title'),
          description: t('product.unavailable.notFound.description'),
          primaryCta: curatorName && curatorSlug
            ? t('product.unavailable.notFound.cta', { curatorName })
            : t('product.unavailable.notFound.ctaFallback'),
          primaryHref: curatorSlug ? `/curator/${curatorSlug}` : '/explore',
          secondaryCta: t('product.unavailable.notFound.secondaryCta'),
          secondaryHref: '/explore',
          showSecondary: true,
        }
    }
  }

  const content = getContent()

  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <div className="text-center">
        {/* Curator banner/context image */}
        {curatorBanner && (
          <div className="relative h-48 w-full mb-8 overflow-hidden rounded-2xl bg-neutral-100">
            <CuratorImageWithFallback
              src={curatorBanner}
              alt={curatorName || 'Curator'}
              size="banner"
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Title */}
        <h1 className="text-3xl font-medium tracking-tight text-neutral-900 mb-4">
          {content.title}
        </h1>

        {/* Description */}
        <p className="text-base text-neutral-600 mb-8 max-w-lg mx-auto">
          {content.description}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link
            href={content.primaryHref}
            className="px-6 py-3 bg-black text-white rounded-xl hover:bg-neutral-900 transition-colors font-medium"
          >
            {content.primaryCta}
          </Link>
          {content.showSecondary && content.secondaryCta && (
            <Link
              href={content.secondaryHref}
              className="px-6 py-3 border border-neutral-300 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-colors font-medium"
            >
              {content.secondaryCta}
            </Link>
          )}
        </div>
      </div>
    </main>
  )
}
