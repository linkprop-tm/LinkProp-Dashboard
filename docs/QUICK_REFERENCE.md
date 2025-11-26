# Guía de Referencia Rápida

## Comandos SQL Útiles

### Verificar RLS Status

```sql
-- Ver si RLS está habilitado en todas las tablas
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

### Ver Políticas RLS

```sql
-- Ver todas las políticas de una tabla
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'usuarios';

-- Ver solo nombres de políticas
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'usuarios';
```

### Verificar Rol de Usuario

```sql
-- Obtener rol del usuario actual
SELECT rol FROM public.usuarios WHERE id = auth.uid();

-- Verificar si usuario actual es admin
SELECT EXISTS (
  SELECT 1 FROM public.usuarios
  WHERE id = auth.uid() AND rol = 'admin'
) AS is_admin;
```

### Listar Funciones SECURITY DEFINER

```sql
SELECT
  n.nspname AS schema,
  p.proname AS function_name,
  CASE WHEN prosecdef THEN 'DEFINER' ELSE 'INVOKER' END AS security
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE prosecdef = true
  AND n.nspname = 'public';
```

### Ver Audit Logs

```sql
-- Últimas 20 acciones
SELECT
  admin_id,
  action,
  target_table,
  created_at
FROM public.audit_logs
ORDER BY created_at DESC
LIMIT 20;

-- Acciones de un admin específico
SELECT * FROM public.audit_logs
WHERE admin_id = 'uuid-here'
ORDER BY created_at DESC;

-- Eliminaciones de usuarios
SELECT * FROM public.audit_logs
WHERE target_table = 'usuarios' AND action = 'DELETE';
```

---

## Testear Políticas RLS Manualmente

### Simular Usuario Específico

```sql
-- Inicio de sesión como usuario autenticado
SET LOCAL role authenticated;
SET LOCAL request.jwt.claim.sub TO 'user-uuid-here';

-- Probar SELECT
SELECT * FROM public.usuarios;
-- Debería devolver solo la fila del usuario

-- Limpiar configuración
RESET role;
```

### Test de Políticas SELECT

```sql
-- Como usuario regular
SET LOCAL role authenticated;
SET LOCAL request.jwt.claim.sub TO 'user-uuid';

SELECT * FROM public.usuarios;
-- Solo debería ver su propia fila

SELECT * FROM public.propiedades;
-- Debería ver todas las propiedades

RESET role;
```

### Test de Políticas INSERT

```sql
SET LOCAL role authenticated;
SET LOCAL request.jwt.claim.sub TO 'user-uuid';

-- Intentar crear propiedad (debería fallar si no es admin)
INSERT INTO public.propiedades (titulo, precio, tipo_propiedad)
VALUES ('Test', 100000, 'Casa');

RESET role;
```

### Test de Políticas UPDATE

```sql
SET LOCAL role authenticated;
SET LOCAL request.jwt.claim.sub TO 'user-uuid';

-- Actualizar propio perfil (debería funcionar)
UPDATE public.usuarios
SET full_name = 'Nuevo Nombre'
WHERE id = 'user-uuid';

-- Intentar cambiar rol (debería fallar)
UPDATE public.usuarios
SET rol = 'admin'
WHERE id = 'user-uuid';

RESET role;
```

### Test de Políticas DELETE

```sql
SET LOCAL role authenticated;
SET LOCAL request.jwt.claim.sub TO 'user-uuid';

-- Intentar eliminar usuario (debería fallar)
DELETE FROM public.usuarios WHERE id = 'otro-user-uuid';

RESET role;
```

---

## Verificar Permisos de Usuario

### Desde SQL

```sql
-- Obtener información completa del usuario actual
SELECT
  u.id,
  u.email,
  u.full_name,
  u.rol,
  CASE WHEN u.rol = 'admin' THEN true ELSE false END AS is_admin
FROM public.usuarios u
WHERE u.id = auth.uid();
```

### Desde React/TypeScript

```typescript
// Usando AuthContext
const { userProfile, isAdmin, isUser } = useAuth();

