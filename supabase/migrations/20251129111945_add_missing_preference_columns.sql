/*
  # Agregar columnas de preferencias faltantes

  1. Cambios
    - Agregar `preferencias_dormitorios_min` (número entero) para mínimo de dormitorios
    - Agregar `preferencias_banos_min` (número entero) para mínimo de baños
    - Agregar `preferencias_m2_max` (número decimal) para máximo de metros cuadrados
    - Agregar `preferencias_antiguedad` (array de texto) para opciones de antigüedad

  2. Notas
    - Todas las columnas son opcionales (nullable)
    - Estas columnas complementan las preferencias existentes para alinearse con la interfaz de usuario
*/

DO $$ 
BEGIN
  -- Agregar preferencias_dormitorios_min si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'usuarios' AND column_name = 'preferencias_dormitorios_min'
  ) THEN
    ALTER TABLE usuarios ADD COLUMN preferencias_dormitorios_min integer;
  END IF;

  -- Agregar preferencias_banos_min si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'usuarios' AND column_name = 'preferencias_banos_min'
  ) THEN
    ALTER TABLE usuarios ADD COLUMN preferencias_banos_min integer;
  END IF;

  -- Agregar preferencias_m2_max si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'usuarios' AND column_name = 'preferencias_m2_max'
  ) THEN
    ALTER TABLE usuarios ADD COLUMN preferencias_m2_max numeric;
  END IF;

  -- Agregar preferencias_antiguedad si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'usuarios' AND column_name = 'preferencias_antiguedad'
  ) THEN
    ALTER TABLE usuarios ADD COLUMN preferencias_antiguedad text[];
  END IF;
END $$;
