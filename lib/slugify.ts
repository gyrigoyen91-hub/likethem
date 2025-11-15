import slugify from 'slugify'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export function generateSlug(text: string): string {
  return slugify(text, {
    lower: true,
    strict: true,
    trim: true,
    remove: /[*+~.()'"!:@]/g
  })
}

export async function generateUniqueSlug(
  text: string, 
  model: 'product' | 'curator',
  existingId?: string
): Promise<string> {
  let baseSlug = generateSlug(text)
  let slug = baseSlug
  let counter = 1

  while (true) {
    let exists = false

    if (model === 'product') {
      const product = await prisma.product.findUnique({
        where: { slug },
        select: { id: true }
      })
      exists = !!(product && product.id !== existingId)
    } else if (model === 'curator') {
      const curator = await prisma.curatorProfile.findUnique({
        where: { slug },
        select: { id: true }
      })
      exists = !!(curator && curator.id !== existingId)
    }

    if (!exists) {
      break
    }

    slug = `${baseSlug}-${counter}`
    counter++
  }

  return slug
}

export function generateProductSlug(title: string, curatorName: string): string {
  const titleSlug = generateSlug(title)
  const curatorSlug = generateSlug(curatorName)
  return `${titleSlug}-by-${curatorSlug}`
} 