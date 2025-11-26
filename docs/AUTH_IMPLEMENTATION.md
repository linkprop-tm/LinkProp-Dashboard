# Implementación de Autenticación con Supabase

## Resumen

Se ha integrado completamente Supabase Auth en LinkProp Dashboard, proporcionando autenticación segura con roles diferenciados para agentes y clientes.

## Arquitectura

### Estructura de Base de Datos

La autenticación utiliza dos tablas principales:

1. **auth.users** (Tabla de Supabase Auth)
   - Gestiona credenciales y sesiones
   - Manejada automáticamente por Supabase

2. **usuarios** (Tabla de perfil personalizada)
   - `auth_id` (uuid) - Referencia a auth.users.id
   - `rol` (text) - 'admin' o 'user'
   - `full_name`, `email`, `telefono`
   - Preferencias del cliente (cuando aplica)

### Mapeo de Roles

- **Frontend**: `'agent'` | `'client'`
- **Backend**: `'admin'` | `'user'`
- Los agentes tienen rol `'admin'`, los clientes tienen rol `'user'`

## Componentes Principales

### 1. AuthContext (`lib/contexts/AuthContext.tsx`)

Proveedor de contexto global que mantiene:
- Estado del usuario autenticado
- Rol del usuario (agent/client)
- Estado de carga
- Funciones de autenticación (signIn, signUp, signOut)

### 2. useAuth Hook (`lib/hooks/useAuth.ts`)

Hook personalizado que:
- Gestiona sesiones de usuario
- Obtiene rol desde la tabla usuarios
- Proporciona funciones de registro y login
- Crea perfiles de usuario automáticamente durante registro

### 3. Componentes de Protección

**ProtectedRoute** (`lib/components/ProtectedRoute.tsx`)
- Protege rutas completas por rol
- Muestra estados de carga
- Redirige si no hay permisos

**RoleGuard** (`lib/components/RoleGuard.tsx`)
- Protege elementos UI específicos
- Incluye helpers `AgentOnly` y `ClientOnly`

### 4. Welcome Component (`components/Welcome.tsx`)

Pantalla de autenticación que incluye:
- Login para agentes y clientes
- Registro de clientes con preferencias
- Validaciones completas de formularios
- Manejo robusto de errores

## Flujos de Usuario

### Registro de Cliente

1. Usuario completa formulario de registro (Step 1):
   - Nombre completo
   - Email
   - Contraseña (mín. 6 caracteres)
   - Teléfono

2. Usuario selecciona preferencias (Step 2):
   - Tipo de operación (Venta/Alquiler)
   - Tipos de propiedad
   - Ubicaciones de interés
   - Rango de precios, etc.

3. Sistema crea:
   - Registro en auth.users
   - Perfil en usuarios con preferencias

### Login

1. Usuario ingresa email y contraseña
2. Sistema valida credenciales
3. Obtiene rol desde tabla usuarios
4. Redirige a interfaz correspondiente:
   - Agente → Dashboard completo
   - Cliente → Vista ClientLayout

### Logout

1. Usuario hace click en "Cerrar Sesión"
2. Sistema cierra sesión en Supabase
3. Limpia estado local
4. Redirige a pantalla de bienvenida

## Seguridad

### Row Level Security (RLS)

Políticas activas en tabla `usuarios`:

1. **Users can view own profile**
   ```sql
   USING (auth.uid() = auth_id)
   ```

2. **Users can update own profile**
   ```sql
   USING (auth.uid() = auth_id)
   WITH CHECK (auth.uid() = auth_id)
   ```

3. **Users can create own profile**
   ```sql
   WITH CHECK (auth.uid() = auth_id)
   ```

### Validaciones

**Frontend:**
- Email con formato válido
- Contraseña mínima de 6 caracteres
- Campos obligatorios verificados
- Preferencias mínimas requeridas

**Backend:**
- Políticas RLS activas
- Relaciones FK con ON DELETE CASCADE
- Validación de unicidad de email

## Integración con UI

### Sidebar
- Muestra avatar dinámico (inicial del nombre)
- Carga nombre y email desde base de datos
- Actualización en tiempo real

### Settings
- Carga datos actuales del usuario
- Permite editar nombre y teléfono
- Email solo lectura (no modificable)
- Feedback visual en guardado

### Header
- Botón "Agregar Propiedad" solo visible para agentes
- Usa RoleGuard para control de acceso

### App.tsx
- Rutas protegidas con ProtectedRoute
- Redirección automática según rol
- Estados de carga durante verificación

## Migraciones Aplicadas

1. **20251126192227_add_auth_integration.sql**
   - Agrega campo auth_id a usuarios
   - Actualiza políticas RLS
   - Crea índices de rendimiento

2. **20251126201806_clean_auth_setup_v2.sql**
   - Limpia configuración previa
   - Establece estructura final

3. **20251126201954_create_admin_functions_v2.sql**
   - Funciones administrativas para gestión de roles

## Testing

### Usuarios de Prueba

Para testing, registra usuarios usando la interfaz:

**Agente:**
- Necesita ser creado manualmente en la base de datos con rol 'admin'

**Cliente:**
- Usa el flujo de registro normal desde la UI
- Se crea automáticamente con rol 'user'

### Verificaciones

✅ Login de agente redirige a dashboard completo
✅ Login de cliente redirige a ClientLayout
✅ Botones sensibles ocultos según rol
✅ Datos de perfil se cargan correctamente
✅ Actualización de perfil funciona
✅ Logout limpia sesión completamente
✅ Build se completa sin errores

## Mantenimiento

### Agregar Nuevo Campo al Perfil

1. Agregar columna a tabla `usuarios` vía migración
2. Actualizar tipo `Usuario` en `database.types.ts`
3. Modificar componentes Settings y Sidebar según necesidad
4. Actualizar función signUp si es necesario

### Agregar Nuevo Rol

1. Actualizar tipo `UserRole` en `App.tsx`
2. Modificar lógica de `getUserRole` en `useAuth.ts`
3. Crear nuevo layout si es necesario
4. Actualizar ProtectedRoute según necesidad

## Notas Importantes

- Email verification está deshabilitado para desarrollo
- Contraseñas deben tener mínimo 6 caracteres
- auth_id es único por usuario
- DELETE CASCADE mantiene consistencia de datos
- RLS policies son restrictivas por defecto
