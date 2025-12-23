#!/usr/bin/env tsx

/**
 * Pre-build migration check
 * 
 * This script runs before Vercel build to detect failed migrations early
 * and provide clear error messages instead of opaque P3009 errors.
 * 
 * Exit codes:
 * - 0: All migrations are clean, build can proceed
 * - 1: Failed migrations detected, build should stop
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

async function preBuildCheck() {
  console.log('🔍 Pre-build migration check...\n')

  try {
    // Query for failed migrations
    const failedMigrations = await prisma.$queryRaw<Array<{
      migration_name: string
      started_at: Date | null
      finished_at: Date | null
      rolled_back_at: Date | null
      logs: string | null
    }>>`
      SELECT 
        migration_name,
        started_at,
        finished_at,
        rolled_back_at,
        logs
      FROM "_prisma_migrations"
      WHERE finished_at IS NULL
         OR rolled_back_at IS NOT NULL
      ORDER BY started_at DESC
    `

    if (failedMigrations.length === 0) {
      console.log('✅ No failed migrations detected. Build can proceed.\n')
      await prisma.$disconnect()
      process.exit(0)
    }

    // Failed migrations found
    console.error('❌ FAILED MIGRATIONS DETECTED\n')
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.error('The following migrations are blocking the build:')
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    failedMigrations.forEach((migration, index) => {
      console.error(`Migration ${index + 1}: ${migration.migration_name}`)
      console.error(`  Started: ${migration.started_at || 'NULL'}`)
      console.error(`  Finished: ${migration.finished_at ? 'YES' : 'NO'}`)
      console.error(`  Rolled back: ${migration.rolled_back_at ? 'YES' : 'NO'}`)
      if (migration.logs) {
        console.error(`  Error logs: ${migration.logs.substring(0, 500)}${migration.logs.length > 500 ? '...' : ''}`)
      }
      console.error('')
    })

    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.error('REMEDIATION STEPS:')
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    console.error('1. Diagnose the issue:')
    console.error('   npm run diagnose:migrations\n')

    console.error('2. If tables exist but migration is marked failed:')
    console.error('   npm run resolve:follow-wishlist\n')

    console.error('3. If migration needs to be rolled back:')
    console.error('   npx prisma@6.12.0 migrate resolve --rolled-back <migration_name>\n')

    console.error('4. If migration needs to be marked as applied:')
    console.error('   npx prisma@6.12.0 migrate resolve --applied <migration_name>\n')

    console.error('5. After resolving, retry the build.\n')

    console.error('For more details, see: docs/DEPLOYMENT_MIGRATIONS.md\n')

    await prisma.$disconnect()
    process.exit(1)

  } catch (error: any) {
    console.error('❌ Error during pre-build check:')
    console.error(error.message)
    if (error.code) {
      console.error(`   Error code: ${error.code}`)
    }
    console.error('\n⚠️  Build will proceed, but migration state is unknown.')
    console.error('   Review migration status manually if build fails.\n')
    await prisma.$disconnect()
    // Don't block build if check itself fails - let Prisma migrate deploy handle it
    process.exit(0)
  }
}

preBuildCheck().catch((error) => {
  console.error('Fatal error in pre-build check:', error)
  // Don't block build on script errors
  process.exit(0)
})
