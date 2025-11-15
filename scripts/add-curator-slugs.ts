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

async function addCuratorSlugs() {
  try {
    console.log('Adding slugs to existing curators...')

    // Get all curators
    const curators = await prisma.curatorProfile.findMany({
      select: {
        id: true,
        storeName: true,
        slug: true
      }
    })

    console.log(`Found ${curators.length} curators to update`)

    for (const curator of curators) {
      // Skip if already has a slug
      if (curator.slug) {
        console.log(`Curator "${curator.storeName}" already has slug: ${curator.slug}`)
        continue
      }

      // Generate a unique slug
      let baseSlug = generateSlug(curator.storeName)
      let slug = baseSlug
      let counter = 1

      // Check if slug already exists
      while (true) {
        const existingCurator = await prisma.curatorProfile.findFirst({
          where: { slug }
        })
        
        if (!existingCurator || existingCurator.id === curator.id) {
          break
        }
        
        slug = `${baseSlug}-${counter}`
        counter++
      }

      // Update the curator with the slug
      await prisma.curatorProfile.update({
        where: { id: curator.id },
        data: { slug }
      })

      console.log(`Updated curator "${curator.storeName}" with slug: ${slug}`)
    }

    console.log('Successfully added slugs to all curators!')
  } catch (error) {
    console.error('Error adding curator slugs:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addCuratorSlugs() 