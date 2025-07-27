import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Helper function to create slug from store name
const createSlug = (storeName: string): string => {
  return storeName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function main() {
  // Create a test curator user
  const hashedPassword = await bcrypt.hash('password123', 12)
  
  const user = await prisma.user.upsert({
    where: { email: 'curator@test.com' },
    update: {},
    create: {
      email: 'curator@test.com',
      password: hashedPassword,
      fullName: 'Marcus Chen',
      role: 'CURATOR',
    },
  })

  const curatorProfile = await prisma.curatorProfile.upsert({
    where: { userId: user.id },
    update: {
      storeName: 'Tokyo Streetwear',
      slug: 'tokyo-streetwear',
      bio: 'Marcus Chen is a Tokyo-based fashion curator known for his minimalist approach to streetwear. His aesthetic combines the precision of Japanese design with the effortless cool of urban style.',
      isPublic: true,
      isEditorsPick: true,
    },
    create: {
      userId: user.id,
      storeName: 'Tokyo Streetwear',
      slug: 'tokyo-streetwear',
      bio: 'Marcus Chen is a Tokyo-based fashion curator known for his minimalist approach to streetwear. His aesthetic combines the precision of Japanese design with the effortless cool of urban style.',
      isPublic: true,
      isEditorsPick: true,
    },
  })

  console.log('Seed data created:', { user, curatorProfile })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 