// Test script to verify user role in database
const { PrismaClient } = require('@prisma/client');

async function testUserRole() {
  const prisma = new PrismaClient();
  
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'gyrigoyen91@gmail.com' },
      select: { id: true, email: true, role: true, fullName: true }
    });
    
    console.log('✅ User from database:', user);
    
    if (user && user.role === 'CURATOR') {
      console.log('✅ User has CURATOR role - middleware should allow access');
    } else {
      console.log('❌ User does not have CURATOR role');
    }
  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testUserRole();
