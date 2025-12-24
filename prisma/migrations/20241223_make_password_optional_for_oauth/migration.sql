-- AlterTable: Make password optional for OAuth users
-- Rename password to passwordHash and make it nullable

-- Step 1: Add new passwordHash column (nullable)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "passwordHash" TEXT;

-- Step 2: Copy existing password values to passwordHash (for existing credentials users)
UPDATE "users" 
SET "passwordHash" = "password" 
WHERE "password" IS NOT NULL AND "password" != '';

-- Step 3: Drop the old password column
ALTER TABLE "users" DROP COLUMN IF EXISTS "password";
