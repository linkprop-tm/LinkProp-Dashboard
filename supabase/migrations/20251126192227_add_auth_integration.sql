/*
  # Add Authentication Integration

  ## Overview
  Integrates Supabase Auth with existing usuarios and admins tables.
  Adds auth_id field to link with auth.users table.

  ## Changes Made

  ### 1. Table Modifications
  - Add `auth_id` (uuid) to `usuarios` table
  - Add `auth_id` (uuid) to `admins` table
  - Both fields reference auth.users(id) and are unique

  ### 2. Security Updates
  - Update RLS policies to use auth.uid() for better security
  - Add policy to allow user registration (INSERT without prior auth)
  - Maintain existing admin and user access controls

  ## Important Notes
  - All new user registrations will create entries in usuarios table by default
  - Admin entries must be created manually with proper auth_id linkage
  - Email verification is disabled for direct registration
*/

-- Add auth_id column to usuarios table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'usuarios' AND column_name = 'auth_id'
  ) THEN
    ALTER TABLE usuarios ADD COLUMN auth_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add auth_id column to admins table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admins' AND column_name = 'auth_id'
  ) THEN
    ALTER TABLE admins ADD COLUMN auth_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create index on auth_id for performance
CREATE INDEX IF NOT EXISTS idx_usuarios_auth_id ON usuarios(auth_id);
CREATE INDEX IF NOT EXISTS idx_admins_auth_id ON admins(auth_id);

-- Drop existing policies to recreate them with auth.uid()
DROP POLICY IF EXISTS "Users can view own profile" ON usuarios;
DROP POLICY IF EXISTS "Users can update own profile" ON usuarios;

-- Updated RLS Policy: Users can view own profile using auth.uid()
CREATE POLICY "Users can view own profile"
  ON usuarios FOR SELECT
  TO authenticated
  USING (auth.uid() = auth_id);

-- Updated RLS Policy: Users can update own profile using auth.uid()
CREATE POLICY "Users can update own profile"
  ON usuarios FOR UPDATE
  TO authenticated
  USING (auth.uid() = auth_id)
  WITH CHECK (auth.uid() = auth_id);

-- New RLS Policy: Allow users to insert their own profile during registration
CREATE POLICY "Users can create own profile"
  ON usuarios FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = auth_id);