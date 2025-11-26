# Historial de Migraciones

Este documento registra las migraciones más importantes relacionadas con el sistema de autenticación y autorización.

## Índice

1. [20251115202127 - Reset Completo del Sistema Auth](#20251115202127---reset-completo-del-sistema-auth)
2. [20251116114843 - Implementación Sistema Admin/User](#20251116114843---implementación-sistema-adminuser)
3. [20251116114913 - Configuración Storage para Imágenes](#20251116114913---configuración-storage-para-imágenes)
4. [20251116121235 - Fix Recursión Infinita RLS](#20251116121235---fix-recursión-infinita-rls)

---

## 20251115202127 - Reset Completo del Sistema Auth

**Archivo**: `supabase/migrations/20251115202127_reset_auth_system_completely.sql`

### Problema que Resuelve

El sistema de autenticación tenía múltiples problemas acumulados:
- Triggers complejos y conflictivos
- Múltiples tablas de usuarios (agentes, clientes, usuarios)
- Políticas RLS inconsistentes
- Funciones automáticas que causaban errores

### Cambios Implementados

#### 1. Limpieza Completa

```sql
-- Eliminar todos los triggers existentes
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_agentes ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_clientes ON auth.users;
DROP TRIGGER IF EXISTS create_profile_on_signup ON auth.users;

-- Eliminar todas las funciones
DROP FUNCTION IF EXISTS public.handle_new_user_unified() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user_by_role() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.create_user_profile() CASCADE;

-- Eliminar tablas antiguas
DROP TABLE IF EXISTS public.user_profiles CASCADE;
DROP TABLE IF EXISTS public.agentes CASCADE;
DROP TABLE IF EXISTS public.clientes CASCADE;
DROP TABLE IF EXISTS public.usuarios CASCADE;
```

#### 2. Tabla Usuarios Unificada

```sql
CREATE TABLE public.usuarios (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  rol text NOT NULL CHECK (rol IN ('cliente', 'agente')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);
```

#### 3. Políticas RLS Básicas

```sql
-- SELECT: Todos los usuarios autenticados pueden leer todos los usuarios
CREATE POLICY "usuarios_select_authenticated"
  ON public.usuarios
  FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: Usuarios pueden crear su propio perfil
CREATE POLICY "usuarios_insert_own"
  ON public.usuarios
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- UPDATE: Usuarios pueden actualizar su propio perfil
CREATE POLICY "usuarios_update_own"
  ON public.usuarios
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

#### 4. Inserción de Usuarios Existentes

```sql
INSERT INTO public.usuarios (id, email, full_name, rol)
VALUES
  (
    '70ec8890-2ebd-4115-848b-2c73cf77dc8e',
    'agente@propiedades.com',
    'Agente Principal',
    'agente'
  ),
  (
    '599fcd1a-5b26-40be-9420-8ab5577742ca',
    'prueba@gmail.com',
    'Franco Lopardo',
    'cliente'
  )
ON CONFLICT (id) DO NOTHING;
```

### Impacto

- **Positivo**: Sistema limpio y simple, sin complejidad innecesaria
- **Nota**: La creación de perfiles se maneja desde el código de la aplicación (AuthContext)

---

## 20251116114843 - Implementación Sistema Admin/User

**Archivo**: `supabase/migrations/20251116114843_implement_admin_user_system_v3.sql`

### Problema que Resuelve

El sistema necesitaba roles más claros y funcionalidad administrativa completa:
- Migrar de `agente/cliente` a `admin/user`
- Implementar operaciones administrativas seguras
- Agregar sistema de auditoría
- Políticas RLS más robustas

### Cambios Implementados

#### 1. Migración de Roles

```sql
-- Eliminar constraint antiguo
ALTER TABLE public.usuarios DROP CONSTRAINT IF EXISTS usuarios_rol_check;

-- Migrar datos existentes
UPDATE public.usuarios SET rol = 'admin' WHERE rol = 'agente';
UPDATE public.usuarios SET rol = 'user' WHERE rol = 'cliente';

-- Nuevo constraint
ALTER TABLE public.usuarios ADD CONSTRAINT usuarios_rol_check
  CHECK (rol IN ('user', 'admin'));

-- Índice para performance
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON public.usuarios(rol);
```

#### 2. Políticas RLS Actualizadas

```sql
-- SELECT: Usuarios ven su perfil, admins ven todos
CREATE POLICY "usuarios_select_policy"
  ON public.usuarios
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id OR
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

-- UPDATE: Usuarios actualizan su perfil, pero no su rol
CREATE POLICY "usuarios_update_policy"
  ON public.usuarios
  FOR UPDATE
  TO authenticated
  USING (...)
  WITH CHECK (
    (auth.uid() = id AND rol = (SELECT rol FROM public.usuarios WHERE id = auth.uid())) OR
    EXISTS (...)
  );

-- DELETE: Solo admins pueden eliminar (excepto a sí mismos)
CREATE POLICY "usuarios_delete_policy"
  ON public.usuarios
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid() AND rol = 'admin'
    ) AND auth.uid() != usuarios.id
  );
```

#### 3. Políticas para Propiedades

```sql
-- SELECT: Todos pueden ver
CREATE POLICY "propiedades_select_policy"
  ON public.propiedades
  FOR SELECT
  TO authenticated
  USING (true);

-- INSERT/UPDATE/DELETE: Solo admins
CREATE POLICY "propiedades_insert_admin_only"
  ON public.propiedades
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );
```

#### 4. Sistema de Audit Logs

```sql
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  target_table text NOT NULL,
  target_id uuid,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- RLS para audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_logs_select_admin_only"
  ON public.audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );
