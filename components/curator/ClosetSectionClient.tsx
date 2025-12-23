'use client';
import { useEffect, useState } from 'react';
import ProductCard from '@/components/curator/ProductCard';
import ProductCardLocked from '@/components/ProductCardLocked';
import DropHero from '@/components/DropHero';
import EmptyState from '@/components/curator/EmptyState';
import CategoryScroller from './CategoryScroller';
import { useT } from '@/hooks/useT';

interface Product {
  id: string;
  title: string;
  price: number;
  slug: string | null;
  imageUrl: string | null;
  isFeatured?: boolean;
  createdAt: string;
  category: string | null;
  visibility?: 'general' | 'inner' | 'drop';
}

interface ActiveDrop {
  id: string;
  title: string;
  description?: string;
  heroImage?: string;
  startsAt: string;
  endsAt: string;
}

interface CategoryCount {
  category: string;
  count: number;
}

interface ClosetSectionClientProps {
  tier: 'PUBLIC' | 'INNER' | 'DROP';
  curatorId: string;
  curatorName: string;
  curatorSlug: string; // Add curator slug for canonical routing
  hasAccess: boolean;
  activeDrop?: ActiveDrop | null;
  products: Product[];
  categoryCounts: CategoryCount[];
  totalCount: number;
}

export default function ClosetSectionClient({ 
  tier,
  curatorId,
  curatorName,
  curatorSlug,
  hasAccess,
  activeDrop,
  products,
  categoryCounts,
  totalCount
}: ClosetSectionClientProps) {
  const t = useT();
  // Show DropHero for DROP tier if there's an active drop
  if (tier === 'DROP' && activeDrop) {
    return (
      <div>
        <DropHero drop={activeDrop} />
        
        {/* Category Scroller */}
        <CategoryScroller 
          items={categoryCounts}
          tier={tier.toLowerCase() as 'PUBLIC'|'INNER'|'DROP'}
          totalCount={totalCount}
        />
        
        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={{ ...product, curatorSlug }} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">{t('curator.emptyState')}</p>
            <p className="text-sm text-gray-400">{t('curator.followForDrops')}</p>
          </div>
        )}
      </div>
    );
  }

  // Show empty state for DROP tier if no active drop
  if (tier === 'DROP' && !activeDrop) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('curator.noActiveDrop')}</h3>
        <p className="text-gray-500 mb-4">
          {t('curator.noActiveDropDesc', { name: curatorName })}
        </p>
        <p className="text-sm text-gray-400">
          {t('curator.followForDrops')}
        </p>
      </div>
    );
  }

  // For INNER tier - always show locked products unless unlocked in localStorage
  // This overrides server-side hasAccess check for UI purposes
  if (tier === 'INNER') {
    const [isUnlocked, setIsUnlocked] = useState(false);

    useEffect(() => {
      // Check localStorage for unlock state keyed by curator slug or ID
      const unlockKey = curatorSlug ? `innerUnlocked:${curatorSlug}` : `innerUnlocked:${curatorId}`;
      const unlocked = localStorage.getItem(unlockKey) === 'true';
      setIsUnlocked(unlocked);
    }, [curatorSlug, curatorId]);

    // Force locked state for Inner - ALL Inner products are locked until localStorage says unlocked
    // This ensures consistent UX: Inner tab always shows locked cards until user unlocks
    const forceLocked = !isUnlocked;

    return (
      <div>
        {/* Inner Closet Narrative - Only show when locked */}
        {forceLocked && products.length > 0 && (
          <div className="mb-6 rounded-lg bg-neutral-50 border border-neutral-200 px-4 py-3">
            <p className="text-sm text-neutral-700 leading-relaxed">
              {t('curator.innerNarrative')}
              <span className="text-neutral-600"> {t('curator.innerNarrativeAccess')}</span>
            </p>
          </div>
        )}

        {/* Category Scroller */}
        <CategoryScroller 
          items={categoryCounts}
          tier={tier.toLowerCase() as 'PUBLIC'|'INNER'|'DROP'}
          totalCount={totalCount}
        />
        
        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-8">
            {products.map((product) =>
              forceLocked ? (
                <ProductCardLocked 
                  key={product.id} 
                  product={product}
                  curatorId={curatorId}
                  curatorSlug={curatorSlug}
                />
              ) : (
                <ProductCard key={product.id} product={{ ...product, curatorSlug }} />
              )
            )}
          </div>
        ) : (
          <EmptyState name={curatorName} />
        )}
      </div>
    );
  }

  // For PUBLIC tier (General Closet)
  return (
    <div>
      {/* Category Scroller */}
      <CategoryScroller 
        items={categoryCounts}
        tier={tier.toLowerCase() as 'PUBLIC'|'INNER'|'DROP'}
        totalCount={totalCount}
      />
      
      {/* Products Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={{ ...product, curatorSlug }} />
          ))}
        </div>
      ) : (
        <EmptyState name={curatorName} />
      )}
    </div>
  );
}
