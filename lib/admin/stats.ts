import { prisma } from '@/lib/prisma'

/**
 * Server-only function to fetch admin dashboard statistics from the database.
 * This function must NOT be imported by client components.
 */
export async function getAdminDashboardStats() {
  try {
    // Fetch all stats in parallel for better performance
    const [totalUsers, curators, products, revenueAgg] = await Promise.all([
      // Total users count
      prisma.user.count(),
      
      // Curators count (users with role CURATOR)
      prisma.user.count({
        where: {
          role: 'CURATOR',
        },
      }),
      
      // Products count
      prisma.product.count(),
      
      // Revenue: sum of totalAmount from all orders
      prisma.order.aggregate({
        _sum: {
          totalAmount: true,
        },
      }),
    ])

    // Extract revenue from aggregate result
    const revenue = revenueAgg._sum.totalAmount ?? null

    return {
      totalUsers,
      curators,
      products,
      revenue,
      lastUpdated: new Date().toISOString(),
    }
  } catch (error) {
    console.error('[ADMIN_STATS][ERROR] Failed to fetch dashboard stats:', error)
    
    // Return safe defaults on error (don't crash the page)
    return {
      totalUsers: 0,
      curators: 0,
      products: 0,
      revenue: null,
      lastUpdated: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
