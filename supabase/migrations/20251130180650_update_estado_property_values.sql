/*
  # Update estado column values for propiedades table

  ## Description
  Updates the valid values for the estado column in propiedades table.
  Replaces 'Vendida' with 'No disponible' to better reflect property availability.

  ## Changes
  1. New Valid Values
    - Disponible (Available)
    - Reservada (Reserved)
    - No disponible (Not available - replaces "Vendida")

  ## Migration Steps
  1. Remove existing CHECK constraint on estado column
  2. Add new CHECK constraint with updated values
  3. Update any existing 'Vendida' records to 'No disponible' (if any exist)

  ## Security
  - No changes to RLS policies needed
  - Existing access policies remain unchanged

  ## Notes
  - All existing 'Disponible' and 'Reservada' records remain unchanged
  - Any 'Vendida' records will be converted to 'No disponible'
  - Default value remains 'Disponible'
*/

-- Remove existing CHECK constraint on estado if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'propiedades_estado_check' 
    AND table_name = 'propiedades'
  ) THEN
    ALTER TABLE propiedades DROP CONSTRAINT propiedades_estado_check;
  END IF;
END $$;

-- Update any existing 'Vendida' records to 'No disponible'
UPDATE propiedades 
SET estado = 'No disponible' 
WHERE estado = 'Vendida';

-- Add new CHECK constraint with updated values
ALTER TABLE propiedades ADD CONSTRAINT propiedades_estado_check 
  CHECK (estado IN ('Disponible', 'Reservada', 'No disponible'));