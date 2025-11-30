/*
  # Remove titulo column from propiedades table

  ## Description
  Removes the titulo (title) column from the propiedades table as it's no longer needed.
  Properties will be identified by other fields like tipo, direccion, and id_original.

  ## Changes
  1. Column Removal
    - Drop `titulo` column from propiedades table
    - This field was required but is being eliminated to simplify the schema

  ## Migration Steps
  1. Remove the NOT NULL constraint if it exists
  2. Drop the titulo column

  ## Security
  - No changes to RLS policies needed
  - Existing access policies remain unchanged

  ## Notes
  - This is a destructive operation - existing titulo data will be lost
  - Ensure any application code referencing titulo is updated before applying
  - Properties will be identified by id_original, tipo, direccion, etc.
*/

-- Drop the titulo column from propiedades table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'propiedades' AND column_name = 'titulo'
  ) THEN
    ALTER TABLE propiedades DROP COLUMN titulo;
  END IF;
END $$;