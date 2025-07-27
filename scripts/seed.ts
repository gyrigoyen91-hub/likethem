import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data
  await prisma.productImage.deleteMany()
  await prisma.product.deleteMany()
  await prisma.curatorProfile.deleteMany()
  await prisma.user.deleteMany()

  // Create a test user
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      password: '$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1m', // password
      fullName: 'Test User',
      role: 'CURATOR'
    }
  })

  // Create a curator profile
  const curator = await prisma.curatorProfile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      storeName: 'Test Store',
      bio: 'A test store for demonstrating the search functionality',
      isPublic: true
    }
  })

  // Create test products
  const products = [
    {
      title: 'Young Money Rolex',
      description: 'A luxury timepiece that represents success and style',
      price: 15000.00,
      category: 'Accessories',
      tags: 'luxury,watch,rolex,premium',
      sizes: 'One Size',
      colors: 'Gold',
      stockQuantity: 1,
      isActive: true,
      curatorId: curator.id
    },
    {
      title: 'Leather Trench Coat',
      description: 'Classic leather trench coat for sophisticated style',
      price: 450.00,
      category: 'Outerwear',
      tags: 'leather,trench,coat,classic',
      sizes: 'S,M,L,XL',
      colors: 'Brown,Black',
      stockQuantity: 5,
      isActive: true,
      curatorId: curator.id
    },
    {
      title: 'Minimalist White Sneakers',
      description: 'Clean and simple white sneakers for everyday wear',
      price: 120.00,
      category: 'Footwear',
      tags: 'minimal,white,sneakers,clean',
      sizes: '7,8,9,10,11',
      colors: 'White',
      stockQuantity: 10,
      isActive: true,
      curatorId: curator.id
    }
  ]

  for (const productData of products) {
    const product = await prisma.product.create({
      data: productData
    })

    // Add a product image
    await prisma.productImage.create({
      data: {
        productId: product.id,
        url: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        altText: product.title,
        order: 0
      }
    })
  }

  console.log('✅ Database seeded successfully!')
  console.log(`Created ${products.length} products for curator: ${curator.storeName}`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 