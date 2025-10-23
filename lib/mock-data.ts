// Mock data for local development when Supabase is not available
export const mockCurators = [
  {
    id: 'curator-1',
    storeName: 'Sofia Laurent',
    slug: 'sofia-laurent',
    bio: 'Fashion curator with an eye for timeless pieces and sustainable style.',
    bannerImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    isPublic: true,
    isEditorsPick: true,
    user: {
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
    }
  },
  {
    id: 'curator-2',
    storeName: 'Gonzalo Yrigoyen',
    slug: 'gonzalo-yrigoyen',
    bio: 'Passionate fashion curator with an eye for unique pieces and sustainable style.',
    bannerImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    isPublic: true,
    isEditorsPick: true,
    user: {
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
    }
  },
  {
    id: 'curator-3',
    storeName: 'David Styles',
    slug: 'david-styles',
    bio: 'Menswear redefined. Classic pieces with a modern twist.',
    bannerImage: 'https://images.unsplash.com/photo-1503341504253-dcdcd54663d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80', // Light banner for testing
    isPublic: true,
    isEditorsPick: false,
    user: {
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
    }
  },
  {
    id: 'curator-4',
    storeName: 'Emma Fashion',
    slug: 'emma-fashion',
    bio: 'Sustainable fashion advocate with a passion for vintage finds.',
    bannerImage: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    isPublic: true,
    isEditorsPick: true,
    user: {
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
    }
  },
  {
    id: 'curator-5',
    storeName: 'Alex Streetwear',
    slug: 'alex-streetwear',
    bio: 'Urban style curator bringing street culture to high fashion.',
    bannerImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    isPublic: true,
    isEditorsPick: false,
    user: {
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
    }
  },
  {
    id: 'curator-6',
    storeName: 'Maya Minimalist',
    slug: 'maya-minimalist',
    bio: 'Less is more. Curating timeless pieces for the modern minimalist.',
    bannerImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    isPublic: true,
    isEditorsPick: false,
    user: {
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
    }
  },
  {
    id: 'curator-7',
    storeName: 'Luna Vintage',
    slug: 'luna-vintage',
    bio: 'Vintage fashion curator with a passion for sustainable style and unique finds.',
    bannerImage: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    isPublic: true,
    isEditorsPick: true,
    user: {
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
    }
  },
  {
    id: 'curator-8',
    storeName: 'Jordan Street',
    slug: 'jordan-street',
    bio: 'Urban fashion enthusiast bringing street culture to high-end style.',
    bannerImage: 'https://images.unsplash.com/photo-1503341504253-dcdcd54663d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    isPublic: true,
    isEditorsPick: true,
    user: {
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
    }
  }
]

export const mockProducts = [
  {
    id: 'product-1',
    title: 'Vintage Denim Jacket',
    price: 89.99,
    slug: 'vintage-denim-jacket',
    category: 'Outerwear',
    visibility: 'general' as const,
    createdAt: '2024-01-15T10:00:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    curatorId: 'curator-1'
  },
  {
    id: 'product-2',
    title: 'Minimalist White Sneakers',
    price: 129.99,
    slug: 'minimalist-white-sneakers',
    category: 'Shoes',
    visibility: 'inner' as const,
    createdAt: '2024-01-14T10:00:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    curatorId: 'curator-1'
  },
  {
    id: 'product-3',
    title: 'Sustainable Cotton T-Shirt',
    price: 34.99,
    slug: 'sustainable-cotton-tshirt',
    category: 'Tops',
    visibility: 'general' as const,
    createdAt: '2024-01-13T10:00:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    curatorId: 'curator-1'
  },
  {
    id: 'product-4',
    title: 'Exclusive Drop Blazer',
    price: 199.99,
    slug: 'exclusive-drop-blazer',
    category: 'Jackets',
    visibility: 'drop' as const,
    createdAt: '2024-01-12T10:00:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1594938298605-cd64c190d844?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    curatorId: 'curator-1',
    dropId: 'drop-1'
  },
  {
    id: 'product-5',
    title: 'Designer Handbag',
    price: 299.99,
    slug: 'designer-handbag',
    category: 'Bags',
    visibility: 'inner' as const,
    createdAt: '2024-01-11T10:00:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    curatorId: 'curator-1'
  },
  {
    id: 'product-6',
    title: 'Elegant Dress',
    price: 149.99,
    slug: 'elegant-dress',
    category: 'Dresses',
    visibility: 'general' as const,
    createdAt: '2024-01-10T10:00:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    curatorId: 'curator-1'
  },
  {
    id: 'product-7',
    title: 'Luxury Watch',
    price: 599.99,
    slug: 'luxury-watch',
    category: 'Jewelry',
    visibility: 'inner' as const,
    createdAt: '2024-01-09T10:00:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1523170335258-f5c6c6f7ffa1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    curatorId: 'curator-1'
  },
  {
    id: 'product-8',
    title: 'Drop Exclusive Pants',
    price: 89.99,
    slug: 'drop-exclusive-pants',
    category: 'Pants',
    visibility: 'drop' as const,
    createdAt: '2024-01-08T10:00:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1506629905607-1b0b0b0b0b0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    curatorId: 'curator-1',
    dropId: 'drop-1'
  }
]

export const mockDrops = [
  {
    id: 'drop-1',
    curatorId: 'curator-1',
    slug: 'fall-edit',
    title: 'Fall Edit',
    description: 'Limited-time essentials for the season',
    heroImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    startsAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    isActive: true,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z'
  }
]

// Helper functions
export function getMockCuratorBySlug(slug: string) {
  return mockCurators.find(c => c.slug === slug)
}

export function getMockProductsByCurator(curatorId: string, visibility?: 'general' | 'inner' | 'drop') {
  let products = mockProducts.filter(p => p.curatorId === curatorId)
  if (visibility) {
    products = products.filter(p => p.visibility === visibility)
  }
  return products
}

export function getMockActiveDrop(curatorId: string) {
  return mockDrops.find(d => d.curatorId === curatorId && d.isActive)
}

export function getMockProductCounts(curatorId: string) {
  const products = mockProducts.filter(p => p.curatorId === curatorId)
  return {
    general: products.filter(p => p.visibility === 'general').length,
    inner: products.filter(p => p.visibility === 'inner').length,
    drop: products.filter(p => p.visibility === 'drop').length
  }
}
