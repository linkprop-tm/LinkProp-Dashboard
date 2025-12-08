/*
  # Agregar Columnas de Preferencias de Departamento

  1. Nuevas Columnas
    - `preferencias_piso_minimo` (text, nullable)
      - Valores posibles: 'Indiferente', '1', '2', '3', '4', '5+'
      - Piso mínimo deseado por el usuario para departamentos
    
    - `preferencias_avenida` (boolean, nullable)
      - true: El usuario PREFIERE propiedades en avenidas
      - false: El usuario NO prefiere propiedades en avenidas
      - null: Indiferente
    
    - `preferencias_orientacion` (preferencias_orientacion_enum, nullable)
      - Valores: 'Frente', 'Contrafrente'
      - null: Indiferente
      - Orientación preferida del departamento

  2. ENUMs Creados
    - `preferencias_orientacion_enum`: Define las opciones de orientación para departamentos

  3. Notas
    - Todas las columnas son opcionales (nullable)
    - Estas preferencias solo aplican cuando el usuario busca departamentos
    - Si el usuario no selecciona departamento como tipo de propiedad, estos campos permanecen como null
    - Diseñadas para complementar las preferencias existentes y mejorar el matching de propiedades
*/

-- Create ENUM for orientación preferences
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'preferencias_orientacion_enum') THEN
    CREATE TYPE preferencias_orientacion_enum AS ENUM ('Frente', 'Contrafrente');
  END IF;
END $$;

-- Add preferencias_piso_minimo column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'usuarios' AND column_name = 'preferencias_piso_minimo'
  ) THEN
    ALTER TABLE usuarios ADD COLUMN preferencias_piso_minimo text;
    COMMENT ON COLUMN usuarios.preferencias_piso_minimo IS 'Minimum floor preference for apartments. Possible values: Indiferente, 1, 2, 3, 4, 5+. NULL when not specified.';
  END IF;
END $$;

-- Add preferencias_avenida column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'usuarios' AND column_name = 'preferencias_avenida'
  ) THEN
    ALTER TABLE usuarios ADD COLUMN preferencias_avenida boolean;
    COMMENT ON COLUMN usuarios.preferencias_avenida IS 'Avenue preference: true = prefers avenues, false = does not prefer avenues, NULL = indifferent';
  END IF;
END $$;

-- Add preferencias_orientacion column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'usuarios' AND column_name = 'preferencias_orientacion'
  ) THEN
    ALTER TABLE usuarios ADD COLUMN preferencias_orientacion preferencias_orientacion_enum;
    COMMENT ON COLUMN usuarios.preferencias_orientacion IS 'Orientation preference for apartments: Frente (front-facing) or Contrafrente (back-facing). NULL when indifferent.';
  END IF;
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_usuarios_piso_minimo ON usuarios(preferencias_piso_minimo) WHERE preferencias_piso_minimo IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_usuarios_avenida ON usuarios(preferencias_avenida) WHERE preferencias_avenida IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_usuarios_orientacion ON usuarios(preferencias_orientacion) WHERE preferencias_orientacion IS NOT NULL;
