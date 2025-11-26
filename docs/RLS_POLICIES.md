# Políticas RLS (Row Level Security)

## Índice

1. [Introducción](#introducción)
2. [Políticas para tabla usuarios](#políticas-para-tabla-usuarios)
3. [Políticas para tabla propiedades](#políticas-para-tabla-propiedades)
4. [Políticas para tabla audit_logs](#políticas-para-tabla-audit_logs)
5. [Principios de Diseño](#principios-de-diseño)
6. [Evitar Recursión Infinita](#evitar-recursión-infinita)
7. [Testing de Políticas](#testing-de-políticas)

## Introducción

Row Level Security (RLS) es un mecanismo de Postgres/Supabase que controla qué filas puede ver o modificar cada usuario. Las políticas RLS se evalúan **antes** de devolver resultados de cualquier consulta.

**Estado de RLS en todas las tablas:**
- ✅ `public.usuarios`: RLS ENABLED
- ✅ `public.propiedades`: RLS ENABLED
- ✅ `public.audit_logs`: RLS ENABLED

## Políticas para tabla `usuarios`

### SELECT: usuarios_select_own

```sql
CREATE POLICY "usuarios_select_own"
  ON public.usuarios
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);
```

**Descripción**: Los usuarios autenticados solo pueden ver su propio perfil.

**Comportamiento**:
- Usuario A puede ver solo su propia fila (`auth.uid() = A`)
- Usuario A NO puede ver los datos de Usuario B
- Los administradores usan `get_all_users_admin()` para ver todos los usuarios

**Ejemplo de uso**:
```typescript
// Como usuario regular, esto solo devuelve MI perfil
const { data } = await supabase
  .from('usuarios')
  .select('*')
  .eq('id', user.id);
```

### INSERT: usuarios_insert_own

```sql
CREATE POLICY "usuarios_insert_own"
  ON public.usuarios
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);
```

**Descripción**: Los usuarios solo pueden crear su propio perfil durante el registro.

**Comportamiento**:
- Solo se permite `INSERT` si el `id` del registro coincide con `auth.uid()`
- Previene que un usuario cree perfiles para otros usuarios
- Se ejecuta automáticamente después de `supabase.auth.signUp()`

**Ejemplo de uso**:
```typescript
// En AuthContext, después del signUp
const profile = await createUserProfile(
  data.user.id,  // Debe ser igual a auth.uid()
  email,
  fullName,
  rol
);
```

### UPDATE: usuarios_update_own

```sql
CREATE POLICY "usuarios_update_own"
  ON public.usuarios
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    rol = (SELECT rol FROM public.usuarios WHERE id = auth.uid())
  );
```

**Descripción**: Los usuarios pueden actualizar su propio perfil, pero NO pueden cambiar su rol.

**Comportamiento**:
- `USING`: Solo puede actualizar si es su propia fila
- `WITH CHECK`: El nuevo valor de `rol` debe ser igual al actual
- Previene que usuarios se auto-promocionen a admin

**Ejemplo de uso**:
```typescript
// ✅ PERMITIDO: Actualizar nombre
await supabase
  .from('usuarios')
  .update({ full_name: 'Nuevo Nombre' })
  .eq('id', user.id);

// ❌ BLOQUEADO: Intentar cambiar rol
await supabase
  .from('usuarios')
  .update({ rol: 'admin' })  // Fallará
  .eq('id', user.id);
```

### DELETE: usuarios_no_delete

```sql
CREATE POLICY "usuarios_no_delete"
  ON public.usuarios
  FOR DELETE
  TO authenticated
  USING (false);
```

**Descripción**: NO se permite eliminación directa de usuarios a través de RLS.

**Comportamiento**:
- Todas las eliminaciones directas fallan
- Los administradores deben usar `delete_user_admin(uuid)` para eliminar usuarios
- Garantiza que las eliminaciones pasen por el sistema de auditoría

**Ejemplo de uso**:
```typescript
// ❌ BLOQUEADO: Eliminación directa
await supabase
  .from('usuarios')
  .delete()
  .eq('id', targetUserId);  // Fallará siempre

// ✅ CORRECTO: Usar función admin
await supabase.rpc('delete_user_admin', {
  target_user_id: targetUserId
});
```

## Políticas para tabla `propiedades`

### SELECT: propiedades_select_policy

```sql
CREATE POLICY "propiedades_select_policy"
  ON public.propiedades
  FOR SELECT
  TO authenticated
  USING (true);
```

**Descripción**: Todos los usuarios autenticados pueden ver todas las propiedades.

**Comportamiento**:
- Cualquier usuario logueado puede consultar propiedades
- No hay restricciones por rol o propiedad

### INSERT: propiedades_insert_admin_only

```sql
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

**Descripción**: Solo administradores pueden crear propiedades.

**Comportamiento**:
- Verifica que el usuario tenga `rol = 'admin'`
- Usuario regular no puede insertar propiedades
- Se usa en componente `PropertyManagement.tsx`

**Nota**: Esta política SÍ incluye un EXISTS, pero NO causa recursión porque consulta desde `propiedades` hacia `usuarios` (no al revés).

### UPDATE: propiedades_update_admin_only

```sql
CREATE POLICY "propiedades_update_admin_only"
  ON public.propiedades
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid() AND rol = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );
```

**Descripción**: Solo administradores pueden actualizar propiedades.

**Comportamiento**:
- `USING` y `WITH CHECK` verifican rol de admin
- Usuarios regulares no pueden modificar propiedades

### DELETE: propiedades_delete_admin_only

```sql
CREATE POLICY "propiedades_delete_admin_only"
  ON public.propiedades
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );
```

**Descripción**: Solo administradores pueden eliminar propiedades.

## Políticas para tabla `audit_logs`

### SELECT: audit_logs_select_admin_only

```sql
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

**Descripción**: Solo administradores pueden ver los audit logs.

### INSERT: audit_logs_insert_system_only

```sql
CREATE POLICY "audit_logs_insert_system_only"
  ON public.audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (false);
```

**Descripción**: Los usuarios NO pueden insertar audit logs directamente.

**Comportamiento**:
- Solo los triggers (SECURITY DEFINER) pueden insertar
- Previene manipulación manual de logs

## Principios de Diseño

### 1. Simplicidad Primero

Las políticas más simples son más fáciles de entender, mantener y debuggear:

```sql
-- ✅ SIMPLE Y SEGURO
USING (auth.uid() = id)

-- ❌ COMPLEJO Y PROPENSO A ERRORES
USING (
  auth.uid() = id OR
  EXISTS (SELECT 1 FROM usuarios WHERE ...)
)
```

### 2. Separación de Responsabilidades

- **RLS**: Controla acceso a datos del usuario
- **Funciones SECURITY DEFINER**: Manejan operaciones administrativas
- **Frontend**: Valida permisos antes de mostrar UI

### 3. Seguridad por Defecto

```sql
-- Default: DENY
-- Solo se permite lo explícitamente autorizado
USING (false)  -- Niega todo por defecto
```

### 4. Auditoría Inmutable

Los logs de auditoría no se pueden modificar ni eliminar:

```sql
-- No hay políticas UPDATE o DELETE para audit_logs
-- Solo SELECT (admin) e INSERT (system)
```

## Evitar Recursión Infinita

### ❌ Patrón que Causa Recursión

```sql
-- NUNCA hacer esto en tabla usuarios:
CREATE POLICY "bad_policy"
  ON public.usuarios
  FOR SELECT
  USING (
    auth.uid() = id OR
    EXISTS (
      SELECT 1 FROM public.usuarios  -- ← Recursión infinita!
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );
```

**Por qué falla**:
1. Usuario intenta SELECT en `usuarios`
2. Política evalúa EXISTS consultando `usuarios`
3. Esto activa la política nuevamente
4. Bucle infinito → Error

### ✅ Solución: Políticas Simples + Funciones SECURITY DEFINER

```sql
-- Política simple en usuarios
CREATE POLICY "usuarios_select_own"
  ON public.usuarios
  FOR SELECT
  USING (auth.uid() = id);  -- Sin recursión

-- Función para admins
CREATE FUNCTION get_all_users_admin()
RETURNS TABLE (...)
SECURITY DEFINER  -- ← Ejecuta con privilegios elevados, ignora RLS
AS $$
BEGIN
  SELECT u.rol INTO caller_role
  FROM public.usuarios u
  WHERE u.id = auth.uid();  -- ← Ejecuta SIN activar RLS

  IF caller_role != 'admin' THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY SELECT * FROM public.usuarios;
END;
$$;
```

### Cuándo es Seguro Usar EXISTS

Es seguro usar EXISTS cuando consultas desde tabla A hacia tabla B:

```sql
-- ✅ SEGURO: Desde propiedades hacia usuarios
CREATE POLICY "propiedades_insert_admin_only"
  ON public.propiedades  -- ← Política en propiedades
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.usuarios  -- ← Consulta a usuarios
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );
```

**Por qué es seguro**: La política está en `propiedades`, no en `usuarios`, por lo que no hay recursión.

## Testing de Políticas

### Test Manual en SQL

```sql
-- Conectarse como usuario específico
SET LOCAL role authenticated;
SET LOCAL request.jwt.claim.sub TO 'user-uuid-here';

-- Probar SELECT
SELECT * FROM public.usuarios;
-- Debería devolver solo la fila del usuario

-- Probar UPDATE
UPDATE public.usuarios
SET full_name = 'Test'
WHERE id = 'user-uuid-here';
-- Debería funcionar

-- Probar cambiar rol
UPDATE public.usuarios
SET rol = 'admin'
WHERE id = 'user-uuid-here';
-- Debería FALLAR

-- Limpiar
RESET role;
```

### Test desde Frontend

```typescript
// Test 1: Usuario regular no puede ver otros perfiles
const { data, error } = await supabase
  .from('usuarios')
  .select('*');
console.log('Filas visibles:', data?.length);  // Debería ser 1

// Test 2: Usuario regular no puede crear propiedades
const { error: propError } = await supabase
  .from('propiedades')
  .insert({ titulo: 'Test', precio: 100000 });
console.log('Error esperado:', propError);  // Debería haber error

// Test 3: Admin puede obtener todos los usuarios
const { data: allUsers, error: adminError } = await supabase
  .rpc('get_all_users_admin');
console.log('Usuarios visibles:', allUsers?.length);  // Todos los usuarios
```

### Checklist de Testing

- [ ] Usuario puede ver solo su propio perfil
- [ ] Usuario puede actualizar su nombre pero NO su rol
- [ ] Usuario NO puede eliminar su cuenta directamente
- [ ] Usuario NO puede ver otros perfiles
- [ ] Admin puede obtener lista completa de usuarios
- [ ] Admin puede eliminar otros usuarios (pero no a sí mismo)
- [ ] Usuario regular NO puede crear/editar/eliminar propiedades
- [ ] Admin puede crear/editar/eliminar propiedades
- [ ] Admin puede ver audit logs
- [ ] Usuario regular NO puede ver audit logs

## Resumen de Comandos Útiles

```sql
-- Ver todas las políticas de una tabla
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'usuarios';

-- Ver si RLS está habilitado
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Deshabilitar RLS temporalmente (SOLO DESARROLLO)
ALTER TABLE public.usuarios DISABLE ROW LEVEL SECURITY;

-- Habilitar RLS (SIEMPRE EN PRODUCCIÓN)
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
```

## Referencias

- [Documentación oficial de Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- Ver `AUTHORIZATION_SOLUTION.md` para arquitectura general
- Ver `ADMIN_FUNCTIONS.md` para funciones que evitan RLS
