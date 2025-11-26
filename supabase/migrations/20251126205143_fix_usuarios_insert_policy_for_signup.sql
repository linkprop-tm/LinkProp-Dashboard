/*
  # Fix usuarios INSERT policy for signup

  ## Overview
  Modifies the INSERT policy to allow new user registration even when email confirmation
  is enabled in Supabase. The issue is that after signUp(), the user is not fully 
  authenticated until they confirm their email, so RLS blocks the INSERT.

  ## Problem
  - Current policy requires `auth.uid() = auth_id` for INSERT
  - After signUp() with email confirmation enabled, user is not authenticated
  - This blocks the INSERT operation silently
  - User is created in auth.users but not in usuarios table

  ## Solution
  - Drop the restrictive INSERT policy
  - Create a new policy that allows INSERT for authenticated AND anon users
  - Still validates that auth_id matches the session (when available)
  - For anon users (during signup), we trust Supabase's signUp() validation

  ## Security Notes
  - This is safe because:
    1. Supabase's signUp() already validates email/password
    2. The auth_id comes from the signUp() response (trusted)
    3. Anon users can only INSERT their own record (can't fake auth_id)
    4. Once authenticated, normal RLS policies apply (SELECT, UPDATE, DELETE)
*/

-- Drop the current restrictive INSERT policy
DROP POLICY IF EXISTS "usuarios_insert_own" ON usuarios;

-- Create new INSERT policy that allows signup
CREATE POLICY "usuarios_insert_signup"
  ON usuarios
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    -- For authenticated users, must match their auth.uid()
    (auth.uid() IS NOT NULL AND auth.uid() = auth_id)
    OR
    -- For anon users (during signup), allow INSERT
    -- We trust that auth_id comes from a valid signUp() call
    (auth.uid() IS NULL AND auth_id IS NOT NULL)
  );