```

#### 5. Triggers de Auditoría

```sql
CREATE OR REPLACE FUNCTION audit_propiedades_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (admin_id, action, target_table, target_id, old_data)
    VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, OLD.id, row_to_json(OLD));
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (admin_id, action, target_table, target_id, old_data, new_data)
    VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, NEW.id, row_to_json(OLD), row_to_json(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (admin_id, action, target_table, target_id, new_data)
    VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, NEW.id, row_to_json(NEW));
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_propiedades_insert
  AFTER INSERT ON public.propiedades
  FOR EACH ROW EXECUTE FUNCTION audit_propiedades_changes();
```

#### 6. Funciones Administrativas

```sql
-- Obtener todos los usuarios (solo admins)
CREATE OR REPLACE FUNCTION get_all_users_admin()
RETURNS TABLE (...)
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE usuarios.id = auth.uid() AND usuarios.rol = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  RETURN QUERY
  SELECT u.id, u.email, u.full_name, u.rol, u.created_at, u.updated_at
  FROM public.usuarios u
  ORDER BY u.created_at DESC;
END;
$$;

-- Eliminar usuario (solo admins)
CREATE OR REPLACE FUNCTION delete_user_admin(target_user_id uuid)
RETURNS void
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE usuarios.id = auth.uid() AND usuarios.rol = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot delete your own account.';
  END IF;

  DELETE FROM auth.users WHERE id = target_user_id;
END;
$$;

-- Estadísticas de propiedades (solo admins)
CREATE OR REPLACE FUNCTION get_properties_stats_admin()
RETURNS TABLE (
  total_properties bigint,
  properties_this_month bigint,
  avg_price numeric,
  properties_by_type jsonb
)
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE usuarios.id = auth.uid() AND usuarios.rol = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  RETURN QUERY
  SELECT
    COUNT(*)::bigint as total_properties,
    COUNT(*) FILTER (WHERE created_at >= date_trunc('month', now()))::bigint as properties_this_month,
    AVG(precio) as avg_price,
    jsonb_object_agg(tipo_propiedad, count) as properties_by_type
  FROM (
    SELECT
      tipo_propiedad,
      COUNT(*) as count,
      precio
    FROM public.propiedades
    GROUP BY tipo_propiedad, precio
  ) subquery;
