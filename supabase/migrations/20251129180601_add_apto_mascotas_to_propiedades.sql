/*
  # Add apto_mascotas column to propiedades table

  ## Description
  This migration adds the `apto_mascotas` (pet-friendly) field to the propiedades table.
  This field is relevant for rental properties to indicate whether pets are allowed.

  ## New Columns
  - `apto_mascotas` (boolean) - Whether the property allows pets (mainly for rentals)
    - Default: false
    - Used as a mandatory filter when users search for rentals and require pet-friendly properties

  ## Security
  - No changes to RLS policies needed
  - New field inherits existing access policies

  ## Indexes
  - Creates index on apto_mascotas for efficient filtering during matching algorithm
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'propiedades' AND column_name = 'apto_mascotas'
  ) THEN
    ALTER TABLE propiedades ADD COLUMN apto_mascotas boolean DEFAULT false;
  END IF;
END $$;

-- Create index for efficient filtering
CREATE INDEX IF NOT EXISTS idx_propiedades_apto_mascotas ON propiedades(apto_mascotas);
