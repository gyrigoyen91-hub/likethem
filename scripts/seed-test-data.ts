import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding test data...')

  try {
    // Create test user
    const testUser = await prisma.user.upsert({
      where: { email: 'gonzalo@likethem.io' },
      update: {},
      create: {
        email: 'gonzalo@likethem.io',
        password: 'hashed-password', // In real app, this would be properly hashed
        fullName: 'Gonzalo Yrigoyen',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        role: 'CURATOR',
        provider: 'credentials',
        emailVerified: new Date(),
        phone: '+1 (555) 123-4567'
      }
    })

    console.log('✅ Created test user:', testUser.email)

    // Create test curator profile
    const testCurator = await prisma.curatorProfile.upsert({
      where: { userId: testUser.id },
      update: {},
      create: {
        userId: testUser.id,
        storeName: 'Gonzalo\'s Fashion Hub',
        bio: 'Passionate fashion curator with an eye for unique pieces and sustainable style. I believe fashion should be both beautiful and responsible.',
        bannerImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
        instagram: 'gonzalo_fashion',
        tiktok: 'gonzalo_style',
        youtube: 'GonzaloFashion',
        twitter: 'gonzalo_style',
        isPublic: true,
        isEditorsPick: true,
        slug: 'gonzalo-yrigoyen'
      }
    })

    console.log('✅ Created test curator:', testCurator.storeName)

    // Create test products
    const testProducts = [
      {
        title: 'Vintage Denim Jacket',
        description: 'Classic vintage denim jacket with a perfect fit. This timeless piece adds character to any outfit and gets better with age.',
        price: 89.99,
        category: 'Outerwear',
        tags: 'vintage,denim,jacket,casual',
        sizes: 'S,M,L,XL',
        colors: 'Blue,Light Blue',
        stockQuantity: 3,
        isActive: true,
        isFeatured: true,
        curatorNote: 'This jacket has been carefully selected for its authentic vintage character and excellent condition.',
        slug: 'vintage-denim-jacket',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
            altText: 'Vintage denim jacket front view',
            order: 0
          },
          {
            url: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
            altText: 'Vintage denim jacket back view',
            order: 1
          }
        ]
      },
      {
        title: 'Minimalist White Sneakers',
        description: 'Clean, minimalist white sneakers perfect for any occasion. These versatile shoes pair beautifully with both casual and semi-formal outfits.',
        price: 129.99,
        category: 'Footwear',
        tags: 'sneakers,white,minimalist,casual',
        sizes: '7,8,9,10,11,12',
        colors: 'White',
        stockQuantity: 8,
        isActive: true,
        isFeatured: false,
        curatorNote: 'A wardrobe essential that never goes out of style. Perfect for the modern minimalist.',
        slug: 'minimalist-white-sneakers',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
            altText: 'Minimalist white sneakers side view',
            order: 0
          }
        ]
      },
      {
        title: 'Sustainable Cotton T-Shirt',
        description: 'Soft, sustainable cotton t-shirt made from organic materials. Comfortable, breathable, and environmentally conscious.',
        price: 34.99,
        category: 'Tops',
        tags: 't-shirt,cotton,sustainable,organic',
        sizes: 'XS,S,M,L,XL,XXL',
        colors: 'White,Black,Navy,Forest Green',
        stockQuantity: 15,
        isActive: true,
        isFeatured: true,
        curatorNote: 'Made from 100% organic cotton. A conscious choice for the environmentally aware fashion lover.',
        slug: 'sustainable-cotton-tshirt',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
            altText: 'Sustainable cotton t-shirt',
            order: 0
          }
        ]
      }
    ]

    for (const productData of testProducts) {
      const { images, ...productInfo } = productData
      
      const product = await prisma.product.create({
        data: {
          ...productInfo,
          curatorId: testCurator.id,
          images: {
            create: images
          }
        }
      })

      console.log('✅ Created product:', product.title)
    }

    console.log('🎉 Test data seeding completed successfully!')
    console.log(`📱 You can now visit: https://likethem.io/curator/gonzalo-yrigoyen`)

  } catch (error) {
    console.error('❌ Error seeding test data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
