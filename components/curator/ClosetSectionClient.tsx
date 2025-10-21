'use client';
import ProductCard from '@/components/curator/ProductCard';
import ProductCardLocked from '@/components/ProductCardLocked';
import DropHero from '@/components/DropHero';
import EmptyState from '@/components/curator/EmptyState';
import CategoryScroller from './CategoryScroller';

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
  hasAccess,
  activeDrop,
  products,
  categoryCounts,
  totalCount
}: ClosetSectionClientProps) {
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
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No products in this drop yet.</p>
            <p className="text-sm text-gray-400">Check back soon for new items!</p>
          </div>
        )}
      </div>
    );
  }

  // Show empty state for DROP tier if no active drop
  if (tier === 'DROP' && !activeDrop) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Drop</h3>
        <p className="text-gray-500 mb-4">
          {curatorName} doesn't have an active drop right now.
        </p>
        <p className="text-sm text-gray-400">
          Follow them to be notified when they launch their next drop!
        </p>
      </div>
    );
  }

  // For INNER tier - show locked products if no access
  if (tier === 'INNER') {
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
            {products.map((product) =>
              hasAccess ? (
                <ProductCard key={product.id} product={product} />
              ) : (
                <ProductCardLocked 
                  key={product.id} 
                  product={{ ...product, curatorId }} 
                />
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
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <EmptyState name={curatorName} />
      )}
    </div>
  );
}
