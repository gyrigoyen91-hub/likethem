// Simple script to create the seller_applications table manually
// This is a workaround since we can't run prisma migrate reset

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createSellerApplicationsTable() {
  try {
    // Create the ApplicationStatus enum (SQLite doesn't support enums, so we'll use a constraint)
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS seller_applications (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
        userId TEXT NOT NULL UNIQUE,
        fullName TEXT NOT NULL,
        socialLinks TEXT,
        audienceBand TEXT,
        reason TEXT,
        status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
        reviewedBy TEXT,
        reviewedAt DATETIME,
        decisionNote TEXT,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id)
      )
    `;

    // Create trigger to update updatedAt
    await prisma.$executeRaw`
      CREATE TRIGGER IF NOT EXISTS update_seller_applications_updatedAt 
      AFTER UPDATE ON seller_applications
      BEGIN
        UPDATE seller_applications SET updatedAt = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END
    `;

    console.log('✅ seller_applications table created successfully');
  } catch (error) {
    console.error('❌ Error creating seller_applications table:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSellerApplicationsTable();
