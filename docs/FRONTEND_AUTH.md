# Integración de Autenticación en Frontend (React)

## Índice

1. [Arquitectura del AuthContext](#arquitectura-del-authcontext)
2. [Tipos TypeScript](#tipos-typescript)
3. [Funciones de Autenticación](#funciones-de-autenticación)
4. [Hook useAuth](#hook-useauth)
5. [Componentes de Protección de Rutas](#componentes-de-protección-de-rutas)
6. [Ejemplos de Uso](#ejemplos-de-uso)
7. [Manejo de Errores](#manejo-de-errores)
8. [Best Practices](#best-practices)

---

## Arquitectura del AuthContext

El sistema de autenticación en React se basa en un `Context` que proporciona el estado de autenticación y funciones para toda la aplicación.

### Ubicación

```
src/contexts/AuthContext.tsx
```

### Flujo de Datos

```
┌─────────────────────────────────────────────────────────┐
│                  Supabase Auth                          │
│              (auth.users table)                         │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ onAuthStateChange
                     ▼
┌─────────────────────────────────────────────────────────┐
│              AuthContext Provider                       │
│  - user (from auth.users)                              │
│  - userProfile (from public.usuarios)                  │
│  - session                                             │
│  - loading                                             │
│  - isAdmin, isUser                                     │
│  - signIn, signUp, signOut                            │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ useAuth()
                     ▼
┌─────────────────────────────────────────────────────────┐
│              React Components                           │
│  - Landing, Dashboard, Admin, etc.                     │
│  - ProtectedRoute, AdminRoute                          │
└─────────────────────────────────────────────────────────┘
```

---

## Tipos TypeScript

### UserProfile

```typescript
export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  rol: 'user' | 'admin';
  created_at: string;
  updated_at: string;
  avatar_url: string | null;
  phone: string | null;
}
```

**Descripción**: Representa el perfil del usuario almacenado en `public.usuarios`.

**Campos**:
- `id`: UUID del usuario (coincide con `auth.users.id`)
- `email`: Email único del usuario
- `full_name`: Nombre completo
- `rol`: Rol del usuario (`'user'` o `'admin'`)
- `created_at`: Fecha de creación
- `updated_at`: Última actualización
- `avatar_url`: URL del avatar (opcional)
- `phone`: Teléfono (opcional)

### AuthContextType

```typescript
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

**Descripción**: Interface del contexto de autenticación.

**Propiedades**:
- `user`: Usuario de Supabase Auth (contiene info básica)
- `userProfile`: Perfil completo del usuario desde `public.usuarios`
- `session`: Sesión activa de Supabase
- `loading`: Indica si se está cargando la autenticación
- `isAdmin`: `true` si el usuario tiene rol 'admin'
- `isUser`: `true` si el usuario tiene rol 'user'

**Métodos**:
- `signIn`: Inicia sesión con email y password
- `signUp`: Registra nuevo usuario
- `signOut`: Cierra sesión

---

## Funciones de Autenticación

### fetchUserProfile

```typescript
const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data as UserProfile | null;
};
```

**Propósito**: Obtiene el perfil del usuario desde `public.usuarios`.

**Uso de `maybeSingle()`**:
- Retorna `null` si no hay resultados (no lanza error)
- Retorna el objeto si hay un resultado
- Lanza error solo si hay múltiples resultados

**Cuándo se llama**:
- Al inicializar el AuthContext
- Cuando cambia el estado de autenticación
- Después de signIn/signUp

### createUserProfile

```typescript
const createUserProfile = async (
  userId: string,
  email: string,
  fullName: string,
  rol: 'user' | 'admin'
) => {
  const { data, error } = await supabase
    .from('usuarios')
    .insert({
      id: userId,
      email: email,
      full_name: fullName,
      rol: rol,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating user profile:', error);
    return null;
  }

  return data as UserProfile;
};
```

**Propósito**: Crea el perfil del usuario en `public.usuarios` después del registro.

**Importante**:
- Se llama automáticamente después de `supabase.auth.signUp()`
- El `id` debe coincidir con el `auth.uid()` para pasar las políticas RLS
- El rol por defecto es `'user'`, pero puede especificarse

**Protección RLS**: La política `usuarios_insert_own` verifica que `auth.uid() = id`.

### signIn

```typescript
const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Supabase auth error:', error);
      return { error };
    }

    if (data.user) {
      let profile = await fetchUserProfile(data.user.id);

      // Si no existe el perfil, crearlo (casos de usuarios legacy)
      if (!profile) {
        const metadata = data.user.user_metadata;
        profile = await createUserProfile(
          data.user.id,
          data.user.email!,
          metadata.full_name || data.user.email!,
          metadata.rol || 'user'
        );
      }

      if (profile) {
        setUserProfile(profile);
      }
    }

    return { error: null };
  } catch (err) {
    console.error('Unexpected error in signIn:', err);
    return { error: err };
  }
};
```

**Propósito**: Inicia sesión del usuario.

**Flujo**:
1. Llama a `supabase.auth.signInWithPassword()`
2. Si es exitoso, obtiene el perfil desde `public.usuarios`
3. Si el perfil no existe, lo crea (usuarios legacy o errores anteriores)
4. Actualiza el estado local

**Manejo de Errores**:
- Errores de Supabase Auth (credenciales incorrectas, usuario no existe)
- Errores de red
- Errores inesperados

### signUp

```typescript
const signUp = async (
  email: string,
  password: string,
  fullName: string,
  rol: 'user' | 'admin' = 'user'
) => {
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
    const profile = await createUserProfile(
      data.user.id,
      email,
      fullName,
      rol
    );

    setUserProfile(profile);
  }

  return { error: null };
};
```

**Propósito**: Registra un nuevo usuario.

**Flujo**:
1. Crea cuenta en `auth.users` con `supabase.auth.signUp()`
2. Guarda metadata (`full_name`, `rol`) en `user_metadata`
3. Crea perfil en `public.usuarios`
4. Actualiza el estado local

**Metadata vs Perfil**:
- **Metadata**: Se almacena en `auth.users.user_metadata` (no accesible vía RLS)
- **Perfil**: Se almacena en `public.usuarios` (protegido por RLS)

**Rol por Defecto**: `'user'`, pero puede especificarse `'admin'` al crear el primer admin.

### signOut

```typescript
const signOut = async () => {
  await supabase.auth.signOut();
  setSession(null);
  setUser(null);
  setUserProfile(null);
};
```

**Propósito**: Cierra la sesión del usuario.

**Flujo**:
1. Llama a `supabase.auth.signOut()`
2. Limpia todo el estado local
3. El `onAuthStateChange` se activa y redirige al usuario

---

## Hook useAuth

### Definición

```typescript
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

### Uso en Componentes

```typescript
import { useAuth } from '../contexts/AuthContext';

const MyComponent: React.FC = () => {
  const { user, userProfile, isAdmin, loading, signOut } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div>
      <h1>Bienvenido, {userProfile?.full_name}</h1>
      {isAdmin && <AdminPanel />}
      <button onClick={signOut}>Cerrar Sesión</button>
    </div>
  );
};
```

### Propiedades Computadas

```typescript
const isAdmin = userProfile?.rol === 'admin';
const isUser = userProfile?.rol === 'user';
```

Estas propiedades facilitan verificaciones de rol en componentes.

---

## Componentes de Protección de Rutas

### ProtectedRoute

**Ubicación**: `src/components/ProtectedRoute.tsx`

```typescript
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
```

**Propósito**: Protege rutas que requieren autenticación.

**Comportamiento**:
- Muestra spinner mientras carga
- Redirige a `/` si no hay usuario autenticado
- Renderiza hijos si usuario está autenticado

**Uso en Router**:
```typescript
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

### AdminRoute

**Ubicación**: `src/components/AdminRoute.tsx`

```typescript
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!userProfile || userProfile.rol !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
```

**Propósito**: Protege rutas que requieren rol de admin.

**Comportamiento**:
- Muestra spinner mientras carga
- Redirige a `/dashboard` si no es admin
- Renderiza hijos si usuario es admin

**Uso en Router**:
```typescript
<Route
  path="/admin"
  element={
    <AdminRoute>
      <AdminDashboard />
    </AdminRoute>
  }
/>
```

---

## Ejemplos de Uso

### Ejemplo 1: Formulario de Login

```typescript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError('Email o contraseña incorrectos');
      setLoading(false);
      return;
    }

    navigate('/dashboard');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Contraseña"
        required
      />
      {error && <p className="text-red-600">{error}</p>}
      <Button type="submit" disabled={loading}>
        {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
      </Button>
    </form>
  );
};
```

### Ejemplo 2: Formulario de Registro

```typescript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const SignUpPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');

  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    const { error } = await signUp(email, password, fullName);

    if (error) {
      if (error.message.includes('already registered')) {
        setError('Este email ya está registrado');
      } else {
        setError('Error al crear la cuenta. Intenta nuevamente.');
      }
      return;
    }

    navigate('/dashboard');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        placeholder="Nombre completo"
        required
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Contraseña"
        required
      />
      {error && <p className="text-red-600">{error}</p>}
      <button type="submit">Registrarse</button>
    </form>
  );
};
```

### Ejemplo 3: Navbar con Estado de Autenticación

```typescript
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';

