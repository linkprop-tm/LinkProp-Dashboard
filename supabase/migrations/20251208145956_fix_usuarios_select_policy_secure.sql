/*
  # Fix usuarios SELECT Policy for Secure Registration

  1. Changes
    - Drop the existing `usuarios_select_for_signup` policy
    - Create a new secure SELECT policy that only allows:
      * Authenticated users to view their own record
      * Admin users to view all records
    - Removes the insecure `anon` access that allowed viewing all records
  
  2. Security
    - Users can only view their own record when authenticated
    - No anonymous access to SELECT queries
    - Admin users retain full access
*/

-- Drop the existing insecure SELECT policy
DROP POLICY IF EXISTS "usuarios_select_for_signup" ON usuarios;

-- Create a new secure SELECT policy
CREATE POLICY "usuarios_select_authenticated"
  ON usuarios
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = auth_id OR is_admin()
  );
