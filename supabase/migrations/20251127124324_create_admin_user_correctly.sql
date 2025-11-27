/*
  # Create Admin User with Correct Password Hash
  
  1. Purpose
    - Creates an admin user (agente@gmail.com) with properly hashed password
    - Uses Supabase's auth functions to ensure compatibility
  
  2. Changes
    - Inserts user into auth.users with encrypted password
    - Creates corresponding record in usuarios table with admin role
  
  3. Security
    - Password is properly encrypted using Supabase's auth system
    - User can immediately login with credentials
*/

-- Insert user into auth.users using Supabase's encryption
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'agente@gmail.com',
  crypt('agente2025', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb,
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
) RETURNING id;

-- Insert into usuarios table
INSERT INTO usuarios (auth_id, email, full_name, rol)
SELECT 
  id,
  'agente@gmail.com',
  'Agente Admin',
  'admin'
FROM auth.users
WHERE email = 'agente@gmail.com';
