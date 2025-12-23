#!/usr/bin/env tsx

/**
 * Resolve the failed 20241222_add_follow_wishlist migration
 * 
 * This script:
 * 1. Validates that the tables exist in the database
 * 2. Checks that key columns exist
 * 3. Marks the migration as APPLIED if validation passes
 * 4. Verifies the migration state is clean
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

async function resolveFollowWishlist() {
  console.log('🔧 Resolving 20241222_add_follow_wishlist migration state...\n')

  const MIGRATION_NAME = '20241222_add_follow_wishlist'

  // Step 1: Safety check - verify tables exist
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('1️⃣  Safety check: Verifying tables exist')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  try {
    // Check follows table
    const followsExists = await prisma.$queryRaw<Array<{ exists: boolean }>>`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'follows'
      ) as exists
    `

    // Check wishlist_items table
    const wishlistExists = await prisma.$queryRaw<Array<{ exists: boolean }>>`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'wishlist_items'
      ) as exists
    `

    if (!followsExists[0]?.exists) {
      console.error('❌ ERROR: Table "follows" does not exist!')
      console.error('   Cannot mark migration as applied - tables are missing.')
      console.error('   Please run the migration SQL manually first.')
      process.exit(1)
    }

    if (!wishlistExists[0]?.exists) {
      console.error('❌ ERROR: Table "wishlist_items" does not exist!')
      console.error('   Cannot mark migration as applied - tables are missing.')
      console.error('   Please run the migration SQL manually first.')
      process.exit(1)
    }

    console.log('✅ Table "follows" exists')
    console.log('✅ Table "wishlist_items" exists\n')

    // Step 2: Verify key columns exist
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('2️⃣  Verifying key columns')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    const followsColumns = await prisma.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'follows'
      ORDER BY column_name
    `

    const wishlistColumns = await prisma.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'wishlist_items'
      ORDER BY column_name
    `

    const requiredFollowsColumns = ['id', 'userid', 'curatorid', 'createdat']
    const requiredWishlistColumns = ['id', 'userid', 'productid', 'createdat']

    const followsColumnNames = followsColumns.map(c => c.column_name.toLowerCase())
    const wishlistColumnNames = wishlistColumns.map(c => c.column_name.toLowerCase())

    const missingFollowsColumns = requiredFollowsColumns.filter(
      col => !followsColumnNames.includes(col)
    )
    const missingWishlistColumns = requiredWishlistColumns.filter(
      col => !wishlistColumnNames.includes(col)
    )

    if (missingFollowsColumns.length > 0) {
      console.error(`❌ ERROR: Table "follows" is missing columns: ${missingFollowsColumns.join(', ')}`)
      process.exit(1)
    }

    if (missingWishlistColumns.length > 0) {
      console.error(`❌ ERROR: Table "wishlist_items" is missing columns: ${missingWishlistColumns.join(', ')}`)
      process.exit(1)
    }

    console.log('✅ All required columns exist in both tables\n')

    // Step 3: Mark migration as applied
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('3️⃣  Marking migration as APPLIED')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    try {
      const resolveOutput = execSync(
        `npx prisma@6.12.0 migrate resolve --applied ${MIGRATION_NAME}`,
        {
          encoding: 'utf-8',
          stdio: 'pipe',
          env: { ...process.env },
        }
      )
      console.log(resolveOutput)
      console.log('✅ Migration marked as APPLIED\n')
    } catch (error: any) {
      console.error('❌ Error marking migration as applied:')
      console.error(error.stdout?.toString() || error.message)
      console.error(error.stderr?.toString() || '')
      process.exit(1)
    }

    // Step 4: Verify migration status
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('4️⃣  Verifying migration status')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    try {
      const statusOutput = execSync('npx prisma@6.12.0 migrate status', {
        encoding: 'utf-8',
        stdio: 'pipe',
        env: { ...process.env },
      })
      console.log(statusOutput)

      if (statusOutput.includes('Database schema is up to date!')) {
        console.log('\n✅ SUCCESS: Migration state fixed!')
        console.log('   Migration 20241222_add_follow_wishlist is now APPLIED')
        console.log('   P3009 error should be resolved.')
        console.log('   Vercel deployments should now succeed.\n')
      } else if (statusOutput.includes('failed migration')) {
        console.log('\n⚠️  WARNING: Prisma still reports failed migrations')
        console.log('   Review the output above for details.\n')
      }
    } catch (error: any) {
      console.error('❌ Error checking migration status:')
      console.error(error.stdout?.toString() || error.message)
      console.error(error.stderr?.toString() || '')
      // Don't exit - migration was marked as applied, status check is just verification
    }

  } catch (error: any) {
    console.error('❌ Fatal error:')
    console.error(error.message)
    if (error.code) {
      console.error(`   Error code: ${error.code}`)
    }
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('✅ Resolution complete')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

resolveFollowWishlist().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
