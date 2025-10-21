import { getCategoryCountsByTier, Tier } from '@/lib/server/curator-categories';
import ClosetSectionClient from './ClosetSectionClient';

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

interface ClosetSectionWrapperProps {
  tier: 'PUBLIC' | 'INNER' | 'DROP';
  curatorId: string;
  curatorName: string;
  hasAccess: boolean;
  activeDrop?: ActiveDrop | null;
  products: Product[];
  useMockData?: boolean;
  selectedCategory?: string | null;
}

export default async function ClosetSectionWrapper({ 
  tier,
  curatorId,
  curatorName,
  hasAccess,
  activeDrop,
  products,
  useMockData = false,
  selectedCategory
}: ClosetSectionWrapperProps) {
  // Get category counts for this tier
  const categoryCounts = await getCategoryCountsByTier({
    curatorId,
    tier: tier as Tier,
    activeDropId: activeDrop?.id,
    useMockData
  });

  // Filter products by category if selected
  let filteredProducts = products;
  if (selectedCategory && selectedCategory !== 'all') {
    filteredProducts = products.filter(p => p.category === selectedCategory);
  }

  // Calculate total count for "All" button
  const totalCount = products.length;

  return (
    <ClosetSectionClient
      tier={tier}
      curatorId={curatorId}
      curatorName={curatorName}
      hasAccess={hasAccess}
      activeDrop={activeDrop}
      products={filteredProducts}
      categoryCounts={categoryCounts}
      totalCount={totalCount}
    />
  );
}
