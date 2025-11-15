// scripts/promote-curator.ts
// Usage: npm run promote:curator

import { PrismaClient } from '@prisma/client';
import process from "node:process";

// Create a temporary Prisma client with SQLite for local development
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "file:./prisma/dev.db"
    }
  }
});

type Role = "BUYER" | "CURATOR" | "ADMIN";

async function main() {
  const email = "gyrigoyen91@gmail.com";

  console.log(`🔍 Looking for user: ${email}`);

  try {
    const user = await prisma.user.findUnique({ 
      where: { email },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        curatorProfile: {
          select: {
            id: true,
            storeName: true
          }
        }
      }
    });

    if (!user) {
      throw new Error(`❌ User not found: ${email}`);
    }

    console.log(`✅ Found user: ${user.fullName || user.email} (Current role: ${user.role})`);

    // Update user role to CURATOR
    const updated = await prisma.user.update({ 
      where: { email }, 
      data: { role: "CURATOR" as Role }
    });

    console.log(`🎉 Successfully promoted to CURATOR: ${updated.email}`);
    console.log(`📊 User details:`, {
      id: updated.id,
      email: updated.email,
      fullName: updated.fullName,
      role: updated.role,
      hasCuratorProfile: !!user.curatorProfile
    });

    // If user doesn't have a curator profile, suggest creating one
    if (!user.curatorProfile) {
      console.log(`💡 Note: User doesn't have a curator profile yet. They can create one at /dashboard/curator/settings`);
    }
  } catch (error) {
    console.error(`❌ Database error:`, error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => {
    console.log(`✅ Script completed successfully!`);
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Error:", err.message);
    process.exit(1);
  });