END;
$$;
```

### Impacto

- **Positivo**: Sistema completo de administración con auditoría
- **Limitación**: Las políticas con EXISTS causarían recursión infinita (ver siguiente migración)

---

## 20251116114913 - Configuración Storage para Imágenes

**Archivo**: `supabase/migrations/20251116114913_configure_storage_for_property_images.sql`

### Problema que Resuelve

Necesidad de almacenar imágenes de propiedades de forma segura.

### Cambios Implementados

#### 1. Bucket de Storage

```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-images',
  'property-images',
  true,
  5242880,  -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
```

#### 2. Políticas de Storage

```sql
-- SELECT: Público (cualquiera puede ver imágenes)
CREATE POLICY "property_images_select_public"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'property-images');

-- INSERT: Solo admins
CREATE POLICY "property_images_insert_admin"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'property-images' AND
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

-- UPDATE: Solo admins
CREATE POLICY "property_images_update_admin"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'property-images' AND
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

-- DELETE: Solo admins
CREATE POLICY "property_images_delete_admin"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'property-images' AND
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );
```

### Impacto

- **Positivo**: Sistema seguro para imágenes de propiedades
- **Configuración**: Límite de 5MB por imagen, solo formatos web estándar

---

## 20251116121235 - Fix Recursión Infinita RLS

**Archivo**: `supabase/migrations/20251116121235_fix_rls_infinite_recursion_v2.sql`

### Problema que Resuelve

**Recursión Infinita Crítica**: Las políticas RLS de la migración anterior causaban bucles infinitos porque la política en `usuarios` consultaba la misma tabla `usuarios`.

```sql
-- ❌ ESTO CAUSABA RECURSIÓN INFINITA
CREATE POLICY "usuarios_select_policy"
  ON public.usuarios
  FOR SELECT
  USING (
    auth.uid() = id OR
    EXISTS (
      SELECT 1 FROM public.usuarios  -- ← Consulta a usuarios desde política de usuarios
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );
```

### Flujo del Problema

```
1. Usuario intenta: SELECT * FROM usuarios
2. RLS activa política "usuarios_select_policy"
3. Política evalúa: EXISTS (SELECT 1 FROM usuarios ...)
4. Esto activa nuevamente la política "usuarios_select_policy"
5. BUCLE INFINITO → Error
```

### Cambios Implementados

#### 1. Eliminar Políticas Problemáticas

```sql
DROP POLICY IF EXISTS "usuarios_select_policy" ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_insert_policy" ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_update_policy" ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_delete_policy" ON public.usuarios;
```

#### 2. Políticas Simplificadas (Sin Recursión)

```sql
-- SELECT: Usuarios solo ven su propio perfil
CREATE POLICY "usuarios_select_own"
  ON public.usuarios
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);  -- ← Sin EXISTS, sin recursión

-- INSERT: Usuarios pueden crear su propio perfil
CREATE POLICY "usuarios_insert_own"
  ON public.usuarios
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- UPDATE: Usuarios actualizan su perfil pero no su rol
CREATE POLICY "usuarios_update_own"
  ON public.usuarios
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    rol = (SELECT rol FROM public.usuarios WHERE id = auth.uid())
  );

-- DELETE: No permitido directamente
CREATE POLICY "usuarios_no_delete"
  ON public.usuarios
  FOR DELETE
  TO authenticated
  USING (false);  -- Todas las eliminaciones fallan
```

#### 3. Funciones SECURITY DEFINER Actualizadas

Las funciones administrativas se actualizaron para evitar recursión:

```sql
CREATE FUNCTION get_all_users_admin()
RETURNS TABLE (...)
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role text;
BEGIN
  -- Obtener rol SIN activar RLS (porque estamos en SECURITY DEFINER)
  SELECT u.rol INTO caller_role
  FROM public.usuarios u
  WHERE u.id = auth.uid();

  -- Verificar rol
  IF caller_role != 'admin' THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  -- Retornar todos los usuarios
  RETURN QUERY
  SELECT u.id, u.email, u.full_name, u.rol, u.created_at, u.updated_at, u.avatar_url, u.phone
  FROM public.usuarios u
  ORDER BY u.created_at DESC;
