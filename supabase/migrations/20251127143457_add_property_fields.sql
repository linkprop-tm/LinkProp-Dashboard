/*
  # Agregar campos faltantes a la tabla propiedades

  ## Descripción
  Esta migración agrega todos los campos faltantes necesarios para completar 
  la información de propiedades según los requerimientos del sistema.

  ## Campos Nuevos

  ### Dimensiones
  - `m2_totales` (decimal) - Metros cuadrados totales del inmueble
  - `m2_cubiertos` (decimal) - Metros cuadrados cubiertos
  - `ambientes` (integer) - Cantidad de ambientes

  ### Características de la Propiedad
  - `antiguedad` (text) - Antigüedad del inmueble (ej: "A estrenar", "5 años")
  - `orientacion` (text) - Orientación (Norte, Sur, Este, Oeste, etc)
  - `expensas` (decimal) - Valor de expensas mensuales

  ### Aptitudes y Características Booleanas
  - `apto_credito` (boolean) - Si es apto para crédito hipotecario
  - `apto_profesional` (boolean) - Si es apto para uso profesional
  - `cochera` (boolean) - Si incluye cochera/garaje

  ### Ubicación Detallada
  - `direccion` (text) - Dirección completa de la propiedad
  - `barrio` (text) - Barrio donde se ubica
  - `provincia` (text) - Provincia

  ### Visibilidad y Origen
  - `visibilidad` (text) - Pública o Privada
  - `url_original` (text) - URL de origen si fue scrapeada
  - `portal_original` (text) - Portal de origen (ej: Mercado Libre, Zonaprop)

  ## Modificaciones

  ### Actualización del campo tipo
  - Se expande el CHECK constraint para incluir: PH, Local, Oficina, Galpon
  
  ### Renombrado conceptual
  - `superficie` se mantiene como `m2_totales` conceptualmente
  - `ubicacion` se mantiene pero se agregan campos más específicos

  ## Seguridad
  - No se modifican las políticas RLS existentes
  - Los nuevos campos heredan las mismas políticas de acceso

  ## Notas Importantes
  - Todos los campos nuevos permiten NULL para compatibilidad con datos existentes
  - Se establecen valores DEFAULT apropiados donde tiene sentido
  - Los campos booleanos tienen DEFAULT false
*/

-- Agregar campos de dimensiones
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'propiedades' AND column_name = 'm2_totales'
  ) THEN
    ALTER TABLE propiedades ADD COLUMN m2_totales decimal CHECK (m2_totales >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'propiedades' AND column_name = 'm2_cubiertos'
  ) THEN
    ALTER TABLE propiedades ADD COLUMN m2_cubiertos decimal CHECK (m2_cubiertos >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'propiedades' AND column_name = 'ambientes'
  ) THEN
    ALTER TABLE propiedades ADD COLUMN ambientes integer DEFAULT 0 CHECK (ambientes >= 0);
  END IF;
END $$;

-- Agregar características de la propiedad
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'propiedades' AND column_name = 'antiguedad'
  ) THEN
    ALTER TABLE propiedades ADD COLUMN antiguedad text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'propiedades' AND column_name = 'orientacion'
  ) THEN
    ALTER TABLE propiedades ADD COLUMN orientacion text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'propiedades' AND column_name = 'expensas'
  ) THEN
    ALTER TABLE propiedades ADD COLUMN expensas decimal DEFAULT 0 CHECK (expensas >= 0);
  END IF;
END $$;

-- Agregar aptitudes y características booleanas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'propiedades' AND column_name = 'apto_credito'
  ) THEN
    ALTER TABLE propiedades ADD COLUMN apto_credito boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'propiedades' AND column_name = 'apto_profesional'
  ) THEN
    ALTER TABLE propiedades ADD COLUMN apto_profesional boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'propiedades' AND column_name = 'cochera'
  ) THEN
    ALTER TABLE propiedades ADD COLUMN cochera boolean DEFAULT false;
  END IF;
END $$;

-- Agregar ubicación detallada
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'propiedades' AND column_name = 'direccion'
  ) THEN
    ALTER TABLE propiedades ADD COLUMN direccion text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'propiedades' AND column_name = 'barrio'
  ) THEN
    ALTER TABLE propiedades ADD COLUMN barrio text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'propiedades' AND column_name = 'provincia'
  ) THEN
    ALTER TABLE propiedades ADD COLUMN provincia text DEFAULT '';
  END IF;
END $$;

-- Agregar visibilidad y origen
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'propiedades' AND column_name = 'visibilidad'
  ) THEN
    ALTER TABLE propiedades ADD COLUMN visibilidad text DEFAULT 'Publica' CHECK (visibilidad IN ('Publica', 'Privada'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'propiedades' AND column_name = 'url_original'
  ) THEN
    ALTER TABLE propiedades ADD COLUMN url_original text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'propiedades' AND column_name = 'portal_original'
  ) THEN
    ALTER TABLE propiedades ADD COLUMN portal_original text DEFAULT '';
  END IF;
END $$;

-- Actualizar el constraint del tipo de propiedad para incluir más opciones
DO $$
BEGIN
  -- Eliminar el constraint existente si existe
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'propiedades_tipo_check' 
    AND table_name = 'propiedades'
  ) THEN
    ALTER TABLE propiedades DROP CONSTRAINT propiedades_tipo_check;
  END IF;

  -- Agregar el nuevo constraint con más opciones
  ALTER TABLE propiedades ADD CONSTRAINT propiedades_tipo_check 
    CHECK (tipo IN ('Casa', 'Departamento', 'Terreno', 'Comercial', 'PH', 'Local', 'Oficina', 'Galpon'));
END $$;

-- Copiar datos de superficie a m2_totales si existen
UPDATE propiedades 
SET m2_totales = superficie 
WHERE m2_totales IS NULL AND superficie IS NOT NULL AND superficie > 0;

-- Copiar datos de ubicacion a direccion si existen
UPDATE propiedades 
SET direccion = ubicacion 
WHERE direccion = '' AND ubicacion IS NOT NULL AND ubicacion != '';

-- Crear índices para los nuevos campos que se consultarán frecuentemente
CREATE INDEX IF NOT EXISTS idx_propiedades_barrio ON propiedades(barrio);
CREATE INDEX IF NOT EXISTS idx_propiedades_provincia ON propiedades(provincia);
CREATE INDEX IF NOT EXISTS idx_propiedades_visibilidad ON propiedades(visibilidad);
CREATE INDEX IF NOT EXISTS idx_propiedades_apto_credito ON propiedades(apto_credito);
CREATE INDEX IF NOT EXISTS idx_propiedades_cochera ON propiedades(cochera);