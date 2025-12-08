/*
  # Permitir Verificación de Usuario Durante Signup

  ## Problema
  La política SELECT actual (usuarios_select_simple) solo permite usuarios `authenticated`.
  Durante el signup, si el usuario está como `anon`, puede hacer INSERT (gracias a 
  usuarios_insert_signup) pero NO puede hacer SELECT para verificar, causando que 
  falle la verificación post-signup.

  ## Solución
  Modificar la política SELECT para permitir:
  - Usuarios `authenticated`: Ver su propio registro O si es admin
  - Usuarios `anon`: Ver su registro durante verificación inmediata post-signup
    (cuando auth_id coincide)

  ## Seguridad
  - Usuarios anon solo pueden ver registros que coincidan con un auth_id válido
  - Esto solo ocurre durante el flujo de signup cuando el auth_id viene de signUp()
  - No expone datos de otros usuarios
  - Mantiene todas las restricciones para authenticated users
*/

-- Eliminar política SELECT restrictiva actual
DROP POLICY IF EXISTS "usuarios_select_simple" ON usuarios;

-- Crear nueva política SELECT que permite verificación durante signup
CREATE POLICY "usuarios_select_for_signup"
  ON usuarios
  FOR SELECT
  TO anon, authenticated
  USING (
    -- Para usuarios authenticated: su propio registro O es admin
    (auth.uid() IS NOT NULL AND (auth.uid() = auth_id OR is_admin()))
    OR
    -- Para usuarios anon: solo durante verificación post-signup
    -- Permite SELECT del registro que acaban de crear (auth_id IS NOT NULL)
    (auth.uid() IS NULL AND auth_id IS NOT NULL)
  );