export const Navbar: React.FC = () => {
  const { user, userProfile, isAdmin, signOut } = useAuth();

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold">
          Propiedades App
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-gray-700">
                Hola, {userProfile?.full_name}
              </span>
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="outline">Admin Panel</Button>
                </Link>
              )}
              <Link to="/dashboard">
                <Button variant="outline">Dashboard</Button>
              </Link>
              <Button onClick={signOut} variant="ghost">
                Cerrar Sesión
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline">Iniciar Sesión</Button>
              </Link>
              <Link to="/signup">
                <Button>Registrarse</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
```

### Ejemplo 4: Perfil de Usuario Editable

```typescript
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export const UserProfile: React.FC = () => {
  const { userProfile } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.full_name);
      setPhone(userProfile.phone || '');
    }
  }, [userProfile]);

  const handleSave = async () => {
    if (!userProfile) return;

    setSaving(true);

    const { error } = await supabase
      .from('usuarios')
      .update({
        full_name: fullName,
        phone: phone || null,
      })
      .eq('id', userProfile.id);

    setSaving(false);

    if (error) {
      alert('Error al guardar cambios');
      console.error(error);
    } else {
      alert('Perfil actualizado correctamente');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Mi Perfil</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nombre</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={userProfile?.email || ''}
            disabled
            className="w-full px-3 py-2 border rounded bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Teléfono</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Rol</label>
          <input
            type="text"
            value={userProfile?.rol || ''}
            disabled
            className="w-full px-3 py-2 border rounded bg-gray-100"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </div>
  );
};
```

---

## Manejo de Errores

### Errores Comunes de Supabase Auth

```typescript
const handleAuthError = (error: any): string => {
  if (error.message.includes('Invalid login credentials')) {
    return 'Email o contraseña incorrectos';
  }

  if (error.message.includes('Email not confirmed')) {
    return 'Por favor confirma tu email';
  }

  if (error.message.includes('User already registered')) {
    return 'Este email ya está registrado';
  }

  if (error.message.includes('Password should be at least')) {
    return 'La contraseña debe tener al menos 6 caracteres';
  }

  return 'Error de autenticación. Intenta nuevamente.';
};
```

### Uso en Componentes

```typescript
const { error } = await signIn(email, password);

