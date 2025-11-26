/*
  # Configuración Limpia de Autenticación v2

  1. Elimina todas las políticas RLS antiguas de usuarios
  2. Agrega columna auth_id si no existe
  3. Actualiza el constraint de rol para admin/user
  4. Crea políticas RLS simplificadas sin recursión
*/

-- ============================================================================
-- PASO 1: ELIMINAR TODAS LAS POLÍTICAS ANTIGUAS
-- ============================================================================

DROP POLICY IF EXISTS "Users can view all users" ON usuarios;
DROP POLICY IF EXISTS "Users can insert their own data" ON usuarios;
DROP POLICY IF EXISTS "Users can update their own data" ON usuarios;
DROP POLICY IF EXISTS "Users can delete their own data" ON usuarios;
DROP POLICY IF EXISTS "usuarios_select_own" ON usuarios;
DROP POLICY IF EXISTS "usuarios_insert_own" ON usuarios;
DROP POLICY IF EXISTS "usuarios_update_own" ON usuarios;
DROP POLICY IF EXISTS "usuarios_no_delete" ON usuarios;

-- ============================================================================
-- PASO 2: AGREGAR COLUMNA AUTH_ID SI NO EXISTE
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'usuarios' AND column_name = 'auth_id'
  ) THEN
    ALTER TABLE usuarios ADD COLUMN auth_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Crear índice solo si no existe
CREATE INDEX IF NOT EXISTS idx_usuarios_auth_id ON usuarios(auth_id);

-- ============================================================================
-- PASO 3: ACTUALIZAR CONSTRAINT DE ROL
-- ============================================================================

-- Eliminar constraint viejo si existe
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_rol_check;

-- Agregar constraint nuevo con valores admin/user
ALTER TABLE usuarios ADD CONSTRAINT usuarios_rol_check CHECK (rol IN ('admin', 'user'));

-- Crear índice en rol
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);

-- ============================================================================
-- PASO 4: CREAR POLÍTICAS RLS SIMPLIFICADAS (SIN RECURSIÓN)
-- ============================================================================

-- SELECT: Usuarios solo ven su propio perfil
CREATE POLICY "usuarios_select_own"
  ON usuarios
  FOR SELECT
  TO authenticated
  USING (auth.uid() = auth_id);

-- INSERT: Usuarios pueden crear su propio perfil durante el registro
CREATE POLICY "usuarios_insert_own"
  ON usuarios
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = auth_id);

-- UPDATE: Usuarios pueden actualizar su perfil pero NO pueden cambiar su rol
CREATE POLICY "usuarios_update_own"
  ON usuarios
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = auth_id)
  WITH CHECK (
    auth.uid() = auth_id AND
    rol = (SELECT rol FROM usuarios WHERE auth_id = auth.uid())
  );

-- DELETE: No se permite eliminación directa
CREATE POLICY "usuarios_no_delete"
  ON usuarios
  FOR DELETE
  TO authenticated
  USING (false);
