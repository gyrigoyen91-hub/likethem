// Helper function to create slug from store name
export const createSlug = (storeName: string): string => {
  return storeName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Helper function to generate unique slug (basic version)
export const generateUniqueSlug = async (baseSlug: string, existingSlugs: string[] = []): Promise<string> => {
  let slug = baseSlug
  let counter = 1
  
  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`
    counter++
  }
  
  return slug
}

// Helper function to generate slug from store name
export const generateSlugFromStoreName = async (storeName: string, existingSlugs: string[] = []): Promise<string> => {
  const baseSlug = createSlug(storeName)
  return await generateUniqueSlug(baseSlug, existingSlugs)
} 