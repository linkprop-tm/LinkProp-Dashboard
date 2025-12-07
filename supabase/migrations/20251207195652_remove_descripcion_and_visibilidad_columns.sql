/*
  # Remove descripcion and visibilidad columns from propiedades

  ## Description
  Removes the descripcion and visibilidad columns from the propiedades table
  to align with the Google Sheets import structure.

  ## Changes
  1. Column Removal
    - Drop `descripcion` column from propiedades table
    - Drop `visibilidad` column from propiedades table

  ## Migration Steps
  1. Drop descripcion column if exists
  2. Drop visibilidad column if exists

  ## Security
  - No changes to RLS policies needed
  - Existing access policies remain unchanged

  ## Notes
  - This is a destructive operation - existing data in these columns will be lost
  - These columns are not part of the Google Sheets import schema
  - Properties will not have description or visibility fields going forward
*/

-- Drop the descripcion column from propiedades table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'propiedades' AND column_name = 'descripcion'
  ) THEN
    ALTER TABLE propiedades DROP COLUMN descripcion;
  END IF;
END $$;

-- Drop the visibilidad column from propiedades table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'propiedades' AND column_name = 'visibilidad'
  ) THEN
    ALTER TABLE propiedades DROP COLUMN visibilidad;
  END IF;
END $$;
