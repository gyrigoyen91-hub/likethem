import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

export const prisma =
  global.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? ['warn', 'error'] : ['query', 'info', 'warn', 'error'],
  })

if (process.env.NODE_ENV !== 'production') global.prisma = prisma

;(async () => {
  try {
    await prisma.$connect()
    console.log('[Prisma] connected')
  } catch (e) {
    console.error('[Prisma] connect error', e)
  }
})()
