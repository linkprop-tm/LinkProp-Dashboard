/*
  # Add Geographic Zone Preferences to Users

  1. Changes
    - Add `preferencias_zona_geografica` column (JSONB, nullable) to store user's drawn geographic zone
    - This column will store polygons in GeoJSON format drawn by users on the map

  2. Purpose
    - Replace traditional neighborhood selection with visual map-based zone drawing
    - Allow users to define their preferred areas by drawing directly on a map
    - Store precise geographic boundaries instead of predefined neighborhood names

  3. Notes
    - Column is nullable to maintain compatibility with existing users who have neighborhood preferences
    - New users can choose to use either neighborhoods or draw a zone (or both)
    - GeoJSON format allows for flexible polygon shapes
    - The field will be updated when users draw or modify their zone in the registration or edit profile flow
*/

-- Add geographic zone preferences column to usuarios table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'usuarios' AND column_name = 'preferencias_zona_geografica'
  ) THEN
    ALTER TABLE usuarios ADD COLUMN preferencias_zona_geografica JSONB;
  END IF;
END $$;

-- Add comment to document the field
COMMENT ON COLUMN usuarios.preferencias_zona_geografica IS 'User preferred geographic zone stored as GeoJSON polygon. Drawn by users on map interface instead of selecting predefined neighborhoods.';
