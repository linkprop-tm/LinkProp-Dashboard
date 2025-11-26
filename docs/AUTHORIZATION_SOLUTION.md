# Solución de Autorización: Sistema Admin/User

## Resumen Ejecutivo

Este documento describe la solución final implementada para el sistema de autenticación y autorización de la aplicación, incluyendo la resolución del problema crítico de recursión infinita en las políticas RLS (Row Level Security) de Supabase.

## Problema Original

El sistema inicial presentaba un problema grave de **recursión infinita** en las políticas RLS. Las políticas intentaban verificar si un usuario era admin consultando la tabla `usuarios`, lo cual activaba nuevamente la política RLS, creando un bucle infinito.

### Ejemplo del Problema

```sql
-- ❌ POLÍTICA PROBLEMÁTICA (causa recursión infinita)
CREATE POLICY "usuarios_select_policy"
  ON public.usuarios
  FOR SELECT
  USING (
    auth.uid() = id OR
    EXISTS (
      SELECT 1 FROM public.usuarios  -- ¡Esto causa recursión!
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );
```

## Solución Implementada

La solución se basa en **dos principios fundamentales**:

1. **Políticas RLS Simplificadas**: Las políticas solo verifican `auth.uid() = id`, sin consultas anidadas
2. **Funciones SECURITY DEFINER**: Las operaciones administrativas usan funciones con privilegios elevados

### 1. Sistema de Roles

Se migró el sistema de roles de `agente/cliente` a `admin/user`:

```sql
-- Migración de roles
UPDATE public.usuarios SET rol = 'admin' WHERE rol = 'agente';
UPDATE public.usuarios SET rol = 'user' WHERE rol = 'cliente';

-- Constraint actualizado
ALTER TABLE public.usuarios ADD CONSTRAINT usuarios_rol_check
  CHECK (rol IN ('user', 'admin'));
```

### 2. Estructura de la Tabla Usuarios

```sql
CREATE TABLE public.usuarios (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  rol text NOT NULL CHECK (rol IN ('user', 'admin')),
  avatar_url text,
  phone text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);
```

### 3. Políticas RLS Simplificadas

#### Para la tabla `usuarios`:

```sql
-- ✅ Los usuarios solo ven su propio perfil
CREATE POLICY "usuarios_select_own"
  ON public.usuarios
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- ✅ Los usuarios pueden insertar su propio perfil
CREATE POLICY "usuarios_insert_own"
  ON public.usuarios
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- ✅ Los usuarios pueden actualizar su propio perfil (sin cambiar rol)
CREATE POLICY "usuarios_update_own"
  ON public.usuarios
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    rol = (SELECT rol FROM public.usuarios WHERE id = auth.uid())
  );

-- ✅ No se permite eliminación directa
CREATE POLICY "usuarios_no_delete"
  ON public.usuarios
  FOR DELETE
  TO authenticated
  USING (false);
```

#### Para la tabla `propiedades`:

```sql
-- ✅ Todos los usuarios autenticados pueden ver propiedades
CREATE POLICY "propiedades_select_policy"
  ON public.propiedades
  FOR SELECT
  TO authenticated
  USING (true);

-- Las operaciones de escritura se controlan mediante funciones SECURITY DEFINER
-- (ver ADMIN_FUNCTIONS.md)
```

### 4. Funciones Administrativas

Para operaciones que requieren privilegios de administrador, se crearon funciones `SECURITY DEFINER`:

```sql
CREATE FUNCTION get_all_users_admin()
RETURNS TABLE (...)
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role text;
BEGIN
  -- Obtener rol del caller SIN recursión
  SELECT u.rol INTO caller_role
  FROM public.usuarios u
  WHERE u.id = auth.uid();

  -- Verificar si es admin
  IF caller_role != 'admin' THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  -- Retornar todos los usuarios
  RETURN QUERY SELECT ...;
END;
$$;
```

**Clave**: La verificación de rol ocurre **dentro** de la función SECURITY DEFINER, no en una política RLS, evitando la recursión.

## Integración con Frontend (React)

### AuthContext

El `AuthContext` maneja la autenticación y los perfiles de usuario:

```typescript
interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  rol: 'user' | 'admin';
  created_at: string;
  updated_at: string;
  avatar_url: string | null;
  phone: string | null;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  isUser: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string, rol?: 'user' | 'admin') => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}
```

### Creación de Perfil de Usuario

Al registrarse, se crea automáticamente el perfil en la tabla `usuarios`:

```typescript
const signUp = async (email: string, password: string, fullName: string, rol: 'user' | 'admin' = 'user') => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        rol: rol,
      },
    },
  });

  if (error) return { error };

  if (data.user) {
    await createUserProfile(data.user.id, email, fullName, rol);
  }

  return { error: null };
};
```

### Verificación de Rol en Componentes

```typescript
const { isAdmin, isUser, userProfile } = useAuth();

// Renderizado condicional
{isAdmin && <AdminPanel />}
{isUser && <UserDashboard />}
```

## Sistema de Auditoría

Se implementó un sistema de audit logs para rastrear acciones administrativas:

```sql
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  target_table text NOT NULL,
  target_id uuid,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz DEFAULT now() NOT NULL
);
```

Los triggers automáticos registran cambios en `propiedades` y eliminaciones en `usuarios`.

## Arquitectura Final

```
┌─────────────────────────────────────────────────────────────┐
│                        React App                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              AuthContext                              │   │
│  │  - user, userProfile, session                        │   │
│  │  - isAdmin, isUser                                   │   │
│  │  - signIn, signUp, signOut                          │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Auth                             │
│                    (auth.users)                              │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              Tabla: public.usuarios                          │
│  ┌────────────────────────────────────────────────────┐     │
│  │  RLS Policies (Simplificadas)                     │     │
│  │  - usuarios_select_own: auth.uid() = id           │     │
│  │  - usuarios_insert_own: auth.uid() = id           │     │
│  │  - usuarios_update_own: auth.uid() = id           │     │
│  │  - usuarios_no_delete: USING (false)              │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│         Funciones SECURITY DEFINER (Admin Only)              │
│  - get_all_users_admin()                                     │
│  - delete_user_admin(uuid)                                   │
│  - get_properties_stats_admin()                              │
│                                                              │
│  Verifican rol DENTRO de la función (sin recursión RLS)     │
└─────────────────────────────────────────────────────────────┘
```

## Ventajas de esta Arquitectura

1. **Sin Recursión**: Las políticas RLS no consultan la misma tabla que protegen
2. **Seguridad por Capas**: RLS + funciones SECURITY DEFINER + verificación frontend
3. **Simplicidad**: Las políticas son fáciles de entender y mantener
4. **Auditoría**: Sistema completo de logs para rastrear acciones
5. **Escalabilidad**: Fácil agregar nuevos roles o permisos
6. **Type-Safety**: TypeScript garantiza tipos correctos en el frontend

## Referencias

- Ver `RLS_POLICIES.md` para detalles de todas las políticas
- Ver `ADMIN_FUNCTIONS.md` para documentación de funciones administrativas
- Ver `MIGRATION_HISTORY.md` para historial de cambios
- Ver `FRONTEND_AUTH.md` para integración con React
