/*
  # Eliminar columna telefono de usuarios

  1. Cambios
    - Elimina la columna `telefono` de la tabla `usuarios`

  2. Notas Importantes
    - Esta operación es irreversible y eliminará permanentemente todos los datos de teléfono existentes
    - Se recomienda hacer un backup de los datos si es necesario conservarlos antes de aplicar esta migración
    - El campo teléfono ha sido eliminado del frontend y la lógica de la aplicación

  3. Impacto
    - La aplicación ya no solicitará ni almacenará números de teléfono de usuarios
    - Registro de usuarios más simple y con menos datos personales sensibles
*/

-- Eliminar columna telefono de la tabla usuarios
ALTER TABLE usuarios DROP COLUMN IF EXISTS telefono;
