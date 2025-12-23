#!/usr/bin/env tsx

/**
 * Diagnose Prisma migration state in production database
 * 
 * This script:
 * 1. Runs `prisma migrate status` to see Prisma's view
 * 2. Queries _prisma_migrations table directly to see actual DB state
 * 3. Identifies any failed or problematic migrations
 */

import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
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

async function diagnoseMigrations() {
  console.log('🔍 Diagnosing Prisma migration state...\n')

  // Step 1: Run prisma migrate status
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('1️⃣  Prisma migrate status:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  try {
    const statusOutput = execSync('npx prisma@6.12.0 migrate status', {
      encoding: 'utf-8',
      stdio: 'pipe',
      env: { ...process.env },
    })
    console.log(statusOutput)
  } catch (error: any) {
    console.error('❌ Error running prisma migrate status:')
    console.error(error.stdout?.toString() || error.message)
    console.error(error.stderr?.toString() || '')
  }

  // Step 2: Query _prisma_migrations table directly
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('2️⃣  Direct database query (_prisma_migrations):')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  try {
    const problematicMigrations = await prisma.$queryRaw<Array<{
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
      WHERE migration_name = '20241222_add_follow_wishlist'
         OR finished_at IS NULL
         OR rolled_back_at IS NOT NULL
      ORDER BY started_at DESC
    `

    if (problematicMigrations.length === 0) {
      console.log('✅ No problematic migrations found in database.')
      console.log('   All migrations appear to be successfully applied.\n')
    } else {
      console.log(`⚠️  Found ${problematicMigrations.length} migration(s) with issues:\n`)

      problematicMigrations.forEach((migration, index) => {
        console.log(`   Migration ${index + 1}: ${migration.migration_name}`)
        console.log(`   ├─ Started at: ${migration.started_at || 'NULL'}`)
        console.log(`   ├─ Finished at: ${migration.finished_at || 'NULL'}`)
        console.log(`   ├─ Rolled back at: ${migration.rolled_back_at || 'NULL'}`)
        console.log(`   ├─ Applied steps: ${migration.applied_steps_count ?? 'NULL'}`)
        if (migration.logs) {
          console.log(`   └─ Logs: ${migration.logs.substring(0, 200)}${migration.logs.length > 200 ? '...' : ''}`)
        } else {
          console.log(`   └─ Logs: NULL`)
        }
        console.log('')

        // Determine status
        if (migration.finished_at === null && migration.rolled_back_at === null) {
          console.log('   ⚠️  STATUS: FAILED (started but never finished, not rolled back)')
        } else if (migration.rolled_back_at !== null) {
          console.log('   ⚠️  STATUS: ROLLED BACK')
        } else if (migration.finished_at !== null) {
          console.log('   ✅ STATUS: APPLIED (but may have been flagged by Prisma)')
        }
        console.log('')
      })
    }

    // Step 3: Check specific migration
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('3️⃣  Specific check: 20241222_add_follow_wishlist')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    const followWishlistMigration = problematicMigrations.find(
      m => m.migration_name === '20241222_add_follow_wishlist'
    )

    if (followWishlistMigration) {
      console.log('📋 Migration details:')
      console.log(`   Migration: ${followWishlistMigration.migration_name}`)
      console.log(`   Finished: ${followWishlistMigration.finished_at ? 'YES' : 'NO'}`)
      console.log(`   Rolled back: ${followWishlistMigration.rolled_back_at ? 'YES' : 'NO'}`)
      console.log(`   Applied steps: ${followWishlistMigration.applied_steps_count ?? 'N/A'}`)
      console.log('')

      // Check if tables exist
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

      console.log('📊 Table existence check:')
      console.log(`   follows table: ${followsExists[0]?.exists ? '✅ EXISTS' : '❌ MISSING'}`)
      console.log(`   wishlist_items table: ${wishlistExists[0]?.exists ? '✅ EXISTS' : '❌ MISSING'}`)
      console.log('')

      if (followsExists[0]?.exists && wishlistExists[0]?.exists) {
        console.log('💡 RECOMMENDATION:')
        console.log('   Tables exist but migration is marked as failed.')
        console.log('   Run: npm run resolve:follow-wishlist')
        console.log('   This will mark the migration as APPLIED.')
      } else {
        console.log('💡 RECOMMENDATION:')
        console.log('   Tables are missing. Migration may have partially failed.')
        console.log('   Review migration SQL and re-run manually if needed.')
      }
    } else {
      console.log('✅ Migration 20241222_add_follow_wishlist not found in problematic migrations.')
      console.log('   It may be successfully applied or not yet started.')
    }

  } catch (error: any) {
    console.error('❌ Error querying database:')
    console.error(error.message)
    if (error.code) {
      console.error(`   Error code: ${error.code}`)
    }
  } finally {
    await prisma.$disconnect()
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('✅ Diagnosis complete')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

diagnoseMigrations().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
