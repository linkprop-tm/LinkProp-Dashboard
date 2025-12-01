/*
  # Add Geolocation Fields to Properties Table

  1. Changes
    - Add `latitud` column (numeric, nullable) to store property latitude
    - Add `longitud` column (numeric, nullable) to store property longitude
    - Add index on (latitud, longitud) for efficient geographic queries
  
  2. Purpose
    - Enable map visualization of properties
    - Support geographic filtering by drawn areas
    - Allow point-in-polygon calculations for area-based searches
  
  3. Notes
    - Coordinates are nullable to allow properties without geocoding
    - Properties without coordinates will not appear on map view
    - Coordinates will be populated via geocoding service or manual entry
    - Valid range for Argentina: latitud (-55 to -21), longitud (-73 to -53)
*/

-- Add geolocation columns to propiedades table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'propiedades' AND column_name = 'latitud'
  ) THEN
    ALTER TABLE propiedades ADD COLUMN latitud numeric(10, 7);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'propiedades' AND column_name = 'longitud'
  ) THEN
    ALTER TABLE propiedades ADD COLUMN longitud numeric(10, 7);
  END IF;
END $$;

-- Add index for efficient geographic queries
CREATE INDEX IF NOT EXISTS idx_propiedades_coordinates 
  ON propiedades(latitud, longitud) 
  WHERE latitud IS NOT NULL AND longitud IS NOT NULL;

-- Add check constraints to ensure valid coordinates for Argentina
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_name = 'propiedades' AND constraint_name = 'valid_latitud'
  ) THEN
    ALTER TABLE propiedades ADD CONSTRAINT valid_latitud 
      CHECK (latitud IS NULL OR (latitud >= -55 AND latitud <= -21));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_name = 'propiedades' AND constraint_name = 'valid_longitud'
  ) THEN
    ALTER TABLE propiedades ADD CONSTRAINT valid_longitud 
      CHECK (longitud IS NULL OR (longitud >= -73 AND longitud <= -53));
  END IF;
END $$;