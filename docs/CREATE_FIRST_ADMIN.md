# Crear el Primer Administrador

Una vez que hayas creado un usuario a través del formulario de registro, necesitas convertirlo en administrador manualmente desde la base de datos de Supabase.

## Pasos:

### 1. Registra el usuario en la aplicación
- Ve a la aplicación y registra un nuevo usuario con tu email
- Completa el formulario de registro

### 2. Obtén el UUID del usuario
Ve al **SQL Editor** de Supabase y ejecuta:

```sql
-- Ver todos los usuarios registrados en auth.users
SELECT id, email, created_at
FROM auth.users
ORDER BY created_at DESC;
```

Copia el `id` (UUID) de tu usuario.

### 3. Actualiza el rol a admin

Opción A - **Si el usuario ya existe en la tabla `usuarios`**:

```sql
-- Actualizar un usuario existente a admin
UPDATE usuarios
SET rol = 'admin'
WHERE auth_id = 'PEGA-AQUI-EL-UUID-DEL-PASO-2';
```

Opción B - **Si el usuario NO existe en la tabla `usuarios`** (crearlo manualmente):

```sql
-- Crear el usuario admin manualmente
INSERT INTO usuarios (
  auth_id,
  email,
  full_name,
  rol
)
VALUES (
  'PEGA-AQUI-EL-UUID-DEL-PASO-2',
  'tu-email@ejemplo.com',
  'Tu Nombre Completo',
  'admin'
);
```

### 4. Verificar

```sql
-- Verificar que el usuario es admin
SELECT id, email, full_name, rol, auth_id
FROM usuarios
WHERE rol = 'admin';
```

### 5. Recarga la aplicación

Cierra sesión y vuelve a iniciar sesión. Ahora deberías tener acceso al panel de administrador.

## Notas Importantes

- Solo debes crear el primer admin manualmente
- Los siguientes admins pueden ser creados desde la aplicación por cualquier admin existente usando la función `update_user_role_admin()`
- El sistema está diseñado para tener al menos un admin en todo momento
- Un admin no puede cambiar su propio rol ni eliminarse a sí mismo
