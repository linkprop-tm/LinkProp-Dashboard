/*
  # Establecer valor predeterminado para preferencias_antiguedad

  1. Cambios
    - Agregar valor predeterminado `ARRAY['Indiferente']` a la columna `preferencias_antiguedad`
    - Esto asegura que todos los nuevos usuarios tengan automáticamente "Indiferente" como antigüedad preferida

  2. Notas
    - El valor se establece automáticamente al crear un nuevo usuario
    - Los usuarios existentes no se ven afectados por este cambio
*/

DO $$ 
BEGIN
  -- Establecer valor predeterminado para preferencias_antiguedad
  ALTER TABLE usuarios 
  ALTER COLUMN preferencias_antiguedad 
  SET DEFAULT ARRAY['Indiferente']::text[];
END $$;
