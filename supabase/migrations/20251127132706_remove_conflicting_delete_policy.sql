/*
  # Eliminar Política DELETE Conflictiva

  ## Problema
  La política "usuarios_no_delete" (USING false) bloquea TODAS las eliminaciones,
  incluso para admins. Esto entra en conflicto con "usuarios_delete_simple" 
  que permite a admins eliminar usuarios.

  ## Solución
  Eliminar la política "usuarios_no_delete" y dejar solo "usuarios_delete_simple"
  que correctamente permite eliminaciones solo a admins.

  ## Seguridad
  - Solo usuarios con rol='admin' pueden eliminar registros de usuarios
  - Usuarios normales no pueden eliminar ningún registro
  - Esto es lo esperado y correcto
*/

-- Eliminar política que bloquea todas las eliminaciones
DROP POLICY IF EXISTS "usuarios_no_delete" ON usuarios;
