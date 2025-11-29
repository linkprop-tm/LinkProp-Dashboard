/*
  # Convert etapa column to ENUM type

  1. Changes
    - Create a new ENUM type `etapa_tipo` with values: 'Explorar', 'Interes', 'Visitada'
    - Convert the `etapa` column in `propiedades_usuarios` table from text to the new ENUM type
    - Add a NOT NULL constraint with a default value of 'Explorar'

  2. Data Safety
    - Uses IF NOT EXISTS to prevent errors if ENUM already exists
    - Drops any existing default before conversion
    - Converts existing data using CAST to ensure compatibility
    - All existing values ('Explorar', 'Interes', 'Visitada') will be preserved
*/

-- Create the ENUM type if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'etapa_tipo') THEN
    CREATE TYPE etapa_tipo AS ENUM ('Explorar', 'Interes', 'Visitada');
  END IF;
END $$;

-- Drop existing default if any
ALTER TABLE propiedades_usuarios 
  ALTER COLUMN etapa DROP DEFAULT;

-- Convert the column to use the ENUM type
ALTER TABLE propiedades_usuarios 
  ALTER COLUMN etapa TYPE etapa_tipo 
  USING etapa::etapa_tipo;

-- Set new default value and NOT NULL constraint
ALTER TABLE propiedades_usuarios 
  ALTER COLUMN etapa SET DEFAULT 'Explorar'::etapa_tipo;

ALTER TABLE propiedades_usuarios 
  ALTER COLUMN etapa SET NOT NULL;
