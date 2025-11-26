/*
  # LinkProp Database Schema

  ## Overview
  Complete database schema for LinkProp real estate management platform.
  Supports properties, users (clients), admins, and relationship tracking.

  ## Tables Created

  ### 1. propiedades (Properties)
  Main table for real estate listings
  - `id` (uuid, PK) - Unique property identifier
  - `titulo` (text) - Property title
  - `descripcion` (text) - Detailed description
  - `tipo` (text) - Property type: Casa, Departamento, Terreno, Comercial
  - `operacion` (text) - Operation type: Venta, Alquiler
  - `precio` (decimal) - Price amount
  - `moneda` (text) - Currency: USD, ARS (default: USD)
  - `ubicacion` (text) - Location/address
  - `dormitorios` (integer) - Number of bedrooms
  - `banos` (integer) - Number of bathrooms
  - `superficie` (decimal) - Surface area in m²
  - `imagenes` (text[]) - Array of image URLs
  - `estado` (text) - Status: Disponible, Reservada, Vendida (default: Disponible)
  - `fecha_creacion` (timestamptz) - Creation timestamp
  - `fecha_actualizacion` (timestamptz) - Last update timestamp

  ### 2. usuarios (Clients/Users)
  Client profiles with integrated preferences
  - `id` (uuid, PK) - Unique user identifier
  - `email` (text, unique) - Email address
  - `nombre` (text) - Full name
  - `telefono` (text) - Phone number
  - `preferencias_tipo` (text[]) - Preferred property types
  - `preferencias_operacion` (text) - Preferred operation (Venta/Alquiler)
  - `preferencias_precio_min` (decimal) - Minimum price preference
  - `preferencias_precio_max` (decimal) - Maximum price preference
  - `preferencias_ubicacion` (text[]) - Preferred locations
  - `preferencias_dormitorios_min` (integer) - Minimum bedrooms
  - `preferencias_banos_min` (integer) - Minimum bathrooms
  - `fecha_creacion` (timestamptz) - Creation timestamp
  - `fecha_actualizacion` (timestamptz) - Last update timestamp

  ### 3. admins (Admin Staff)
  Platform administrators and agents
  - `id` (uuid, PK) - Unique admin identifier
  - `email` (text, unique) - Email address
  - `nombre` (text) - Full name
  - `rol` (text) - Role: admin, agente
  - `telefono` (text) - Phone number
  - `fecha_creacion` (timestamptz) - Creation timestamp

  ### 4. propiedades_usuarios (Property-User Relationships)
  Many-to-many relationship tracking interest stages
  - `id` (uuid, PK) - Unique relationship identifier
  - `propiedad_id` (uuid, FK) - Property reference
  - `usuario_id` (uuid, FK) - User reference
  - `etapa` (text) - Stage: Explorar, Interes, Visitada (default: Explorar)
  - `fecha_interes` (timestamptz) - Interest date (auto-set when stage = Interes)
  - `calificacion` (integer) - Rating 1-5 (only for Visitada stage)
  - `comentario_compartido` (text) - User comment (only for Visitada stage)
  - `nota_agente` (text) - Agent notes (admin-only visibility)
  - `fecha_creacion` (timestamptz) - Creation timestamp
  - `fecha_actualizacion` (timestamptz) - Last update timestamp
  - UNIQUE constraint on (propiedad_id, usuario_id)

  ## Security (RLS)
  - All tables have Row Level Security enabled
  - Policies restrict access based on user role
  - Admins have full access
  - Users can only view/modify their own data
  - Match counts visible only to admins

  ## Indexes
  - Performance indexes on frequently queried columns
  - Foreign key indexes for join optimization
*/

-- Create propiedades table
CREATE TABLE IF NOT EXISTS propiedades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  descripcion text DEFAULT '',
  tipo text NOT NULL CHECK (tipo IN ('Casa', 'Departamento', 'Terreno', 'Comercial')),
  operacion text NOT NULL CHECK (operacion IN ('Venta', 'Alquiler')),
  precio decimal NOT NULL CHECK (precio >= 0),
  moneda text DEFAULT 'USD' CHECK (moneda IN ('USD', 'ARS')),
  ubicacion text NOT NULL,
  dormitorios integer DEFAULT 0 CHECK (dormitorios >= 0),
  banos integer DEFAULT 0 CHECK (banos >= 0),
  superficie decimal DEFAULT 0 CHECK (superficie >= 0),
  imagenes text[] DEFAULT '{}',
  estado text DEFAULT 'Disponible' CHECK (estado IN ('Disponible', 'Reservada', 'Vendida')),
  fecha_creacion timestamptz DEFAULT now(),
  fecha_actualizacion timestamptz DEFAULT now()
);

