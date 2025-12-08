/*
  # Agregar Columna de Metros Cuadrados Máximos
  
  1. Nueva Columna
    - `preferencias_m2_max` (numeric, nullable)
      - Metros cuadrados máximos deseados por el usuario
      - Complementa el campo preferencias_m2_min existente
      - NULL indica que no hay límite máximo
  
  2. Notas
    - Esta columna permite al usuario establecer un rango completo de superficie
    - Junto con preferencias_m2_min, forma el rango: [m2_min, m2_max]
    - Si m2_max es NULL, se interpreta como "sin límite superior"
*/

-- Add preferencias_m2_max column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'usuarios' AND column_name = 'preferencias_m2_max'
  ) THEN
    ALTER TABLE usuarios ADD COLUMN preferencias_m2_max numeric;
    COMMENT ON COLUMN usuarios.preferencias_m2_max IS 'Maximum square meters preference. NULL indicates no upper limit.';
  END IF;
END $$;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_usuarios_m2_max ON usuarios(preferencias_m2_max) WHERE preferencias_m2_max IS NOT NULL;