console.log('Usuario:', userProfile?.full_name);
console.log('Es admin:', isAdmin);
console.log('Es user:', isUser);
console.log('Rol:', userProfile?.rol);
```

### Verificar Función Administrativa

```typescript
// Intentar llamar función de admin
const { data, error } = await supabase.rpc('get_all_users_admin');

if (error) {
  if (error.message.includes('Access denied')) {
    console.log('Usuario NO es admin');
  }
} else {
  console.log('Usuario ES admin, datos:', data);
}
```

---

## Checklist de Seguridad

### Al Modificar RLS

- [ ] RLS está habilitado en la tabla (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`)
- [ ] Hay política para SELECT (de lo contrario nadie puede leer)
- [ ] Hay política para INSERT (si usuarios deben poder insertar)
- [ ] Política UPDATE verifica ownership
- [ ] Política DELETE es restrictiva o usa `USING (false)`
- [ ] No hay recursión infinita en políticas
- [ ] Se testean todas las políticas con usuario regular y admin

### Al Crear Funciones SECURITY DEFINER

- [ ] Incluye `SECURITY DEFINER` en definición
- [ ] Incluye `SET search_path = public`
- [ ] Verifica rol del usuario con `auth.uid()`
- [ ] Valida todos los parámetros de entrada
- [ ] Usa `RAISE EXCEPTION` para errores
- [ ] Otorga permisos solo a `authenticated`
- [ ] No causa recursión en RLS
- [ ] Está documentada en ADMIN_FUNCTIONS.md

### Al Crear Nuevos Usuarios

- [ ] Crea cuenta en `auth.users` primero (`supabase.auth.signUp`)
- [ ] Crea perfil en `public.usuarios` inmediatamente después
- [ ] Asigna rol correcto ('user' o 'admin')
- [ ] Verifica que el usuario puede hacer login
- [ ] Verifica que RLS funciona correctamente para el nuevo usuario

### Al Eliminar Usuarios

- [ ] Usa `delete_user_admin()` función en lugar de DELETE directo
- [ ] Verifica que no sea el propio usuario
- [ ] Confirma la eliminación en UI
- [ ] Maneja errores apropiadamente
- [ ] Verifica que se registró en audit_logs

---

## Errores Comunes y Soluciones

### Error: "new row violates row-level security policy"

**Causa**: Intentando insertar/actualizar pero política `WITH CHECK` falla.

**Solución**:
```sql
-- Verificar políticas INSERT/UPDATE
SELECT policyname, cmd, with_check
FROM pg_policies
WHERE tablename = 'nombre_tabla';

-- Revisar que la condición WITH CHECK sea correcta
```

### Error: "infinite recursion detected in policy"

**Causa**: Política RLS consulta la misma tabla que protege.

**Solución**:
```sql
-- ❌ Malo
CREATE POLICY "policy"
  ON usuarios
  USING (EXISTS (SELECT 1 FROM usuarios WHERE ...));

-- ✅ Bueno
CREATE POLICY "policy"
  ON usuarios
  USING (auth.uid() = id);
```

### Error: "permission denied for table"

**Causa**: RLS está habilitado pero no hay políticas, o usuario no tiene permisos básicos.

**Solución**:
```sql
-- Verificar si RLS está habilitado
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'nombre_tabla';

-- Ver políticas
SELECT * FROM pg_policies WHERE tablename = 'nombre_tabla';

-- Otorgar permisos básicos
GRANT SELECT, INSERT, UPDATE, DELETE ON nombre_tabla TO authenticated;
```

### Error: "Access denied. Admin role required."

**Causa**: Usuario no admin intenta usar función SECURITY DEFINER.

**Solución**: Verificar rol del usuario:
```typescript
const { userProfile } = useAuth();
if (userProfile?.rol !== 'admin') {
  alert('Necesitas ser administrador para esta acción');
  return;
}
```

### Usuario No Puede Ver Sus Datos

**Causa**: Política SELECT muy restrictiva o mal configurada.

**Solución**:
```sql
-- Verificar política SELECT
SELECT policyname, qual FROM pg_policies
WHERE tablename = 'usuarios' AND cmd = 'SELECT';

-- Debería tener:
-- USING (auth.uid() = id)
```

### Usuario Puede Cambiar Su Propio Rol

