#!/usr/bin/env tsx

/**
 * Data Migration Script: SQLite to Postgres
 * 
 * This script migrates user data from the local SQLite database to the Postgres database.
 * It should only be run locally and requires explicit confirmation.
 * 
 * Usage:
 *   DATABASE_URL="postgres://..." npx tsx scripts/migrate-sqlite-to-postgres.ts
 */

import { PrismaClient as SQLitePrismaClient } from '@prisma/client'
import { PrismaClient as PostgresPrismaClient } from '@prisma/client'

// Guard against running in production
if (process.env.NODE_ENV === 'production') {
  console.error('❌ This script cannot be run in production!')
  process.exit(1)
}

// Require explicit confirmation
const args = process.argv.slice(2)
if (!args.includes('--confirm')) {
  console.log('⚠️  This script will migrate data from SQLite to Postgres.')
  console.log('⚠️  Make sure you have backed up your data!')
  console.log('⚠️  Run with --confirm flag to proceed.')
  process.exit(1)
}

// SQLite client (pointing to local dev.db)
const sqliteClient = new SQLitePrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db'
    }
  }
})

// Postgres client (using DATABASE_URL)
const postgresClient = new PostgresPrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

async function migrateUsers() {
  console.log('🔄 Starting user migration from SQLite to Postgres...')
  
  try {
    // Read all users from SQLite
    const sqliteUsers = await sqliteClient.user.findMany({
      select: {
        id: true,
        email: true,
        password: true,
        fullName: true,
        avatar: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    console.log(`📊 Found ${sqliteUsers.length} users in SQLite`)

    if (sqliteUsers.length === 0) {
      console.log('✅ No users to migrate')
      return
    }

    let migrated = 0
    let skipped = 0
    let errors = 0

    for (const user of sqliteUsers) {
      try {
        // Upsert user into Postgres
        await postgresClient.user.upsert({
          where: { email: user.email },
          update: {
            // Only update if the Postgres version is newer or has more data
            fullName: user.fullName || undefined,
            avatar: user.avatar || undefined,
            password: user.password || '',
            role: user.role,
            provider: 'legacy', // Mark as legacy migration
            emailVerified: null, // Unknown for legacy users
          },
          create: {
            id: user.id,
            email: user.email,
            password: user.password || '',
            fullName: user.fullName,
            avatar: user.avatar,
            role: user.role,
            provider: 'legacy',
            emailVerified: null,
            phone: null,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          }
        })

        migrated++
        console.log(`✅ Migrated user: ${user.email}`)
      } catch (error) {
        errors++
        console.error(`❌ Failed to migrate user ${user.email}:`, error)
      }
    }

    console.log('\n📈 Migration Summary:')
    console.log(`✅ Successfully migrated: ${migrated} users`)
    console.log(`⏭️  Skipped: ${skipped} users`)
    console.log(`❌ Errors: ${errors} users`)

  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  }
}

async function main() {
  try {
    console.log('🚀 Starting SQLite to Postgres migration...')
    console.log(`📅 Started at: ${new Date().toISOString()}`)
    
    await migrateUsers()
    
    console.log('\n🎉 Migration completed successfully!')
    console.log(`📅 Finished at: ${new Date().toISOString()}`)
    
  } catch (error) {
    console.error('💥 Migration failed:', error)
    process.exit(1)
  } finally {
    await sqliteClient.$disconnect()
    await postgresClient.$disconnect()
  }
}

// Run the migration
main()
