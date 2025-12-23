#!/bin/bash
set -e

# Load environment variables from .env.prod
export DATABASE_URL=$(grep '^DATABASE_URL=' .env.prod | cut -d'=' -f2- | tr -d '"')
export DIRECT_URL=$(grep '^DIRECT_URL=' .env.prod | cut -d'=' -f2- | tr -d '"')

echo "Step 1: Checking existing tables..."
npx prisma db execute --url "$DIRECT_URL" --stdin <<'SQL'
SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name;
SQL

echo ""
echo "Step 2: Creating baseline migration..."
mkdir -p prisma/migrations/0000_baseline
npx prisma migrate diff --from-empty --to-url "$DIRECT_URL" --script > prisma/migrations/0000_baseline/migration.sql

echo ""
echo "Step 3: Marking baseline as applied..."
npx prisma migrate resolve --applied 0000_baseline

echo ""
echo "Step 4: Creating alignment migration..."
mkdir -p prisma/migrations/0002_align_to_schema
npx prisma migrate diff --from-url "$DIRECT_URL" --to-schema-datamodel prisma/schema.prisma --script > prisma/migrations/0002_align_to_schema/migration.sql

echo ""
echo "Step 5: Deploying migrations..."
npx prisma migrate deploy
npx prisma migrate status

echo ""
echo "Step 6: Verifying tables exist..."
npx prisma db execute --url "$DIRECT_URL" --stdin <<'SQL'
SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name;
SQL

echo ""
echo "✅ Migration baseline complete!"
