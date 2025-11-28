/*
  # Agregar columna foto_perfil_url a tabla usuarios

  ## Overview
  Agrega la columna foto_perfil_url a la tabla usuarios para almacenar
  la URL de la foto de perfil de cada usuario.

  ## Changes Made

  ### 1. Columna Nueva
  - `foto_perfil_url` (text, nullable) - URL de la foto de perfil del usuario
    - Puede ser NULL si el usuario no ha subido foto
    - Almacena la URL pública desde Supabase Storage

  ## Security Notes
  - Las políticas RLS existentes cubren esta columna automáticamente
  - Los usuarios pueden actualizar su propia foto_perfil_url
  - Los admins pueden gestionar fotos de todos los usuarios
*/

-- Agregar columna foto_perfil_url a la tabla usuarios
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'usuarios' AND column_name = 'foto_perfil_url'
  ) THEN
    ALTER TABLE usuarios ADD COLUMN foto_perfil_url text;
  END IF;
END $$;

-- Crear índice para mejorar rendimiento en consultas que filtren por fotos
CREATE INDEX IF NOT EXISTS idx_usuarios_foto_perfil ON usuarios(foto_perfil_url) WHERE foto_perfil_url IS NOT NULL;