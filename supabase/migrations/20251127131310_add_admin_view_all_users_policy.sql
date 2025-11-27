/*
  # Add Admin View All Users Policy

  ## Overview
  Creates a new RLS policy that allows administrators (users with rol='admin' 
  in the usuarios table) to view all users. This fixes the issue where admins 
  cannot see client lists in the admin interface.

  ## Problem
  - Original migration created policy "Admins can manage all users" checking admins table
  - Later migrations added 'rol' field to usuarios table
  - No policy exists to allow usuarios with rol='admin' to view all usuarios records
  - Current policies only allow users to view their own profile

  ## Solution
  1. Drop the old policy that checks the admins table
  2. Create new policy "Admins can view all users from usuarios table"
  3. Policy checks if the authenticated user has rol='admin' in usuarios table
  4. This allows admin users to see all clients (rol='user') in the system

  ## Security Notes
  - Only users with rol='admin' in usuarios table can view all users
  - Regular users (rol='user') continue to only see their own profile
  - Maintains existing security while enabling admin functionality
*/

-- Drop the old policy that checks the admins table
DROP POLICY IF EXISTS "Admins can manage all users" ON usuarios;

-- Create new policy for admins to view all users
CREATE POLICY "Admins can view all users from usuarios table"
  ON usuarios
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_id = auth.uid()
      AND usuarios.rol = 'admin'
    )
  );

-- Create new policy for admins to update all users
CREATE POLICY "Admins can update all users from usuarios table"
  ON usuarios
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_id = auth.uid()
      AND usuarios.rol = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_id = auth.uid()
      AND usuarios.rol = 'admin'
    )
  );

-- Create new policy for admins to delete users
CREATE POLICY "Admins can delete users from usuarios table"
  ON usuarios
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_id = auth.uid()
      AND usuarios.rol = 'admin'
    )
  );