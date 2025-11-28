/*
  # Update usuarios table preferences structure

  1. Changes
    - Remove `preferencias_dormitorios_min` column (not needed)
    - Remove `preferencias_banos_min` column (not needed)
    - Remove `avatar_url` column (duplicate of foto_perfil_url)
    - Add `preferencias_amenities` column (text array for apartment amenities)
    - Add `preferencias_m2_min` column (numeric for minimum square meters)
    - Add `preferencias_ambientes` column (text for number of rooms/environments)
    - Add `preferencias_apto_credito` column (boolean for credit eligibility)
    - Add `preferencias_apto_profesional` column (boolean for professional use)
    - Add `preferencias_cochera` column (boolean for garage availability)
    - Add `preferencias_apto_mascotas` column (boolean for pets, used when operation is rental)

  2. Notes
    - All new boolean columns default to false for data consistency
    - preferencias_amenities is conditional (only when property type is departamento)
    - preferencias_apto_mascotas is conditional (only when operation type is alquiler)
    - Data migration is safe as we're dropping unused columns and adding new optional ones
*/

-- Remove unnecessary columns
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'usuarios' AND column_name = 'preferencias_dormitorios_min'
  ) THEN
    ALTER TABLE usuarios DROP COLUMN preferencias_dormitorios_min;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'usuarios' AND column_name = 'preferencias_banos_min'
  ) THEN
    ALTER TABLE usuarios DROP COLUMN preferencias_banos_min;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'usuarios' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE usuarios DROP COLUMN avatar_url;
  END IF;
END $$;

-- Add new preference columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'usuarios' AND column_name = 'preferencias_amenities'
  ) THEN
    ALTER TABLE usuarios ADD COLUMN preferencias_amenities text[] DEFAULT '{}';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'usuarios' AND column_name = 'preferencias_m2_min'
  ) THEN
    ALTER TABLE usuarios ADD COLUMN preferencias_m2_min numeric;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'usuarios' AND column_name = 'preferencias_ambientes'
  ) THEN
    ALTER TABLE usuarios ADD COLUMN preferencias_ambientes text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'usuarios' AND column_name = 'preferencias_apto_credito'
  ) THEN
    ALTER TABLE usuarios ADD COLUMN preferencias_apto_credito boolean DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'usuarios' AND column_name = 'preferencias_apto_profesional'
  ) THEN
    ALTER TABLE usuarios ADD COLUMN preferencias_apto_profesional boolean DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'usuarios' AND column_name = 'preferencias_cochera'
  ) THEN
    ALTER TABLE usuarios ADD COLUMN preferencias_cochera boolean DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'usuarios' AND column_name = 'preferencias_apto_mascotas'
  ) THEN
    ALTER TABLE usuarios ADD COLUMN preferencias_apto_mascotas boolean DEFAULT false;
  END IF;
END $$;