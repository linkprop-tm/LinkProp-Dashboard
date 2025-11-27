/*
  # Agregar columna de amenities a propiedades

  ## Descripción
  Agrega soporte para almacenar amenities/comodidades de las propiedades
  como un array de texto (PostgreSQL text[]).

  ## Cambios
  1. Nueva Columna
    - `amenities` (text[]) - Array de comodidades y amenities
    - Valor por defecto: array vacío '{}'
    - Permite NULL para compatibilidad con datos existentes

  2. Índice
    - Crea índice GIN para búsquedas eficientes en arrays
    - Permite búsquedas rápidas por amenities específicos

  ## Amenities Soportados
  Los amenities comunes incluyen:
  - Pileta
  - SUM (Salón de Usos Múltiples)
  - Parrilla
  - Gimnasio
  - Lavadero
  - Balcón Terraza

  ## Seguridad
  - No se modifican las políticas RLS existentes
  - Los nuevos datos heredan las mismas políticas de acceso
  - El campo es accesible según los permisos de la tabla propiedades

  ## Notas
  - Compatible con propiedades existentes (default a array vacío)
  - El índice GIN optimiza queries del tipo: WHERE 'Pileta' = ANY(amenities)
  - Los amenities pueden agregarse/eliminarse dinámicamente desde la UI
*/

-- Agregar columna amenities como array de texto
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'propiedades' AND column_name = 'amenities'
  ) THEN
    ALTER TABLE propiedades ADD COLUMN amenities text[] DEFAULT '{}';
  END IF;
END $$;

-- Crear índice GIN para búsquedas eficientes en arrays
-- GIN (Generalized Inverted Index) es ideal para búsquedas en arrays
CREATE INDEX IF NOT EXISTS idx_propiedades_amenities
ON propiedades USING GIN (amenities);

-- Agregar comentario a la columna para documentación
COMMENT ON COLUMN propiedades.amenities IS
'Array de comodidades y amenities de la propiedad. Valores comunes: Pileta, SUM, Parrilla, Gimnasio, Lavadero, Balcón Terraza';