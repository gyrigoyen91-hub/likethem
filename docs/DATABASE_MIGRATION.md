# Database Migration Guide

## Overview

This project has been migrated from SQLite to managed Postgres (Supabase) for better scalability and production reliability.

## Database Configuration

### Environment Variables

Required environment variables:

```bash
# Postgres Database URLs (Supabase)
DATABASE_URL="postgresql://postgres.mineihnvptbfkqdfcrzg:Gyrigoyen0708!@aws-1-us-east-1.pooler.supabase.com:5432/postgres?pgbouncer=true&connect_timeout=15&sslmode=require"
DIRECT_URL="postgresql://postgres:Gyrigoyen0708!@db.mineihnvptbfkqdfcrzg.supabase.co:5432/postgres?sslmode=require"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-here"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### Vercel Environment Variables

Add these to your Vercel project settings:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add the following variables:
   - `DATABASE_URL` (use the pooled connection string)
   - `DIRECT_URL` (use the direct connection string)
   - `NEXTAUTH_URL` (set to your production domain)
   - `NEXTAUTH_SECRET` (generate a secure secret)
   - `GOOGLE_CLIENT_ID` (from Google Console)
   - `GOOGLE_CLIENT_SECRET` (from Google Console)

## User Model Fields

The User model includes the following fields:

```prisma
model User {
  id            String          @id @default(cuid())
  email         String          @unique
  password      String          // empty for OAuth users
  fullName      String?
  avatar        String?
  provider      String?         // e.g. "google" or "credentials"
  emailVerified DateTime?
  phone         String?
  role          Role            @default(BUYER)
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
  // ... relations
}
```

### NextAuth Field Mapping

- `session.user.id` ← `user.id`
- `session.user.name` ← `user.fullName`
- `session.user.image` ← `user.avatar`
- `session.user.email` ← `user.email`

## Running Migrations

### Local Development

```bash
# Generate Prisma client
npx prisma generate

# Push schema changes (for development)
npx prisma db push

# Create migration (for production)
npx prisma migrate dev --name migration-name
```

### Production Deployment

```bash
# Deploy migrations to production
npx prisma migrate deploy
```

## Data Migration

If you need to migrate data from the old SQLite database:

```bash
# Run the migration script (requires --confirm flag)
DATABASE_URL="your-postgres-url" npx tsx scripts/migrate-sqlite-to-postgres.ts --confirm
```

**⚠️ Warning**: This script should only be run locally and requires explicit confirmation.

## Database Security

### Password Rotation

To rotate database passwords:

1. Update password in Supabase dashboard
2. Update `DATABASE_URL` and `DIRECT_URL` in Vercel environment variables
3. Redeploy the application

### Connection Security

- All connections use SSL (`sslmode=require`)
- Pooled connections are used for serverless environments
- Direct connections are used for migrations and admin tasks

## Troubleshooting

### Common Issues

1. **Connection Timeout**: Ensure `connect_timeout=15` is in the DATABASE_URL
2. **SSL Errors**: Verify `sslmode=require` is present
3. **Migration Failures**: Use direct connection for migrations
4. **Pool Exhaustion**: Check connection limits in Supabase dashboard

### Logs

Check Vercel function logs for database-related errors:
- Go to Vercel Dashboard → Your Project → Functions
- Look for errors containing "P1001", "P2002", or other Prisma error codes

## Rollback Plan

If you need to rollback to SQLite temporarily:

1. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = "file:./dev.db"
   }
   ```

2. Run `npx prisma db push` to sync with SQLite
3. Deploy the changes

**Note**: This is only for emergency rollback. The project is permanently moving to Postgres.