if (error) {
  const friendlyError = handleAuthError(error);
  setError(friendlyError);
}
```

---

## Best Practices

### 1. Siempre Verificar `loading` Antes de Renderizar

```typescript
const { user, loading } = useAuth();

if (loading) {
  return <LoadingSpinner />;
}

// Ahora es seguro asumir que user está cargado
```

### 2. No Confiar Solo en Frontend para Seguridad

```typescript
// ❌ Solo verificar en frontend
{isAdmin && <DeleteButton />}

// ✅ Verificar en frontend Y en backend (RLS + funciones)
{isAdmin && (
  <DeleteButton
    onClick={async () => {
      // Esta llamada será rechazada si el usuario no es admin
      await supabase.rpc('delete_user_admin', { target_user_id: userId });
    }}
  />
)}
```

### 3. Manejar Estados de Carga

```typescript
const [submitting, setSubmitting] = useState(false);

const handleSubmit = async () => {
  setSubmitting(true);
  try {
    await someAsyncOperation();
  } finally {
    setSubmitting(false);  // Siempre limpiar estado
  }
};
```

### 4. Limpiar Suscripciones

```typescript
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    // Manejar cambios
  });

  return () => {
    subscription.unsubscribe();  // Limpiar al desmontar
  };
}, []);
```

### 5. Usar `maybeSingle()` en Vez de `single()`

```typescript
// ✅ Mejor
const { data } = await supabase
  .from('usuarios')
  .select('*')
  .eq('id', userId)
  .maybeSingle();  // Retorna null si no hay resultados

// ❌ Evitar
const { data } = await supabase
  .from('usuarios')
  .select('*')
  .eq('id', userId)
  .single();  // Lanza error si no hay resultados
```

### 6. Validar Inputs en Frontend

```typescript
const validateEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

const handleSignUp = async () => {
  if (!validateEmail(email)) {
    setError('Email inválido');
    return;
  }

  if (!validatePassword(password)) {
    setError('La contraseña debe tener al menos 6 caracteres');
    return;
  }

  // Proceder con signUp
};
```

---

## Referencias

- [Documentación de Supabase Auth](https://supabase.com/docs/guides/auth)
- [React Context API](https://react.dev/reference/react/useContext)
- [React Router Protected Routes](https://reactrouter.com/en/main/start/tutorial)
- Ver `AUTHORIZATION_SOLUTION.md` para arquitectura general
- Ver `RLS_POLICIES.md` para políticas de seguridad
- Ver `ADMIN_FUNCTIONS.md` para operaciones administrativas
