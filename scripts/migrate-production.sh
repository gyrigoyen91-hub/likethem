#!/bin/bash

# Production migration script for NextAuth tables
# This script should be run on Vercel during deployment

echo "🚀 Starting NextAuth tables migration for production..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL environment variable is not set"
  exit 1
fi

echo "✅ DATABASE_URL is set"

# Generate Prisma client
echo "📦 Generating Prisma client..."
npx prisma generate

# Deploy migrations to production database
echo "🗄️ Deploying migrations to production database..."
npx prisma migrate deploy

echo "✅ NextAuth tables migration completed successfully!"

# Verify tables exist
echo "🔍 Verifying NextAuth tables..."
npx tsx scripts/check-nextauth-tables.ts
