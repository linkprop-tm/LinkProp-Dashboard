/*
  # Drop Unused Preference Columns from Usuarios Table

  1. Changes
    - Drop `preferencias_dormitorios_min` column from `usuarios` table
    - Drop `preferencias_banos_min` column from `usuarios` table
    - Drop `preferencias_m2_max` column from `usuarios` table

  2. Reasoning
    - These preference columns are no longer needed in the application
    - Removing unused columns improves database performance and clarity
    - No data migration needed as these are optional preference fields

  3. Impact
    - Frontend and backend code will be updated to remove references to these columns
    - Existing user records will not be affected (columns simply removed)
    - Application will continue to work with remaining preference columns
*/

-- Drop the three unused preference columns
DO $$
BEGIN
  -- Drop preferencias_dormitorios_min if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'usuarios' AND column_name = 'preferencias_dormitorios_min'
  ) THEN
    ALTER TABLE usuarios DROP COLUMN preferencias_dormitorios_min;
  END IF;

  -- Drop preferencias_banos_min if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'usuarios' AND column_name = 'preferencias_banos_min'
  ) THEN
    ALTER TABLE usuarios DROP COLUMN preferencias_banos_min;
  END IF;

  -- Drop preferencias_m2_max if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'usuarios' AND column_name = 'preferencias_m2_max'
  ) THEN
    ALTER TABLE usuarios DROP COLUMN preferencias_m2_max;
  END IF;
END $$;
