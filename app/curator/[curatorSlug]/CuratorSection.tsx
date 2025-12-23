import ProductCard from '@/components/curator/ProductCard';
import ProductCardLocked from '@/components/ProductCardLocked';
import DropHero from '@/components/DropHero';
import EmptyState from '@/components/curator/EmptyState';

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
  banner?: string;
  startsAt: string;
  endsAt: string;
}

interface CuratorSectionProps {
  tab: 'general' | 'inner' | 'drops';
  products: Product[];
  hasAccess: boolean;
  activeDrop?: ActiveDrop | null;
  curatorId: string;
  curatorName: string;
}

export default function CuratorSection({ 
  tab, 
  products, 
  hasAccess, 
  activeDrop, 
  curatorId,
  curatorName 
}: CuratorSectionProps) {
  if (tab === 'drops') {
    return (
      <div>
        {activeDrop ? (
          <>
            <DropHero drop={activeDrop} />
            {products.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
          </>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Drop</h3>
            <p className="text-gray-500 mb-4">
              {curatorName} doesn't have an active drop right now.
            </p>
            <p className="text-sm text-gray-400">
              Follow them to be notified when they launch their next drop!
            </p>
          </div>
        )}
      </div>
    );
  }

  if (tab === 'inner') {
    return (
      <div>
        {products.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              hasAccess ? (
                <ProductCard key={product.id} product={product} />
              ) : (
                <ProductCardLocked 
                  key={product.id} 
                  product={product} 
                  curatorId={curatorId}
                />
              )
            ))}
          </div>
        ) : (
          <EmptyState name={curatorName} />
        )}
      </div>
    );
  }

  // General tab
  return (
    <div>
      {products.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
