/*
  # Remove Duplicate INSERT Policy

  ## Problem
  There are TWO INSERT policies active on the usuarios table:
  1. usuarios_insert_own - Only allows authenticated users (restrictive)
  2. usuarios_insert_signup - Allows both anon and authenticated (correct)

  The presence of both policies may cause conflicts. We need to keep only
  the correct one (usuarios_insert_signup) that allows signup to work.

  ## Solution
  Drop the restrictive usuarios_insert_own policy, leaving only usuarios_insert_signup.

  ## Security
  After this migration, the INSERT policy will be:
  - usuarios_insert_signup: Allows anon and authenticated users to insert
    with proper validation (auth.uid() = auth_id or valid auth_id from signUp)
*/

-- Remove the restrictive INSERT policy
DROP POLICY IF EXISTS "usuarios_insert_own" ON usuarios;

-- Verify usuarios_insert_signup exists (it should from previous migration)
-- If for some reason it doesn't exist, create it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'usuarios' 
    AND policyname = 'usuarios_insert_signup'
  ) THEN
    CREATE POLICY "usuarios_insert_signup"
      ON usuarios
      FOR INSERT
      TO anon, authenticated
      WITH CHECK (
        (auth.uid() IS NOT NULL AND auth.uid() = auth_id)
        OR
        (auth.uid() IS NULL AND auth_id IS NOT NULL)
      );
  END IF;
END $$;
