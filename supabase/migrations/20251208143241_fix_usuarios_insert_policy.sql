/*
  # Agregar Política INSERT Faltante para Usuarios

  ## Problema Identificado
  La tabla 'usuarios' no tiene ninguna política INSERT activa, lo que impide que
  los usuarios se registren correctamente. La política "usuarios_insert_own" fue
  eliminada en una migración anterior pero nunca fue recreada.

  ## Solución
  Crear una política INSERT simple que permita a usuarios autenticados crear su
  propio registro durante el signup.

  ## Cambios
  1. Crear política INSERT que:
     - Permite a usuarios autenticados insertar su propio registro
     - Verifica que auth.uid() coincida con auth_id
     - Se aplica solo durante el proceso de registro

  ## Seguridad
  - Solo usuarios autenticados pueden insertar
  - Solo pueden insertar su propio registro (auth.uid() = auth_id)
  - No permite insertar registros de otros usuarios
*/

-- Eliminar cualquier política INSERT anterior si existe
DROP POLICY IF EXISTS "usuarios_insert_own" ON usuarios;

-- Crear política INSERT para permitir registro de usuarios
CREATE POLICY "usuarios_insert_own"
  ON usuarios
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = auth_id);
