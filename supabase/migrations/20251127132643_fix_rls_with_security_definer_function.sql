/*
  # Solución Definitiva: Eliminar Recursión en Políticas RLS

  ## Problema
  Las políticas RLS con subqueries que consultan la misma tabla 'usuarios' causan
  recursión infinita. PostgreSQL detecta esto y falla con:
  "ERROR: infinite recursion detected in policy for relation usuarios"

  ## Solución
  Crear una función con SECURITY DEFINER que bypasea RLS para verificar si un 
  usuario es admin, y usarla en las políticas sin causar recursión.

  ## Cambios
  1. Crear función is_admin() que verifica el rol sin activar RLS
  2. Reemplazar política SELECT que causaba recursión
  3. Simplificar políticas UPDATE y DELETE para usar la misma función

  ## Seguridad
  - La función is_admin() usa SECURITY DEFINER pero solo lee, no modifica datos
  - Solo verifica el rol del usuario autenticado actual
  - No expone datos de otros usuarios
*/

-- Crear función que verifica si el usuario actual es admin
-- SECURITY DEFINER permite que la función bypasee RLS
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM usuarios
    WHERE auth_id = auth.uid() AND rol = 'admin'
  );
END;
$$;

-- Eliminar política anterior que causaba recursión
DROP POLICY IF EXISTS "usuarios_select_unified" ON usuarios;

-- Crear nueva política SELECT sin recursión usando la función
CREATE POLICY "usuarios_select_simple"
  ON usuarios
  FOR SELECT
  TO authenticated
  USING (
    -- Puede ver su propio registro
    auth.uid() = auth_id
    OR
    -- O es admin (verificado con función que bypasea RLS)
    is_admin()
  );

-- Actualizar política UPDATE para usar la función
DROP POLICY IF EXISTS "Admins can update all users from usuarios table" ON usuarios;

CREATE POLICY "usuarios_update_simple"
  ON usuarios
  FOR UPDATE
  TO authenticated
  USING (
    -- Puede actualizar su propio registro O es admin
    auth.uid() = auth_id OR is_admin()
  )
  WITH CHECK (
    -- Para admin: puede actualizar cualquier registro
    -- Para usuario normal: solo su propio registro y no puede cambiar su rol
    (is_admin()) OR
    (auth.uid() = auth_id AND rol = (SELECT rol FROM usuarios WHERE auth_id = auth.uid()))
  );

-- Actualizar política DELETE para usar la función
DROP POLICY IF EXISTS "Admins can delete users from usuarios table" ON usuarios;

CREATE POLICY "usuarios_delete_simple"
  ON usuarios
  FOR DELETE
  TO authenticated
  USING (
    -- Solo admins pueden eliminar usuarios
    is_admin()
  );

-- Nota: usuarios_update_own sigue existiendo pero será overridden por la nueva política
-- Si hay conflicto, podemos eliminarla
DROP POLICY IF EXISTS "usuarios_update_own" ON usuarios;
