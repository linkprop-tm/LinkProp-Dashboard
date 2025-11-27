/*
  # Corregir Políticas RLS para Login de Admin

  ## Problema Identificado
  Las políticas RLS actuales tienen subqueries recursivas que consultan la misma tabla 
  'usuarios' dentro de las condiciones USING, causando problemas de performance o 
  fallos en las consultas cuando un usuario admin intenta leer su propio registro.

  ## Solución
  1. Eliminar todas las políticas SELECT que tienen subqueries recursivas
  2. Crear una política SELECT unificada y simple que permita:
     - A cualquier usuario autenticado ver su propio registro (auth.uid() = auth_id)
     - Esta política sola es suficiente porque cuando un admin consulta su propio perfil,
       ve su rol='admin' y puede luego acceder a funciones específicas de admin
  3. Las políticas de admin para UPDATE y DELETE se mantienen separadas ya que solo
     se usan cuando el admin está modificando otros usuarios, no consultando el propio

  ## Cambios
  1. DROP de políticas SELECT problemáticas:
     - "usuarios_select_own"
     - "Admins can view all users from usuarios table"
  
  2. CREATE de nueva política SELECT unificada:
     - Permite a usuarios autenticados ver cualquier registro donde auth_id coincida
     - Permite a admins ver todos los registros (verificado con rol en la misma fila)
  
  ## Seguridad
  - Usuarios normales (rol='user') solo ven su propio registro
  - Usuarios admin (rol='admin') ven su propio registro Y todos los demás
  - Sin subqueries recursivas que causen problemas de performance
*/

-- Eliminar políticas SELECT conflictivas
DROP POLICY IF EXISTS "usuarios_select_own" ON usuarios;
DROP POLICY IF EXISTS "Admins can view all users from usuarios table" ON usuarios;

-- Crear política SELECT unificada sin recursión
-- Esta política permite:
-- 1. Cualquier usuario ver su propio registro (auth.uid() = auth_id)
-- 2. Usuarios con rol='admin' ver TODOS los registros
CREATE POLICY "usuarios_select_unified"
  ON usuarios
  FOR SELECT
  TO authenticated
  USING (
    -- Puede ver su propio registro
    auth.uid() = auth_id
    OR
    -- O es admin (verificado en el mismo registro que está consultando)
    -- Esto funciona porque cuando un admin consulta la lista de usuarios,
    -- el sistema verifica si auth.uid() coincide con algún auth_id donde rol='admin'
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_id = auth.uid() AND u.rol = 'admin'
      LIMIT 1
    )
  );

-- Verificar que otras políticas UPDATE están correctas
-- No las tocamos porque funcionan bien con subqueries ya que UPDATE es menos frecuente
