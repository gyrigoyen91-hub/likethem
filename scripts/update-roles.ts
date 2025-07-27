import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateUserRoles() {
  try {
    console.log('Updating user roles...')

    // Update existing users to use the new role system
    // Convert string roles to enum values
    const users = await prisma.user.findMany()
    
    for (const user of users) {
      let newRole: 'ADMIN' | 'CURATOR' | 'BUYER' = 'BUYER'
      
      // Map existing string roles to new enum values
      if (user.role === 'ADMIN') {
        newRole = 'ADMIN'
      } else if (user.role === 'CURATOR') {
        newRole = 'CURATOR'
      } else if (user.role === 'BUYER' || user.role === 'SHOPPER') {
        newRole = 'BUYER'
      }
      
      // Update user role
      await prisma.user.update({
        where: { id: user.id },
        data: { role: newRole }
      })
      
      console.log(`Updated user ${user.email} role from "${user.role}" to "${newRole}"`)
    }

    console.log('User roles updated successfully!')
  } catch (error) {
    console.error('Error updating user roles:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateUserRoles() 