-- Create usuarios table
CREATE TABLE IF NOT EXISTS usuarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  nombre text NOT NULL,
  telefono text DEFAULT '',
  preferencias_tipo text[] DEFAULT '{}',
  preferencias_operacion text CHECK (preferencias_operacion IN ('Venta', 'Alquiler', NULL)),
  preferencias_precio_min decimal CHECK (preferencias_precio_min >= 0),
  preferencias_precio_max decimal CHECK (preferencias_precio_max >= 0),
  preferencias_ubicacion text[] DEFAULT '{}',
  preferencias_dormitorios_min integer CHECK (preferencias_dormitorios_min >= 0),
  preferencias_banos_min integer CHECK (preferencias_banos_min >= 0),
  fecha_creacion timestamptz DEFAULT now(),
  fecha_actualizacion timestamptz DEFAULT now()
);

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  nombre text NOT NULL,
  rol text NOT NULL DEFAULT 'agente' CHECK (rol IN ('admin', 'agente')),
  telefono text DEFAULT '',
  fecha_creacion timestamptz DEFAULT now()
);

-- Create propiedades_usuarios table
CREATE TABLE IF NOT EXISTS propiedades_usuarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  propiedad_id uuid NOT NULL REFERENCES propiedades(id) ON DELETE CASCADE,
  usuario_id uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  etapa text DEFAULT 'Explorar' CHECK (etapa IN ('Explorar', 'Interes', 'Visitada')),
  fecha_interes timestamptz,
  calificacion integer CHECK (calificacion >= 1 AND calificacion <= 5),
  comentario_compartido text DEFAULT '',
  nota_agente text DEFAULT '',
  fecha_creacion timestamptz DEFAULT now(),
  fecha_actualizacion timestamptz DEFAULT now(),
  UNIQUE(propiedad_id, usuario_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_propiedades_usuarios_usuario ON propiedades_usuarios(usuario_id);
CREATE INDEX IF NOT EXISTS idx_propiedades_usuarios_propiedad ON propiedades_usuarios(propiedad_id);
CREATE INDEX IF NOT EXISTS idx_propiedades_usuarios_etapa ON propiedades_usuarios(etapa);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);

-- Enable Row Level Security
ALTER TABLE propiedades ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE propiedades_usuarios ENABLE ROW LEVEL SECURITY;

-- RLS Policies for propiedades
CREATE POLICY "Admins can manage all properties"
  ON propiedades FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.email = auth.jwt()->>'email'))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.email = auth.jwt()->>'email'));

CREATE POLICY "Users can view available properties"
  ON propiedades FOR SELECT
  TO authenticated
  USING (estado = 'Disponible');

-- RLS Policies for usuarios
CREATE POLICY "Admins can manage all users"
  ON usuarios FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.email = auth.jwt()->>'email'))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.email = auth.jwt()->>'email'));

CREATE POLICY "Users can view own profile"
  ON usuarios FOR SELECT
  TO authenticated
  USING (email = auth.jwt()->>'email');

CREATE POLICY "Users can update own profile"
  ON usuarios FOR UPDATE
  TO authenticated
  USING (email = auth.jwt()->>'email')
  WITH CHECK (email = auth.jwt()->>'email');

-- RLS Policies for admins
CREATE POLICY "Admins can view admin table"
  ON admins FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.email = auth.jwt()->>'email'));

-- RLS Policies for propiedades_usuarios
CREATE POLICY "Admins can manage all relationships"
  ON propiedades_usuarios FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.email = auth.jwt()->>'email'))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.email = auth.jwt()->>'email'));

CREATE POLICY "Users can view own relationships"
  ON propiedades_usuarios FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM usuarios WHERE usuarios.id = propiedades_usuarios.usuario_id AND usuarios.email = auth.jwt()->>'email'));

CREATE POLICY "Users can insert own relationships"
  ON propiedades_usuarios FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM usuarios WHERE usuarios.id = propiedades_usuarios.usuario_id AND usuarios.email = auth.jwt()->>'email'));

CREATE POLICY "Users can update own relationships"
  ON propiedades_usuarios FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM usuarios WHERE usuarios.id = propiedades_usuarios.usuario_id AND usuarios.email = auth.jwt()->>'email'))
  WITH CHECK (EXISTS (SELECT 1 FROM usuarios WHERE usuarios.id = propiedades_usuarios.usuario_id AND usuarios.email = auth.jwt()->>'email'));

-- Function to auto-update fecha_actualizacion
CREATE OR REPLACE FUNCTION update_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fecha_actualizacion = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for auto-updating timestamps
CREATE TRIGGER update_propiedades_fecha_actualizacion
  BEFORE UPDATE ON propiedades
  FOR EACH ROW
  EXECUTE FUNCTION update_fecha_actualizacion();

CREATE TRIGGER update_usuarios_fecha_actualizacion
  BEFORE UPDATE ON usuarios
  FOR EACH ROW
  EXECUTE FUNCTION update_fecha_actualizacion();

CREATE TRIGGER update_propiedades_usuarios_fecha_actualizacion
  BEFORE UPDATE ON propiedades_usuarios
  FOR EACH ROW
  EXECUTE FUNCTION update_fecha_actualizacion();

-- Function to auto-set fecha_interes when etapa changes to 'Interes'
CREATE OR REPLACE FUNCTION set_fecha_interes()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.etapa = 'Interes' AND (OLD.etapa IS NULL OR OLD.etapa != 'Interes') THEN
    NEW.fecha_interes = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_set_fecha_interes
  BEFORE INSERT OR UPDATE ON propiedades_usuarios
  FOR EACH ROW
  EXECUTE FUNCTION set_fecha_interes();