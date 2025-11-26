# Funciones Administrativas (SECURITY DEFINER)

## Índice

1. [¿Qué es SECURITY DEFINER?](#qué-es-security-definer)
2. [get_all_users_admin()](#get_all_users_admin)
3. [delete_user_admin()](#delete_user_admin)
4. [get_properties_stats_admin()](#get_properties_stats_admin)
5. [Patrones de Seguridad](#patrones-de-seguridad)
6. [Ejemplos de Uso desde React](#ejemplos-de-uso-desde-react)

## ¿Qué es SECURITY DEFINER?

`SECURITY DEFINER` es una directiva de PostgreSQL que permite que una función se ejecute con los privilegios del **creador de la función** en lugar de los privilegios del **usuario que la llama**.

### ¿Por qué usamos SECURITY DEFINER?

Las políticas RLS simplificadas solo permiten a los usuarios ver sus propios datos. Para operaciones administrativas (ver todos los usuarios, eliminar cuentas, etc.), necesitamos un mecanismo que:

1. **Eleve privilegios temporalmente** para leer todas las filas
2. **Verifique el rol** del usuario ANTES de permitir la operación
3. **Evite recursión infinita** en las políticas RLS

### Flujo de Ejecución

```
Usuario Admin → Llama función → Verifica rol → Ejecuta con privilegios elevados
Usuario Regular → Llama función → Verifica rol → RECHAZA (error)
```

### Alternativas Rechazadas

#### ❌ Opción 1: Políticas RLS complejas con EXISTS

```sql
-- Causa recursión infinita
CREATE POLICY "usuarios_select_all_if_admin"
  ON public.usuarios
  FOR SELECT
  USING (
    auth.uid() = id OR
    EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND rol = 'admin')
  );
```

**Problema**: La política consulta la misma tabla que protege → bucle infinito.

#### ❌ Opción 2: Deshabilitar RLS

```sql
ALTER TABLE public.usuarios DISABLE ROW LEVEL SECURITY;
```

**Problema**: Expone todos los datos a todos los usuarios → inseguro.

#### ✅ Opción 3: SECURITY DEFINER (Solución implementada)

```sql
CREATE FUNCTION get_all_users_admin()
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar rol DENTRO de la función
  -- Ejecutar con privilegios elevados
END;
$$;
```

**Ventajas**: Seguro, sin recursión, verificación de permisos explícita.

---

## get_all_users_admin()

### Propósito

Permite a los administradores obtener una lista completa de todos los usuarios del sistema.

### Firma

```sql
CREATE FUNCTION get_all_users_admin()
RETURNS TABLE (
  id uuid,
  email text,
  full_name text,
  rol text,
  created_at timestamptz,
  updated_at timestamptz,
  avatar_url text,
  phone text
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
```

### Implementación

```sql
CREATE FUNCTION get_all_users_admin()
RETURNS TABLE (...)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  caller_role text;
BEGIN
  -- Paso 1: Obtener rol del usuario que llama
  -- (sin activar políticas RLS porque estamos en SECURITY DEFINER)
  SELECT u.rol INTO caller_role
  FROM public.usuarios u
  WHERE u.id = auth.uid();

  -- Paso 2: Verificar si es admin
  IF caller_role != 'admin' THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  -- Paso 3: Retornar todos los usuarios
  RETURN QUERY
  SELECT u.id, u.email, u.full_name, u.rol, u.created_at, u.updated_at, u.avatar_url, u.phone
  FROM public.usuarios u
  ORDER BY u.created_at DESC;
END;
$$;
```

### Detalles Técnicos

- **SECURITY DEFINER**: La función ignora las políticas RLS al ejecutarse
- **SET search_path = public**: Previene ataques de search path injection
- **DECLARE caller_role text**: Variable para almacenar el rol del usuario
- **RAISE EXCEPTION**: Termina la ejecución si el usuario no es admin
- **RETURN QUERY**: Retorna el resultado de un SELECT como tabla

### Uso desde React

```typescript
const fetchUsers = async () => {
  try {
    const { data, error } = await supabase.rpc('get_all_users_admin');

    if (error) throw error;

    setUsers(data || []);
  } catch (err) {
    console.error('Error fetching users:', err);
    // Si el usuario no es admin, obtendrá error "Access denied"
  }
};
```

### Permisos

```sql
GRANT EXECUTE ON FUNCTION get_all_users_admin() TO authenticated;
```

Todos los usuarios autenticados pueden **llamar** la función, pero solo los admins obtendrán resultados.

### Casos de Uso

- Pantalla de gestión de usuarios (`UserManagement.tsx`)
- Dashboard administrativo mostrando total de usuarios
- Exportación de datos de usuarios
- Reportes de usuarios activos

---

## delete_user_admin()

### Propósito

Permite a los administradores eliminar cuentas de usuario de forma segura, incluyendo:
- Registro en `public.usuarios`
- Cuenta en `auth.users`
- Auditoría de la eliminación

### Firma

```sql
CREATE FUNCTION delete_user_admin(target_user_id uuid)
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
```

### Implementación

```sql
CREATE FUNCTION delete_user_admin(target_user_id uuid)
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  caller_role text;
BEGIN
  -- Paso 1: Obtener rol del usuario que llama
  SELECT u.rol INTO caller_role
  FROM public.usuarios u
  WHERE u.id = auth.uid();

  -- Paso 2: Verificar si es admin
  IF caller_role != 'admin' THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  -- Paso 3: Prevenir auto-eliminación
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot delete your own account.';
  END IF;

  -- Paso 4: Eliminar de usuarios (cascada automática)
  DELETE FROM public.usuarios WHERE id = target_user_id;

  -- Paso 5: Eliminar de auth.users
  DELETE FROM auth.users WHERE id = target_user_id;
END;
$$;
```

### Detalles Técnicos

- **RETURNS void**: No retorna datos, solo ejecuta la acción
- **Validación de auto-eliminación**: Previene que admin se elimine a sí mismo
- **Orden de eliminación**: Primero `usuarios`, luego `auth.users`
- **Foreign key cascade**: Las relaciones se eliminan automáticamente
- **Trigger de auditoría**: Se registra automáticamente en `audit_logs`

### Uso desde React

```typescript
const handleDeleteConfirm = async () => {
  if (!userToDelete) return;

  try {
    const { error } = await supabase.rpc('delete_user_admin', {
      target_user_id: userToDelete.id,
    });

    if (error) throw error;

    // Actualizar estado local
    setUsers(users.filter((u) => u.id !== userToDelete.id));
    setDeleteModalOpen(false);
  } catch (err: any) {
    console.error('Error deleting user:', err);
    alert(err.message || 'Error al eliminar el usuario');
  }
};
```

### Permisos

```sql
GRANT EXECUTE ON FUNCTION delete_user_admin(uuid) TO authenticated;
```

### Casos de Uso

- Eliminar cuentas de usuarios inactivos
- Remover usuarios que violan términos de servicio
- Limpiar cuentas de prueba
- Gestión de usuarios desde panel administrativo

### Efectos Secundarios

Al eliminar un usuario se activan automáticamente:

1. **Trigger de auditoría**: Registra la eliminación en `audit_logs`
2. **Cascade DELETE**: Elimina registros relacionados por foreign keys
3. **Sesión invalidada**: El usuario es deslogueado si estaba conectado

---

## get_properties_stats_admin()

### Propósito

Proporciona estadísticas agregadas sobre las propiedades del sistema para el dashboard administrativo.

### Firma

```sql
CREATE FUNCTION get_properties_stats_admin()
RETURNS TABLE (
  total_properties bigint,
  properties_this_month bigint,
  avg_price numeric,
  properties_by_type jsonb
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
```

### Implementación

```sql
CREATE FUNCTION get_properties_stats_admin()
RETURNS TABLE (...)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  caller_role text;
BEGIN
  -- Paso 1: Verificar rol de admin
  SELECT u.rol INTO caller_role
  FROM public.usuarios u
  WHERE u.id = auth.uid();

  IF caller_role != 'admin' THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  -- Paso 2: Calcular estadísticas
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

### Detalles Técnicos

- **FILTER clause**: PostgreSQL permite filtros en agregaciones
- **date_trunc('month', now())**: Primer día del mes actual
- **jsonb_object_agg**: Convierte pares clave-valor en objeto JSON
- **Subquery**: Agrupa primero, luego agrega

### Uso desde React

```typescript
const fetchStats = async () => {
  try {
    const { data, error } = await supabase.rpc('get_properties_stats_admin');

    if (error) throw error;

    if (data && data.length > 0) {
      const stats = data[0];
      console.log('Total:', stats.total_properties);
      console.log('Este mes:', stats.properties_this_month);
      console.log('Precio promedio:', stats.avg_price);
      console.log('Por tipo:', stats.properties_by_type);
    }
  } catch (err) {
    console.error('Error fetching stats:', err);
  }
};
```

### Permisos

```sql
GRANT EXECUTE ON FUNCTION get_properties_stats_admin() TO authenticated;
```

### Casos de Uso

- Dashboard administrativo con métricas
- Reportes de inventario de propiedades
- Análisis de tendencias de precios
- Visualización de distribución por tipo de propiedad

---

## Patrones de Seguridad

### 1. Verificación de Rol Explícita

Todas las funciones SECURITY DEFINER deben verificar el rol del usuario:

```sql
DECLARE
  caller_role text;
BEGIN
  -- Obtener rol
  SELECT u.rol INTO caller_role
  FROM public.usuarios u
  WHERE u.id = auth.uid();

  -- Verificar
  IF caller_role != 'admin' THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  -- ... resto de la función
END;
```

### 2. SET search_path = public

Previene ataques de "search path injection":

```sql
CREATE FUNCTION my_function()
SECURITY DEFINER
SET search_path = public  -- ← Importante
```

Sin esto, un atacante podría crear funciones maliciosas en su propio schema.

### 3. Validación de Parámetros

```sql
-- Verificar que los parámetros no sean NULL
IF target_user_id IS NULL THEN
  RAISE EXCEPTION 'Invalid user ID';
END IF;

-- Verificar lógica de negocio
IF target_user_id = auth.uid() THEN
  RAISE EXCEPTION 'Cannot delete your own account.';
END IF;
```

### 4. Uso de auth.uid()

Siempre usar `auth.uid()` para identificar al usuario actual:

```sql
-- ✅ Correcto
WHERE id = auth.uid()

-- ❌ Incorrecto (no funciona en Supabase)
WHERE id = current_user
```

### 5. Permisos Mínimos

Otorgar solo los permisos necesarios:

```sql
-- ✅ Solo authenticated
GRANT EXECUTE ON FUNCTION my_function() TO authenticated;

-- ❌ No hacer esto
GRANT EXECUTE ON FUNCTION my_function() TO PUBLIC;
```

---

## Ejemplos de Uso desde React

### Escenario 1: Cargar Lista de Usuarios

```typescript
import { supabase } from '../lib/supabase';

interface Usuario {
  id: string;
  email: string;
  full_name: string;
  rol: 'user' | 'admin';
  created_at: string;
  updated_at: string;
  avatar_url: string | null;
  phone: string | null;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_all_users_admin');

      if (error) throw error;

      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      // Manejar error (por ejemplo, usuario no es admin)
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {loading ? <Loading /> : <UserList users={users} />}
    </div>
  );
};
```

### Escenario 2: Eliminar Usuario con Confirmación

```typescript
const handleDeleteUser = async (userId: string) => {
  // Confirmar con modal
  const confirmed = await confirmModal({
    title: 'Confirmar Eliminación',
    message: '¿Estás seguro de que deseas eliminar este usuario?',
  });

  if (!confirmed) return;

  try {
    const { error } = await supabase.rpc('delete_user_admin', {
      target_user_id: userId,
    });

    if (error) throw error;

    // Actualizar UI
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    toast.success('Usuario eliminado correctamente');
  } catch (err: any) {
    console.error('Error:', err);

    if (err.message.includes('Cannot delete your own account')) {
      toast.error('No puedes eliminar tu propia cuenta');
    } else if (err.message.includes('Access denied')) {
      toast.error('No tienes permisos de administrador');
    } else {
      toast.error('Error al eliminar usuario');
    }
  }
};
```

### Escenario 3: Dashboard con Estadísticas

```typescript
const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalProperties: 0,
    propertiesThisMonth: 0,
    avgPrice: 0,
    propertiesByType: {},
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase.rpc('get_properties_stats_admin');

      if (error) throw error;

      if (data && data.length > 0) {
        const result = data[0];
        setStats({
          totalProperties: result.total_properties,
          propertiesThisMonth: result.properties_this_month,
          avgPrice: result.avg_price,
          propertiesByType: result.properties_by_type,
        });
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      <StatCard title="Total Propiedades" value={stats.totalProperties} />
      <StatCard title="Este Mes" value={stats.propertiesThisMonth} />
      <StatCard title="Precio Promedio" value={`$${stats.avgPrice.toFixed(2)}`} />
    </div>
  );
};
```

### Manejo de Errores Común

```typescript
const callAdminFunction = async (functionName: string, params: any) => {
  try {
    const { data, error } = await supabase.rpc(functionName, params);

    if (error) throw error;

    return { data, error: null };
  } catch (err: any) {
    console.error(`Error in ${functionName}:`, err);

    // Parsear mensajes de error comunes
    if (err.message.includes('Access denied')) {
      return { data: null, error: 'No tienes permisos de administrador' };
    }

    if (err.message.includes('Cannot delete your own account')) {
      return { data: null, error: 'No puedes eliminar tu propia cuenta' };
    }

    return { data: null, error: 'Error al ejecutar la operación' };
  }
};
```

---

## Checklist de Seguridad

Al crear nuevas funciones SECURITY DEFINER, verificar:

- [ ] Usar `SECURITY DEFINER` en la definición
- [ ] Incluir `SET search_path = public`
- [ ] Verificar rol del usuario con `auth.uid()`
- [ ] Validar todos los parámetros de entrada
- [ ] Usar `RAISE EXCEPTION` para errores claros
- [ ] Otorgar permisos solo a `authenticated`
- [ ] Documentar propósito, parámetros y retorno
- [ ] Incluir ejemplos de uso
- [ ] Testear con usuario admin y usuario regular
- [ ] Verificar que no cause recursión en RLS

---

## Referencias

- [PostgreSQL SECURITY DEFINER](https://www.postgresql.org/docs/current/sql-createfunction.html)
- [Supabase Database Functions](https://supabase.com/docs/guides/database/functions)
- Ver `RLS_POLICIES.md` para políticas relacionadas
- Ver `AUTHORIZATION_SOLUTION.md` para arquitectura completa
