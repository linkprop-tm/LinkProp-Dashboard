/*
  # Add estado_usuario ENUM Column to usuarios Table

  1. Changes
    - Creates a new ENUM type `estado_usuario_enum` with values 'Activo' and 'Inactivo'
    - Adds `estado_usuario` column to the `usuarios` table
    - Position: Between `telefono` and `preferencias_tipo`
    - Default value: 'Activo' for all new users
    - Allows NULL for admin users (flexibility)
    - Updates all existing records to have 'Activo' as initial value
  
  2. Purpose
    - Enable user account activation/deactivation functionality
    - Automatically assigns 'Activo' status to new users during registration
    - Provides granular control over user access without deletion
    - Maintains data integrity with ENUM type constraints

  3. Important Notes
    - This field is NOT requested during user registration
    - System automatically assigns 'Activo' value
    - Admin interface can later modify this value for user management
    - NULL is permitted to allow flexibility for admin accounts
*/

-- Create ENUM type for estado_usuario
DO $$ BEGIN
  CREATE TYPE estado_usuario_enum AS ENUM ('Activo', 'Inactivo');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add estado_usuario column to usuarios table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'usuarios' AND column_name = 'estado_usuario'
  ) THEN
    ALTER TABLE usuarios 
    ADD COLUMN estado_usuario estado_usuario_enum DEFAULT 'Activo';
  END IF;
END $$;

-- Update existing records to have 'Activo' as default
UPDATE usuarios 
SET estado_usuario = 'Activo' 
WHERE estado_usuario IS NULL;

-- Add descriptive comment to column
COMMENT ON COLUMN usuarios.estado_usuario IS 'Estado del usuario: Activo o Inactivo. Por defecto Activo al crear cuenta. Puede ser NULL para cuentas admin.';
