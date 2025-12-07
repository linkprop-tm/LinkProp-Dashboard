/*
  # Agregar columnas faltantes para sincronización con Google Sheets

  1. Nuevas Columnas
    - `piso` (integer) - Número de piso del inmueble (null para PB o cuando no aplica)
    - `avenida` (boolean) - Indica si la propiedad está ubicada en una avenida principal
    - `disposicion` (text) - Disposición del inmueble: Frente, Contrafrente, Lateral, Interno
    - `confiabilidad` (text) - Nivel de confianza de los datos: Alta, Media
    - `fecha_scraping` (timestamptz) - Fecha y hora en que se scrapeó la propiedad

  2. Propósito
    - Mantener paridad completa con las columnas del Google Sheets
    - Permitir sincronización completa de datos sin pérdida de información
    - Facilitar el tracking de origen y calidad de datos importados

  3. Notas
    - Todos los campos son opcionales (nullable) para compatibilidad con datos existentes
    - Se establecen valores DEFAULT apropiados donde tiene sentido
    - disposicion se valida con un CHECK constraint
    - confiabilidad solo permite "Alta" o "Media"
*/

-- Agregar columna piso
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'propiedades' AND column_name = 'piso'
  ) THEN
    ALTER TABLE propiedades ADD COLUMN piso integer CHECK (piso >= 0);
  END IF;
END $$;

-- Agregar columna avenida
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'propiedades' AND column_name = 'avenida'
  ) THEN
    ALTER TABLE propiedades ADD COLUMN avenida boolean DEFAULT false;
  END IF;
END $$;

-- Agregar columna disposicion
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'propiedades' AND column_name = 'disposicion'
  ) THEN
    ALTER TABLE propiedades ADD COLUMN disposicion text DEFAULT '';
  END IF;
END $$;

-- Agregar constraint para disposicion si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_name = 'propiedades' AND constraint_name = 'valid_disposicion'
  ) THEN
    ALTER TABLE propiedades ADD CONSTRAINT valid_disposicion
      CHECK (disposicion = '' OR disposicion IN ('Frente', 'Contrafrente', 'Lateral', 'Interno'));
  END IF;
END $$;

-- Agregar columna confiabilidad
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'propiedades' AND column_name = 'confiabilidad'
  ) THEN
    ALTER TABLE propiedades ADD COLUMN confiabilidad text DEFAULT '';
  END IF;
END $$;

-- Agregar constraint para confiabilidad si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_name = 'propiedades' AND constraint_name = 'valid_confiabilidad'
  ) THEN
    ALTER TABLE propiedades ADD CONSTRAINT valid_confiabilidad
      CHECK (confiabilidad = '' OR confiabilidad IN ('Alta', 'Media'));
  END IF;
END $$;

-- Agregar columna fecha_scraping
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'propiedades' AND column_name = 'fecha_scraping'
  ) THEN
    ALTER TABLE propiedades ADD COLUMN fecha_scraping timestamptz;
  END IF;
END $$;

-- Crear índices para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_propiedades_piso ON propiedades(piso) WHERE piso IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_propiedades_avenida ON propiedades(avenida) WHERE avenida = true;
CREATE INDEX IF NOT EXISTS idx_propiedades_disposicion ON propiedades(disposicion) WHERE disposicion != '';
CREATE INDEX IF NOT EXISTS idx_propiedades_confiabilidad ON propiedades(confiabilidad) WHERE confiabilidad != '';
CREATE INDEX IF NOT EXISTS idx_propiedades_fecha_scraping ON propiedades(fecha_scraping) WHERE fecha_scraping IS NOT NULL;

-- Agregar comentarios a las columnas para documentación
COMMENT ON COLUMN propiedades.piso IS 'Número de piso del inmueble. NULL para planta baja o cuando no aplica';
COMMENT ON COLUMN propiedades.avenida IS 'Indica si la propiedad está ubicada en una avenida principal';
COMMENT ON COLUMN propiedades.disposicion IS 'Disposición del inmueble: Frente, Contrafrente, Lateral, Interno';
COMMENT ON COLUMN propiedades.confiabilidad IS 'Nivel de confianza de los datos importados: Alta, Media';
COMMENT ON COLUMN propiedades.fecha_scraping IS 'Fecha y hora en que se scrapeó la propiedad desde el portal original';
