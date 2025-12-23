import { PrismaClient } from '@prisma/client'
import slugify from 'slugify'

const prisma = new PrismaClient()

function generateSlug(text: string): string {
  return slugify(text, {
    lower: true,
    strict: true,
    trim: true,
    remove: /[*+~.()'"!:@]/g
  })
}

async function addProductSlugs() {
  try {
    console.log('Adding slugs to existing products...')

    // First, let's add the slug column with a default value
    // We'll need to do this manually since Prisma doesn't support adding required columns with defaults
    
    // Get all products
    const products = await prisma.product.findMany({
      include: {
        curator: {
          select: {
            storeName: true
          }
        }
      }
    })

    console.log(`Found ${products.length} products to update`)

    for (const product of products) {
      // Generate a unique slug
      let baseSlug = generateSlug(product.title)
      let slug = baseSlug
      let counter = 1

      // Check if slug already exists
      while (true) {
        const existingProduct = await prisma.product.findFirst({
          where: { slug }
        })
        
        if (!existingProduct || existingProduct.id === product.id) {
          break
        }
        
        slug = `${baseSlug}-${counter}`
        counter++
      }

      // Update the product with the slug
      await prisma.product.update({
        where: { id: product.id },
        data: { slug }
      })

      console.log(`Updated product "${product.title}" with slug: ${slug}`)
    }

    console.log('Successfully added slugs to all products!')
  } catch (error) {
    console.error('Error adding product slugs:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addProductSlugs() 