import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkNextAuthTables() {
  try {
    console.log('🔍 Checking NextAuth tables in production database...\n');

    // Check if tables exist and get counts
    const tables = ['User', 'Account', 'Session', 'VerificationToken'];
    
    for (const table of tables) {
      try {
        const count = await (prisma as any)[table.toLowerCase()].count();
        console.log(`✅ ${table}: ${count} records`);
      } catch (error: any) {
        if (error.message.includes('does not exist') || error.message.includes('no such table')) {
          console.log(`❌ ${table}: Table does not exist`);
        } else {
          console.log(`⚠️ ${table}: Error - ${error.message}`);
        }
      }
    }

    // Check User table structure
    try {
      const sampleUser = await prisma.user.findFirst({
        select: {
          id: true,
          email: true,
          role: true,
          fullName: true,
          emailVerified: true,
        }
      });
      console.log('\n📋 Sample User structure:', sampleUser);
    } catch (error: any) {
      console.log('\n❌ User table error:', error.message);
    }

    // Check Account table structure
    try {
      const sampleAccount = await prisma.account.findFirst({
        select: {
          id: true,
          provider: true,
          type: true,
          userId: true,
        }
      });
      console.log('\n📋 Sample Account structure:', sampleAccount);
    } catch (error: any) {
      console.log('\n❌ Account table error:', error.message);
    }

  } catch (error) {
    console.error('❌ Database connection error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkNextAuthTables();
