/*
  # Funciones SECURITY DEFINER para Administradores v2

  ## Descripción
  Elimina funciones antiguas y crea nuevas funciones con SECURITY DEFINER que permiten 
  a los administradores realizar operaciones que normalmente están bloqueadas por RLS.

  ## Funciones Creadas
  1. is_admin() - Verificar si el usuario es admin
  2. get_all_users_admin() - Ver todos los usuarios
  3. delete_user_admin(uuid) - Eliminar usuario
  4. update_user_role_admin(uuid, text) - Cambiar rol de usuario
  5. get_user_stats_admin() - Obtener estadísticas
  6. get_all_properties_admin() - Ver todas las propiedades
*/

-- ============================================================================
-- ELIMINAR FUNCIONES ANTIGUAS
-- ============================================================================

DROP FUNCTION IF EXISTS is_admin();
DROP FUNCTION IF EXISTS get_all_users_admin();
DROP FUNCTION IF EXISTS delete_user_admin(uuid);
DROP FUNCTION IF EXISTS update_user_role_admin(uuid, text);
DROP FUNCTION IF EXISTS get_user_stats_admin();
DROP FUNCTION IF EXISTS get_all_properties_admin();

-- ============================================================================
-- FUNCIÓN 1: is_admin() - Verificar si el usuario es administrador
-- ============================================================================

CREATE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM usuarios
    WHERE auth_id = auth.uid()
    AND rol = 'admin'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

-- ============================================================================
-- FUNCIÓN 2: get_all_users_admin() - Ver todos los usuarios (solo admins)
-- ============================================================================

CREATE FUNCTION get_all_users_admin()
RETURNS TABLE (
  id uuid,
  email text,
  full_name text,
  telefono text,
  rol text,
  auth_id uuid,
  avatar_url text,
  preferencias_tipo text[],
  preferencias_operacion text,
  preferencias_precio_min numeric,
  preferencias_precio_max numeric,
  preferencias_ubicacion text[],
  preferencias_dormitorios_min integer,
  preferencias_banos_min integer,
  fecha_creacion timestamptz,
  fecha_actualizacion timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Solo administradores pueden ver todos los usuarios';
  END IF;

  RETURN QUERY
  SELECT
    u.id,
    u.email,
    u.full_name,
    u.telefono,
    u.rol,
    u.auth_id,
    u.avatar_url,
    u.preferencias_tipo,
    u.preferencias_operacion,
    u.preferencias_precio_min,
    u.preferencias_precio_max,
    u.preferencias_ubicacion,
    u.preferencias_dormitorios_min,
    u.preferencias_banos_min,
    u.fecha_creacion,
    u.fecha_actualizacion
  FROM usuarios u
  ORDER BY u.fecha_creacion DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION get_all_users_admin() TO authenticated;

-- ============================================================================
-- FUNCIÓN 3: delete_user_admin() - Eliminar usuario (solo admins)
-- ============================================================================

CREATE FUNCTION delete_user_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count integer;
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Solo administradores pueden eliminar usuarios';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM usuarios WHERE id = user_id) THEN
    RAISE EXCEPTION 'Usuario no encontrado';
  END IF;

  IF EXISTS (SELECT 1 FROM usuarios WHERE id = user_id AND auth_id = auth.uid()) THEN
    RAISE EXCEPTION 'No puedes eliminarte a ti mismo';
  END IF;

  DELETE FROM usuarios WHERE id = user_id;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  RETURN deleted_count > 0;
END;
$$;

GRANT EXECUTE ON FUNCTION delete_user_admin(uuid) TO authenticated;

-- ============================================================================
-- FUNCIÓN 4: update_user_role_admin() - Cambiar rol de usuario (solo admins)
-- ============================================================================

CREATE FUNCTION update_user_role_admin(user_id uuid, new_role text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_count integer;
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Solo administradores pueden cambiar roles';
  END IF;

  IF new_role NOT IN ('admin', 'user') THEN
    RAISE EXCEPTION 'Rol inválido. Debe ser admin o user';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM usuarios WHERE id = user_id) THEN
    RAISE EXCEPTION 'Usuario no encontrado';
  END IF;

  IF EXISTS (SELECT 1 FROM usuarios WHERE id = user_id AND auth_id = auth.uid()) THEN
    RAISE EXCEPTION 'No puedes cambiar tu propio rol';
  END IF;

  UPDATE usuarios
  SET rol = new_role, fecha_actualizacion = now()
  WHERE id = user_id;

  GET DIAGNOSTICS updated_count = ROW_COUNT;

  RETURN updated_count > 0;
END;
$$;

GRANT EXECUTE ON FUNCTION update_user_role_admin(uuid, text) TO authenticated;

-- ============================================================================
-- FUNCIÓN 5: get_user_stats_admin() - Obtener estadísticas (solo admins)
-- ============================================================================

CREATE FUNCTION get_user_stats_admin()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Solo administradores pueden ver estadísticas';
  END IF;

  SELECT json_build_object(
    'total_usuarios', (SELECT COUNT(*) FROM usuarios WHERE rol = 'user'),
    'total_admins', (SELECT COUNT(*) FROM usuarios WHERE rol = 'admin'),
    'total_propiedades', (SELECT COUNT(*) FROM propiedades),
    'registros_ultimos_7_dias', (
      SELECT COUNT(*) FROM usuarios 
      WHERE fecha_creacion >= now() - interval '7 days'
    ),
    'registros_ultimos_30_dias', (
      SELECT COUNT(*) FROM usuarios 
      WHERE fecha_creacion >= now() - interval '30 days'
    )
  ) INTO result;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION get_user_stats_admin() TO authenticated;

-- ============================================================================
-- FUNCIÓN 6: get_all_properties_admin() - Ver todas las propiedades (solo admins)
-- ============================================================================

CREATE FUNCTION get_all_properties_admin()
RETURNS TABLE (
  id uuid,
  titulo text,
  descripcion text,
  tipo text,
  operacion text,
  precio numeric,
  ubicacion text,
  dormitorios integer,
  banos integer,
  superficie numeric,
  imagenes text[],
  estado text,
  fecha_creacion timestamptz,
  fecha_actualizacion timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Solo administradores pueden ver todas las propiedades';
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    p.titulo,
    p.descripcion,
    p.tipo,
    p.operacion,
    p.precio,
    p.ubicacion,
    p.dormitorios,
    p.banos,
    p.superficie,
    p.imagenes,
    p.estado,
    p.fecha_creacion,
    p.fecha_actualizacion
  FROM propiedades p
  ORDER BY p.fecha_creacion DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION get_all_properties_admin() TO authenticated;
