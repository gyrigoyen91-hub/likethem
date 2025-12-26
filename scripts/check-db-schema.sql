-- Check DB schema for auth compatibility
-- Run this in Supabase SQL Editor to verify schema matches Prisma

-- 1. Check User table columns
SELECT 
  column_name, 
  is_nullable, 
  data_type,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'users'
ORDER BY ordinal_position;

-- 2. Check if password column still exists (should NOT exist)
SELECT EXISTS (
  SELECT 1 FROM information_schema.columns
  WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'password'
) as password_column_exists;

-- 3. Check if passwordHash column exists and is nullable (should be TRUE)
SELECT 
  column_name,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'users' 
  AND column_name = 'passwordHash';

-- 4. Check Account links for Google provider
SELECT 
  a.id, 
  a.provider, 
  a."providerAccountId", 
  a."userId", 
  u.email,
  u."passwordHash" IS NOT NULL as has_password
FROM "accounts" a
JOIN "users" u ON u.id = a."userId"
WHERE a.provider = 'google'
ORDER BY u.email;

-- 5. Check for duplicate providerAccountIds (should be 0)
SELECT 
  "providerAccountId",
  COUNT(*) as count
FROM "accounts"
WHERE provider = 'google'
GROUP BY "providerAccountId"
HAVING COUNT(*) > 1;
