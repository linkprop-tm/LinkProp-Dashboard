/*
  # Fix usuarios table structure

  ## Overview
  Fixes the table structure to allow proper user registration by removing the foreign key
  constraint on the id column and ensuring auth_id is the sole reference to auth.users.

  ## Problem Identified
  - The `id` column was originally set as a foreign key to `auth.users(id)`
  - Later migrations added `auth_id` as the proper reference to `auth.users(id)`
  - This created a conflict where INSERT operations failed because `id` was not provided
  - The registration code uses `auth_id` but `id` (being a PK without DEFAULT) was required

  ## Changes Made

  ### 1. Fix id column
  - Remove foreign key constraint from `id` column if it exists
  - Set DEFAULT value to `gen_random_uuid()` for auto-generation
  - Keep `id` as PRIMARY KEY (uuid)

  ### 2. Ensure auth_id is the proper reference
  - `auth_id` remains as the UNIQUE foreign key to `auth.users(id)`
  - This is the column used by the application code

  ## Security Notes
  - RLS policies remain unchanged
  - All existing data remains intact
  - Only structural changes to allow proper INSERT operations
*/

-- Remove foreign key constraint from id column if it exists
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_id_fkey;

-- Ensure id has a default value for auto-generation
ALTER TABLE usuarios ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Verify auth_id is properly constrained (should already exist from previous migrations)
-- This is just a safety check - it won't fail if constraint already exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'usuarios_auth_id_fkey' 
    AND table_name = 'usuarios'
  ) THEN
    ALTER TABLE usuarios 
      ADD CONSTRAINT usuarios_auth_id_fkey 
      FOREIGN KEY (auth_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;
