/*
  # Add ID_original column to propiedades table

  ## Description
  Adds a new column `id_original` to the propiedades table to store the original ID
  from external sources like Google Sheets. This enables tracking the source of
  imported properties and facilitates synchronization.

  ## New Column
  - `id_original` (text) - Original ID from external source (e.g., Google Sheets row ID)
    - Allows NULL for manually created properties
    - No unique constraint to allow flexibility with external sources
    - Default: empty string

  ## Security
  - No changes to RLS policies needed
  - New field inherits existing access policies from propiedades table

  ## Index
  - Creates index on id_original for efficient lookups during sync operations
*/

-- Add id_original column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'propiedades' AND column_name = 'id_original'
  ) THEN
    ALTER TABLE propiedades ADD COLUMN id_original text DEFAULT '';
  END IF;
END $$;

-- Create index for efficient lookups during synchronization
CREATE INDEX IF NOT EXISTS idx_propiedades_id_original ON propiedades(id_original);

-- Add comment to the column for documentation
COMMENT ON COLUMN propiedades.id_original IS
'Original ID from external source (e.g., Google Sheets). Used for synchronization and tracking property origin.';