**Causa**: Política UPDATE no verifica que rol no cambie.

**Solución**:
```sql
-- Política correcta
CREATE POLICY "usuarios_update_own"
  ON public.usuarios
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    rol = (SELECT rol FROM public.usuarios WHERE id = auth.uid())
  );
```

---

## Comandos de Mantenimiento

### Recrear Política RLS

```sql
-- Eliminar política existente
DROP POLICY IF EXISTS "nombre_politica" ON tabla;

-- Crear nueva política
CREATE POLICY "nombre_politica"
  ON tabla
  FOR SELECT
  TO authenticated
  USING (condicion);
```

### Deshabilitar/Habilitar RLS Temporalmente

```sql
-- SOLO PARA DESARROLLO/DEBUGGING
ALTER TABLE public.usuarios DISABLE ROW LEVEL SECURITY;

-- Hacer pruebas...

-- SIEMPRE REHABILITAR
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
```

### Limpiar Audit Logs Antiguos

```sql
-- Eliminar logs más antiguos de 90 días
DELETE FROM public.audit_logs
WHERE created_at < now() - interval '90 days';
```

### Resetear Usuario a Estado Base

```sql
-- Solo para desarrollo
UPDATE public.usuarios
SET rol = 'user'
WHERE id = 'user-uuid';
```

---

## Snippets de Código React

### Verificar Permisos Antes de Renderizar

```typescript
import { useAuth } from '../contexts/AuthContext';

const AdminButton = () => {
  const { isAdmin } = useAuth();

  if (!isAdmin) return null;

  return <button onClick={handleAdminAction}>Acción Admin</button>;
};
```

### Proteger Rutas

```typescript
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminRoute = ({ children }) => {
  const { isAdmin, loading } = useAuth();

  if (loading) return <Loading />;
  if (!isAdmin) return <Navigate to="/" />;

  return children;
};
```

### Llamar Función Admin con Manejo de Errores

```typescript
const callAdminFunction = async () => {
  try {
    const { data, error } = await supabase.rpc('get_all_users_admin');

    if (error) {
      if (error.message.includes('Access denied')) {
        alert('No tienes permisos de administrador');
      } else {
        alert('Error: ' + error.message);
      }
      return;
    }

    console.log('Datos:', data);
  } catch (err) {
    console.error('Error inesperado:', err);
  }
};
```

### Actualizar Perfil de Usuario

```typescript
const updateProfile = async (fullName: string) => {
  const { error } = await supabase
    .from('usuarios')
    .update({ full_name: fullName })
    .eq('id', user.id);

  if (error) {
    console.error('Error actualizando perfil:', error);
  }
};
```

---

## Enlaces Rápidos

### Documentación Interna
- [AUTHORIZATION_SOLUTION.md](./AUTHORIZATION_SOLUTION.md) - Arquitectura completa
- [RLS_POLICIES.md](./RLS_POLICIES.md) - Todas las políticas RLS
- [ADMIN_FUNCTIONS.md](./ADMIN_FUNCTIONS.md) - Funciones administrativas
- [MIGRATION_HISTORY.md](./MIGRATION_HISTORY.md) - Historial de cambios
- [FRONTEND_AUTH.md](./FRONTEND_AUTH.md) - Integración React

### Documentación Externa
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Row Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase Functions](https://supabase.com/docs/guides/database/functions)

---

## Contactos de Emergencia

### Si RLS Causa Problemas en Producción

1. **NO deshabilitar RLS**
2. Revisar logs de errores en Supabase Dashboard
3. Verificar políticas con comandos de este documento
4. Crear función SECURITY DEFINER temporal si es necesario
5. Documentar el problema y la solución

### Si Usuarios No Pueden Acceder a Sus Datos

1. Verificar que RLS esté habilitado: `SELECT rowsecurity FROM pg_tables WHERE tablename = 'tabla';`
2. Verificar políticas SELECT: `SELECT * FROM pg_policies WHERE tablename = 'tabla' AND cmd = 'SELECT';`
3. Simular usuario afectado con `SET LOCAL request.jwt.claim.sub`
4. Testear consultas manualmente
5. Ajustar política según sea necesario
