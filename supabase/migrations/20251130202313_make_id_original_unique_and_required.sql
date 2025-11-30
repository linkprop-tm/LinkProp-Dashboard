/*
  # Make id_original unique and required in propiedades table

  ## Description
  Updates the id_original column to be unique and required (NOT NULL).
  This ensures every property imported from Google Sheets has a unique identifier
  and prevents duplicate imports.

  ## Changes
  1. Column Constraints
    - Change `id_original` from nullable to NOT NULL
    - Add UNIQUE constraint to prevent duplicate entries
    - Keep existing default of empty string for backward compatibility

  ## Migration Steps
  1. Update any existing NULL or empty id_original values with generated IDs
  2. Add NOT NULL constraint
  3. Add UNIQUE constraint

  ## Security
  - No changes to RLS policies needed
  - Existing access policies remain unchanged

  ## Notes
  - Existing properties with NULL or empty id_original will get auto-generated IDs
  - Format: 'PROP-{timestamp}-{random}' for auto-generated IDs
  - This prevents duplicate imports when syncing from Google Sheets
  - The sync operation will use id_original to identify existing properties
*/

-- Update any NULL or empty id_original values with generated unique IDs
UPDATE propiedades 
SET id_original = 'PROP-' || EXTRACT(EPOCH FROM now())::text || '-' || substr(md5(random()::text), 1, 8)
WHERE id_original IS NULL OR id_original = '';

-- Make id_original NOT NULL
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'propiedades' 
    AND column_name = 'id_original'
    AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE propiedades ALTER COLUMN id_original SET NOT NULL;
  END IF;
END $$;

-- Add UNIQUE constraint to id_original
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'propiedades_id_original_unique' 
    AND table_name = 'propiedades'
  ) THEN
    ALTER TABLE propiedades ADD CONSTRAINT propiedades_id_original_unique UNIQUE (id_original);
  END IF;
END $$;

-- Update comment on the column
COMMENT ON COLUMN propiedades.id_original IS
'Unique identifier from external source (e.g., Google Sheets). Required and unique. Used for synchronization and tracking property origin.';