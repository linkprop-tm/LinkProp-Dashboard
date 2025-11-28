/*
  # Remove ubicacion column from propiedades table

  1. Changes
    - Remove the `ubicacion` column from the `propiedades` table
    - The table already has `direccion`, `barrio`, and `provincia` columns which provide more granular location data
    - Location will be calculated dynamically as needed using: `${direccion}, ${barrio}, ${provincia}`

  2. Notes
    - This migration is safe as the location data is preserved in the separate fields
    - Any queries using `ubicacion` should be updated to use the separate location fields instead
*/

-- Remove the ubicacion column from propiedades table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'propiedades' AND column_name = 'ubicacion'
  ) THEN
    ALTER TABLE propiedades DROP COLUMN ubicacion;
  END IF;
END $$;
