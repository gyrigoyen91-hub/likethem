-- Fix DB schema to match Prisma (idempotent)
-- Run this in Supabase SQL Editor if schema check shows issues

-- Step 1: Add passwordHash column if it doesn't exist
ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "passwordHash" TEXT;

-- Step 2: Migrate existing password values to passwordHash (if password column exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' 
      AND table_name = 'users' 
      AND column_name = 'password'
  ) THEN
    -- Copy password to passwordHash where passwordHash is null
    UPDATE "users" 
    SET "passwordHash" = "password" 
    WHERE "passwordHash" IS NULL 
      AND "password" IS NOT NULL 
      AND "password" <> '';
    
    -- Drop the old password column
    ALTER TABLE "users" DROP COLUMN "password";
  END IF;
END $$;

-- Step 3: Ensure passwordHash is nullable (should already be, but verify)
-- This is handled by the ADD COLUMN IF NOT EXISTS above

-- Verify the result
SELECT 
  column_name, 
  is_nullable, 
  data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'users'
  AND column_name IN ('password', 'passwordHash')
ORDER BY column_name;
