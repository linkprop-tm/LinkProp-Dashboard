/*
  # Convert preference columns to ENUM NOT NULL

  ## Overview
  This migration converts two preference columns to ENUM types with NOT NULL constraints and default values:
  - `preferencias_operacion`: from text with CHECK constraint to ENUM (NOT NULL, default 'Venta')
  - `preferencias_antiguedad`: from text[] array to single ENUM value (NOT NULL, default 'Indiferente')

  ## Changes

  1. New ENUM Types
     - `tipo_operacion_preferencia`: 'Venta', 'Alquiler'
     - `tipo_antiguedad_preferencia`: 'Indiferente', 'Pozo / Construcción', 'A estrenar', 'Hasta 5 años', 'Hasta 10 años', 'Hasta 20 años', 'Hasta 50 años'

  2. Column Modifications on `usuarios` table
     - `preferencias_operacion`:
       * Convert from `text` to `tipo_operacion_preferencia` ENUM
       * Add NOT NULL constraint with default value 'Venta'
       * Migrate existing NULL values to 'Venta'
       * Remove old CHECK constraint
     
     - `preferencias_antiguedad`:
       * Convert from `text[]` array to single `tipo_antiguedad_preferencia` ENUM value
       * Add NOT NULL constraint with default value 'Indiferente'
       * Migrate existing data: extract first array element or use 'Indiferente' if empty/NULL
       * This changes the UI from multi-select to single-select

  ## Data Migration
  - All NULL values in `preferencias_operacion` will be set to 'Venta'
  - All NULL or empty arrays in `preferencias_antiguedad` will be set to 'Indiferente'
  - Non-empty arrays will use their first element (mapped to new enum values if needed)

  ## Important Notes
  - This is a breaking change for the frontend - the antiguedad preference changes from array to single value
  - Both fields become mandatory (NOT NULL) to ensure data integrity
  - The new antiguedad options align with the specification provided
*/

-- Step 1: Create ENUM types
DO $$ BEGIN
  CREATE TYPE tipo_operacion_preferencia AS ENUM ('Venta', 'Alquiler');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE tipo_antiguedad_preferencia AS ENUM (
    'Indiferente',
    'Pozo / Construcción',
    'A estrenar',
    'Hasta 5 años',
    'Hasta 10 años',
    'Hasta 20 años',
    'Hasta 50 años'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Step 2: Migrate preferencias_operacion

-- First, update any NULL values to 'Venta'
UPDATE usuarios 
SET preferencias_operacion = 'Venta' 
WHERE preferencias_operacion IS NULL;

-- Drop the old CHECK constraint if it exists
DO $$ 
BEGIN
  ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_preferencias_operacion_check;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Convert column to ENUM type with NOT NULL and default
ALTER TABLE usuarios 
  ALTER COLUMN preferencias_operacion TYPE tipo_operacion_preferencia 
  USING preferencias_operacion::tipo_operacion_preferencia;

ALTER TABLE usuarios 
  ALTER COLUMN preferencias_operacion SET DEFAULT 'Venta'::tipo_operacion_preferencia;

ALTER TABLE usuarios 
  ALTER COLUMN preferencias_operacion SET NOT NULL;

-- Step 3: Migrate preferencias_antiguedad from text[] to single ENUM value

-- Create a temporary column for the new type
ALTER TABLE usuarios ADD COLUMN preferencias_antiguedad_new tipo_antiguedad_preferencia;

-- Migrate data: extract first element from array or use 'Indiferente' as default
-- We need to map old values to new ENUM values
UPDATE usuarios 
SET preferencias_antiguedad_new = CASE
  -- If array is NULL or empty, use 'Indiferente'
  WHEN preferencias_antiguedad IS NULL OR array_length(preferencias_antiguedad, 1) IS NULL THEN 'Indiferente'::tipo_antiguedad_preferencia
  
  -- Map existing values to new ENUM values
  WHEN preferencias_antiguedad[1] = 'Indiferente' THEN 'Indiferente'::tipo_antiguedad_preferencia
  WHEN preferencias_antiguedad[1] = 'Pozo / Construcción' THEN 'Pozo / Construcción'::tipo_antiguedad_preferencia
  WHEN preferencias_antiguedad[1] = 'A estrenar' THEN 'A estrenar'::tipo_antiguedad_preferencia
  WHEN preferencias_antiguedad[1] = 'Hasta 5 años' THEN 'Hasta 5 años'::tipo_antiguedad_preferencia
  WHEN preferencias_antiguedad[1] = 'Hasta 10 años' THEN 'Hasta 10 años'::tipo_antiguedad_preferencia
  WHEN preferencias_antiguedad[1] = 'Hasta 20 años' THEN 'Hasta 20 años'::tipo_antiguedad_preferencia
  WHEN preferencias_antiguedad[1] = 'Hasta 50 años' THEN 'Hasta 50 años'::tipo_antiguedad_preferencia
  
  -- For any values like 'Más de 20 años', map to 'Hasta 50 años'
  WHEN preferencias_antiguedad[1] LIKE '%20%' OR preferencias_antiguedad[1] LIKE 'Más%' THEN 'Hasta 50 años'::tipo_antiguedad_preferencia
  
  -- Default fallback
  ELSE 'Indiferente'::tipo_antiguedad_preferencia
END;

-- Drop the old column
ALTER TABLE usuarios DROP COLUMN preferencias_antiguedad;

-- Rename the new column to the original name
ALTER TABLE usuarios RENAME COLUMN preferencias_antiguedad_new TO preferencias_antiguedad;

-- Set NOT NULL constraint and default value
ALTER TABLE usuarios 
  ALTER COLUMN preferencias_antiguedad SET DEFAULT 'Indiferente'::tipo_antiguedad_preferencia;

ALTER TABLE usuarios 
  ALTER COLUMN preferencias_antiguedad SET NOT NULL;

-- Add helpful comment
COMMENT ON COLUMN usuarios.preferencias_antiguedad IS 'Preferencia de antigüedad de propiedad (valor único, no array). Valores: Indiferente, Pozo / Construcción, A estrenar, Hasta 5/10/20/50 años';
COMMENT ON COLUMN usuarios.preferencias_operacion IS 'Tipo de operación preferida (obligatorio). Valores: Venta, Alquiler';