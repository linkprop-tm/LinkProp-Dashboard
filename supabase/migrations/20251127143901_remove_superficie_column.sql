/*
  # Eliminar columna superficie de la tabla propiedades

  ## Descripción
  Elimina la columna `superficie` ya que ha sido reemplazada por los campos
  más específicos `m2_totales` y `m2_cubiertos`.

  ## Cambios
  - Elimina la columna `superficie` de la tabla `propiedades`

  ## Notas
  - Los datos ya fueron migrados a `m2_totales` en la migración anterior
  - Esta operación es segura ya que los datos están preservados en el nuevo campo
*/

-- Eliminar la columna superficie
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'propiedades' AND column_name = 'superficie'
  ) THEN
    ALTER TABLE propiedades DROP COLUMN superficie;
  END IF;
END $$;