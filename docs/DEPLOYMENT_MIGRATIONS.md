# Deployment Migrations Guide

## Overview

This document explains how Prisma migrations work in production deployments and how to resolve common issues, particularly the P3009 error ("migrate found failed migrations").

## ⚠️ IMPORTANT: Production Migration Policy

**Migrations are NOT run automatically during Vercel builds.**

- Vercel build script: `next build` (migrations removed)
- Migrations must be run manually or via controlled CI job
- This prevents P3009 errors from blocking production deployments

## Why P3009 Happens

Prisma tracks migration state in the `_prisma_migrations` table. When a migration fails during deployment:

1. Prisma records the migration as "started" (`started_at` is set)
2. The migration fails (SQL error, timeout, etc.)
3. Prisma does NOT set `finished_at`
4. Future `prisma migrate deploy` commands see this failed migration and refuse to proceed (P3009)

This is a safety mechanism to prevent partial migrations from causing data corruption.

## Common Scenarios

### Scenario 1: Migration Failed but Tables Were Created

**Symptoms:**
- Migration appears in `_prisma_migrations` with `finished_at = NULL`
- Tables actually exist in the database
- P3009 error on subsequent deployments

**Resolution:**
```bash
# 1. Verify tables exist
npm run diagnose:migrations

# 2. Mark migration as applied (if tables exist)
npm run resolve:follow-wishlist

# Or manually:
npx prisma@6.12.0 migrate resolve --applied 20241222_add_follow_wishlist
```

### Scenario 2: Migration Partially Failed

**Symptoms:**
- Some tables/constraints created, others missing
- Migration marked as failed

**Resolution:**
1. Review migration SQL manually
2. Apply missing parts via SQL editor or manual migration
3. Mark migration as applied: `npx prisma@6.12.0 migrate resolve --applied <migration_name>`

### Scenario 3: Migration Needs to be Rolled Back

**Symptoms:**
- Migration created incorrect schema
- Need to undo changes

**Resolution:**
```bash
# 1. Manually roll back the changes (drop tables, etc.)
# 2. Mark migration as rolled back
npx prisma@6.12.0 migrate resolve --rolled-back <migration_name>
```

## Diagnostic Tools

### Check Migration Status

```bash
npm run diagnose:migrations
```

This script:
- Runs `prisma migrate status`
- Queries `_prisma_migrations` table directly
- Shows failed/rolled-back migrations
- Checks if tables exist
- Provides remediation recommendations

### Resolve Follow/Wishlist Migration

```bash
npm run resolve:follow-wishlist
```

This script:
- Validates that `follows` and `wishlist_items` tables exist
- Verifies required columns are present
- Marks `20241222_add_follow_wishlist` as APPLIED
- Verifies migration status is clean

## Vercel Build Process

### Current Setup

Vercel runs:
```bash
npm run vercel-build
```

Which executes:
1. `tsx scripts/prisma/preBuildCheck.ts` - Pre-build migration check
2. `prisma migrate deploy` - Apply pending migrations
3. `next build` - Build Next.js application

### Pre-Build Check

The `preBuildCheck.ts` script runs before migrations to:
- Detect failed migrations early
- Provide clear error messages (instead of opaque P3009)
- Suggest remediation steps
- Exit with code 1 if failed migrations are found (blocks build)

This makes debugging faster than waiting for `prisma migrate deploy` to fail.

## Production Migration Workflow (Current Policy)

**Migrations are run separately from application builds.**

### Workflow

1. **Before deploying new code with migrations:**
   ```bash
   # Set production database URL
   export DATABASE_URL="<production-database-url>"
   
   # Check status
   npx prisma@6.12.0 migrate status
   
   # Apply migrations
   npx prisma@6.12.0 migrate deploy
   
   # Verify success
   npx prisma@6.12.0 migrate status
   # Should show: "Database schema is up to date!"
   ```

2. **Deploy application:**
   ```bash
   git push origin main
   ```
   - Vercel builds without running migrations
   - Build cannot be blocked by migration state issues

### Why This Approach?

**Benefits:**
- ✅ Builds never fail due to migration state (P3009)
- ✅ Migrations can be tested and verified before deployment
- ✅ Clear separation: schema changes vs. code changes
- ✅ Easier to rollback if migration fails

**Trade-offs:**
- ⚠️ Requires manual migration step (or CI/CD job)
- ⚠️ Must ensure migrations run before app deployment

**Best Practice:**
- Run migrations in a controlled environment (local with prod DB, or CI/CD)
- Verify migrations succeed before pushing code
- Document migration steps in PR descriptions

## Environment Variables

Ensure these are set in Vercel Production:

- `DATABASE_URL` - Connection string (with pgbouncer for app)
- `DIRECT_URL` - Direct connection (without pgbouncer, for migrations)

**Important:** Migrations MUST use `DIRECT_URL` because:
- PgBouncer (connection pooling) doesn't support transactions
- Migrations require transaction support
- `prisma migrate deploy` automatically uses `DIRECT_URL` if available

## Troubleshooting

### P3009 Error on Vercel

1. Check Vercel build logs for the exact migration name
2. Run `npm run diagnose:migrations` locally (with production DB credentials)
3. If tables exist, run `npm run resolve:follow-wishlist`
4. If tables don't exist, review migration SQL and apply manually
5. Retry deployment

### Migration State Inconsistency

If `_prisma_migrations` table is out of sync:

1. Query the table directly:
```sql
SELECT migration_name, started_at, finished_at, rolled_back_at
FROM "_prisma_migrations"
WHERE finished_at IS NULL OR rolled_back_at IS NOT NULL;
```

2. For each problematic migration:
   - If tables exist: `migrate resolve --applied <name>`
   - If tables don't exist: `migrate resolve --rolled-back <name>`

### Build Fails but Migration Succeeds

If `prisma migrate deploy` succeeds but build still fails:

1. Check if `preBuildCheck.ts` is failing
2. Review script output for false positives
3. Temporarily disable pre-build check if needed (not recommended)

## Best Practices

1. **Test migrations locally first**
   - Use `prisma migrate dev` in development
   - Test against production-like data if possible

2. **Use idempotent migration SQL**
   - `CREATE TABLE IF NOT EXISTS`
   - `DO $$ ... END $$` blocks for constraints
   - Safe to run multiple times

3. **Monitor migration state**
   - Run `diagnose:migrations` regularly
   - Set up alerts for failed migrations

4. **Document complex migrations**
   - Add comments in migration SQL
   - Document rollback procedures
   - Note any manual steps required

5. **Version control migrations**
   - Never delete migration files
   - Always commit migration files
   - Review migrations in PRs

## Related Files

- `scripts/prisma/diagnoseMigrations.ts` - Diagnostic tool
- `scripts/prisma/resolveFollowWishlist.ts` - Resolution script
- `scripts/prisma/preBuildCheck.ts` - Pre-build guardrail
- `prisma/migrations/` - Migration SQL files
- `package.json` - Build scripts and npm commands

## Additional Resources

- [Prisma Migrate Documentation](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Prisma Migrate Troubleshooting](https://www.prisma.io/docs/guides/migrate/troubleshooting-development)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
