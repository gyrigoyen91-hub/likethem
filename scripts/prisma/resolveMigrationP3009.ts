#!/usr/bin/env tsx

/**
 * Diagnose Prisma P3009 error for 20241222_add_follow_wishlist migration
 * 
 * This is a READ-ONLY diagnostic script. It does NOT modify the database.
 * It checks migration state and table existence, then recommends actions.
 * 
 * Usage:
 *   export DATABASE_URL="<production-database-url>"
 *   npm run resolve:p3009:diagnose
 */

import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load .env.prod if it exists, otherwise use default .env
const envProdPath = path.join(process.cwd(), '.env.prod')
const envPath = path.join(process.cwd(), '.env')

if (require('fs').existsSync(envProdPath)) {
  dotenv.config({ path: envProdPath })
} else if (require('fs').existsSync(envPath)) {
  dotenv.config({ path: envPath })
}

const prisma = new PrismaClient()

async function diagnoseP3009() {
  console.log('🔍 Diagnosing Prisma P3009 for migration 20241222_add_follow_wishlist\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  const MIGRATION_NAME = '20241222_add_follow_wishlist'

  if (!process.env.DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL environment variable is not set')
    console.error('   Set it to your production database URL (same as Vercel uses)')
    console.error('   Example: export DATABASE_URL="postgresql://..."\n')
    process.exit(1)
  }

  try {
    // Step 1: Query _prisma_migrations for the specific migration
    console.log('1️⃣  Checking migration state in _prisma_migrations table...\n')

    const migrationRecord = await prisma.$queryRaw<Array<{
      migration_name: string
      started_at: Date | null
      finished_at: Date | null
      rolled_back_at: Date | null
      applied_steps_count: number | null
      logs: string | null
    }>>`
      SELECT 
        migration_name,
        started_at,
        finished_at,
        rolled_back_at,
        applied_steps_count,
        logs
      FROM "_prisma_migrations"
      WHERE migration_name = $1
    `, MIGRATION_NAME)

    if (migrationRecord.length === 0) {
      console.log(`   ⚠️  Migration "${MIGRATION_NAME}" not found in _prisma_migrations`)
      console.log('   This migration may not have been started yet.\n')
    } else {
      const record = migrationRecord[0]
      console.log(`   Migration: ${record.migration_name}`)
      console.log(`   Started at: ${record.started_at || 'NULL'}`)
      console.log(`   Finished at: ${record.finished_at || 'NULL'}`)
      console.log(`   Rolled back at: ${record.rolled_back_at || 'NULL'}`)
      console.log(`   Applied steps: ${record.applied_steps_count ?? 'NULL'}`)
      if (record.logs) {
        console.log(`   Logs: ${record.logs.substring(0, 300)}${record.logs.length > 300 ? '...' : ''}`)
      } else {
        console.log(`   Logs: NULL`)
      }
      console.log('')

      // Determine status
      if (record.finished_at === null && record.rolled_back_at === null) {
        console.log('   ⚠️  STATUS: FAILED (started but never finished, not rolled back)')
        console.log('   This is causing P3009 error.\n')
      } else if (record.rolled_back_at !== null) {
        console.log('   ⚠️  STATUS: ROLLED BACK')
        console.log('   Migration was rolled back. Tables may not exist.\n')
      } else if (record.finished_at !== null) {
        console.log('   ✅ STATUS: APPLIED')
        console.log('   Migration appears to be successfully applied.\n')
      }
    }

    // Step 2: Check if tables exist
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('2️⃣  Checking if tables exist in database...\n')

    const followsExists = await prisma.$queryRaw<Array<{ exists: boolean }>>`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'follows'
      ) as exists
    `

    const wishlistExists = await prisma.$queryRaw<Array<{ exists: boolean }>>`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'wishlist_items'
      ) as exists
    `

    const followsTableExists = followsExists[0]?.exists ?? false
    const wishlistTableExists = wishlistExists[0]?.exists ?? false

    console.log(`   follows table: ${followsTableExists ? '✅ EXISTS' : '❌ MISSING'}`)
    console.log(`   wishlist_items table: ${wishlistTableExists ? '✅ EXISTS' : '❌ MISSING'}\n`)

    // Step 3: Check columns if tables exist
    if (followsTableExists) {
      const followsColumns = await prisma.$queryRaw<Array<{ column_name: string }>>`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'follows'
        ORDER BY column_name
      `
      console.log(`   follows columns: ${followsColumns.map(c => c.column_name).join(', ')}`)
    }

    if (wishlistTableExists) {
      const wishlistColumns = await prisma.$queryRaw<Array<{ column_name: string }>>`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'wishlist_items'
        ORDER BY column_name
      `
      console.log(`   wishlist_items columns: ${wishlistColumns.map(c => c.column_name).join(', ')}`)
    }
    console.log('')

    // Step 4: Decision matrix
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('3️⃣  RECOMMENDATION:\n')

    if (followsTableExists && wishlistTableExists) {
      console.log('   ✅ Tables exist → Migration SQL was applied successfully')
      console.log('   ✅ Safe to mark migration as APPLIED\n')
      console.log('   📋 ACTION REQUIRED:')
      console.log('   Run this command to mark migration as applied:\n')
      console.log('   npx prisma@6.12.0 migrate resolve --applied 20241222_add_follow_wishlist\n')
      console.log('   Then verify:')
      console.log('   npx prisma@6.12.0 migrate status\n')
      console.log('   Expected output: "Database schema is up to date!"\n')
    } else {
      console.log('   ❌ Tables are MISSING → Migration partially or completely failed')
      console.log('   ⚠️  DO NOT mark migration as applied yet\n')
      console.log('   📋 ACTION REQUIRED:')
      console.log('   1. Review migration SQL: prisma/migrations/20241222_add_follow_wishlist/migration.sql')
      console.log('   2. Apply the SQL manually via database client or psql')
      console.log('   3. Verify tables exist')
      console.log('   4. Then run: npx prisma@6.12.0 migrate resolve --applied 20241222_add_follow_wishlist\n')
    }

    // Step 5: Check for other failed migrations
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('4️⃣  Checking for other failed migrations...\n')

    const otherFailed = await prisma.$queryRaw<Array<{
      migration_name: string
      finished_at: Date | null
      rolled_back_at: Date | null
    }>>`
      SELECT 
        migration_name,
        finished_at,
        rolled_back_at
      FROM "_prisma_migrations"
      WHERE (finished_at IS NULL OR rolled_back_at IS NOT NULL)
        AND migration_name != $1
      ORDER BY started_at DESC
    `, MIGRATION_NAME)

    if (otherFailed.length > 0) {
      console.log(`   ⚠️  Found ${otherFailed.length} other failed/rolled-back migration(s):\n`)
      otherFailed.forEach(m => {
        console.log(`   - ${m.migration_name}`)
        console.log(`     Finished: ${m.finished_at ? 'YES' : 'NO'}`)
        console.log(`     Rolled back: ${m.rolled_back_at ? 'YES' : 'NO'}\n`)
      })
      console.log('   These may also need to be resolved.\n')
    } else {
      console.log('   ✅ No other failed migrations found.\n')
    }

  } catch (error: any) {
    console.error('❌ Error during diagnosis:')
    console.error(error.message)
    if (error.code) {
      console.error(`   Error code: ${error.code}`)
    }
    console.error('\n   Check that DATABASE_URL is correct and database is accessible.\n')
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('✅ Diagnosis complete')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

diagnoseP3009().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