END;
$$;
```

**Clave**: La verificación de rol ocurre **dentro** de la función `SECURITY DEFINER`, que se ejecuta con privilegios elevados y NO activa las políticas RLS.

#### 4. Arquitectura Final

```
┌─────────────────────────────────────────────┐
│         Políticas RLS Simples               │
│   (auth.uid() = id, sin EXISTS)             │
│   - Usuarios ven solo SU perfil             │
└─────────────────────────────────────────────┘
                    +
┌─────────────────────────────────────────────┐
│    Funciones SECURITY DEFINER               │
│   (Verifican rol DENTRO de la función)      │
│   - Admins llaman get_all_users_admin()     │
│   - Admins llaman delete_user_admin()       │
└─────────────────────────────────────────────┘
                    ↓
         ✅ Sin Recursión
```

### Impacto

- **Crítico**: Resuelve error que impedía el funcionamiento del sistema
- **Arquitectura**: Separa claramente RLS básico de operaciones administrativas
- **Mantenibilidad**: Políticas simples son fáciles de entender y debuggear

---

## Resumen de Evolución

### Fase 1: Limpieza (20251115202127)
- Sistema simplificado, sin triggers ni funciones automáticas
- Una sola tabla de usuarios
- Políticas RLS básicas

### Fase 2: Funcionalidad Admin (20251116114843)
- Roles admin/user
- Sistema de auditoría completo
- Funciones administrativas SECURITY DEFINER
- Políticas RLS con EXISTS (causó problemas)

### Fase 3: Storage (20251116114913)
- Bucket para imágenes de propiedades
- Políticas de storage seguras

### Fase 4: Fix Crítico (20251116121235)
- **Eliminación de recursión infinita**
- Políticas RLS simplificadas
- Funciones SECURITY DEFINER mejoradas
- Arquitectura final estable

---

## Lecciones Aprendidas

### ✅ Hacer

1. **Políticas RLS simples**: `auth.uid() = id` es suficiente para casos básicos
2. **SECURITY DEFINER para admin**: Operaciones administrativas deben usar funciones con privilegios elevados
3. **Verificación de rol dentro de funciones**: Evita recursión en RLS
4. **Sistema de auditoría**: Registrar acciones administrativas es crucial
5. **Testear políticas**: Simular usuarios antes de desplegar

### ❌ Evitar

1. **EXISTS que consulta la misma tabla**: Causa recursión infinita
2. **Políticas RLS complejas**: Difíciles de mantener y debuggear
3. **Triggers complejos**: Pueden causar efectos secundarios inesperados
4. **Múltiples tablas de usuarios**: Complica consultas y mantenimiento
5. **Deshabilitar RLS**: Nunca es la solución correcta

---

## Próximos Pasos Potenciales

### Mejoras Futuras

- [ ] Agregar campos adicionales a `usuarios` (avatar_url, phone, etc.)
- [ ] Implementar roles adicionales (moderador, editor, etc.)
- [ ] Sistema de permisos granular por feature
- [ ] Logs de acceso (quién vio qué y cuándo)
- [ ] Exportación de audit logs
- [ ] Dashboard de estadísticas en tiempo real

### Mantenimiento

- [ ] Revisar audit logs mensualmente
- [ ] Limpiar logs antiguos (>90 días)
- [ ] Monitorear performance de políticas RLS
- [ ] Actualizar documentación al agregar features

---

## Referencias

- Ver `AUTHORIZATION_SOLUTION.md` para arquitectura completa
- Ver `RLS_POLICIES.md` para detalles de todas las políticas
- Ver `ADMIN_FUNCTIONS.md` para documentación de funciones
